import proveedorsCon from "../Controllers/ProveedorController.js"
import express from "express";
import { authMiddleware } from "../Middleware/auth.js";
import { requireRole, requireAdmin } from "../Middleware/roleMiddleware.js";

const router=express.Router();

router.route("/")
.get(authMiddleware, proveedorsCon.get)
.post(authMiddleware, requireRole("Operativo", "Supervisor"), proveedorsCon.post);

router.route("/:id")
.put(authMiddleware, requireRole("Supervisor"), proveedorsCon.put)
.delete(authMiddleware, requireAdmin, proveedorsCon.delete);

export default router;export default router;
