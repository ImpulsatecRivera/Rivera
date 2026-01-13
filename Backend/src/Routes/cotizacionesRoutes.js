import express from "express"
import cotizacionesController from "../Controllers/CotizacionesController.js"

const router = express.Router();

// GET - Todos pueden leer
router.get("/", cotizacionesController.getAllCotizaciones);

// POST - Admin, Supervisor, Operativo pueden crear
router.post("/", cotizacionesController.createCotizacion);

// GET by ID - Todos pueden leer
router.get('/:id', cotizacionesController.getCotizacionById);

// DELETE - Solo Admin
router.delete('/:id',  cotizacionesController.deleteCotizacion);

// PUT - Admin, Supervisor pueden editar
router.put("/:id",  cotizacionesController.updateCotizacion);

export default router;