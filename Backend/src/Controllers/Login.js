import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { config } from "../config.js";
import EmpleadoModel from "../Models/Empleados.js";
import MotoristaModel from "../Models/Motorista.js";
import ClienteModel from "../Models/Clientes.js";

const LoginController = {};

// 🔒 SISTEMA DE INTENTOS FALLIDOS
const failedAttempts = new Map(); // Almacena { email: { attempts: number, blockedUntil: Date } }

// 🛡️ Función para verificar si el usuario está bloqueado
const isBlocked = (email) => {
  const attemptData = failedAttempts.get(email);
  if (!attemptData) return false;
  
  // Si está bloqueado, verificar si ya pasaron los 5 minutos
  if (attemptData.blockedUntil && new Date() < attemptData.blockedUntil) {
    return true;
  }
  
  // Si ya pasó el tiempo de bloqueo, reiniciar intentos
  if (attemptData.blockedUntil && new Date() >= attemptData.blockedUntil) {
    failedAttempts.delete(email);
    return false;
  }
  
  return false;
};

// 📊 Función para registrar intento fallido - CORREGIDA
const recordFailedAttempt = (email) => {
  const attemptData = failedAttempts.get(email) || { attempts: 0, blockedUntil: null };
  attemptData.attempts += 1;
  
  // 🔒 Si alcanza 4 intentos, bloquear inmediatamente
  if (attemptData.attempts >= 4) {
    attemptData.blockedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
    console.log(`🔒 Usuario ${email} bloqueado hasta ${attemptData.blockedUntil} después de ${attemptData.attempts} intentos`);
  }
  
  failedAttempts.set(email, attemptData);
  console.log(`📊 Usuario: ${email} - Intentos: ${attemptData.attempts} - Bloqueado: ${!!attemptData.blockedUntil}`);
  return attemptData;
};

// ✅ Función para limpiar intentos exitosos
const clearFailedAttempts = (email) => {
  failedAttempts.delete(email);
};

// 📈 Función para obtener tiempo restante de bloqueo
const getBlockTimeRemaining = (email) => {
  const attemptData = failedAttempts.get(email);
  if (!attemptData || !attemptData.blockedUntil) return 0;
  
  const remaining = attemptData.blockedUntil.getTime() - Date.now();
  return Math.max(0, Math.ceil(remaining / 1000)); // en segundos
};

LoginController.Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🔒 VERIFICAR SI EL USUARIO ESTÁ BLOQUEADO
    if (isBlocked(email)) {
      const timeRemaining = getBlockTimeRemaining(email);
      const minutesRemaining = Math.ceil(timeRemaining / 60);
      
      return res.status(429).json({ 
        message: `Demasiados intentos fallidos. Intenta de nuevo en ${minutesRemaining} minuto(s).`,
        blocked: true,
        timeRemaining: timeRemaining
      });
    }

    // 🚨 VERIFICAR SI YA TIENE 4 INTENTOS ANTES DE PROCESAR
    const currentAttempts = failedAttempts.get(email)?.attempts || 0;
    if (currentAttempts >= 4) {
      // Bloquear inmediatamente
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
        timeRemaining: timeRemaining
      });
    }

    let userFound;
    let userType;
    let isPasswordValid = false;

    // 1️⃣ Verificar si es el administrador
    if (email === config.ADMIN.emailAdmin) {
      if (password !== config.ADMIN.password) {
        // ❌ REGISTRAR INTENTO FALLIDO
        const attemptData = recordFailedAttempt(email);
        // 🔧 CORREGIR EL CÁLCULO DE INTENTOS RESTANTES
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
      // 2️⃣ Buscar en Empleados
      userFound = await EmpleadoModel.findOne({ email });

      if (userFound) {
        isPasswordValid = await bcryptjs.compare(password, userFound.password);
        if (!isPasswordValid) {
          // ❌ REGISTRAR INTENTO FALLIDO
          const attemptData = recordFailedAttempt(email);
          // 🔧 CORREGIR EL CÁLCULO DE INTENTOS RESTANTES
          const remaining = Math.max(0, 4 - attemptData.attempts);
          
          return res.status(400).json({ 
            message: `Contraseña incorrecta. Te quedan ${remaining} intento(s).`,
            attemptsRemaining: remaining
          });
        }
        userType = "Empleado";
      } else {
        // 3️⃣ Si no es empleado, buscar en Motoristas
        userFound = await MotoristaModel.findOne({ email });

        if (userFound) {
          isPasswordValid = await bcryptjs.compare(password, userFound.password);
          if (!isPasswordValid) {
            // ❌ REGISTRAR INTENTO FALLIDO
            const attemptData = recordFailedAttempt(email);
            // 🔧 CORREGIR EL CÁLCULO DE INTENTOS RESTANTES
            const remaining = Math.max(0, 4 - attemptData.attempts);
            
            return res.status(400).json({ 
              message: `Contraseña incorrecta. Te quedan ${remaining} intento(s).`,
              attemptsRemaining: remaining
            });
          }
          userType = "Motorista";
        } else {
          // 4️⃣ Si no es motorista, buscar en Clientes
          userFound = await ClienteModel.findOne({ email });

          if (!userFound) {
            // ❌ REGISTRAR INTENTO FALLIDO
            const attemptData = recordFailedAttempt(email);
            // 🔧 CORREGIR EL CÁLCULO DE INTENTOS RESTANTES
            const remaining = Math.max(0, 4 - attemptData.attempts);
            
            return res.status(400).json({ 
              message: `Usuario no encontrado. Te quedan ${remaining} intento(s).`,
              attemptsRemaining: remaining
            });
          }

          isPasswordValid = await bcryptjs.compare(password, userFound.password);
          if (!isPasswordValid) {
            // ❌ REGISTRAR INTENTO FALLIDO
            const attemptData = recordFailedAttempt(email);
            // 🔧 CORREGIR EL CÁLCULO DE INTENTOS RESTANTES
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

    // ✅ LOGIN EXITOSO - LIMPIAR INTENTOS FALLIDOS
    clearFailedAttempts(email);

    if (!config.JWT.secret) {
      console.error("Falta JWT secret en config.js");
      return res.status(500).json({ message: "Error del servidor: JWT" });
    }

    jwt.sign(
      { id: userFound._id, userType },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn },
      (error, token) => {
        if (error) {
          console.error("Error al firmar token:", error);
          return res.status(500).json({ message: "Error al generar token" });
        }

        res.cookie("authToken", token, {
          httpOnly: true,
          sameSite: "Lax",
          secure: false, // cámbialo a true si usas HTTPS en producción
        });

        res.status(200).json({
          message: "Inicio de sesión completado",
          userType,
          user: {
            id: userFound._id,
            email: userFound.email || email,
            nombre: userFound.nombre || userFound.name || null,
          },
        });
      }
    );
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

LoginController.checkAuth = async (req, res) => {
  try {
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ message: "No autorizado" });
    }

    jwt.verify(token, config.JWT.secret, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token inválido" });
      }

      const { id, userType } = decoded;

      if (userType === "Administrador") {
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

      // Seleccionar el modelo correcto según el tipo de usuario
      switch (userType) {
        case "Empleado":
          Model = EmpleadoModel;
          break;
        case "Motorista":
          Model = MotoristaModel;
          break;
        case "Cliente":
          Model = ClienteModel;
          break;
        default:
          return res.status(400).json({ message: "Tipo de usuario inválido" });
      }

      userFound = await Model.findById(id).select("email nombre name");

      if (!userFound) {
        return res.status(404).json({ 
          message: `${userType} no encontrado` 
        });
      }

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
    console.error("Error en checkAuth:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default LoginController;