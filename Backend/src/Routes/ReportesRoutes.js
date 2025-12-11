import express from 'express';
import ReportesRoutes from "../Controllers/ReportesController.js"

const router = express.Router();

// 1. Reporte individual de un mantenimiento
router.get('/individual/:id', ReportesRoutes.generarPDFIndividual);

// 2. Reporte consolidado de todos los mantenimientos
router.get('/todos', ReportesRoutes.generarPDFTodosMantenimientos);

// 3. Reporte mensual simple (un solo mes) - NUEVO
router.get('/mensual-simple/:mes/:ano', ReportesRoutes.generarPDFMensualSimple);

// 4. Reporte de múltiples meses - NUEVO
router.post('/mensual-multiple', ReportesRoutes.generarPDFMultiplesMeses);

export default router;