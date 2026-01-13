import jwt from "jsonwebtoken";
import EmpleadoModel from "../Models/Empleados.js";
import { config } from "../config.js";

/**
 * validateAuthToken(allowedRoles = [])
 * - allowedRoles can contain: 'admin', 'motorista', 'Operativo', 'Supervisor', 'Empleado', etc.
 * - If empty (default) it only validates the token and sets req.user
 */
export const validateAuthToken = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.authToken;
      if (!token) {
        return res.status(401).json({ message: "Cookies not found, please login" });
      }

      const decoded = jwt.verify(token, config.JWT.secret);
      const { id, userType } = decoded;

      // ADMIN (env) -> mapped to 'admin'
      if (userType === "Administrador") {
        if (allowedRoles.length === 0 || allowedRoles.includes("admin")) {
          req.user = { id, userType: "admin" };
          return next();
        }
        return res.status(403).json({ message: "Access denied", userPermission: "admin" });
      }

      // MOTORISTA -> mapped to 'motorista'
      if (userType === "Motorista") {
        if (allowedRoles.length === 0 || allowedRoles.includes("motorista")) {
          req.user = { id, userType: "motorista" };
          return next();
        }
        return res.status(403).json({ message: "Access denied", userPermission: "motorista" });
      }

      // EMPLEADO -> fetch DB to resolve rol (Operativo | Supervisor)
      if (userType === "Empleado") {
        const empleado = await EmpleadoModel.findById(id).select("rol email name lastName");
        if (!empleado) {
          return res.status(401).json({ message: "Empleado no encontrado" });
        }

        const rol = empleado.rol; // Expect 'Operativo' | 'Supervisor'

        // allow if no allowedRoles specified or if allowedRoles includes the rol or generic 'Empleado'
        const allowed =
          allowedRoles.length === 0 ||
          allowedRoles.includes(rol) ||
          allowedRoles.includes("Empleado") ||
          allowedRoles.includes(rol?.toLowerCase());

        if (!allowed) {
          return res.status(403).json({ message: "Access denied", userPermission: rol });
        }

        req.user = {
          id,
          userType: "empleado",
          rol,
          email: empleado.email,
          nombre: empleado.name || null,
        };

        return next();
      }

      // Other user types (Cliente or unknown)
      if (allowedRoles.length === 0) {
        req.user = { id, userType };
        return next();
      }

      const simpleType = String(userType).toLowerCase();
      if (allowedRoles.includes(simpleType) || allowedRoles.includes(userType)) {
        req.user = { id, userType };
        return next();
      }

      return res.status(403).json({ message: "Access denied", userPermission: userType });
    } catch (error) {
      console.error("[validateAuthToken] error:", error);
      return res.status(401).json({ message: "error " + error });
    }
  };
};

export default validateAuthToken;