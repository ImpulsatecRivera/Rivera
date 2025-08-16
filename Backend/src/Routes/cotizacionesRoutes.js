import express from "express"
import cotizacionesController from "../Controllers/CotizacionesController.js"

const router = express.Router();

// GET - Obtener todas las cotizaciones
router.route("/").get(cotizacionesController.getAllCotizaciones);

// POST - Crear nueva cotización (AQUÍ ESTABA EL ERROR - era .get en lugar de .post)
router.route("/").post(cotizacionesController.createCotizacion);

// GET - Obtener cotización por ID
router.get('/:id', cotizacionesController.getCotizacionById);

// DELETE - Eliminar cotización
router.delete('/:id', cotizacionesController.deleteCotizacion);

export default router;