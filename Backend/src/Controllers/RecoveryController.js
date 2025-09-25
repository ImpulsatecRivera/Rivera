import EmpleadosModel from "../Models/Empleados.js";
import MotoristasModel from "../Models/Motorista.js";
import ClientesModelo from "../Models/Clientes.js"; 
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { EnviarEmail, html } from "../Utils/RecoveryPass.js";
import { config } from "../config.js";
import { EnviarSms } from "../Utils/EnviarSms.js";

const RecoveryPass = {};

// Función auxiliar para buscar usuario en TODOS los modelos
const buscarUsuario = async (criterio, valor) => {
  let userFound = null;
  let userType = null;

  // 1. Buscar en Empleados
  if (criterio === "email") {
    userFound = await EmpleadosModel.findOne({ 
      email: { $regex: new RegExp(`^${valor}$`, 'i') } 
    });
    if (userFound) userType = "Empleado";
  } else if (criterio === "phone") {
    userFound = await EmpleadosModel.findOne({
      $or: [
        { phone: valor },
        { phone: valor.replace('+503', '') },
        { phone: valor.replace('+', '') }
      ]
    });
    if (userFound) userType = "Empleado";
  }

  // 2. Si no se encuentra en Empleados, buscar en Motoristas
  if (!userFound) {
    if (criterio === "email") {
      userFound = await MotoristasModel.findOne({ 
        email: { $regex: new RegExp(`^${valor}$`, 'i') } 
      });
      if (userFound) userType = "Motorista";
    } else if (criterio === "phone") {
      userFound = await MotoristasModel.findOne({
        $or: [
          { phone: valor },
          { phone: valor.replace('+503', '') },
          { phone: valor.replace('+', '') }
        ]
      });
      if (userFound) userType = "Motorista";
    }
  }

  // 3. Si no se encuentra en Motoristas, buscar en Clientes
  if (!userFound) {
    if (criterio === "email") {
      userFound = await ClientesModelo.findOne({ 
        email: { $regex: new RegExp(`^${valor}$`, 'i') } 
      });
      if (userFound) userType = "Cliente";
    } else if (criterio === "phone") {
      userFound = await ClientesModelo.findOne({
        $or: [
          { phone: valor },
          { phone: valor.replace('+503', '') },
          { phone: valor.replace('+', '') }
        ]
      });
      if (userFound) userType = "Cliente";
    }
  }

  return { userFound, userType };
};

// Función auxiliar para actualizar contraseña en TODOS los modelos
const actualizarContrasena = async (decoded, hashedPassword) => {
  let updatedUser = null;

  // Intentar actualizar en el modelo correspondiente según userType
  if (decoded.userType === "Empleado") {
    updatedUser = await EmpleadosModel.findOneAndUpdate(
      { $or: [{ email: decoded.email }, { _id: decoded.id }] },
      { 
        password: hashedPassword,
        passwordUpdatedAt: new Date()
      },
      { new: true }
    );
  } else if (decoded.userType === "Motorista") {
    updatedUser = await MotoristasModel.findOneAndUpdate(
      { $or: [{ email: decoded.email }, { _id: decoded.id }] },
      { 
        password: hashedPassword,
        passwordUpdatedAt: new Date()
      },
      { new: true }
    );
  } else if (decoded.userType === "Cliente") {
    updatedUser = await ClientesModelo.findOneAndUpdate(
      { $or: [{ email: decoded.email }, { _id: decoded.id }] },
      { 
        password: hashedPassword,
        passwordUpdatedAt: new Date()
      },
      { new: true }
    );
  }

  // Si no se encuentra en el modelo específico, buscar en TODOS los modelos
  if (!updatedUser) {
    // Buscar en Empleados
    updatedUser = await EmpleadosModel.findOneAndUpdate(
      { $or: [{ email: decoded.email }, { _id: decoded.id }] },
      { 
        password: hashedPassword,
        passwordUpdatedAt: new Date()
      },
      { new: true }
    );

    // Si no está en Empleados, buscar en Motoristas
    if (!updatedUser) {
      updatedUser = await MotoristasModel.findOneAndUpdate(
        { $or: [{ email: decoded.email }, { _id: decoded.id }] },
        { 
          password: hashedPassword,
          passwordUpdatedAt: new Date()
        },
        { new: true }
      );
    }

    // Si no está en Motoristas, buscar en Clientes
    if (!updatedUser) {
      updatedUser = await ClientesModelo.findOneAndUpdate(
        { $or: [{ email: decoded.email }, { _id: decoded.id }] },
        { 
          password: hashedPassword,
          passwordUpdatedAt: new Date()
        },
        { new: true }
      );
    }
  }

  return updatedUser;
};

