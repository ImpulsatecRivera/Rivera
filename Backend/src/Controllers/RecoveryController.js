import EmpleadosModel from "../Models/Empleados.js";
import MotoristasModel from "../Models/Motorista.js";
import ClientesModelo from "../Models/Clientes.js"; 
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { EnviarEmail, html } from "../Utils/RecoveryPass.js";
import { config } from "../config.js";
import { EnviarSms } from "../Utils/EnviarSms.js";

const RecoveryPass = {};

// ========================================
// FUNCIÓN AUXILIAR: Normalizar teléfono
// ========================================
const normalizarTelefono = (phone) => {
  if (!phone) return null;
  
  // Convertir a string y limpiar
  let cleaned = String(phone)
    .trim()
    .replace(/\s+/g, '')      // Eliminar espacios
    .replace(/[-()]/g, '');   // Eliminar guiones y paréntesis
  
  // Remover prefijo + si existe
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // Si empieza con 503, removerlo para tener solo los 8 dígitos
  if (cleaned.startsWith('503') && cleaned.length > 8) {
    cleaned = cleaned.substring(3);
  }
  
  // Debe tener exactamente 8 dígitos para El Salvador
  if (cleaned.length === 8 && /^\d{8}$/.test(cleaned)) {
    return cleaned; // Retorna solo los 8 dígitos: "22345678"
  }
  
  return null;
};

// ========================================
// FUNCIÓN AUXILIAR: Buscar usuario MEJORADA
// ========================================
const buscarUsuario = async (criterio, valor) => {
  let userFound = null;
  let userType = null;

  if (criterio === "email") {
    // Búsqueda por email (sin cambios)
    userFound = await EmpleadosModel.findOne({ 
      email: { $regex: new RegExp(`^${valor}$`, 'i') } 
    });
    if (userFound) userType = "Empleado";

    if (!userFound) {
      userFound = await MotoristasModel.findOne({ 
        email: { $regex: new RegExp(`^${valor}$`, 'i') } 
      });
      if (userFound) userType = "Motorista";
    }

    if (!userFound) {
      userFound = await ClientesModelo.findOne({ 
        email: { $regex: new RegExp(`^${valor}$`, 'i') } 
      });
      if (userFound) userType = "Cliente";
    }
  } 
  else if (criterio === "phone") {
    // 🔥 BÚSQUEDA MEJORADA POR TELÉFONO
    console.log("🔍 Buscando usuario por teléfono:", valor);
    
    // Normalizar el teléfono de búsqueda a 8 dígitos
    const normalizedSearch = normalizarTelefono(valor);
    
    if (!normalizedSearch) {
      console.log("❌ Número inválido después de normalizar");
      return { userFound: null, userType: null };
    }
    
    console.log("🔍 Número normalizado para búsqueda:", normalizedSearch);
    
    // Generar todas las variaciones posibles del número
    const variaciones = [
      normalizedSearch,                    // 22345678
      `+503${normalizedSearch}`,           // +50322345678
      `503${normalizedSearch}`,            // 50322345678
      `${normalizedSearch.slice(0,4)}-${normalizedSearch.slice(4)}`, // 2234-5678
    ];
    
    console.log("🔍 Buscando variaciones:", variaciones);
    
    // Buscar en Empleados
    userFound = await EmpleadosModel.findOne({
      $or: variaciones.map(v => ({ phone: v }))
    });
    
    if (userFound) {
      userType = "Empleado";
      console.log("✅ Usuario encontrado en Empleados");
      console.log("📱 Teléfono en BD:", userFound.phone);
    }

    // Si no se encuentra, buscar en Motoristas
    if (!userFound) {
      userFound = await MotoristasModel.findOne({
        $or: variaciones.map(v => ({ phone: v }))
      });
      
      if (userFound) {
        userType = "Motorista";
        console.log("✅ Usuario encontrado en Motoristas");
        console.log("📱 Teléfono en BD:", userFound.phone);
      }
    }

    // Si no se encuentra, buscar en Clientes
    if (!userFound) {
      userFound = await ClientesModelo.findOne({
        $or: variaciones.map(v => ({ phone: v }))
      });
      
      if (userFound) {
        userType = "Cliente";
        console.log("✅ Usuario encontrado en Clientes");
        console.log("📱 Teléfono en BD:", userFound.phone);
      }
    }
    
    if (!userFound) {
      console.log("❌ No se encontró usuario con ninguna variación del teléfono");
      
      // 🔍 DEBUG: Mostrar algunos teléfonos en la BD
      const empleadosSample = await EmpleadosModel.find({}, { phone: 1 }).limit(3);
      const motoristasSample = await MotoristasModel.find({}, { phone: 1 }).limit(3);
      const clientesSample = await ClientesModelo.find({}, { phone: 1 }).limit(3);
      
      console.log("📋 Muestra de teléfonos en BD:");
      console.log("  Empleados:", empleadosSample.map(e => e.phone));
      console.log("  Motoristas:", motoristasSample.map(m => m.phone));
      console.log("  Clientes:", clientesSample.map(c => c.phone));
    }
  }

  return { userFound, userType };
};

