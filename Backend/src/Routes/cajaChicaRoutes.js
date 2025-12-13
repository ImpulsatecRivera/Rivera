import express from 'express';
import cajaChicaController from '../Controllers/CajaChicaController.js';
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "public/" });

// =====================================================
// OBTENER TODOS LOS MOVIMIENTOS
// =====================================================
// GET /api/caja-chica
router.get("/", cajaChicaController.getAllMovements);

// =====================================================
// OBTENER BALANCE ACTUAL
// =====================================================
// GET /api/caja-chica/balance
router.get('/balance', cajaChicaController.getCurrentBalance);

// =====================================================
// REGISTRAR INGRESO (CON PASSWORD) 🔐
// =====================================================
// POST /api/caja-chica/ingreso
// Body: {
//   amount: 100,
//   reason: "Descripción del ingreso",
//   password: "contraseña-del-env"
// }
// Opcional: voucher (archivo)
// Solo admin puede hacer ingresos
router.post("/ingreso", upload.single("voucher"), cajaChicaController.registrarIngreso);

// =====================================================
// REGISTRAR EGRESO (SIN PASSWORD) ✅
// =====================================================
// POST /api/caja-chica/egreso
// Body: {
//   amount: 50,
//   reason: "Descripción del gasto",
//   employeeId: "id-del-empleado" (si no es admin),
//   voucher: archivo (OBLIGATORIO - imagen o PDF)
// }
// IMPORTANTE: El voucher es OBLIGATORIO para egresos
// Cualquier usuario autorizado puede hacer egresos
router.post("/egreso", upload.single("voucher"), cajaChicaController.cashOperation);

export default router;