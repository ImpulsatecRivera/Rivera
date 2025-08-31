import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { OAuth2Client } from "google-auth-library"; // ✅ IMPORTAR GOOGLE AUTH
import { config } from "../config.js";
import EmpleadoModel from "../Models/Empleados.js";
import MotoristaModel from "../Models/Motorista.js";
import ClienteModel from "../Models/Clientes.js";

const LoginController = {};

// ✅ INICIALIZAR CLIENTE DE GOOGLE
const client = new OAuth2Client(config.GOOGLE.CLIENT_ID);

// ===================== Intentos fallidos =====================
const failedAttempts = new Map();

const isBlocked = (email) => {
  const d = failedAttempts.get(email);
  if (!d) return false;
  if (d.blockedUntil && new Date() < d.blockedUntil) return true;
  if (d.blockedUntil && new Date() >= d.blockedUntil) {
    failedAttempts.delete(email);
    return false;
  }
  return false;
};

const recordFailedAttempt = (email) => {
  const d = failedAttempts.get(email) || { attempts: 0, blockedUntil: null };
  d.attempts += 1;
  if (d.attempts >= 4) {
    d.blockedUntil = new Date(Date.now() + 5 * 60 * 1000);
    console.log(`🔒 ${email} bloqueado hasta ${d.blockedUntil} (intentos: ${d.attempts})`);
  }
  failedAttempts.set(email, d);
  return d;
};

const clearFailedAttempts = (email) => failedAttempts.delete(email);

const getBlockTimeRemaining = (email) => {
  const d = failedAttempts.get(email);
  if (!d?.blockedUntil) return 0;
  return Math.max(0, Math.ceil((d.blockedUntil.getTime() - Date.now()) / 1000));
};

// ===================== Helper para generar token =====================
const generateToken = (payload) => {
  return jwt.sign(payload, config.JWT.secret, { expiresIn: config.JWT.expiresIn });
};

// ===================== Helper para Set-Cookie (Corregido) =====================
const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  
  res.cookie("authToken", token, {
    path: "/",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    ...(isProd && { partitioned: true }) // CHIPS solo en producción
  });
  
  console.log("🍪 [LOGIN] Cookie configurada correctamente");
};

