import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { config } from "../config.js";
import EmpleadoModel from "../Models/Empleados.js";
import MotoristaModel from "../Models/Motorista.js";

const LoginController = {};

/**
 * Función para validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Función para validar contraseña
 * @param {string} password - Contraseña a validar
 * @returns {boolean} - true si es válida
 */
const validatePassword = (password) => {
  return password && typeof password === 'string' && password.trim().length >= 6;
};

/**
 * Función para validar campos requeridos
 * @param {object} data - Datos a validar
 * @param {array} requiredFields - Campos requeridos
 * @returns {object} - {isValid: boolean, missingFields: array}
 */
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => 
    !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
  );
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Función para validar configuración JWT
 * @returns {object} - {isValid: boolean, error: string}
 */
const validateJWTConfig = () => {
  if (!config.JWT?.secret) {
    return {
      isValid: false,
      error: "Configuración JWT incompleta: falta secret"
    };
  }
  
  if (!config.JWT?.expiresIn) {
    return {
      isValid: false,
      error: "Configuración JWT incompleta: falta expiresIn"
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Función para validar configuración de administrador
 * @returns {object} - {isValid: boolean, error: string}
 */
const validateAdminConfig = () => {
  if (!config.ADMIN?.emailAdmin || !config.ADMIN?.password) {
    return {
      isValid: false,
      error: "Configuración de administrador incompleta"
    };
  }
  
  if (!validateEmail(config.ADMIN.emailAdmin)) {
    return {
      isValid: false,
      error: "Email de administrador inválido en configuración"
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Función para generar token JWT de forma promisificada
 * @param {object} payload - Datos a incluir en el token
 * @param {string} secret - Clave secreta
 * @param {object} options - Opciones del token
 * @returns {Promise<string>} - Token generado
 */
const generateToken = (payload, secret, options) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
  });
};

/**
 * Función para verificar token JWT de forma promisificada
 * @param {string} token - Token a verificar
 * @param {string} secret - Clave secreta
 * @returns {Promise<object>} - Payload del token
 */
const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (error, decoded) => {
      if (error) {
        reject(error);
      } else {
        resolve(decoded);
      }
    });
  });
};

/**
 * Función para configurar cookies de autenticación de forma segura
 * @param {object} res - Objeto response
 * @param {string} token - Token a almacenar
 */
const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie("authToken", token, {
    httpOnly: true, // Previene acceso desde JavaScript (XSS)
    sameSite: isProduction ? "Strict" : "Lax", // Protección CSRF
    secure: isProduction, // Solo HTTPS en producción
    maxAge: 24 * 60 * 60 * 1000, // 24 horas en millisegundos
    path: "/" // Cookie disponible en toda la aplicación
  });
};

/**
 * Endpoint para autenticación de usuarios
 * POST /auth/login
 * 
 * Soporta tres tipos de usuarios:
 * 1. Administrador (credenciales en config)
 * 2. Empleados (base de datos)
 * 3. Motoristas (base de datos)
 */
LoginController.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    const requiredFields = ['email', 'password'];
    const validation = validateRequiredFields(req.body, requiredFields);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos",
        error: `Los siguientes campos son obligatorios: ${validation.missingFields.join(', ')}`,
        missingFields: validation.missingFields
      });
    }

    // Validar formato de email
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Formato de email inválido",
        error: "Por favor proporciona un email válido"
      });
    }

    // Validar contraseña
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Contraseña inválida",
        error: "La contraseña debe tener al menos 6 caracteres"
      });
    }

    // Validar configuración JWT antes de proceder
    const jwtValidation = validateJWTConfig();
    if (!jwtValidation.isValid) {
      return res.status(500).json({
        success: false,
        message: "Error de configuración del servidor",
        error: "Configuración JWT incompleta"
      });
    }

    let userFound;
    let userType;
    const emailLowerCase = email.toLowerCase().trim();

    // 1️⃣ Verificar si es el administrador
    if (emailLowerCase === config.ADMIN.emailAdmin?.toLowerCase()) {
      // Validar configuración de administrador
      const adminValidation = validateAdminConfig();
      if (!adminValidation.isValid) {
        return res.status(500).json({
          success: false,
          message: "Error de configuración del servidor",
          error: adminValidation.error
        });
      }

      // Verificar contraseña del administrador
      if (password !== config.ADMIN.password) {
        return res.status(401).json({
          success: false,
          message: "Credenciales incorrectas",
          error: "Email o contraseña incorrectos"
        });
      }

      userType = "Administrador";
      userFound = { 
        _id: "admin", 
        email: config.ADMIN.emailAdmin,
        name: "Administrador",
        lastName: "Sistema"
      };
    } else {
      // 2️⃣ Buscar en la colección de Empleados
      userFound = await EmpleadoModel.findOne({ 
        email: { $regex: new RegExp(`^${emailLowerCase}$`, 'i') }
      }).select('+password'); // Asegurar que incluya el campo password

      if (userFound) {
        // Verificar contraseña del empleado
        const isPasswordMatch = await bcryptjs.compare(password, userFound.password);
        if (!isPasswordMatch) {
          return res.status(401).json({
            success: false,
            message: "Credenciales incorrectas",
            error: "Email o contraseña incorrectos"
          });
        }
        userType = "Empleado";
      } else {
        // 3️⃣ Si no es empleado, buscar en la colección de Motoristas
        userFound = await MotoristaModel.findOne({ 
          email: { $regex: new RegExp(`^${emailLowerCase}$`, 'i') }
        }).select('+password'); // Asegurar que incluya el campo password

        if (!userFound) {
          return res.status(401).json({
            success: false,
            message: "Credenciales incorrectas",
            error: "Email o contraseña incorrectos"
          });
        }

        // Verificar contraseña del motorista
        const isPasswordMatch = await bcryptjs.compare(password, userFound.password);
        if (!isPasswordMatch) {
          return res.status(401).json({
            success: false,
            message: "Credenciales incorrectas",
            error: "Email o contraseña incorrectos"
          });
        }
        userType = "Motorista";
      }
    }

    // Generar token JWT
    const tokenPayload = { 
      id: userFound._id, 
      userType,
      email: userFound.email || config.ADMIN.emailAdmin
    };

    try {
      const token = await generateToken(
        tokenPayload,
        config.JWT.secret,
        { expiresIn: config.JWT.expiresIn }
      );

      // Configurar cookie de autenticación de forma segura
      setAuthCookie(res, token);

      // Preparar respuesta exitosa sin datos sensibles
      const userResponse = {
        id: userFound._id,
        email: userFound.email || config.ADMIN.emailAdmin,
        userType,
        name: userFound.name || "Administrador",
        lastName: userFound.lastName || "Sistema"
      };

      res.status(200).json({
        success: true,
        message: "Inicio de sesión exitoso",
        data: {
          user: userResponse,
          loginTime: new Date().toISOString()
        }
      });

    } catch (tokenError) {
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: "No se pudo generar el token de autenticación"
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor durante el login",
      error: error.message
    });
  }
};

