import express from 'express';
import cajaChicaController from '../Controllers/CajaChicaController.js';
import multer from "multer";
import validateAuthToken from "../Middlewares/validateAuthToken.js";

const router = express.Router();

const upload = multer({ dest: "public/" });

// OBTENER TODOS LOS MOVIMIENTOS - Solo admin y empleados
router.get("/", validateAuthToken(["admin","Operativo","Supervisor","Coordinador"]), cajaChicaController.getAllMovements);

// OBTENER BALANCE ACTUAL - Solo admin y empleados
router.get('/balance', validateAuthToken(["admin","Operativo","Supervisor","Coordinador"]), cajaChicaController.getCurrentBalance);

// REGISTRAR INGRESO - Admin, Supervisor, Operativo
router.post("/ingreso", validateAuthToken(["admin","Operativo","Supervisor","Coordinador"]), upload.single("voucher"), cajaChicaController.registrarIngreso);

// REGISTRAR EGRESO - Admin, Supervisor, Operativo
router.post("/egreso", validateAuthToken(["admin","Operativo","Supervisor","Coordinador"]), upload.single("voucher"), cajaChicaController.cashOperation);

// UPLOAD VOUCHER - Admin, Supervisor
router.patch(
  '/movements/:id/voucher', 
  validateAuthToken(["admin","Operativo","Supervisor"]),
  upload.single('voucher'), 
  cajaChicaController.uploadVoucher
);

// GENERAR VALE - Admin, Supervisor
router.post('/:id/generar-vale', validateAuthToken(["admin","Operativo","Supervisor","Coordinador"]), cajaChicaController.generarVale);

export default router;