// ===================== 🆕 GOOGLE LOGIN (CORREGIDO) =====================
LoginController.GoogleLogin = async (req, res) => {
  const { googleToken } = req.body;

  try {
    console.log("🔍 [GOOGLE LOGIN] Iniciando verificación...");
    
    if (!googleToken) {
      console.log("❌ Token de Google faltante");
      return res.status(400).json({ error: "Token de Google requerido" });
    }

    if (!config.GOOGLE.CLIENT_ID) {
      console.error("❌ GOOGLE_CLIENT_ID no configurado");
      return res.status(500).json({ error: "Configuración de Google faltante" });
    }

    // Verificar el token con Google
    console.log("🔍 Verificando token con Google...");
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: config.GOOGLE.CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    console.log("✅ Token verificado exitosamente para:", email);

    if (!email) {
      return res.status(400).json({ error: "No se pudo obtener el email" });
    }

    // Buscar usuario en empleados o clientes
    let user = await EmpleadoModel.findOne({ email });
    let role = "Empleado";

    if (!user) {
      user = await ClienteModel.findOne({ email });
      role = "Cliente";
    }

    // Si no existe, creamos un cliente automáticamente
    if (!user) {
      console.log("👤 Creando nuevo cliente con Google:", email);
      
      user = await ClienteModel.create({
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || 'Usuario',
        email,
        profilePicture: picture,
        googleId: googleId,
        isGoogleUser: true,
        emailVerified: true,
        profileCompleted: false, // Perfil incompleto hasta que agreguen info adicional
        // NO incluimos password, phone, address, idNumber, birthDate para usuarios de Google
      });
      role = "Cliente";
    } else {
      // Actualizar googleId si no existe
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture && !user.profilePicture) {
          user.profilePicture = picture;
        }
        await user.save();
      }
    }

    // Generar token JWT
    const token = generateToken({ 
      id: user._id, 
      userType: role 
    });

    // Configurar cookie segura
    setAuthCookie(res, token);

    return res.status(200).json({ 
      message: "Login con Google exitoso", 
      userType: role,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.firstName || user.nombre || name,
        apellido: user.lastName || null,
        profilePicture: user.profilePicture || picture,
        userType: role,
        isGoogleUser: true,
        profileCompleted: user.profileCompleted || false,
        needsProfileCompletion: user.isGoogleUser && !user.isProfileComplete()
      },
      token
    });
    
  } catch (error) {
    console.error("💥 Error en GoogleLogin:", error);
    
    // Errores específicos de Google
    if (error.message.includes('Token used too late')) {
      return res.status(400).json({ error: "Token de Google expirado" });
    }
    if (error.message.includes('Invalid token signature')) {
      return res.status(400).json({ error: "Token de Google inválido" });
    }
    
    return res.status(500).json({ 
      error: "Error al iniciar sesión con Google",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===================== LOGIN =====================
LoginController.Login = async (req, res) => {
  const { email, password } = req.body;
  console.log("🔐 [LOGIN] email:", email);

  try {
    // Bloqueo por intentos
    if (isBlocked(email)) {
      const sec = getBlockTimeRemaining(email);
      return res.status(429).json({
        message: `Demasiados intentos fallidos. Intenta de nuevo en ${Math.ceil(sec / 60)} minuto(s).`,
        blocked: true,
        timeRemaining: sec,
      });
    }

    const currentAttempts = failedAttempts.get(email)?.attempts || 0;
    if (currentAttempts >= 4) {
      const d = failedAttempts.get(email);
      if (!d.blockedUntil) {
        d.blockedUntil = new Date(Date.now() + 5 * 60 * 1000);
        failedAttempts.set(email, d);
      }
      const sec = getBlockTimeRemaining(email);
      return res.status(429).json({
        message: `Demasiados intentos fallidos. Intenta de nuevo en ${Math.ceil(sec / 60)} minuto(s).`,
        blocked: true,
        timeRemaining: sec,
      });
    }

    let userFound;
    let userType;
    let valid = false;

    // 1) Admin
    if (email === config.ADMIN.emailAdmin) {
      if (password !== config.ADMIN.password) {
        const d = recordFailedAttempt(email);
        const remaining = Math.max(0, 4 - d.attempts);
        return res.status(400).json({
          message: `Contraseña incorrecta. Te quedan ${remaining} intento(s).`,
          attemptsRemaining: remaining,
        });
      }
      userType = "Administrador";
      userFound = { _id: "admin", email };
      valid = true;
    } else {
      // 2) Empleado
      userFound = await EmpleadoModel.findOne({ email });
      if (userFound) {
        valid = await bcryptjs.compare(password, userFound.password);
        if (!valid) {
          const d = recordFailedAttempt(email);
          const remaining = Math.max(0, 4 - d.attempts);
          return res.status(400).json({
            message: `Contraseña incorrecta. Te quedan ${remaining} intento(s).`,
            attemptsRemaining: remaining,
          });
        }
        userType = "Empleado";
      } else {
        // 3) Motorista
        userFound = await MotoristaModel.findOne({ email });
        if (userFound) {
          valid = await bcryptjs.compare(password, userFound.password);
          if (!valid) {
            const d = recordFailedAttempt(email);
            const remaining = Math.max(0, 4 - d.attempts);
            return res.status(400).json({
              message: `Contraseña incorrecta. Te quedan ${remaining} intento(s).`,
              attemptsRemaining: remaining,
            });
          }
          userType = "Motorista";
        } else {
          // 4) Cliente
          userFound = await ClienteModel.findOne({ email });
          if (!userFound) {
            console.log('❌ Cliente no encontrado para email:', email);
            const d = recordFailedAttempt(email);
            const remaining = Math.max(0, 4 - d.attempts);
            return res.status(400).json({
              message: `Usuario no encontrado. Te quedan ${remaining} intento(s).`,
              attemptsRemaining: remaining,
            });
          }

          console.log('✅ Cliente encontrado:', userFound._id);
          valid = await bcryptjs.compare(password, userFound.password);
          console.log('🔑 bcrypt.compare result:', valid);

          if (!valid) {
            console.log('❌ Contraseña incorrecta para cliente');
            const d = recordFailedAttempt(email);
            const remaining = Math.max(0, 4 - d.attempts);
            return res.status(400).json({
              message: `Contraseña incorrecta. Te quedan ${remaining} intento(s).`,
              attemptsRemaining: remaining,
            });
          }

          console.log('✅ Login de cliente exitoso');
          userType = "Cliente";
        }
      }
    }

    // ✅ Login exitoso
    clearFailedAttempts(email);

    if (!config.JWT.secret) {
      console.error("❌ Falta JWT secret en config.js");
      return res.status(500).json({ message: "Error del servidor: JWT" });
    }

    const token = generateToken({ id: userFound._id, userType });
    setAuthCookie(res, token);

    return res.status(200).json({
      message: "Inicio de sesión completado",
      userType,
      user: {
        id: userFound._id,
        email: userFound.email || email,
        nombre: userFound.nombre || userFound.firstName || userFound.name || null,
        apellido: userFound.lastName || null,
        userType
      },
      token,
    });
    
  } catch (e) {
    console.error("💥 [LOGIN] Error:", e);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ===================== CHECK AUTH (Corregido) =====================
LoginController.checkAuth = async (req, res) => {
  try {
    console.log("🔍 [checkAuth] Verificando autenticación");
    const token = req.cookies?.authToken;
    
    if (!token) {
      return res.status(200).json({ 
        message: "No hay sesión activa", 
        user: null 
      });
    }

    jwt.verify(token, config.JWT.secret, async (err, decoded) => {
      if (err) {
        return res.status(200).json({ 
          message: "Token inválido", 
          user: null 
        });
      }

      const { id, userType } = decoded;
      
      if (userType === "Administrador") {
        return res.status(200).json({
          user: { 
            id, 
            email: config.ADMIN.emailAdmin, 
            userType: "Administrador" 
          },
        });
      }

      let Model = null;
      if (userType === "Empleado") Model = EmpleadoModel;
      else if (userType === "Motorista") Model = MotoristaModel;
      else if (userType === "Cliente") Model = ClienteModel;
      else {
        return res.status(200).json({ 
          message: "Tipo de usuario inválido", 
          user: null 
        });
      }

      const userFound = await Model.findById(id).select("email nombre name firstName lastName profilePicture googleId");
      if (!userFound) {
        return res.status(200).json({ 
          message: `${userType} no encontrado`, 
          user: null 
        });
      }

      return res.status(200).json({
        user: {
          id: userFound._id,
          email: userFound.email,
          userType,
          nombre: userFound.firstName || userFound.nombre || userFound.name || null,
          apellido: userFound.lastName || null,
          profilePicture: userFound.profilePicture || null,
          isGoogleUser: !!userFound.googleId,
          profileCompleted: userFound.profileCompleted || false,
          needsProfileCompletion: userFound.isGoogleUser && userFound.isProfileComplete && !userFound.isProfileComplete()
        },
      });
    });
  } catch (e) {
    console.error("💥 [checkAuth] Error:", e);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ===================== LOGOUT =====================
LoginController.logout = async (req, res) => {
  try {
    res.clearCookie("authToken", {
      path: "/",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production"
    });
    
    return res.status(200).json({ message: "Logout exitoso" });
  } catch (error) {
    console.error("❌ [LOGOUT] Error:", error);
    return res.status(500).json({ message: "Error en logout" });
  }
};

// ===================== COMPLETAR PERFIL PARA USUARIOS DE GOOGLE =====================
LoginController.completeProfile = async (req, res) => {
  try {
    const { phone, address, idNumber, birthDate } = req.body;
    const userId = req.user.id; // Viene del middleware de autenticación
    
    // Buscar el usuario
    const user = await ClienteModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Verificar que sea usuario de Google
    if (!user.isGoogleUser) {
      return res.status(400).json({ message: "Este endpoint es solo para usuarios de Google" });
    }
    
    // Validar campos requeridos
    if (!phone || !address || !idNumber || !birthDate) {
      return res.status(400).json({ 
        message: "Todos los campos son requeridos",
        required: ["phone", "address", "idNumber", "birthDate"]
      });
    }
    
    // Validar que el idNumber no esté en uso por otro usuario
    const existingUser = await ClienteModel.findOne({ 
      idNumber, 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: "El número de identificación ya está registrado" 
      });
    }
    
    // Actualizar el perfil
    user.phone = phone;
    user.address = address;
    user.idNumber = idNumber;
    user.birthDate = new Date(birthDate);
    user.profileCompleted = true;
    
    await user.save();
    
    console.log(`✅ Perfil completado para usuario Google: ${user.email}`);
    
    return res.status(200).json({
      message: "Perfil completado exitosamente",
      user: {
        id: user._id,
        email: user.email,
        nombre: user.firstName,
        apellido: user.lastName,
        phone: user.phone,
        address: user.address,
        idNumber: user.idNumber,
        birthDate: user.birthDate,
        profileCompleted: true,
        isGoogleUser: true
      }
    });
    
  } catch (error) {
    console.error("💥 Error completando perfil:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Ya existe un usuario con ese número de identificación" 
      });
    }
    
    return res.status(500).json({ 
      message: "Error interno del servidor" 
    });
  }
};

export default LoginController;