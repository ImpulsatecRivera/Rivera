// Middleware/roleMiddleware.js
import EmpleadosModel from '../Models/Empleados.js';

// Middleware para verificar rol del empleado
export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({ 
          message: "No autenticado" 
        });
      }

      // Si es admin, dejar pasar (los admins pueden hacer todo)
      if (req.user.userType === 'Administrador') {
        req.user.rol = 'Administrador';
        return next();
      }

      // Si es Empleado, obtener su rol
      if (req.user.userType === 'Empleado') {
        const empleado = await EmpleadosModel.findById(req.user.id);
        
        if (!empleado) {
          return res.status(404).json({ 
            message: "Empleado no encontrado" 
          });
        }

        // Agregar rol del empleado al request
        req.user.rol = empleado.rol;

        // Verificar si tiene permiso
        if (!allowedRoles.includes(empleado.rol)) {
          return res.status(403).json({ 
            message: `Acceso denegado. Solo ${allowedRoles.join(' o ')} pueden hacer esto`,
            tuRol: empleado.rol,
            rolesPermitidos: allowedRoles
          });
        }

        return next();
      }

      // Otros tipos de usuario no tienen acceso
      return res.status(403).json({ 
        message: `Acceso denegado para ${req.user.userType}`
      });

    } catch (error) {
      console.error("Error en roleMiddleware:", error);
      return res.status(500).json({ 
        message: "Error al verificar permisos",
        error: error.message 
      });
    }
  };
};

// Middleware para solo Admin
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: "No autenticado" 
      });
    }

    if (req.user.userType !== 'Administrador') {
      return res.status(403).json({ 
        message: "Solo administradores pueden hacer esto",
        tuTipo: req.user.userType
      });
    }

    req.user.rol = 'Administrador';
    next();
  } catch (error) {
    console.error("Error en requireAdmin:", error);
    return res.status(500).json({ 
      message: "Error al verificar permisos",
      error: error.message 
    });
  }
};
