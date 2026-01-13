import express from 'express';
import ReporteViajesYGastosSemanalesController from '../Controllers/ReporteViajesYGastosSemanalesController.js';

const router = express.Router();

// POST /api/reporte/viajes-gastos/semanal/pdf -> Genera y descarga PDF
router.post('/pdf', ReporteViajesYGastosSemanalesController.generarPDFSemanal);

export default router;