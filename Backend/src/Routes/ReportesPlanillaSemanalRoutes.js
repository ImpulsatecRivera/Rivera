import express from 'express';
import ReportesPlanillaSemanalController from '../Controllers/ReportesPlanillaSemanalController.js';

const router = express.Router();

// ============================================
// RUTAS DE REPORTES PLANILLA SEMANAL
// ============================================

/**
 * GET /api/reportes/planilla/semanal/detallado/:id
 * Reporte semanal detallado (día por día como imagen 1)
 * Params:
 * - id: ObjectId de la planilla semanal
 */
router.get('/detallado/:id', ReportesPlanillaSemanalController.generarPDFSemanalDetallado);

/**
 * GET /api/reportes/planilla/semanal/mensual/:mes/:ano
 * Reporte mensual consolidado (estilo "extra" como imagen 2)
 * Params:
 * - mes: Número del mes (1-12)
 * - ano: Año (ej: 2025)
 */
router.get('/mensual/:mes/:ano', ReportesPlanillaSemanalController.generarPDFMensual);

/**
 * POST /api/reportes/planilla/semanal/multiMes
 * Reporte consolidado de múltiples meses (trimestral, semestral, 9 meses)
 * Body:
 * {
 *   "meses": [1, 2, 3],  // Array de meses (1-12), máximo 9, no necesitan ser consecutivos
 *   "ano": 2025
 * }
 * 
 * Ejemplos:
 * - Trimestral: { "meses": [1, 2, 3], "ano": 2025 }
 * - Semestral: { "meses": [1, 2, 3, 4, 5, 6], "ano": 2025 }
 * - 9 meses: { "meses": [1, 2, 3, 4, 5, 6, 7, 8, 9], "ano": 2025 }
 * - Custom: { "meses": [1, 3, 5, 7], "ano": 2025 } // Meses no consecutivos
 */
router.post('/multiMes', ReportesPlanillaSemanalController.generarPDFMultiMes);

/**
 * GET /api/reportes/planilla/semanal/anual/:ano
 * Reporte anual consolidado (todos los meses del año)
 * Params:
 * - ano: Año (ej: 2025)
 */
router.get('/anual/:ano', ReportesPlanillaSemanalController.generarPDFAnual);

export default router;