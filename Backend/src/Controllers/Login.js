import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { config } from "../config.js";
import EmpleadoModel from "../Models/Empleados.js";
import MotoristaModel from "../Models/Motorista.js";
import ClienteModel from "../Models/Clientes.js";

const LoginController = {};

// 🔒 SISTEMA DE INTENTOS FALLIDOS (se mantiene)
const failedAttempts = new Map(); // { email: { attempts: number, blockedUntil: Date } }

// 🛡️ Verificar si el usuario está bloqueado (se mantiene)
const isBlocked = (email) => {
  const attemptData = failedAttempts.get(email);
  if (!attemptData) return false;

  if (attemptData.blockedUntil && new Date() < attemptData.blockedUntil) {
    return true;
  }
  if (attemptData.blockedUntil && new Date() >= attemptData.blockedUntil) {
    failedAttempts.delete(email);
    return false;
  }
  return false;
};

// 📊 Registrar intento fallido (se mantiene)
const recordFailedAttempt = (email) => {
  const attemptData = failedAttempts.get(email) || { attempts: 0, blockedUntil: null };
  attemptData.attempts += 1;

  if (attemptData.attempts >= 4) {
    attemptData.blockedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
    console.log(`🔒 Usuario ${email} bloqueado hasta ${attemptData.blockedUntil} después de ${attemptData.attempts} intentos`);
  }

  failedAttempts.set(email, attemptData);
  console.log(`📊 Usuario: ${email} - Intentos: ${attemptData.attempts} - Bloqueado: ${!!attemptData.blockedUntil}`);
  return attemptData;
};

// ✅ Limpiar intentos (se mantiene)
const clearFailedAttempts = (email) => {
  failedAttempts.delete(email);
};

// ⏳ Tiempo restante bloqueo (se mantiene)
const getBlockTimeRemaining = (email) => {
  const attemptData = failedAttempts.get(email);
  if (!attemptData || !attemptData.blockedUntil) return 0;
  const remaining = attemptData.blockedUntil.getTime() - Date.now();
  return Math.max(0, Math.ceil(remaining / 1000)); // seg
};

// ===================== Utils de Cookie =====================
// Construimos Set-Cookie manual para poder incluir "Partitioned" en producción
const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  const attrs = [
    `authToken=${token}`,
    "Path=/",
    "HttpOnly",
    `Max-Age=${24 * 60 * 60}`, // 24h
    isProd ? "SameSite=None" : "SameSite=Lax",
    isProd ? "Secure" : "",
    isProd ? "Partitioned" : "", // CHIPS (recomendado para cookies de terceros)
  ].filter(Boolean);

  const cookieStr = attrs.join("; ");
  console.log("🍪 [LOGIN] Set-Cookie:", cookieStr);
  res.append("Set-Cookie", cookieStr);
};

// (opcional) utilidad por si quieres reusar el borrado aquí también
const clearAuthCookie = (res) => {
  const isProd = process.env.NODE_ENV === "production";
  const attrs = [
    "authToken=",
    "Path=/",
    "HttpOnly",
    "Max-Age=0",
    isProd ? "SameSite=None" : "SameSite=Lax",
    isProd ? "Secure" : "",
    isProd ? "Partitioned" : "",
  ].filter(Boolean);

  const cookieStr = attrs.join("; ");
  console.log("🍪 [LOGIN] Clear-Cookie:", cookieStr);
  res.append("Set-Cookie", cookieStr);
};

