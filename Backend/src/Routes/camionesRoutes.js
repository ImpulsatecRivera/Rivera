import express from "express";
import multer from "multer"
import camionesController from "../Controllers/CamionesController.js";
import validateAuthToken from "../Middlewares/validateAuthToken.js";

const router = express.Router();

const upload= multer({dest: "public/"})

// Configuración para múltiples archivos
const uploadFields = upload.fields([
  { name: 'img', maxCount: 1 }, // Imagen del camión (opcional)
  { name: 'circulationCardImage', maxCount: 1 } // Imagen de tarjeta de circulación (opcional)
])

// GET - solo admin, empleados y motoristas pueden ver la lista
router
.route("/")
.get(validateAuthToken(["admin","Operativo","Supervisor","motorista"]), camionesController.get)
// POST - solo admin y empleados
.post(validateAuthToken(["admin","Operativo","Supervisor"]), uploadFields, camionesController.post);

router
.route("/:id")
// PUT - solo admin y empleados
.put(validateAuthToken(["admin","Operativo","Supervisor"]), uploadFields, camionesController.put)
// GET by id - admin, empleados y motoristas
.get(validateAuthToken(["admin","Operativo","Supervisor","motorista"]), camionesController.getById)
// DELETE - solo admin y empleados
.delete(validateAuthToken(["admin","Operativo","Supervisor"]), camionesController.delete);

// STATS - admin, empleados y motoristas
router.get('/:id/stats', validateAuthToken(["admin","Operativo","Supervisor","motorista"]), camionesController.getByIdWithStats);

export default router; 