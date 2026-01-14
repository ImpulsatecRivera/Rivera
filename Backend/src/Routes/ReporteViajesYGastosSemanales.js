import express from 'express';
import ReporteViajesYGastosSemanalesController from '../Controllers/ReporteViajesYGastosSemanalesController.js';
import { validateAuthToken } from '../Middlewares/validateAuthToken.js';
const router = express.Router();

// POST /api/reporte/viajes-gastos/semanal/pdf -> Genera y descarga PDF
router.post('/pdf',validateAuthToken(["admin", "Operativo", "Supervisor"]), ReporteViajesYGastosSemanalesController.generarPDFSemanal);

export default router;