// ===================== LOGIN =====================
LoginController.Login = async (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 [LOGIN] Intento de login para email:', email);

  try {
    // 🔒 VERIFICAR BLOQUEO
    if (isBlocked(email)) {
      const timeRemaining = getBlockTimeRemaining(email);
      const minutesRemaining = Math.ceil(timeRemaining / 60);
      console.log('🚫 [LOGIN] Usuario bloqueado:', email, 'Tiempo restante:', timeRemaining);

      return res.status(429).json({
        message: `Demasiados intentos fallidos. Intenta de nuevo en ${minutesRemaining} minuto(s).`,
        blocked: true,
        timeRemaining
      });
    }

    // 🚨 VERIFICAR INTENTOS >= 4
    const currentAttempts = failedAttempts.get(email)?.attempts || 0;
    if (currentAttempts >= 4) {
      const attemptData = failedAttempts.get(email);
      if (!attemptData.blockedUntil) {
        attemptData.blockedUntil = new Date(Date.now() + 5 * 60 * 1000);
        failedAttempts.set(email, attemptData);
        console.log(`🔒 Usuario ${email} bloqueado hasta ${attemptData.blockedUntil}`);
      }
      const timeRemaining = getBlockTimeRemaining(email);
      const minutesRemaining = Math.ceil(timeRemaining / 60);

      return res.status(429).json({
        message: `Demasiados intentos fallidos. Intenta de nuevo en ${minutesRemaining} minuto(s).`,
        blocked: true,
        timeRemaining
      });
    }

    let userFound;
    let userType;
    let isPasswordValid = false;

    // 1️⃣ Admin
    if (email === config.ADMIN.emailAdmin) {
      console.log('👑 [LOGIN] Verificando credenciales de administrador');
      if (password !== config.ADMIN.password) {
        console.log('❌ [LOGIN] Contraseña incorrecta para administrador');
        const attemptData = recordFailedAttempt(email);
        const remaining = Math.max(0, 4 - attemptData.attempts);
        return res.status(400).json({
          message: `Contraseña incorrecta. Te quedan ${remaining} intento(s).`,
          attemptsRemaining: remaining
        });
      }
      userType = "Administrador";
      userFound = { _id: "admin", email };
      isPasswordValid = true;
    } else {
      // 2️⃣ Empleado
      console.log('👥 [LOGIN] Buscando en empleados...');
      userFound = await EmpleadoModel.findOne({ email });

      if (userFound) {
        console.log('✅ [LOGIN] Usuario encontrado en empleados');
        isPasswordValid = await bcryptjs.compare(password, userFound.password);
        if (!isPasswordValid) {
          console.log('❌ [LOGIN] Contraseña incorrecta para empleado');
          const attemptData = recordFailedAttempt(email);
          const remaining = Math.max(0, 4 - attemptData.attempts);
          return res.status(400).json({
            message: `Contraseña incorrecta. Te quedan ${remaining} intento(s).`,
            attemptsRemaining: remaining
          });
        }
        userType = "Empleado";
      } else {
        // 3️⃣ Motorista
        console.log('🚛 [LOGIN] Buscando en motoristas...');
        userFound = await MotoristaModel.findOne({ email });

        if (userFound) {
          console.log('✅ [LOGIN] Usuario encontrado en motoristas');
          isPasswordValid = await bcryptjs.compare(password, userFound.password);
          if (!isPasswordValid) {
            console.log('❌ [LOGIN] Contraseña incorrecta para motorista');
            const attemptData = recordFailedAttempt(email);
            const remaining = Math.max(0, 4 - attemptData.attempts);
            return res.status(400).json({
              message: `Contraseña incorrecta. Te quedan ${remaining} intento(s).`,
              attemptsRemaining: remaining
            });
          }
          userType = "Motorista";
        } else {
          // 4️⃣ Cliente
          console.log('👤 [LOGIN] Buscando en clientes...');
          userFound = await ClienteModel.findOne({ email });

          if (!userFound) {
            console.log('❌ [LOGIN] Usuario no encontrado en ninguna colección');
            const attemptData = recordFailedAttempt(email);
            const remaining = Math.max(0, 4 - attemptData.attempts);
            return res.status(400).json({
              message: `Usuario no encontrado. Te quedan ${remaining} intento(s).`,
              attemptsRemaining: remaining
            });
          }

          console.log('✅ [LOGIN] Usuario encontrado en clientes');
          isPasswordValid = await bcryptjs.compare(password, userFound.password);
          if (!isPasswordValid) {
            console.log('❌ [LOGIN] Contraseña incorrecta para cliente');
            const attemptData = recordFailedAttempt(email);
            const remaining = Math.max(0, 4 - attemptData.attempts);
            return res.status(400).json({
              message: `Contraseña incorrecta. Te quedan ${remaining} intento(s).`,
              attemptsRemaining: remaining
            });
          }
          userType = "Cliente";
        }
      }
    }

    // ✅ LOGIN OK - limpiar intentos
    console.log('🎉 [LOGIN] Login exitoso para:', email, 'Tipo:', userType);
    clearFailedAttempts(email);

    if (!config.JWT.secret) {
      console.error("❌ [LOGIN] Falta JWT secret en config.js");
      return res.status(500).json({ message: "Error del servidor: JWT" });
    }

    console.log('🔑 [LOGIN] Generando token JWT...');
    jwt.sign(
      { id: userFound._id, userType },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn },
      (error, token) => {
        if (error) {
          console.error("❌ [LOGIN] Error al firmar token:", error);
          return res.status(500).json({ message: "Error al generar token" });
        }

        console.log('✅ [LOGIN] Token generado correctamente');

        // 🍪 COOKIE httpOnly preparada para cross-site
        setAuthCookie(res, token);

        // (opcional) mantener el header Authorization si ya lo usas
        res.setHeader('Authorization', `Bearer ${token}`);

        console.log('📤 [LOGIN] Enviando respuesta exitosa con cookie y header');
        return res.status(200).json({
          message: "Inicio de sesión completado",
          userType,
          user: {
            id: userFound._id,
            email: userFound.email || email,
            nombre: userFound.nombre || userFound.name || null,
          },
          // Si tu frontend aún lo usa, mantenemos el token
          token: token
        });
      }
    );
  } catch (error) {
    console.error("❌ [LOGIN] Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ===================== CHECK AUTH (se mantiene) =====================
LoginController.checkAuth = async (req, res) => {
  try {
    console.log("🔍 [checkAuth] Iniciando verificación de autenticación");
    const token = req.cookies?.authToken;
    console.log("🍪 [checkAuth] Token de cookie:", token ? "Presente" : "No encontrado");

    if (!token) {
      console.log("❌ [checkAuth] No hay token en cookies");
      return res.status(401).json({ message: "No autorizado" });
    }

    jwt.verify(token, config.JWT.secret, async (err, decoded) => {
      if (err) {
        console.log("❌ [checkAuth] Token inválido:", err.message);
        return res.status(401).json({ message: "Token inválido" });
      }

      console.log("✅ [checkAuth] Token válido, datos decodificados:", { id: decoded.id, userType: decoded.userType });
      const { id, userType } = decoded;

      if (userType === "Administrador") {
        console.log("👑 [checkAuth] Usuario administrador autenticado");
        return res.status(200).json({
          user: {
            id,
            email: config.ADMIN.emailAdmin,
            userType: "Administrador",
          },
        });
      }

      let userFound;
      let Model;

      switch (userType) {
        case "Empleado":
          Model = EmpleadoModel; break;
        case "Motorista":
          Model = MotoristaModel; break;
        case "Cliente":
          Model = ClienteModel; break;
        default:
          console.log("❌ [checkAuth] Tipo de usuario inválido:", userType);
          return res.status(400).json({ message: "Tipo de usuario inválido" });
      }

      console.log(`🔍 [checkAuth] Buscando ${userType} con ID:`, id);
      userFound = await Model.findById(id).select("email nombre name");

      if (!userFound) {
        console.log(`❌ [checkAuth] ${userType} no encontrado en base de datos`);
        return res.status(404).json({ message: `${userType} no encontrado` });
      }

      console.log(`✅ [checkAuth] ${userType} encontrado:`, {
        id: userFound._id,
        email: userFound.email,
        nombre: userFound.nombre || userFound.name
      });

      return res.status(200).json({
        user: {
          id: userFound._id,
          email: userFound.email,
          userType,
          nombre: userFound.nombre || userFound.name || null,
        },
      });
    });
  } catch (error) {
    console.error("💥 [checkAuth] Error interno del servidor:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default LoginController;
