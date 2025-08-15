import express from "express"
import cotizacionesController from "../Controllers/CotizacionesController.js"

const router = express.Router();


router.route("/").get(cotizacionesController.getAllCotizaciones);

router.get('/:id', cotizacionesController.getCotizacionById);

router.delete('/:id', cotizacionesController.deleteCotizacion);
export default router;