// ========================================
// FUNCIÓN AUXILIAR: Actualizar contraseña
// ========================================
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

// ========================================
// ENDPOINT: Solicitar código de recuperación
// ========================================
RecoveryPass.requestCode = async (req, res) => {
  console.log('🔥 [DEBUG] === INICIO REQUEST CODE ===');
  
  const { email, phone, via = "email" } = req.body;
  console.log("📥 Request body:", { email, phone, via });

  try {
    // Validaciones de entrada
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

    // Buscar usuario según el método seleccionado
    if (via === "email") {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("🔍 Buscando por email:", normalizedEmail);
      
      const result = await buscarUsuario("email", normalizedEmail);
      userFound = result.userFound;
      userType = result.userType;
      
    } else if (via === "sms") {
      // 🔥 NORMALIZACIÓN MEJORADA
      console.log("📱 Teléfono recibido del frontend:", phone);
      
      // El frontend envía: +50322345678
      // Normalizar a formato consistente
      const result = await buscarUsuario("phone", phone);
      userFound = result.userFound;
      userType = result.userType;
    }

    // Si no se encuentra usuario
    if (!userFound) {
      const searchTerm = via === "email" ? "email" : "número de teléfono";
      console.log(`❌ Usuario no encontrado con ${searchTerm}:`, via === "email" ? email : phone);
      
      return res.status(400).json({ 
        message: `Usuario no encontrado con ese ${searchTerm}`,
        debug: {
          received: via === "email" ? email : phone,
          normalized: via === "sms" ? normalizarTelefono(phone) : null
        }
      });
    }

    // Verificación adicional para SMS
    if (via === "sms" && !userFound.phone) {
      console.log("❌ Usuario encontrado pero sin teléfono registrado");
      return res.status(400).json({
        message: "La cuenta no tiene número de teléfono registrado. Usa recuperación por email."
      });
    }

    // Generar código de 5 dígitos
    const codex = Math.floor(10000 + Math.random() * 90000).toString();
    console.log("🔑 Código generado:", codex);

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
        // Usar el teléfono del usuario tal como está en la BD
        let phoneToUse = userFound.phone;
        
        // Asegurar formato +503XXXXXXXX para Twilio
        const normalizedForTwilio = normalizarTelefono(phoneToUse);
        if (normalizedForTwilio) {
          phoneToUse = `+503${normalizedForTwilio}`;
        }
        
        console.log("📤 Enviando SMS a:", phoneToUse);
        
        const smsMessage = `Tu código de verificación es: ${codex}. Válido por 20 minutos.`;
        
        // 🧪 MODO DESARROLLO
        if (process.env.NODE_ENV === 'development') {
          console.log("🧪 MODO DESARROLLO - SMS simulado");
          console.log("📱 Número destino:", phoneToUse);
          console.log("📝 Código:", codex);
          
          return res.status(200).json({ 
            message: "⚠️ DESARROLLO: SMS simulado (código en consola)",
            success: true,
            sentTo: phoneToUse,
            method: "sms",
            userType: userType,
            recoveryToken: token,
            devCode: codex
          });
        }
        
        // Enviar SMS real
        const smsResult = await EnviarSms(phoneToUse, smsMessage);
        
        if (!smsResult.success) {
          console.error("❌ Error enviando SMS:", smsResult);
          
          let errorMessage = "Error enviando SMS.";
          let statusCode = 500;
          
          if (smsResult.code === 21211) {
            errorMessage = "El número de teléfono no es válido.";
            statusCode = 400;
          } else if (smsResult.code === 21608) {
            errorMessage = "Este número no está verificado en Twilio.";
            statusCode = 403;
          }
          
          return res.status(statusCode).json({ 
            message: errorMessage,
            success: false,
            error: smsResult.error,
            twilioCode: smsResult.code
          });
        }
        
        console.log("✅ SMS enviado exitosamente");
        
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
        // EMAIL (sin cambios)
        const emailToUse = userFound.email;
        
        console.log("📧 Enviando email a:", emailToUse);
        await EnviarEmail(
          emailToUse,
          "Tu código de verificación",
          "Hola, este es tu código de verificación para recuperar tu contraseña.",
          html(codex)
        );
        
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
      console.error("❌ Error enviando código:", sendError);
      
      const errorMessage = via === "sms" 
        ? "Error enviando SMS. Intenta con recuperación por email." 
        : "Error enviando email. Intenta nuevamente.";
      
      return res.status(500).json({ 
        message: errorMessage,
        error: sendError.message 
      });
    }

  } catch (error) {
    console.error("❌ Error general en requestCode:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

// ========================================
// ENDPOINT: Verificar código
// ========================================
RecoveryPass.verifyCode = async (req, res) => {
  const { code, recoveryToken, isPhoneVerification } = req.body;

  console.log("Verificando código:", code);

  try {
    if (!code || !recoveryToken) {
      return res.status(400).json({ message: "Código y token requeridos" });
    }

    if (code.length !== 5 || !/^\d{5}$/.test(code)) {
      return res.status(400).json({ message: "El código debe tener 5 dígitos" });
    }

    // Verificar token JWT
    let decoded;
    try {
      decoded = jwt.verify(recoveryToken, config.JWT.secret);
    } catch (jwtError) {
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
      return res.status(400).json({ 
        message: "Código inválido. Verifica e inténtalo de nuevo." 
      });
    }

    // ⭐ NUEVO: Si es verificación de teléfono al registrarse
    if (isPhoneVerification && decoded.phone) {
      console.log("Marcando teléfono como verificado:", decoded.phone);
      
      // Actualizar el campo phoneVerified en el modelo correspondiente
      let updatedUser = null;
      
      if (decoded.userType === "Empleado") {
        updatedUser = await EmpleadosModel.findByIdAndUpdate(
          decoded.id,
          { 
            phoneVerified: true,
            phoneVerifiedAt: new Date()
          },
          { new: true }
        );
      } else if (decoded.userType === "Motorista") {
        updatedUser = await MotoristasModel.findByIdAndUpdate(
          decoded.id,
          { 
            phoneVerified: true,
            phoneVerifiedAt: new Date()
          },
          { new: true }
        );
      } else if (decoded.userType === "Cliente") {
        updatedUser = await ClientesModelo.findByIdAndUpdate(
          decoded.id,
          { 
            phoneVerified: true,
            phoneVerifiedAt: new Date()
          },
          { new: true }
        );
      }

      if (!updatedUser) {
        return res.status(404).json({ 
          message: "Usuario no encontrado" 
        });
      }

      console.log("✅ Teléfono verificado para:", updatedUser.phone);
    }

    const newToken = jwt.sign(
      {
        email: decoded.email,
        phone: decoded.phone,
        id: decoded.id,
        codex: decoded.codex,
        userType: decoded.userType,
        verified: true,
        via: decoded.via,
        verifiedAt: new Date().toISOString()
      },
      config.JWT.secret,
      { expiresIn: "20m" }
    );

    res.status(200).json({
      message: isPhoneVerification 
        ? "Teléfono verificado exitosamente" 
        : "Código verificado exitosamente",
      success: true,
      method: decoded.via,
      userType: decoded.userType,
      phoneVerified: isPhoneVerification ? true : undefined,
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

// ========================================
// ENDPOINT: Cambiar contraseña
// ========================================
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

// ========================================
// ENDPOINT: Iniciar sesión con código
// ========================================
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

// ========================================
// ENDPOINT: Debug de usuarios (auxiliar)
// ========================================
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

// ========================================
// ENDPOINT: Enviar código para registro nuevo
// ========================================
RecoveryPass.sendVerificationForRegistration = async (req, res) => {
  console.log('🔥 [DEBUG] === ENVÍO DE CÓDIGO PARA REGISTRO ===');
  
  const { phone } = req.body;
  
  try {
    // Validación
    if (!phone) {
      return res.status(400).json({ message: "Número de teléfono es requerido" });
    }

    // Normalizar número
    let normalizedPhone = phone.trim();
    if (!normalizedPhone.startsWith('+')) {
      if (normalizedPhone.startsWith('503')) {
        normalizedPhone = '+' + normalizedPhone;
      } else {
        normalizedPhone = '+503' + normalizedPhone;
      }
    }

    console.log("📱 Enviando SMS de verificación para registro a:", normalizedPhone);

    // ⭐ OPCIONAL: Verificar que NO exista ya un usuario con este teléfono
    const existingUser = await buscarUsuario("phone", normalizedPhone);
    if (existingUser.userFound) {
      return res.status(400).json({ 
        message: "Este número de teléfono ya está registrado. Intenta iniciar sesión.",
        alreadyExists: true
      });
    }

    // Generar código de 5 dígitos
    const codex = Math.floor(10000 + Math.random() * 90000).toString();
    console.log("🔑 Código generado:", codex);

    // Crear token JWT (sin ID de usuario, solo con teléfono)
    const tokenPayload = { 
      phone: normalizedPhone,
      codex, 
      purpose: 'registration', // ⭐ Identificar que es para registro
      verified: false,
      via: 'sms',
      createdAt: new Date().toISOString()
    };

    const token = jwt.sign(tokenPayload, config.JWT.secret, { expiresIn: "20m" });

    // Enviar SMS
    try {
      // Modo desarrollo: Simular SMS
      if (process.env.NODE_ENV === 'development') {
        console.log("🧪 MODO DESARROLLO - SMS simulado");
        console.log("📱 Número destino:", normalizedPhone);
        console.log("📝 Código:", codex);
        
        return res.status(200).json({ 
          message: "⚠️ DESARROLLO: SMS simulado (código en consola)",
          success: true,
          sentTo: normalizedPhone,
          method: "sms",
          recoveryToken: token,
          devCode: codex // ⚠️ Solo en desarrollo
        });
      }

      // Enviar SMS real
      const smsMessage = `Tu código de verificación es: ${codex}. Válido por 20 minutos.`;
      console.log('📤 Enviando SMS...');
      
      const smsResult = await EnviarSms(normalizedPhone, smsMessage);
      console.log('📋 Resultado SMS:', smsResult);
      
      if (!smsResult.success) {
        console.error("❌ Error enviando SMS:", smsResult);
        
        let errorMessage = "Error enviando SMS.";
        let statusCode = 500;
        
        if (smsResult.code === 21211) {
          errorMessage = "El número de teléfono no es válido.";
          statusCode = 400;
        } else if (smsResult.code === 21608) {
          errorMessage = "Este número no está verificado en Twilio. En cuentas de prueba, solo números verificados pueden recibir SMS.";
          statusCode = 403;
        } else if (smsResult.code === 21614) {
          errorMessage = "No se puede enviar SMS a números de este país.";
          statusCode = 400;
        } else if (smsResult.code === 20003) {
          errorMessage = "Error de configuración del servicio SMS.";
          statusCode = 500;
        }
        
        return res.status(statusCode).json({ 
          message: errorMessage,
          success: false,
          error: smsResult.error,
          twilioCode: smsResult.code
        });
      }
      
      console.log("✅ SMS enviado exitosamente");
      
      return res.status(200).json({ 
        message: "Código enviado vía SMS",
        success: true,
        sentTo: `***${normalizedPhone.slice(-4)}`,
        method: "sms",
        messageId: smsResult.messageId,
        recoveryToken: token
      });
      
    } catch (sendError) {
      console.error("❌ Error enviando SMS:", sendError);
      return res.status(500).json({ 
        message: "Error enviando SMS. Intenta nuevamente.",
        error: sendError.message 
      });
    }

  } catch (error) {
    console.error("❌ Error en sendVerificationForRegistration:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

// ========================================
// ENDPOINT: Verificar código para registro
// ========================================
RecoveryPass.verifyCodeForRegistration = async (req, res) => {
  const { code, recoveryToken } = req.body;

  console.log("🔐 Verificando código para registro");

  try {
    if (!code || !recoveryToken) {
      return res.status(400).json({ message: "Código y token requeridos" });
    }

    if (code.length !== 5 || !/^\d{5}$/.test(code)) {
      return res.status(400).json({ message: "El código debe tener 5 dígitos" });
    }

    // Verificar token JWT
    let decoded;
    try {
      decoded = jwt.verify(recoveryToken, config.JWT.secret);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: "El código ha expirado. Solicita un nuevo código." 
        });
      }
      return res.status(401).json({ 
        message: "Token inválido. Solicita un nuevo código." 
      });
    }

    // Verificar que sea para registro
    if (decoded.purpose !== 'registration') {
      return res.status(400).json({ 
        message: "Token no válido para registro" 
      });
    }

    // Verificar código
    if (decoded.codex !== code) {
      console.log("❌ Código incorrecto");
      return res.status(400).json({ 
        message: "Código inválido. Verifica e inténtalo de nuevo." 
      });
    }

    console.log("✅ Código verificado correctamente para registro");

    // Crear nuevo token con código verificado
    const verifiedToken = jwt.sign(
      {
        phone: decoded.phone,
        codex: decoded.codex,
        purpose: 'registration',
        verified: true,
        verifiedAt: new Date().toISOString()
      },
      config.JWT.secret,
      { expiresIn: "20m" }
    );

    res.status(200).json({
      message: "Teléfono verificado exitosamente",
      success: true,
      phoneVerified: true,
      phone: decoded.phone,
      verifiedToken: verifiedToken
    });

  } catch (error) {
    console.error("❌ Error en verifyCodeForRegistration:", error);
    res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

export default RecoveryPass;