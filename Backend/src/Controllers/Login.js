import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { config } from "../config.js";
import EmpleadoModel from "../Models/Empleados.js";

const LoginController = {};

LoginController.Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let userFound;
    let userType;

    if (email === config.ADMIN.emailAdmin) {
      if (password !== config.ADMIN.password) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }

      userType = "Administrador";
      userFound = { _id: "admin", email };
    } else {
      userFound = await EmpleadoModel.findOne({ email });

      if (!userFound) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }

      const isMatch = await bcryptjs.compare(password, userFound.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }

      userType = "Empleado";
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

        res.cookie("authToken", token, { httpOnly: true });
        res.status(200).json({
          message: "Inicio de sesión completado",
          userType,
          user: {
            id: userFound._id,
            email: userFound.email || email,
          }
        });
      }
    );
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default LoginController;
