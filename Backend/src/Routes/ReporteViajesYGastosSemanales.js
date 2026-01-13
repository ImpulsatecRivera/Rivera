import express from 'express';
import ReporteController from '../Controllers/ReporteViajesYGastosSemanalesController.js';

const router = express.Router();

// POST /api/reporte/viajes-gastos/semanal -> Retorna JSON con datos
router.post('/semanal', ReporteController.generarReporteSemanal);

// POST /api/reporte/viajes-gastos/semanal/pdf -> Genera y descarga PDF
router.post('/pdf', ReporteController.generarPDFSemanal);

export default router;