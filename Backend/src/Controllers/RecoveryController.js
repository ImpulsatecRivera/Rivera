import EmpleadosModel from "../Models/Empleados.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { EnviarEmail, html } from "../Utils/RecoveryPass.js";
import { config } from "../config.js";
import { EnviarSms } from "../Utils/EnviarSms.js";

const RecoveryPass = {};

// Solicitar código de recuperación
RecoveryPass.requestCode = async (req, res) => {
  const { email, phone, via = "email" } = req.body;

  console.log("📧 Solicitud de código recibida:", { email, phone, via });

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

    let userFound;
    let searchCriteria;

    // Buscar usuario según el método seleccionado
    if (via === "email") {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("🔍 Buscando usuario por email:", normalizedEmail);
      
      // Búsqueda por email (case-insensitive)
      userFound = await EmpleadosModel.findOne({ 
        email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
      });
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
      
      console.log("🔍 Buscando usuario por teléfono:", normalizedPhone);
      
      // Buscar por número exacto o sin código de país
      userFound = await EmpleadosModel.findOne({
        $or: [
          { phone: normalizedPhone },
          { phone: normalizedPhone.replace('+503', '') },
          { phone: normalizedPhone.replace('+', '') }
        ]
      });
      searchCriteria = `phone: ${normalizedPhone}`;
    }
    
    console.log("🔍 Criterio de búsqueda:", searchCriteria);
    console.log("👤 Usuario encontrado:", userFound ? `Sí (ID: ${userFound._id})` : "No");

    // Si no se encuentra usuario
    if (!userFound) {
      const searchTerm = via === "email" ? "email" : "número de teléfono";
      console.log(`❌ Usuario no encontrado con ${searchTerm}:`, via === "email" ? email : phone);
      
      return res.status(400).json({ 
        message: `Usuario no encontrado con ese ${searchTerm}` 
      });
    }

    // Verificación adicional para SMS: usuario debe tener teléfono registrado
    if (via === "sms" && !userFound.phone) {
      console.log("❌ Usuario encontrado pero sin teléfono registrado");
      return res.status(400).json({
        message: "La cuenta no tiene número de teléfono registrado. Usa recuperación por email."
      });
    }

    // Generar código de 5 dígitos
    const codex = Math.floor(10000 + Math.random() * 90000).toString();
    console.log("🔢 Código generado:", codex);

    // Crear token JWT
    const tokenPayload = { 
      email: userFound.email,
      phone: userFound.phone || null,
      id: userFound._id,
      codex, 
      userType: "Empleado", 
      verified: false,
      via: via,
      createdAt: new Date().toISOString()
    };

    const token = jwt.sign(tokenPayload, config.JWT.secret, { expiresIn: "20m" });

    // Enviar token en cookie
    res.cookie("tokenRecoveryCode", token, {
      maxAge: 20 * 60 * 1000, // 20 minutos
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    });

    // Enviar código según método seleccionado
    try {
      if (via === "sms") {
        // Usar el teléfono del usuario encontrado (no el enviado en la request)
        const phoneToUse = userFound.phone;
        const smsMessage = `🔐 Tu código de verificación es: ${codex}. Válido por 20 minutos.`;
        
        console.log("📱 Enviando SMS a:", phoneToUse);
        await EnviarSms(phoneToUse, smsMessage);
        
        console.log("✅ SMS enviado exitosamente");
        
        res.status(200).json({ 
          message: "Código enviado vía SMS",
          success: true,
          sentTo: `***${phoneToUse.slice(-4)}`,
          method: "sms"
        });
        
      } else {
        // Para EMAIL
        const emailToUse = userFound.email;
        
        console.log("📧 Enviando email a:", emailToUse);
        await EnviarEmail(
          emailToUse,
          "🔐 Tu código de verificación",
          "Hola, este es tu código de verificación para recuperar tu contraseña.",
          html(codex)
        );
        
        console.log("✅ Email enviado exitosamente");
        
        res.status(200).json({ 
          message: "Código enviado vía email",
          success: true,
          sentTo: `***@${emailToUse.split('@')[1]}`,
          method: "email"
        });
      }
    } catch (sendError) {
      console.error("❌ Error enviando código:", sendError);
      
      // Limpiar cookie si falla el envío
      res.clearCookie("tokenRecoveryCode");
      
      const errorMessage = via === "sms" 
        ? "Error enviando SMS. Verifica que el número sea correcto." 
        : "Error enviando email. Verifica que el email sea correcto.";
        
      res.status(500).json({ message: errorMessage });
    }

  } catch (error) {
    console.error("❌ Error general en requestCode:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Verificar código
RecoveryPass.verifyCode = async (req, res) => {
  const { code } = req.body;

  console.log("🔍 Verificando código:", code);

  try {
    // Validaciones básicas
    if (!code) {
      return res.status(400).json({ message: "Código requerido" });
    }

    if (code.length !== 5 || !/^\d{5}$/.test(code)) {
      return res.status(400).json({ message: "El código debe tener 5 dígitos" });
    }

    // Obtener token de cookie
    const token = req.cookies.tokenRecoveryCode;
    if (!token) {
      console.log("❌ Token no encontrado en cookies");
      return res.status(401).json({ 
        message: "No se encontró token de verificación. Solicita un nuevo código." 
      });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT.secret);
      console.log("✅ Token decodificado:", { 
        email: decoded.email, 
        via: decoded.via,
        createdAt: decoded.createdAt 
      });
    } catch (jwtError) {
      console.log("❌ Error JWT:", jwtError.message);
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
      console.log("❌ Código incorrecto:", { enviado: code, esperado: decoded.codex });
      return res.status(400).json({ 
        message: "Código inválido. Verifica e inténtalo de nuevo." 
      });
    }

    console.log("✅ Código verificado correctamente");

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

    // Actualizar cookie
    res.cookie("tokenRecoveryCode", newToken, {
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    });

    console.log(`✅ Código verificado para: ${decoded.email || decoded.phone}`);
    res.status(200).json({
      message: "Código verificado exitosamente",
      success: true,
      method: decoded.via
    });

  } catch (error) {
    console.error("❌ Error en verifyCode:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Cambiar contraseña
RecoveryPass.newPassword = async (req, res) => {
  const { newPassword } = req.body;

  console.log("🔐 Solicitud de cambio de contraseña");

  try {
    // Validaciones
    if (!newPassword) {
      return res.status(400).json({ message: "Nueva contraseña es requerida" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 6 caracteres" 
      });
    }

    // Verificar token
    const token = req.cookies.tokenRecoveryCode;
    if (!token) {
      return res.status(401).json({ message: "Token no encontrado" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT.secret);
    } catch (jwtError) {
      console.log("❌ Error JWT en newPassword:", jwtError.message);
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    if (!decoded.verified) {
      return res.status(400).json({ message: "Código no verificado" });
    }

    console.log("🔍 Actualizando contraseña para usuario:", decoded.email);

    // Hashear nueva contraseña
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Actualizar contraseña - buscar por email o ID
    const updatedUser = await EmpleadosModel.findOneAndUpdate(
      { $or: [{ email: decoded.email }, { _id: decoded.id }] },
      { 
        password: hashedPassword,
        passwordUpdatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log("❌ Usuario no encontrado para actualizar contraseña");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Limpiar cookie
    res.clearCookie("tokenRecoveryCode");

    console.log(`✅ Contraseña actualizada para: ${decoded.email || decoded.phone}`);
    res.status(200).json({ 
      message: "Contraseña actualizada exitosamente",
      success: true 
    });

  } catch (error) {
    console.error("❌ Error en newPassword:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Iniciar sesión con código (sin cambiar contraseña)
RecoveryPass.IniciarSesionConCodigo = async (req, res) => {
  const { code } = req.body;
  const token = req.cookies.tokenRecoveryCode;

  console.log("🚀 Intento de inicio de sesión con código");

  if (!code || !token) {
    return res.status(400).json({ 
      message: "Faltan datos o token no encontrado" 
    });
  }

  try {
    // Verificar token y código
    const decoded = jwt.verify(token, config.JWT.secret);
    
    if (decoded.codex !== code) {
      console.log("❌ Código incorrecto en inicio de sesión");
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
    { expiresIn: "8h" } // Sesión más larga
    );

    // Limpiar token temporal y establecer token de sesión
    res.clearCookie("tokenRecoveryCode");
    res.cookie("authToken", authToken, {
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    });

    console.log(`✅ Inicio de sesión exitoso para: ${decoded.email || decoded.phone}`);
    return res.status(200).json({ 
      message: "Inicio de sesión exitoso", 
      success: true,
      user: {
        email: decoded.email,
        userType: decoded.userType
      }
    });

  } catch (error) {
    console.error("❌ Error en IniciarSesionConCodigo:", error);
    return res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

// Función auxiliar para debugging (remover en producción)
RecoveryPass.debugUsers = async (req, res) => {
  try {
    const users = await EmpleadosModel.find({}, { email: 1, phone: 1, _id: 1 }).limit(10);
    console.log("👥 Usuarios en DB:", users);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default RecoveryPass;