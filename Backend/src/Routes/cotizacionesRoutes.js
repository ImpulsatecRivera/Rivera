import express from "express"
import cotizacionesController from "../Controllers/CotizacionesController.js"

const router = express.Router();


router.route("/").get(cotizacionesController.getAllCotizaciones);


export default router;