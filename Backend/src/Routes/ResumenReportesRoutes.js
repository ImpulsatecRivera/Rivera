import express from 'express';
import ReportesDieselRoutes from "../Controllers/ReportesResumenDiesel.js"
import { authMiddleware } from "../Middleware/auth.js";

const router = express.Router();

// 1. Reporte individual de un mantenimiento
router.get('/individual/:id', authMiddleware, ReportesDieselRoutes.generarPDFIndividual);

// 2. Reporte consolidado de todos los mantenimientos
router.get('/reportes/diesel/mes/:mes/:ano', authMiddleware, ReportesDieselRoutes.generarPDFMensualSimple);
router.get('/reportes/diesel/mes-detallado/:mes/:ano', authMiddleware, ReportesDieselRoutes.generarPDFMensualDetallado);
router.post('/reportes/diesel/comparativo', authMiddleware, ReportesDieselRoutes.generarPDFMultiplesMeses);
router.get('/reportes/diesel/anual/:ano', authMiddleware, ReportesDieselRoutes.generarPDFAnual); // 
// Reporte semanal
router.get('/reportes/diesel/semanal/:mes/:ano/:semana', authMiddleware, ReportesDieselRoutes.generarPDFSemanal);

export default router;