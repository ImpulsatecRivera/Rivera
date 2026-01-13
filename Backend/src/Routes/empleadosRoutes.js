import empleadosCon from "../Controllers/EmpleadosController.js";
import express from "express";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "public/" });

/**
 * ✅ RUTAS CON CONTROL DE ROLES
 * 
 * ADMIN: Acceso total (crear, leer, actualizar, eliminar)
 * SUPERVISOR: Puede leer, crear y actualizar (NO eliminar)
 * OPERATIVO: Solo puede leer y crear
 */

// GET /empleados - Obtener todos los empleados
// Acceso: Todos (ADMIN, SUPERVISOR, OPERATIVO)
router.get(
  "/",
  empleadosCon.get
);

// POST /empleados - Crear nuevo empleado
// Acceso: ADMIN, SUPERVISOR, OPERATIVO
router.post(
  "/",
  upload.single("img"),
  empleadosCon.post
);

// PUT /empleados/:id - Actualizar empleado
// Acceso: ADMIN, SUPERVISOR
router.put(
  "/:id",
  upload.single("img"),
  empleadosCon.put
);

// DELETE /empleados/:id - Eliminar empleado
// Acceso: Solo ADMIN
router.delete(
  "/:id",
  empleadosCon.delete
);

export default router;