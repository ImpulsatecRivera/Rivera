import express from 'express';
import cajaChicaController from '../Controllers/CajaChicaController.js';
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "public/" });

// Obtener todos los movimientos de caja chica
router.route("/")
    .get(cajaChicaController.getAllMovements)
    // Crear una nueva operación de caja chica (ingreso/egreso) con posible voucher
    .post(upload.single("voucher"), cajaChicaController.cashOperation)

// Obtener el balance actual de caja chica
router.get('/balance', cajaChicaController.getCurrentBalance)

export default router;