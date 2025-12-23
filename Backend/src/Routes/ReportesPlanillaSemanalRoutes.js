import express from 'express';
import ReportesPlanillaSemanalController from '../Controllers/ReportesPlanillaSemanalController.js';

const router = express.Router();

// ============================================
// RUTAS DE REPORTES PLANILLA SEMANAL
// ============================================

// Reporte semanal detallado (día por día como imagen 1)
router.get('/semanal-detallado/:id', ReportesPlanillaSemanalController.generarPDFSemanalDetallado);

// Reporte mensual consolidado (estilo "extra" como imagen 2)
router.get('/mensual/:mes/:ano', ReportesPlanillaSemanalController.generarPDFMensual);

export default router;