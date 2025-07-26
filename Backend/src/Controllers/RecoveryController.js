import EmpleadosModel from "../Models/Empleados.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { EnviarEmail, html } from "../Utils/RecoveryPass.js";
import { config } from "../config.js";
import { EnviarSms } from "../Utils/EnviarSms.js";

const RecoveryPass = {};

// 🚀 VERSIÓN INNOVADORA - requestCode adaptado para Opción 1
RecoveryPass.requestCode = async (req, res) => {
  const { contactInfo, method = "email" } = req.body; // ← CAMBIO: recibe contactInfo y method

  try {
    let userFound;
    let searchType;

    console.log("=== INNOVATIVE BACKEND DEBUG ===");
    console.log("ContactInfo recibido:", contactInfo);
    console.log("Method recibido:", method);

    // 🧠 DETECCIÓN INTELIGENTE AUTOMÁTICA
    if (contactInfo.includes("@")) {
      // Es EMAIL
      userFound = await EmpleadosModel.findOne({ email: contactInfo });
      searchType = "email";
      console.log("🔍 Buscando por EMAIL:", contactInfo);
    } else {
      // Es TELÉFONO  
      userFound = await EmpleadosModel.findOne({ phone: contactInfo });
      searchType = "phone";
      console.log("🔍 Buscando por TELÉFONO:", contactInfo);
    }

    if (!userFound) {
      console.log("❌ Usuario no encontrado");
      return res.status(400).json({ 
        message: `Usuario no encontrado con ${searchType === "email" ? "email" : "teléfono"}: ${contactInfo}` 
      });
    }

    console.log("✅ Usuario encontrado:", {
      email: userFound.email,
      phone: userFound.phone,
      name: userFound.name
    });

    const userType = "Empleado";
    const codex = Math.floor(10000 + Math.random() * 90000).toString();

    // 🎯 TOKEN CON DATOS COMPLETOS
    const token = jwt.sign(
      { 
        email: userFound.email,     // ← Siempre incluir email del usuario
        phone: userFound.phone,     // ← Siempre incluir teléfono del usuario  
        contactInfo: contactInfo,   // ← Info original que usó para buscar
        searchType: searchType,     // ← Cómo se encontró (email/phone)
        codex, 
        userType, 
        verified: false 
      },
      config.JWT.secret,
      { expiresIn: "20m" }
    );

    res.cookie("tokenRecoveryCode", token, {
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    });

    // 🚀 ENVÍO INTELIGENTE SEGÚN MÉTODO SELECCIONADO
    let sendTo, sendMethod;
    
    if (method === "sms") {
      // Usuario quiere SMS
      if (!userFound.phone) {
        return res.status(400).json({
          message: "Tu cuenta no tiene un número de teléfono registrado. Usa email como método de envío."
        });
      }
      
      await EnviarSms(userFound.phone, `🔐 Tu código de verificación es: ${codex}`);
      sendTo = userFound.phone;
      sendMethod = "SMS";
      
    } else {
      // Usuario quiere EMAIL
      if (!userFound.email) {
        return res.status(400).json({
          message: "Tu cuenta no tiene un email registrado. Usa SMS como método de envío."
        });
      }
      
      await EnviarEmail(
        userFound.email,
        "🔐 Tu código de verificación",
        "Hola, este es tu código de verificación para recuperar tu contraseña.",
        html(codex)
      );
      sendTo = userFound.email;
      sendMethod = "email";
    }

    console.log(`✅ Código ${codex} enviado via ${sendMethod} a ${sendTo}`);

    res.status(200).json({ 
      message: `Código enviado via ${sendMethod}`,
      sentTo: sendMethod === "SMS" ? 
        `***${sendTo.slice(-4)}` : // Ocultar teléfono parcialmente
        `***${sendTo.split('@')[1]}`, // Ocultar email parcialmente
      method: sendMethod.toLowerCase()
    });

  } catch (error) {
    console.error("❌ Error en requestCode innovador:", error);
    res.status(500).json({ message: "Error al solicitar el código" });
  }
};

// ✅ verifyCode - NO necesita cambios, ya funciona perfecto
RecoveryPass.verifyCode = async (req, res) => {
  const { code } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ message: "Código requerido" });
    }

    if (code.length !== 5 || !/^\d{5}$/.test(code)) {
      return res.status(400).json({ message: "El código debe tener 5 dígitos" });
    }

    const token = req.cookies.tokenRecoveryCode;

    if (!token) {
      return res.status(401).json({ message: "No se encontró token de verificación. Solicita un nuevo código." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT.secret);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "El código ha expirado. Solicita un nuevo código." });
      }
      return res.status(401).json({ message: "Token inválido. Solicita un nuevo código." });
    }

    if (decoded.codex !== code) {
      return res.status(400).json({ message: "Código inválido. Verifica e inténtalo de nuevo." });
    }

    // 🎯 TOKEN VERIFICADO CON TODOS LOS DATOS
    const newToken = jwt.sign(
      {
        email: decoded.email,
        phone: decoded.phone,
        contactInfo: decoded.contactInfo,
        searchType: decoded.searchType,
        codex: decoded.codex,
        userType: decoded.userType,
        verified: true, // ← MARCADO COMO VERIFICADO
      },
      config.JWT.secret,
      { expiresIn: "20m" }
    );

    res.cookie("tokenRecoveryCode", newToken, {
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    console.log(`✅ Código verificado para usuario: ${decoded.email}`);
    res.status(200).json({
      message: "Código verificado exitosamente",
      success: true
    });

  } catch (error) {
    console.error("❌ Error en verifyCode:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ newPassword - NO necesita cambios, ya funciona perfecto
RecoveryPass.newPassword = async (req, res) => {
  const { newPassword } = req.body;

  try {
    const token = req.cookies.tokenRecoveryCode;

    if (!token) {
      return res.status(401).json({ message: "Token no encontrado" });
    }

    const decoded = jwt.verify(token, config.JWT.secret);

    if (!decoded.verified) {
      return res.status(400).json({ message: "Código no verificado" });
    }

    const { email, userType } = decoded;
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    let updatedUser;

    if (userType === "Empleado") {
      updatedUser = await EmpleadosModel.findOneAndUpdate(
        { email },
        { password: hashedPassword },
        { new: true }
      );
    }

    res.clearCookie("tokenRecoveryCode");

    console.log(`✅ Contraseña actualizada para: ${email}`);
    res.status(200).json({ message: "Contraseña actualizada exitosamente" });

  } catch (error) {
    console.error("❌ Error en newPassword:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ IniciarSesionConCodigo - NO necesita cambios
RecoveryPass.IniciarSesionConCodigo = async (req, res) => {
  const { code } = req.body;
  const token = req.cookies.tokenRecoveryCode;

  if (!code || !token) {
    return res.status(400).json({ message: "Faltan datos o token no encontrado" })
  }

  try {
    const decoded = jwt.verify(token, config.JWT.secret);
    if (decoded.codex !== code) {
      return res.status(400).json({ message: "Codigo incorrecto" });
    }

    const authToken = jwt.sign({
      email: decoded.email,
      userType: decoded.userType,
      id: decoded.id,
    },
      config.JWT.secret,
      { expiresIn: "20m" }
    );

    res.clearCookie("tokenRecoveryCode");
    res.cookie("authToken", authToken, {
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    return res.status(200).json({ message: "Inicio de sesion exitoso", success: true });
  } catch (error) {
    console.error("❌ Error en IniciarSesionConCodigo:", error);
    return res.status(500).json({ message: "Error al iniciar sesión" });
  }
}

export default RecoveryPass;