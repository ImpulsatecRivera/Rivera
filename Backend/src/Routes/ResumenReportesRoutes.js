import express from 'express';
import ReportesDieselRoutes from "../Controllers/ReportesResumenDiesel.js"

const router = express.Router();

// 1. Reporte individual de un mantenimiento
router.get('/individual/:id', ReportesDieselRoutes.generarPDFIndividual);

// 2. Reporte consolidado de todos los mantenimientos
router.get('/reportes/diesel/mes/:mes/:ano', ReportesDieselRoutes.generarPDFMensualSimple);
router.get('/reportes/diesel/mes-detallado/:mes/:ano', ReportesDieselRoutes.generarPDFMensualDetallado);
router.post('/reportes/diesel/comparativo', ReportesDieselRoutes.generarPDFMultiplesMeses);
router.get('/reportes/diesel/anual/:ano', ReportesDieselRoutes.generarPDFAnual); // 
// Reporte semanal
router.get('/reportes/diesel/semanal/:mes/:ano/:semana', ReportesDieselRoutes.generarPDFSemanal);

export default router;