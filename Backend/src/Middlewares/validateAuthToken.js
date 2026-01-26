import jwt from "jsonwebtoken";
import EmpleadoModel from "../Models/Empleados.js";
import ClienteModel from "../Models/Clientes.js";
import MotoristaModel from "../Models/Motorista.js";
import { config } from "../config.js";

/**
 * validateAuthToken(allowedRoles = [])
 * - allowedRoles can contain: 'admin', 'motorista', 'Operativo', 'Supervisor', 'Empleado', 'cliente', etc.
 * - If empty (default) it only validates the token and sets req.user
 */
export const validateAuthToken = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      let token = null;
      
      // ✅ PRIMERO: Intentar leer del header Authorization (más confiable)
      if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
        }
      }
      
      // ✅ SEGUNDO: Fallback a cookies solo si no hay header
      if (!token) {
        token = req.cookies?.authToken;
      }

      if (!token) {
        return res.status(401).json({ message: "Token not found, please login" });
      }

      const decoded = jwt.verify(token, config.JWT.secret);
      const { id, userType } = decoded;
      const normalizedType = String(userType || '').trim().toLowerCase();
      const normalizedSingular = normalizedType.replace(/s$/,'');

      // ADMIN -> normalized to 'admin'
      if (normalizedType === 'administrador' || normalizedType === 'admin' || normalizedType.startsWith('admin')) {
        if (allowedRoles.length === 0 || allowedRoles.includes("admin")) {
          req.user = { id, userType: "admin" };
          return next();
        }
        return res.status(403).json({ message: "Access denied", userPermission: "admin" });
      }

      // MOTORISTA -> fetch DB to resolve rol (motorista | auxiliar)
      if (normalizedType.startsWith('motorist') || normalizedType === 'motoristas' || normalizedSingular === 'motorista') {
        const motorista = await MotoristaModel.findById(id).select("rol name lastName");
        if (!motorista) {
          return res.status(401).json({ message: "Motorista no encontrado" });
        }

        const rol = motorista.rol; // Expect 'motorista' | 'auxiliar'

        // allow if no allowedRoles specified or if allowedRoles includes the rol or generic 'motorista'
        const allowed =
          allowedRoles.length === 0 ||
          allowedRoles.includes(rol) ||
          allowedRoles.includes("motorista") ||
          allowedRoles.includes("motoristas") ||
          allowedRoles.includes(rol?.toLowerCase());

        if (!allowed) {
          return res.status(403).json({ message: "Access denied", userPermission: rol });
        }

        req.user = {
          id,
          userType: "motorista",
          rol,
          nombre: motorista.name || null,
          apellido: motorista.lastName || null,
        };

        return next();
      }

      // EMPLEADO -> fetch DB to resolve rol (Operativo | Supervisor)
      if (normalizedType.startsWith('emplead') || normalizedType === 'empleados' || normalizedSingular === 'empleado') {
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

      // CLIENTE -> mapped to 'cliente' (load basic info for ownership checks)
      if (normalizedType.startsWith('client') || normalizedType === 'clientes' || normalizedSingular === 'cliente') {
        const cliente = await ClienteModel.findById(id).select("email firstName lastName nombreComercial tipoCliente");
        if (!cliente) {
          return res.status(401).json({ message: "Cliente no encontrado" });
        }

        if (allowedRoles.length === 0 || allowedRoles.includes("cliente") || allowedRoles.includes("Cliente") || allowedRoles.includes('clientes')) {
          req.user = {
            id,
            userType: "cliente",
            email: cliente.email,
            name: typeof cliente.getNombreDisplay === 'function' ? cliente.getNombreDisplay() : `${cliente.firstName || ''} ${cliente.lastName || ''}`.trim(),
            tipoCliente: cliente.tipoCliente || null,
          };
          return next();
        }

        return res.status(403).json({ message: "Access denied", userPermission: "cliente" });
      }

      // Other user types (unknown)
      if (allowedRoles.length === 0) {
        req.user = { id, userType };
        return next();
      }

      const simpleType = normalizedSingular; // normalized and singular
      if (allowedRoles.includes(simpleType) || allowedRoles.includes(normalizedType) || allowedRoles.includes(userType)) {
        req.user = { id, userType: normalizedSingular };
        return next();
      }

      return res.status(403).json({ message: "Access denied", userPermission: userType });
    } catch (error) {
      console.error("[validateAuthToken] error:", error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

export default validateAuthToken;