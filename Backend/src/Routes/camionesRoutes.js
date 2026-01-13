import express from "express";
import multer from "multer"
import camionesController from "../Controllers/CamionesController.js";
import { authMiddleware } from "../Middleware/auth.js";
import { requireRole, requireAdmin } from "../Middleware/roleMiddleware.js";

const router = express.Router();

const upload= multer({dest: "public/"})

router
.route("/")
.get(authMiddleware, camionesController.get)
.post(authMiddleware, requireRole("Operativo", "Supervisor"), upload.single("img"), camionesController.post);

router
.route("/:id")
.put(authMiddleware, requireRole("Supervisor"), upload.single("img"), camionesController.put)
.get(authMiddleware, camionesController.getById)
.delete(authMiddleware, requireAdmin, camionesController.delete);

export default router;router.get('/:id/stats', camionesController.getByIdWithStats);

export default router;