/**
 * Rutas para reportes PDF de planillas quincenales
 * 
 * Endpoints disponibles:
 * - GET /quincenal/:id           Generar PDF de planilla quincenal específica
 * - GET /mensual/:mes/:año       Generar reporte mensual consolidado
 * - POST /multiMes               Generar reporte de múltiples meses (trimestral, semestral, etc)
 * - GET /anual/:año              Generar reporte anual consolidado
 */

import express from 'express';
import ReportesPlanillasController from '../Controllers/ReportesPlanillaQuincenalController.js';

const router = express.Router();

/**
 * GET /api/reportes/planilla/quincenal/:id
 * Generar y descargar PDF de una planilla quincenal específica
 */
router.get('/:id', ReportesPlanillasController.generarPDFQuincenal);

/**
 * GET /api/reportes/planilla/mensual/:mes/:año
 * Generar reporte mensual consolidado con todas las quincenas del mes
 */
router.get('/mensual/:mes/:año', ReportesPlanillasController.generarPDFMensual);

/**
 * POST /api/reportes/planilla/quincenal/multiMes
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
router.post('/multiMes', ReportesPlanillasController.generarPDFMultiMes);

/**
 * GET /api/reportes/planilla/quincenal/anual/:ano
 * Reporte anual consolidado (todos los meses del año)
 * Params:
 * - ano: Año (ej: 2025)
 */
router.get('/anual/:ano', ReportesPlanillasController.generarPDFAnual);

export default router;