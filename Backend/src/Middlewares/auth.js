// Middleware/auth.js
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import EmpleadosModel from '../Models/Empleados.js';
import MotoristasModel from '../Models/Motorista.js';
import ClientesModelo from '../Models/Clientes.js';

// Middleware para verificar token JWT
export const authMiddleware = async (req, res, next) => {
  try {
    // 1. Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        message: "Token no proporcionado. Inicia sesión." 
      });
    }

    // 2. Extraer token (formato: "Bearer TOKEN")
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ 
        message: "Token inválido" 
      });
    }

    // 3. Verificar y decodificar token
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT.secret);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: "Token expirado. Inicia sesión nuevamente.",
          expired: true
        });
      }
      return res.status(401).json({ 
        message: "Token inválido" 
      });
    }

    // 4. Buscar usuario según userType
    let user = null;

    if (decoded.userType === 'Empleado') {
      user = await EmpleadosModel.findById(decoded.id);
    } else if (decoded.userType === 'Motorista') {
      user = await MotoristasModel.findById(decoded.id);
    } else if (decoded.userType === 'Cliente') {
      user = await ClientesModelo.findById(decoded.id);
    }

    // 5. Verificar que el usuario exista
    if (!user) {
      return res.status(404).json({ 
        message: "Usuario no encontrado" 
      });
    }

    // 6. Agregar info del usuario al request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone,
      phoneVerified: user.phoneVerified || false,
      userType: decoded.userType,
      nombre: user.nombre
    };

    // 7. Continuar a la siguiente función
    next();

  } catch (error) {
    console.error("Error en authMiddleware:", error);
    return res.status(500).json({ 
      message: "Error de autenticación",
      error: error.message 
    });
  }
};

// Middleware opcional: Solo permite ciertos tipos de usuario
export const requireUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: "No autenticado" 
      });
    }

    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({ 
        message: `Acceso denegado. Solo para: ${allowedTypes.join(', ')}`,
        yourType: req.user.userType
      });
    }

    next();
  };
};

// Middleware opcional: Verificar que el teléfono esté verificado
export const requirePhoneVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: "No autenticado" 
    });
  }

  if (!req.user.phoneVerified) {
    return res.status(403).json({ 
      message: "Debes verificar tu número de teléfono primero",
      requiresVerification: true
    });
  }

  next();
};