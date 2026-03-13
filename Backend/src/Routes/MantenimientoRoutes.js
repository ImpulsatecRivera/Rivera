import express from "express"
import mantenimientoCon from "../Controllers/MantenimientoController.js"
import { validateAuthToken } from "../Middlewares/validateAuthToken.js"
const router = express.Router()

router.route("/")
    .get(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar","Coordinador"]), mantenimientoCon.getMantenimineto)
    .post(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar","Coordinador"]), mantenimientoCon.postMantenimiento);

router.route("/:id")
    .get(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar","Coordinador"]), mantenimientoCon.obtenerMantoId)
    .put(validateAuthToken(["admin",  "Supervisor", "motorista", "auxiliar"]), mantenimientoCon.ActualizarMantenimiento)
    .delete(validateAuthToken(["admin"]), mantenimientoCon.DeleteManto)

export default router;
