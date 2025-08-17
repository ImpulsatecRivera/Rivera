import express from "express"
import cotizacionesController from "../Controllers/CotizacionesController.js"

const router = express.Router();


router.route("/").get(cotizacionesController.getAllCotizaciones);

router.route("/").post(cotizacionesController.createCotizacion);

router.get('/:id', cotizacionesController.getCotizacionById);

router.delete('/:id', cotizacionesController.deleteCotizacion);

router.put("/:id",cotizacionesController.updateCotizacion);

export default router;