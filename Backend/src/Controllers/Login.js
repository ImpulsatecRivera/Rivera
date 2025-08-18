import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { config } from "../config.js";
import EmpleadoModel from "../Models/Empleados.js";
import MotoristaModel from "../Models/Motorista.js"; // Asegúrate de que este modelo existe
import ClienteModel from "../Models/Clientes.js"; // Asegúrate de que este modelo existe

const LoginController = {};

LoginController.Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let userFound;
    let userType;

    // Verificar si es administrador
    if (email === config.ADMIN.emailAdmin) {
      if (password !== config.ADMIN.password) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }

      userType = "Administrador";
      userFound = { _id: "admin", email };
    } else {
      // Buscar en empleados
      userFound = await EmpleadoModel.findOne({ email });
      if (userFound) {
        const isMatch = await bcryptjs.compare(password, userFound.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Contraseña incorrecta" });
        }
        userType = "Empleado";
      } else {
        // Buscar en motoristas
        userFound = await MotoristaModel.findOne({ email });
        if (userFound) {
          const isMatch = await bcryptjs.compare(password, userFound.password);
          if (!isMatch) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
          }
          userType = "Motorista";
        } else {
          // Buscar en clientes
          userFound = await ClienteModel.findOne({ email });
          if (userFound) {
            const isMatch = await bcryptjs.compare(password, userFound.password);
            if (!isMatch) {
              return res.status(400).json({ message: "Contraseña incorrecta" });
            }
            userType = "Cliente";
          } else {
            return res.status(400).json({ message: "Usuario no encontrado" });
          }
        }
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
            // Agregar información adicional según el tipo de usuario
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