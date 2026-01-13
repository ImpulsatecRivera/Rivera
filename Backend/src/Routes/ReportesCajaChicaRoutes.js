import express from 'express';
import ReportesCajaChicaController from '../Controllers/ReportesCajaChicaController.js';
import { authMiddleware } from "../Middleware/auth.js";

const router = express.Router();

// =====================================================
// 1. REPORTE INDIVIDUAL - Detalles de un movimiento específico
// =====================================================
// GET /api/reportesCajaChica/individual/:id
// Ejemplo: /api/reportesCajaChica/individual/507f1f77bcf86cd799439011
// Uso: Ver comprobante de un ingreso o egreso específico
router.get('/individual/:id', authMiddleware, ReportesCajaChicaController.generarPDFIndividual);

// =====================================================
// 2. REPORTE CONSOLIDADO - Todos los movimientos históricos
// =====================================================
// GET /api/reportesCajaChica/todos
// Ejemplo: /api/reportesCajaChica/todos
// Uso: Auditoría completa, ver todo el historial de caja chica
router.get('/todos', authMiddleware, ReportesCajaChicaController.generarPDFTodosMovimientos);

// =====================================================
// 3. REPORTE MENSUAL - Movimientos de un mes específico
// =====================================================
// GET /api/reportesCajaChica/mensual-simple/:mes/:ano
// Parámetros:
//   - mes: 1-12 (enero-diciembre)
//   - ano: 2024, 2025, etc.
// Ejemplo: /api/reportesCajaChica/mensual-simple/12/2025
// Uso: Cierre mensual, reporte de diciembre 2025
router.get('/mensual-simple/:mes/:ano', authMiddleware, ReportesCajaChicaController.generarPDFMensualSimple);

// =====================================================
// 4. REPORTE COMPARATIVO - Múltiples meses seleccionados
// =====================================================
// POST /api/reportesCajaChica/mensual-multiple
// Body JSON:
// {
//   "meses": [10, 11, 12],  // Octubre, Noviembre, Diciembre
//   "ano": 2025
// }
// Uso: Comparar trimestre (Oct-Nov-Dic), análisis de tendencias
router.post('/mensual-multiple', authMiddleware, ReportesCajaChicaController.generarPDFMultiplesMeses);

// =====================================================
// 5. REPORTE DIARIO - Movimientos de un día específico
// =====================================================
// GET /api/reportesCajaChica/diario/:fecha
// Parámetro:
//   - fecha: YYYY-MM-DD (formato ISO)
// Ejemplo: /api/reportesCajaChica/diario/2025-12-12
// Uso: Cierre de caja diario, ver movimientos del día con horas
router.get('/diario/:fecha', authMiddleware, ReportesCajaChicaController.generarPDFDiario);

// =====================================================
// 6. REPORTE POR RANGO DE FECHAS - Período personalizado
// =====================================================
// POST /api/reportesCajaChica/rango-fechas
// Body JSON:
// {
//   "fechaInicio": "2025-12-01",  // Formato YYYY-MM-DD
//   "fechaFin": "2025-12-07"      // Formato YYYY-MM-DD
// }
// Ejemplos de uso:
//   - Semanal: del 1 al 7 (7 días)
//   - Quincenal: del 1 al 15 (15 días)
//   - Personalizado: cualquier rango (ej: Nov 1 a Ene 2)
// Nota: Sin límite de días, puede cruzar meses y años
router.post('/rango-fechas', authMiddleware, ReportesCajaChicaController.generarPDFRangoFechas);

export default router;