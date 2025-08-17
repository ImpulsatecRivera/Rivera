import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { config } from "../config.js";
import EmpleadoModel from "../Models/Empleados.js";
import MotoristaModel from "../Models/Motorista.js";

const LoginController = {};

LoginController.Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let userFound;
    let userType;

    // 1️⃣ Verificar si es el administrador
    if (email === config.ADMIN.emailAdmin) {
      if (password !== config.ADMIN.password) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }

      userType = "Administrador";
      userFound = { _id: "admin", email };
    } else {
      // 2️⃣ Buscar en Empleados
      userFound = await EmpleadoModel.findOne({ email });

      if (userFound) {
        const isMatch = await bcryptjs.compare(password, userFound.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Contraseña incorrecta" });
        }
        userType = "Empleado";
      } else {
        // 3️⃣ Si no es empleado, buscar en Motoristas
        userFound = await MotoristaModel.findOne({ email });

        if (!userFound) {
          return res.status(400).json({ message: "Usuario no encontrado" });
        }

        const isMatch = await bcryptjs.compare(password, userFound.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Contraseña incorrecta" });
        }
        userType = "Motorista";
      }
    }

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

      // 1️⃣ Si es administrador
      if (userType === "Administrador") {
        return res.status(200).json({
          user: {
            id,
            email: config.ADMIN.emailAdmin,
            userType: "Administrador",
          },
        });
      }

      // 2️⃣ Si es empleado
      if (userType === "Empleado") {
        const userFound = await EmpleadoModel.findById(id).select("email");

        if (!userFound) {
          return res.status(404).json({ message: "Empleado no encontrado" });
        }

        return res.status(200).json({
          user: {
            id: userFound._id,
            email: userFound.email,
            userType: "Empleado",
          },
        });
      }

      // 3️⃣ Si es motorista
      if (userType === "Motorista") {
        const userFound = await MotoristaModel.findById(id).select("email");

        if (!userFound) {
          return res.status(404).json({ message: "Motorista no encontrado" });
        }

        return res.status(200).json({
          user: {
            id: userFound._id,
            email: userFound.email,
            userType: "Motorista",
          },
        });
      }

      // 4️⃣ Si el userType no es reconocido
      return res.status(400).json({ message: "Tipo de usuario no válido" });
    });
  } catch (error) {
    console.error("Error en checkAuth:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default LoginController;