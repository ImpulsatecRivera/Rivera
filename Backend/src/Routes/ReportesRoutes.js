import express from 'express';
import ReportesRoutes from "../Controllers/ReportesController.js"
import { authMiddleware } from "../Middleware/auth.js";

const router = express.Router();

// 1. Reporte individual de un mantenimiento
router.get('/individual/:id', authMiddleware, ReportesRoutes.generarPDFIndividual);

// 2. Reporte anual por camión
router.get('/anual/:ano', authMiddleware, ReportesRoutes.generarPDFAnual);

// 3. Reporte mensual simple (un solo mes)
router.get('/mensual-simple/:mes/:ano', authMiddleware, ReportesRoutes.generarPDFMensualSimple);

// 4. Reporte semanal
router.get('/semanal/:mes/:ano/:semana', authMiddleware, ReportesRoutes.generarPDFSemanal);
router.get('/rango-fechas/:fechaInicio/:fechaFin', authMiddleware, ReportesRoutes.generarPDFRangoFechas); // NUEVA RUTA


// 5. Reporte de múltiples meses
router.post('/mensual-multiple', authMiddleware, ReportesRoutes.generarPDFMultiplesMeses);

export default router;