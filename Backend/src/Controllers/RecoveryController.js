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

  console.log("📧 Solicitud de código:", { email, phone, via }); // Debug

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

    // Buscar usuario según el método seleccionado
    if (via === "email") {
      userFound = await EmpleadosModel.findOne({ email: email.toLowerCase() });
    } else if (via === "sms") {
      // Normalizar número de teléfono
      const normalizedPhone = phone.startsWith('+') ? phone : `+503${phone}`;
      userFound = await EmpleadosModel.findOne({ phone: normalizedPhone });
    }
    
    console.log("🔍 Usuario encontrado:", userFound ? "Sí" : "No"); // Debug

    if (!userFound) {
      const searchTerm = via === "email" ? "email" : "número de teléfono";
      return res.status(400).json({ message: `Usuario no encontrado con ese ${searchTerm}` });
    }

    // Generar código de 5 dígitos
    const codex = Math.floor(10000 + Math.random() * 90000).toString();
    console.log("🔢 Código generado:", codex); // Debug (remover en producción)

    // Crear token JWT
    const token = jwt.sign(
      { 
        email: userFound.email,
        phone: userFound.phone || null,
        id: userFound._id,
        codex, 
        userType: "Empleado", 
        verified: false,
        via: via
      },
      config.JWT.secret,
      { expiresIn: "20m" }
    );

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
        // Validar que el usuario tenga teléfono registrado
        if (!userFound.phone) {
          return res.status(400).json({
            message: "La cuenta no tiene número de teléfono registrado."
          });
        }

        // Enviar SMS real
        const smsMessage = `Tu código de verificación es: ${codex}. Válido por 20 minutos.`;
        
        await EnviarSms(userFound.phone, smsMessage);
        
        console.log("📱 SMS enviado a:", userFound.phone); // Debug
        
        res.status(200).json({ 
          message: "Código enviado vía SMS",
          success: true,
          sentTo: `***${userFound.phone.slice(-4)}` // Mostrar solo últimos 4 dígitos
        });
        
      } else {
        // Para EMAIL: enviar código al email directamente
        await EnviarEmail(
          userFound.email,
          "🔐 Tu código de verificación",
          "Hola, este es tu código de verificación para recuperar tu contraseña.",
          html(codex)
        );
        console.log("📧 Email enviado a:", userFound.email); // Debug
        
        res.status(200).json({ 
          message: "Código enviado vía email",
          success: true,
          sentTo: `***${userFound.email.split('@')[1]}`
        });
      }
    } catch (sendError) {
      console.error("❌ Error enviando código:", sendError);
      res.status(500).json({ 
        message: via === "sms" ? "Error enviando SMS" : "Error enviando email"
      });
    }

  } catch (error) {
    console.error("❌ Error en requestCode:", error);
    res.status(500).json({ message: "Error al solicitar el código" });
  }
};

// Verificar código
RecoveryPass.verifyCode = async (req, res) => {
  const { code } = req.body;

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
      return res.status(401).json({ 
        message: "No se encontró token de verificación. Solicita un nuevo código." 
      });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT.secret);
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

    // Crear nuevo token con código verificado
    const newToken = jwt.sign(
      {
        email: decoded.email,
        phone: decoded.phone,
        id: decoded.id,
        codex: decoded.codex,
        userType: decoded.userType,
        verified: true,
        via: decoded.via
      },
      config.JWT.secret,
      { expiresIn: "20m" }
    );

    // Actualizar cookie
    res.cookie("tokenRecoveryCode", newToken, {
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    console.log(`✅ Código verificado para: ${decoded.email || decoded.phone}`);
    res.status(200).json({
      message: "Código verificado exitosamente",
      success: true
    });

  } catch (error) {
    console.error("❌ Error en verifyCode:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Cambiar contraseña
RecoveryPass.newPassword = async (req, res) => {
  const { newPassword } = req.body;

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

    const decoded = jwt.verify(token, config.JWT.secret);
    if (!decoded.verified) {
      return res.status(400).json({ message: "Código no verificado" });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Actualizar contraseña - buscar por email o ID
    const updatedUser = await EmpleadosModel.findOneAndUpdate(
      { $or: [{ email: decoded.email }, { _id: decoded.id }] },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Limpiar cookie
    res.clearCookie("tokenRecoveryCode");

    console.log(`🔐 Contraseña actualizada para: ${decoded.email || decoded.phone}`);
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

  if (!code || !token) {
    return res.status(400).json({ 
      message: "Faltan datos o token no encontrado" 
    });
  }

  try {
    // Verificar token y código
    const decoded = jwt.verify(token, config.JWT.secret);
    
    if (decoded.codex !== code) {
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
      sameSite: 'Lax',
    });

    console.log(`🚀 Inicio de sesión exitoso para: ${decoded.email || decoded.phone}`);
    return res.status(200).json({ 
      message: "Inicio de sesión exitoso", 
      success: true 
    });

  } catch (error) {
    console.error("❌ Error en IniciarSesionConCodigo:", error);
    return res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

export default RecoveryPass;