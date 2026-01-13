import express from "express"
import cotizacionesController from "../Controllers/CotizacionesController.js"
import { authMiddleware } from "../Middleware/auth.js";
import { requireRole, requireAdmin } from "../Middleware/roleMiddleware.js";

const router = express.Router();

// GET - Todos pueden leer
router.get("/", authMiddleware, cotizacionesController.getAllCotizaciones);

// POST - Admin, Supervisor, Operativo pueden crear
router.post("/", authMiddleware, requireRole("Operativo", "Supervisor"), cotizacionesController.createCotizacion);

// GET by ID - Todos pueden leer
router.get('/:id', authMiddleware, cotizacionesController.getCotizacionById);

// DELETE - Solo Admin
router.delete('/:id', authMiddleware, requireAdmin, cotizacionesController.deleteCotizacion);

// PUT - Admin, Supervisor pueden editar
router.put("/:id", authMiddleware, requireRole("Supervisor"), cotizacionesController.updateCotizacion);

export default router;