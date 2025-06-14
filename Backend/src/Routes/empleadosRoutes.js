import empleadosCon from "../Controllers/EmpleadosController.js";
import express from "express";

const router = express.Router();

router.route("/")
.get(empleadosCon.get)
.post(empleadosCon.post);

router.route("/:id")
.put(empleadosCon.put)
.delete(empleadosCon.delete);


export default router;