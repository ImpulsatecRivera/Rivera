import EmpleadosModel from "../Models/Empleados.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { EnviarEmail, html } from "../Utils/RecoveryPass.js";
import { config } from "../config.js";
import { EnviarSms } from "../Utils/EnviarSms.js";

const RecoveryPass = {};

// Función para solicitar código de recuperación (vía email o SMS)
RecoveryPass.requestCode = async (req, res) => {
  const { contactInfo, method = "email" } = req.body;

  // Función interna para normalizar teléfono (agregar prefijo +503 si no tiene)
  const normalizePhone = (phone) => {
    let cleaned = phone.replace(/\s|-/g, ''); // Eliminar espacios y guiones
    if (!cleaned.startsWith('+')) {
      cleaned = '+503' + cleaned; // Prefijo por defecto para El Salvador
    }
    return cleaned;
  };

  try {
    let userFound;
    let searchType;
    let contact = contactInfo;

    // Normalizar teléfono solo si el método es SMS y no parece email
    if (method === "sms" && !contactInfo.includes("@")) {
      contact = normalizePhone(contactInfo);
    }

    // Buscar usuario por email o teléfono según corresponda
    if (contact.includes("@")) {
      userFound = await EmpleadosModel.findOne({ email: contact });
      searchType = "email";
    } else {
      userFound = await EmpleadosModel.findOne({ phone: contact });
      searchType = "phone";
    }

    // Si no existe usuario con ese contacto, responder error
    if (!userFound) {
      return res.status(400).json({ 
        message: `Usuario no encontrado con ${searchType === "email" ? "email" : "teléfono"}: ${contact}` 
      });
    }

    // Generar código aleatorio de 5 dígitos para verificación
    const codex = Math.floor(10000 + Math.random() * 90000).toString();

    // Crear token JWT con datos del usuario y código generado
    const token = jwt.sign(
      { 
        email: userFound.email,
        phone: userFound.phone,
        contactInfo: contact,
        searchType,
        codex, 
        userType: "Empleado", 
        verified: false 
      },
      config.JWT.secret,
      { expiresIn: "20m" }
    );

    // Enviar token al cliente en una cookie segura y con duración limitada
    res.cookie("tokenRecoveryCode", token, {
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    });

    // Enviar código al usuario según método seleccionado
    if (method === "sms") {
      // Validar que exista teléfono registrado para SMS
      if (!userFound.phone) {
        return res.status(400).json({
          message: "Tu cuenta no tiene un número de teléfono registrado. Usa email como método de envío."
        });
      }

      // Intentar enviar SMS con el código generado
      try {
        await EnviarSms(userFound.phone, `🔐 Tu código de verificación es: ${codex}`);
      } catch (smsError) {
        return res.status(500).json({ message: "No se pudo enviar el SMS. Verifica el número o el proveedor." });
      }

      // Responder éxito indicando método y último dígitos del teléfono
      return res.status(200).json({ 
        message: `Código enviado via SMS`,
        sentTo: `***${userFound.phone.slice(-4)}`,
        method: "sms"
      });

    } else {
      // Validar que exista email registrado para envío por email
      if (!userFound.email) {
        return res.status(400).json({
          message: "Tu cuenta no tiene un email registrado. Usa SMS como método de envío."
        });
      }

      // Enviar email con código y plantilla HTML
      await EnviarEmail(
        userFound.email,
        "🔐 Tu código de verificación",
        "Hola, este es tu código de verificación para recuperar tu contraseña.",
        html(codex)
      );

      // Responder éxito indicando método y dominio del email
      return res.status(200).json({ 
        message: `Código enviado via email`,
        sentTo: `***${userFound.email.split('@')[1]}`,
        method: "email"
      });
    }

  } catch (error) {
    // Manejo de error general
    res.status(500).json({ message: "Error al solicitar el código" });
  }
};

// Verifica el código recibido contra el token almacenado en cookies
RecoveryPass.verifyCode = async (req, res) => {
  const { code } = req.body;

  try {
    // Validaciones básicas de entrada
    if (!code) {
      return res.status(400).json({ message: "Código requerido" });
    }
    if (code.length !== 5 || !/^\d{5}$/.test(code)) {
      return res.status(400).json({ message: "El código debe tener 5 dígitos" });
    }

    // Obtener token de cookie
    const token = req.cookies.tokenRecoveryCode;
    if (!token) {
      return res.status(401).json({ message: "No se encontró token de verificación. Solicita un nuevo código." });
    }

    let decoded;
    try {
      // Verificar y decodificar token JWT
      decoded = jwt.verify(token, config.JWT.secret);
    } catch (jwtError) {
      // Manejo de expiración o token inválido
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "El código ha expirado. Solicita un nuevo código." });
      }
      return res.status(401).json({ message: "Token inválido. Solicita un nuevo código." });
    }

    // Comparar código recibido con el guardado en token
    if (decoded.codex !== code) {
      return res.status(400).json({ message: "Código inválido. Verifica e inténtalo de nuevo." });
    }

    // Crear nuevo token con flag de código verificado
    const newToken = jwt.sign(
      {
        email: decoded.email,
        phone: decoded.phone,
        contactInfo: decoded.contactInfo,
        searchType: decoded.searchType,
        codex: decoded.codex,
        userType: decoded.userType,
        verified: true,
      },
      config.JWT.secret,
      { expiresIn: "20m" }
    );

    // Actualizar cookie con nuevo token verificado
    res.cookie("tokenRecoveryCode", newToken, {
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    return res.status(200).json({
      message: "Código verificado exitosamente",
      success: true
    });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualiza la contraseña si el código fue verificado correctamente
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

    // Hashear la nueva contraseña
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Actualizar usuario según tipo
    if (decoded.userType === "Empleado") {
      await EmpleadosModel.findOneAndUpdate(
        { email: decoded.email },
        { password: hashedPassword },
        { new: true }
      );
    }

    // Limpiar cookie de recuperación
    res.clearCookie("tokenRecoveryCode");

    return res.status(200).json({ message: "Contraseña actualizada exitosamente" });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Iniciar sesión con código de verificación
RecoveryPass.IniciarSesionConCodigo = async (req, res) => {
  const { code } = req.body;
  const token = req.cookies.tokenRecoveryCode;

  if (!code || !token) {
    return res.status(400).json({ message: "Faltan datos o token no encontrado" });
  }

  try {
    // Decodificar token y validar código
    const decoded = jwt.verify(token, config.JWT.secret);
    if (decoded.codex !== code) {
      return res.status(400).json({ message: "Codigo incorrecto" });
    }

    // Generar token de autenticación para sesión
    const authToken = jwt.sign({
      email: decoded.email,
      userType: decoded.userType,
      id: decoded.id,
    }, config.JWT.secret, { expiresIn: "20m" });

    // Limpiar token temporal y establecer token de sesión
    res.clearCookie("tokenRecoveryCode");
    res.cookie("authToken", authToken, {
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    return res.status(200).json({ message: "Inicio de sesion exitoso", success: true });

  } catch (error) {
    return res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

export default RecoveryPass;
