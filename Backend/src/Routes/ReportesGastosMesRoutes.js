import express from 'express';
import ReportesGastosMesController from '../Controllers/ReportesGastosMesController.js';

const router = express.Router();

// POST /api/reporte/gastos-mes/pdf -> genera y descarga PDF consolidado mensual
router.post('/pdf', ReportesGastosMesController.generarPDFMensualConsolidado);

export default router;
