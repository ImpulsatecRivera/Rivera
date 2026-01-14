import express from "express";
import multer from "multer"
import camionesController from "../Controllers/CamionesController.js";
import validateAuthToken from "../Middlewares/validateAuthToken.js";

const router = express.Router();

const upload= multer({dest: "public/"})

// GET - solo admin, empleados y motoristas pueden ver la lista
router
.route("/")
.get(validateAuthToken(["admin","Operativo","Supervisor","motorista"]), camionesController.get)
// POST - solo admin y empleados
.post(validateAuthToken(["admin","Operativo","Supervisor"]), upload.single("img"), camionesController.post);

router
.route("/:id")
// PUT - solo admin y empleados
.put(validateAuthToken(["admin","Operativo","Supervisor"]), upload.single("img"), camionesController.put)
// GET by id - admin, empleados y motoristas
.get(validateAuthToken(["admin","Operativo","Supervisor","motorista"]), camionesController.getById)
// DELETE - solo admin y empleados
.delete(validateAuthToken(["admin","Operativo","Supervisor"]), camionesController.delete);

// STATS - admin, empleados y motoristas
router.get('/:id/stats', validateAuthToken(["admin","Operativo","Supervisor","motorista"]), camionesController.getByIdWithStats);

export default router; 