import empleadosCon from "../Controllers/EmpleadosController.js";
import express from "express";
import multer from "multer";
import { validateAuthToken } from "../Middlewares/validateAuthToken.js";

const router = express.Router();

const upload = multer({ dest: "public/" });

/**
 * ✅ RUTAS CON CONTROL DE ROLES
 * 
 * ADMIN: Acceso total (crear, leer, actualizar, eliminar)
 * SUPERVISOR: Puede leer, crear y actualizar (NO eliminar)
 * OPERATIVO: Puede leer y crear
 */

// GET /empleados - Obtener todos los empleados
// Acceso: ADMIN, SUPERVISOR, OPERATIVO (view-only)
router.get(
  "/",
  validateAuthToken(["admin","Operativo","Supervisor","Coordinador"]),
  empleadosCon.get
);

// POST /empleados - Crear nuevo empleado
// Acceso: ADMIN, SUPERVISOR, OPERATIVO
router.post(
  "/",
  validateAuthToken(["admin","Supervisor","Coordinador"]),
  upload.single("img"),
  empleadosCon.post
);

// PUT /empleados/:id - Actualizar empleado
// Acceso: ADMIN, SUPERVISOR, COORDINADOR (SUPERVISOR no puede eliminar, pero sí actualizar)
router.put(
  "/:id",
  validateAuthToken(["admin","Supervisor"]),
  upload.single("img"),
  empleadosCon.put
);

// DELETE /empleados/:id - Eliminar empleado
// Acceso: Solo ADMIN
router.delete(
  "/:id",
  validateAuthToken(["admin"]),
  empleadosCon.delete
);

export default router;