/**
 * Endpoint para verificar autenticación
 * GET /auth/check
 * 
 * Verifica si el usuario tiene una sesión válida y retorna
 * información del usuario autenticado.
 */
LoginController.checkAuth = async (req, res) => {
  try {
    // Obtener token de las cookies
    const token = req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No autorizado",
        error: "Token de autenticación no encontrado"
      });
    }

    // Validar configuración JWT
    const jwtValidation = validateJWTConfig();
    if (!jwtValidation.isValid) {
      return res.status(500).json({
        success: false,
        message: "Error de configuración del servidor",
        error: "Configuración JWT incompleta"
      });
    }

    try {
      // Verificar y decodificar token
      const decoded = await verifyToken(token, config.JWT.secret);
      const { id, userType, email } = decoded;

      // Validar que el token tenga los campos necesarios
      if (!id || !userType) {
        return res.status(401).json({
          success: false,
          message: "Token inválido",
          error: "Token no contiene información válida de usuario"
        });
      }

      let userData;

      // 1️⃣ Si es administrador
      if (userType === "Administrador") {
        // Validar configuración de administrador
        const adminValidation = validateAdminConfig();
        if (!adminValidation.isValid) {
          return res.status(500).json({
            success: false,
            message: "Error de configuración del servidor",
            error: adminValidation.error
          });
        }

        userData = {
          id,
          email: config.ADMIN.emailAdmin,
          userType: "Administrador",
          name: "Administrador",
          lastName: "Sistema"
        };
      }
      // 2️⃣ Si es empleado
      else if (userType === "Empleado") {
        const userFound = await EmpleadoModel.findById(id)
          .select('email name lastName createdAt updatedAt');

        if (!userFound) {
          return res.status(404).json({
            success: false,
            message: "Usuario no encontrado",
            error: "El empleado ya no existe en el sistema"
          });
        }

        userData = {
          id: userFound._id,
          email: userFound.email,
          userType: "Empleado",
          name: userFound.name,
          lastName: userFound.lastName,
          lastUpdated: userFound.updatedAt
        };
      }
      // 3️⃣ Si es motorista
      else if (userType === "Motorista") {
        const userFound = await MotoristaModel.findById(id)
          .select('email name lastName createdAt updatedAt');

        if (!userFound) {
          return res.status(404).json({
            success: false,
            message: "Usuario no encontrado",
            error: "El motorista ya no existe en el sistema"
          });
        }

        userData = {
          id: userFound._id,
          email: userFound.email,
          userType: "Motorista",
          name: userFound.name,
          lastName: userFound.lastName,
          lastUpdated: userFound.updatedAt
        };
      }
      // 4️⃣ Si el userType no es reconocido
      else {
        return res.status(400).json({
          success: false,
          message: "Tipo de usuario no válido",
          error: `Tipo de usuario '${userType}' no reconocido`
        });
      }

      res.status(200).json({
        success: true,
        message: "Usuario autenticado correctamente",
        data: {
          user: userData,
          tokenIssuedAt: new Date(decoded.iat * 1000).toISOString(),
          tokenExpiresAt: new Date(decoded.exp * 1000).toISOString()
        }
      });

    } catch (tokenError) {
      // Manejar errores específicos del token
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: "Token expirado",
          error: "La sesión ha expirado, por favor inicia sesión nuevamente"
        });
      }
      
      if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: "Token inválido",
          error: "El token de autenticación no es válido"
        });
      }
      
      // Error genérico de token
      return res.status(401).json({
        success: false,
        message: "Error de autenticación",
        error: "No se pudo verificar el token de autenticación"
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor durante la verificación",
      error: error.message
    });
  }
};

/**
 * Endpoint para cerrar sesión
 * POST /auth/logout
 * 
 * Limpia la cookie de autenticación del cliente
 */
LoginController.logout = async (req, res) => {
  try {
    // Limpiar cookie de autenticación
    res.clearCookie("authToken", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? "Strict" : "Lax",
      secure: process.env.NODE_ENV === 'production',
      path: "/"
    });

    res.status(200).json({
      success: true,
      message: "Sesión cerrada exitosamente",
      data: {
        logoutTime: new Date().toISOString()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor durante el logout",
      error: error.message
    });
  }
};

export default LoginController;