import express from 'express';
import ReportesRoutes from "../Controllers/ReportesController.js"
import { validateAuthToken } from '../Middlewares/validateAuthToken.js';
const router = express.Router();

// 1. Reporte individual de un mantenimiento
router.get('/individual/:id', validateAuthToken(["admin", "Operativo", "Supervisor"]), ReportesRoutes.generarPDFIndividual);

// 2. Reporte anual por camión
router.get('/anual/:ano', validateAuthToken(["admin", "Operativo", "Supervisor"]),ReportesRoutes.generarPDFAnual);

// 3. Reporte mensual simple (un solo mes)
router.get('/mensual-simple/:mes/:ano', validateAuthToken(["admin", "Operativo", "Supervisor"]),ReportesRoutes.generarPDFMensualSimple);

// 4. Reporte semanal
router.get('/semanal/:mes/:ano/:semana',validateAuthToken(["admin", "Operativo", "Supervisor"]), ReportesRoutes.generarPDFSemanal);
router.get('/rango-fechas/:fechaInicio/:fechaFin',validateAuthToken(["admin", "Operativo", "Supervisor"]), ReportesRoutes.generarPDFRangoFechas); // NUEVA RUTA


// 5. Reporte de múltiples meses
router.post('/mensual-multiple',validateAuthToken(["admin", "Operativo", "Supervisor"]), ReportesRoutes.generarPDFMultiplesMeses);

export default router;