// Solicitar código de recuperación
RecoveryPass.requestCode = async (req, res) => {
  console.log('🔥 [DEBUG] === INICIO REQUEST CODE ===');
  console.log('🔥 [DEBUG] NODE_ENV:', process.env.NODE_ENV);
  console.log('🔥 [DEBUG] Variables Twilio disponibles:');
  console.log('  - ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'SI' : 'NO');
  console.log('  - AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'SI' : 'NO');  
  console.log('  - PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? 'SI' : 'NO');
  console.log('🔥 [DEBUG] Config object Twilio:');
  console.log('  - config.TWILIO_ACCOUNT_SID:', config.TWILIO_ACCOUNT_SID ? 'SI' : 'NO');
  console.log('  - config.TWILIO_AUTH_TOKEN:', config.TWILIO_AUTH_TOKEN ? 'SI' : 'NO');
  console.log('  - config.TWILIO_PHONE_NUMBER:', config.TWILIO_PHONE_NUMBER ? 'SI' : 'NO');
  
  const { email, phone, via = "email" } = req.body;
  console.log("🔥 [DEBUG] Request body:", { email, phone, via });

  console.log("Solicitud de código recibida:", { email, phone, via });

  try {
    // Validaciones de entrada según el método
    if (via === "email" && !email) {
      return res.status(400).json({ message: "Email es requerido" });
    }

    if (via === "sms" && !phone) {
      return res.status(400).json({ message: "Número de teléfono es requerido" });
    }

    if (!["email", "sms"].includes(via)) {
      return res.status(400).json({ message: "Método de envío debe ser 'email' o 'sms'" });
    }

    let userFound, userType;
    let searchCriteria;

    // Buscar usuario según el método seleccionado
    if (via === "email") {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("Buscando usuario por email:", normalizedEmail);
      
      const result = await buscarUsuario("email", normalizedEmail);
      userFound = result.userFound;
      userType = result.userType;
      searchCriteria = `email: ${normalizedEmail}`;
      
    } else if (via === "sms") {
      // Normalizar número de teléfono
      let normalizedPhone = phone.trim();
      
      // Si no empieza con +, agregar código de país
      if (!normalizedPhone.startsWith('+')) {
        if (normalizedPhone.startsWith('503')) {
          normalizedPhone = '+' + normalizedPhone;
        } else {
          normalizedPhone = '+503' + normalizedPhone;
        }
      }
      
      console.log("Buscando usuario por teléfono:", normalizedPhone);
      
      const result = await buscarUsuario("phone", normalizedPhone);
      userFound = result.userFound;
      userType = result.userType;
      searchCriteria = `phone: ${normalizedPhone}`;
    }
    
    console.log("Criterio de búsqueda:", searchCriteria);
    console.log("Usuario encontrado:", userFound ? `Sí (ID: ${userFound._id}, Tipo: ${userType})` : "No");

    // Si no se encuentra usuario
    if (!userFound) {
      const searchTerm = via === "email" ? "email" : "número de teléfono";
      console.log(`Usuario no encontrado con ${searchTerm}:`, via === "email" ? email : phone);
      
      return res.status(400).json({ 
        message: `Usuario no encontrado con ese ${searchTerm}` 
      });
    }

    // Verificación adicional para SMS: usuario debe tener teléfono registrado
    if (via === "sms" && !userFound.phone) {
      console.log("Usuario encontrado pero sin teléfono registrado");
      return res.status(400).json({
        message: "La cuenta no tiene número de teléfono registrado. Usa recuperación por email."
      });
    }

    // Generar código de 5 dígitos
    const codex = Math.floor(10000 + Math.random() * 90000).toString();
    console.log("Código generado:", codex);

    // Crear token JWT
    const tokenPayload = { 
      email: userFound.email,
      phone: userFound.phone || null,
      id: userFound._id,
      codex, 
      userType: userType,
      verified: false,
      via: via,
      createdAt: new Date().toISOString()
    };

    const token = jwt.sign(tokenPayload, config.JWT.secret, { expiresIn: "20m" });

    // Enviar código según método seleccionado
    try {
      if (via === "sms") {
        // Usar el teléfono del usuario encontrado
        let phoneToUse = userFound.phone;
        
        // Agregar código de país si no lo tiene
        if (!phoneToUse.startsWith('+')) {
          if (phoneToUse.startsWith('503')) {
            phoneToUse = '+' + phoneToUse;
          } else {
            phoneToUse = '+503' + phoneToUse;
          }
        }
        
        const smsMessage = `Tu código de verificación es: ${codex}. Válido por 20 minutos.`;
        
        // 🧪 MODO DESARROLLO: Simular SMS sin enviar (opcional)
        if (process.env.NODE_ENV === 'development') {
          console.log("🧪 MODO DESARROLLO - SMS simulado");
          console.log("📱 Número destino:", phoneToUse);
          console.log("📝 Código:", codex);
          console.log("🔗 Token:", token);
          
          return res.status(200).json({ 
            message: "⚠️ DESARROLLO: SMS simulado (código en consola del servidor)",
            success: true,
            sentTo: phoneToUse,
            method: "sms",
            userType: userType,
            recoveryToken: token,
            devCode: codex // ⚠️ Solo para desarrollo - ELIMINAR en producción
          });
        }
        
        console.log("Enviando SMS a:", phoneToUse);
        console.log('🔥 [DEBUG] Intentando enviar SMS...');
        
        // Enviar SMS real
        const smsResult = await EnviarSms(phoneToUse, smsMessage);
        console.log('🔥 [DEBUG] Resultado SMS:', smsResult);
        
        // ✅ MANEJO MEJORADO DE ERRORES
        if (!smsResult.success) {
          console.error("❌ Error enviando SMS:", smsResult);
          
          // Determinar el tipo de error según el código de Twilio
          let errorMessage = "Error enviando SMS.";
          let statusCode = 500;
          let suggestion = "Intenta usar recuperación por email.";
          
          if (smsResult.code === 21211) {
            // Número inválido
            errorMessage = "El número de teléfono no es válido.";
            statusCode = 400;
          } else if (smsResult.code === 21608) {
            // Número no verificado (Trial account)
            errorMessage = "Este número no está verificado. En cuentas de prueba Twilio, solo números verificados pueden recibir SMS.";
            statusCode = 403;
            suggestion = "Verifica el número en tu cuenta Twilio o usa recuperación por email.";
          } else if (smsResult.code === 21614) {
            // No puedes enviar SMS a este país
            errorMessage = "No se puede enviar SMS a números de este país con tu configuración actual de Twilio.";
            statusCode = 400;
          } else if (smsResult.code === 21606) {
            // Número de teléfono no es móvil
            errorMessage = "El número proporcionado no es un número móvil válido.";
            statusCode = 400;
          } else if (smsResult.code === 20003) {
            // Credenciales de autenticación inválidas
            errorMessage = "Error de configuración del servicio SMS. Contacta al administrador.";
            statusCode = 500;
            suggestion = "Verifica las credenciales de Twilio en el servidor.";
          }
          
          return res.status(statusCode).json({ 
            message: errorMessage,
            success: false,
            error: smsResult.error,
            twilioCode: smsResult.code,
            suggestion: suggestion,
            debug: {
              phoneUsed: phoneToUse,
              twilioError: smsResult.error,
              hasCredentials: {
                accountSid: !!config.TWILIO_ACCOUNT_SID,
                authToken: !!config.TWILIO_AUTH_TOKEN,
                phoneNumber: !!config.TWILIO_PHONE_NUMBER
              }
            }
          });
        }
        
        console.log("✅ SMS confirmado enviado:", smsResult.messageId);
        
        return res.status(200).json({ 
          message: "Código enviado vía SMS",
          success: true,
          sentTo: `***${phoneToUse.slice(-4)}`,
          method: "sms",
          userType: userType,
          messageId: smsResult.messageId,
          recoveryToken: token
        });
        
      } else {
        // Para EMAIL
        const emailToUse = userFound.email;
        
        console.log("Enviando email a:", emailToUse);
        await EnviarEmail(
          emailToUse,
          "Tu código de verificación",
          "Hola, este es tu código de verificación para recuperar tu contraseña.",
          html(codex)
        );
        
        console.log("Email enviado exitosamente");
        
        return res.status(200).json({ 
          message: "Código enviado vía email",
          success: true,
          sentTo: `***@${emailToUse.split('@')[1]}`,
          method: "email",
          userType: userType,
          recoveryToken: token
        });
      }
    } catch (sendError) {
      console.error("Error enviando código:", sendError);
      
      const errorMessage = via === "sms" 
        ? "Error enviando SMS. Intenta con recuperación por email." 
        : "Error enviando email. Intenta nuevamente.";
      
      return res.status(500).json({ 
        message: errorMessage,
        error: sendError.message 
      });
    }

  } catch (error) {
    console.error("Error general en requestCode:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

// Verificar código
RecoveryPass.verifyCode = async (req, res) => {
  const { code, recoveryToken } = req.body;

  console.log("Verificando código:", code);

  try {
    // Validaciones básicas
    if (!code) {
      return res.status(400).json({ message: "Código requerido" });
    }

    if (!recoveryToken) {
      return res.status(400).json({ 
        message: "Token de recuperación requerido. Solicita un nuevo código." 
      });
    }

    if (code.length !== 5 || !/^\d{5}$/.test(code)) {
      return res.status(400).json({ message: "El código debe tener 5 dígitos" });
    }

    // Verificar token JWT
    let decoded;
    try {
      decoded = jwt.verify(recoveryToken, config.JWT.secret);
      console.log("Token decodificado:", { 
        email: decoded.email, 
        via: decoded.via,
        userType: decoded.userType,
        createdAt: decoded.createdAt 
      });
    } catch (jwtError) {
      console.log("Error JWT:", jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: "El código ha expirado. Solicita un nuevo código." 
        });
      }
      return res.status(401).json({ 
        message: "Token inválido. Solicita un nuevo código." 
      });
    }

    // Verificar código
    if (decoded.codex !== code) {
      console.log("Código incorrecto:", { enviado: code, esperado: decoded.codex });
      return res.status(400).json({ 
        message: "Código inválido. Verifica e inténtalo de nuevo." 
      });
    }

    console.log("Código verificado correctamente");

    // Crear nuevo token con código verificado
    const newTokenPayload = {
      email: decoded.email,
      phone: decoded.phone,
      id: decoded.id,
      codex: decoded.codex,
      userType: decoded.userType,
      verified: true,
      via: decoded.via,
      verifiedAt: new Date().toISOString()
    };

    const newToken = jwt.sign(newTokenPayload, config.JWT.secret, { expiresIn: "20m" });

    console.log(`Código verificado para: ${decoded.email || decoded.phone} (${decoded.userType})`);
    res.status(200).json({
      message: "Código verificado exitosamente",
      success: true,
      method: decoded.via,
      userType: decoded.userType,
      verifiedToken: newToken
    });

  } catch (error) {
    console.error("Error en verifyCode:", error);
    res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

// Cambiar contraseña
RecoveryPass.newPassword = async (req, res) => {
  const { newPassword, verifiedToken } = req.body;

  console.log("Solicitud de cambio de contraseña");

  try {
    // Validaciones
    if (!newPassword) {
      return res.status(400).json({ message: "Nueva contraseña es requerida" });
    }

    if (!verifiedToken) {
      return res.status(400).json({ message: "Token de verificación requerido" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 6 caracteres" 
      });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(verifiedToken, config.JWT.secret);
    } catch (jwtError) {
      console.log("Error JWT en newPassword:", jwtError.message);
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    if (!decoded.verified) {
      return res.status(400).json({ message: "Código no verificado" });
    }

    console.log("Actualizando contraseña para usuario:", decoded.email, `(${decoded.userType})`);

    // Hashear nueva contraseña
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Actualizar contraseña usando la función auxiliar
    const updatedUser = await actualizarContrasena(decoded, hashedPassword);

    if (!updatedUser) {
      console.log("Usuario no encontrado para actualizar contraseña");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log(`Contraseña actualizada para: ${decoded.email || decoded.phone} (${decoded.userType})`);
    res.status(200).json({ 
      message: "Contraseña actualizada exitosamente",
      success: true,
      userType: decoded.userType
    });

  } catch (error) {
    console.error("Error en newPassword:", error);
    res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

// Iniciar sesión con código (sin cambiar contraseña)
RecoveryPass.IniciarSesionConCodigo = async (req, res) => {
  const { code, verifiedToken } = req.body;

  console.log("Intento de inicio de sesión con código");

  if (!code || !verifiedToken) {
    return res.status(400).json({ 
      message: "Faltan datos requeridos" 
    });
  }

  try {
    // Verificar token y código
    const decoded = jwt.verify(verifiedToken, config.JWT.secret);
    
    if (decoded.codex !== code) {
      console.log("Código incorrecto en inicio de sesión");
      return res.status(400).json({ message: "Código incorrecto" });
    }

    if (!decoded.verified) {
      return res.status(400).json({ 
        message: "Código no verificado previamente" 
      });
    }

    // Crear token de autenticación
    const authToken = jwt.sign({
      email: decoded.email,
      userType: decoded.userType,
      id: decoded.id,
      loginMethod: "recovery_code",
      loginAt: new Date().toISOString()
    },
    config.JWT.secret,
    { expiresIn: "8h" }
    );

    console.log(`Inicio de sesión exitoso para: ${decoded.email || decoded.phone} (${decoded.userType})`);
    return res.status(200).json({ 
      message: "Inicio de sesión exitoso", 
      success: true,
      user: {
        email: decoded.email,
        userType: decoded.userType
      },
      authToken: authToken
    });

  } catch (error) {
    console.error("Error en IniciarSesionConCodigo:", error);
    return res.status(500).json({ 
      message: "Error al iniciar sesión",
      error: error.message 
    });
  }
};

// Función auxiliar para debugging
RecoveryPass.debugUsers = async (req, res) => {
  try {
    const empleados = await EmpleadosModel.find({}, { email: 1, phone: 1, _id: 1 }).limit(5);
    const motoristas = await MotoristasModel.find({}, { email: 1, phone: 1, _id: 1 }).limit(5);
    const clientes = await ClientesModelo.find({}, { email: 1, phone: 1, _id: 1 }).limit(5);
    
    console.log("Empleados en DB:", empleados);
    console.log("Motoristas en DB:", motoristas);
    console.log("Clientes en DB:", clientes);
    
    res.json({ 
      empleados,
      motoristas,
      clientes,
      total: {
        empleados: empleados.length,
        motoristas: motoristas.length,
        clientes: clientes.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default RecoveryPass;