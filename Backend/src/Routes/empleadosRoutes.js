import empleadosCon from "../Controllers/EmpleadosController.js";
import express from "express";
import multer from "multer";

const router = express.Router();

const upload= multer({dest: "public/"})

// Rutas para empleados
router.route("/")
    .get(empleadosCon.get)
    .post(upload.single("img"),empleadosCon.post);

router.route("/:id")
    .put(upload.single("img"),empleadosCon.put)
    .delete(empleadosCon.delete);

export default router;z