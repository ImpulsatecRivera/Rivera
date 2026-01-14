import express from "express"
import mantenimientoCon from "../Controllers/MantenimientoController.js"
import { validateAuthToken } from "../Middlewares/validateAuthToken.js"
const router = express.Router()

router.route("/")
    .get(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista"]), mantenimientoCon.getMantenimineto)
    .post(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista"]), mantenimientoCon.postMantenimiento);

router.route("/:id")
    .get(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista"]), mantenimientoCon.obtenerMantoId)
    .put(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista"]), mantenimientoCon.ActualizarMantenimiento)
    .delete(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista"]), mantenimientoCon.DeleteManto)

export default router;
