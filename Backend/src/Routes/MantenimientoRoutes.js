import express from "express"
import mantenimientoCon from "../Controllers/MantenimientoController.js"

const router= express.Router()

router.route("/")
.get(mantenimientoCon.getMantenimineto)
.post(mantenimientoCon.postMantenimiento);

router.route("/:id")
.get(mantenimientoCon.obtenerMantoId)
.put(mantenimientoCon.ActualizarMantenimiento)
.delete(mantenimientoCon.DeleteManto)

export default router;
