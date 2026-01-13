import express from 'express';
import cajaChicaController from '../Controllers/CajaChicaController.js';
import multer from "multer";
import { authMiddleware } from "../Middleware/auth.js";
import { requireRole, requireAdmin } from "../Middleware/roleMiddleware.js";

const router = express.Router();

const upload = multer({ dest: "public/" });

// OBTENER TODOS LOS MOVIMIENTOS - Todos pueden leer
router.get("/", authMiddleware, cajaChicaController.getAllMovements);

// OBTENER BALANCE ACTUAL - Todos pueden leer
router.get('/balance', authMiddleware, cajaChicaController.getCurrentBalance);

// REGISTRAR INGRESO - Admin, Supervisor, Operativo
router.post("/ingreso", authMiddleware, requireRole("Operativo", "Supervisor"), upload.single("voucher"), cajaChicaController.registrarIngreso);

// REGISTRAR EGRESO - Admin, Supervisor, Operativo
router.post("/egreso", authMiddleware, requireRole("Operativo", "Supervisor"), upload.single("voucher"), cajaChicaController.cashOperation);

// UPLOAD VOUCHER - Admin, Supervisor
router.patch(
  '/movements/:id/voucher', 
  authMiddleware,
  requireRole("Supervisor"),
  upload.single('voucher'), 
  cajaChicaController.uploadVoucher
);

// GENERAR VALE - Admin, Supervisor
router.post('/:id/generar-vale', authMiddleware, requireRole("Supervisor"), cajaChicaController.generarVale);
