import express from 'express';
import ReportesRoutes from "../Controllers/ReportesController.js"

const router = express.Router();

// 1. Reporte individual de un mantenimiento
router.get('/individual/:id', ReportesRoutes.generarPDFIndividual);

// 2. Reporte anual por camión
router.get('/anual/:ano', ReportesRoutes.generarPDFAnual);

// 3. Reporte mensual simple (un solo mes)
router.get('/mensual-simple/:mes/:ano', ReportesRoutes.generarPDFMensualSimple);

// 4. Reporte de múltiples meses
router.post('/mensual-multiple', ReportesRoutes.generarPDFMultiplesMeses);

export default router;