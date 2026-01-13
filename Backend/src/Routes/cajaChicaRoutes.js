import express from 'express';
import cajaChicaController from '../Controllers/CajaChicaController.js';
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "public/" });

// OBTENER TODOS LOS MOVIMIENTOS - Todos pueden leer
router.get("/", cajaChicaController.getAllMovements);

// OBTENER BALANCE ACTUAL - Todos pueden leer
router.get('/balance', cajaChicaController.getCurrentBalance);

// REGISTRAR INGRESO - Admin, Supervisor, Operativo
router.post("/ingreso",upload.single("voucher"), cajaChicaController.registrarIngreso);

// REGISTRAR EGRESO - Admin, Supervisor, Operativo
router.post("/egreso", upload.single("voucher"), cajaChicaController.cashOperation);

// UPLOAD VOUCHER - Admin, Supervisor
router.patch(
  '/movements/:id/voucher', 
  upload.single('voucher'), 
  cajaChicaController.uploadVoucher
);

// GENERAR VALE - Admin, Supervisor
router.post('/:id/generar-vale', cajaChicaController.generarVale);

export default router;
