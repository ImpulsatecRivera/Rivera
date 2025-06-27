import EmpleadosModel from "../Models/Empleados.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { EnviarEmail, html } from "../Utils/RecoveryPass.js";
import { config } from "../config.js";

const RecoveryPass = {};

// Solicitar código
RecoveryPass.requestCode = async (req, res) => {
  const { email } = req.body;

  try {
    let userFound = await EmpleadosModel.findOne({ email });
    let userType = "Empleado";

    if (!userFound) {
      return res.status(400).json({ message: "Usuario no existente" });
    }

    const codex = Math.floor(10000 + Math.random() * 90000).toString();

    const token = jwt.sign(
      { email, codex, userType, verified: false },
      config.JWT.secret,
      { expiresIn: "20m" }
    );

    res.cookie("tokenRecoveryCode", token, {
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    });

    await EnviarEmail(
      email,
      "Tu código de verificación",
      "Hola, este es tu código de verificación para recuperar tu contraseña.",
      html(codex)
    );

    console.log(`Solicitud de recuperación iniciada para tipo: ${userType}`);
    res.status(200).json({ message: "Correo enviado con el código de verificación" });

  } catch (error) {
    console.error("Error en requestCode:", error);
    res.status(500).json({ message: "Error al solicitar el código" });
  }
};

// Verificar código
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

    const newToken = jwt.sign(
      {
        email: decoded.email,
        codex: decoded.codex,
        userType: decoded.userType,
        verified: true,
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

    console.log(`Código verificado para tipo: ${decoded.userType}`);
    res.status(200).json({
      message: "Código verificado exitosamente",
      success: true
    });

  } catch (error) {
    console.error("Error en verifyCode:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Cambiar contraseña
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

    console.log(`Contraseña actualizada para tipo: ${userType}`);
    res.status(200).json({ message: "Contraseña actualizada exitosamente" });

  } catch (error) {
    console.error("Error en newPassword:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default RecoveryPass;
