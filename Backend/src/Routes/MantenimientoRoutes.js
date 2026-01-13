import express from "express"
import mantenimientoCon from "../Controllers/MantenimientoController.js"
import { authMiddleware } from "../Middleware/auth.js";
import { requireRole, requireAdmin } from "../Middleware/roleMiddleware.js";

const router= express.Router()

router.route("/")
.get(authMiddleware, mantenimientoCon.getMantenimineto)
.post(authMiddleware, requireRole("Operativo", "Supervisor"), mantenimientoCon.postMantenimiento);

router.route("/:id")
.get(authMiddleware, mantenimientoCon.obtenerMantoId)
.put(authMiddleware, requireRole("Supervisor"), mantenimientoCon.ActualizarMantenimiento)
.delete(authMiddleware, requireAdmin, mantenimientoCon.DeleteManto)

export default router;
