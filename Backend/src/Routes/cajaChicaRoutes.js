import express from 'express';
import cajaChicaController from '../Controllers/CajaChicaController.js';
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "public/" });

// =====================================================
// RUTAS SIN AUTENTICACIÓN JWT
// (El admin usa password del .env, no JWT)
// =====================================================

// OBTENER TODOS LOS MOVIMIENTOS
router.get("/", cajaChicaController.getAllMovements);

// OBTENER BALANCE ACTUAL
router.get('/balance', cajaChicaController.getCurrentBalance);

// REGISTRAR INGRESO (CON PASSWORD del .env)
router.post("/ingreso", upload.single("voucher"), cajaChicaController.registrarIngreso);

// REGISTRAR EGRESO (sin password, solo comprobante obligatorio)
router.post("/egreso", upload.single("voucher"), cajaChicaController.cashOperation);


export default router;
