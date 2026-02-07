import express from 'express';
import ReportesDieselRoutes from "../Controllers/ReportesResumenDiesel.js"
import { validateAuthToken } from '../Middlewares/validateAuthToken.js';
const router = express.Router();

// 1. Reporte individual de un mantenimiento
router.get('/individual/:id', ReportesDieselRoutes.generarPDFIndividual);

// 2. Reporte consolidado de todos los mantenimientos
router.get('/reportes/diesel/mes/:mes/:ano', validateAuthToken(["admin", "Operativo", "Supervisor","Coordinador"]), ReportesDieselRoutes.generarPDFMensualSimple);
router.get('/reportes/diesel/mes-detallado/:mes/:ano', validateAuthToken(["admin", "Operativo", "Supervisor","Coordinador"]), ReportesDieselRoutes.generarPDFMensualDetallado);
router.post('/reportes/diesel/comparativo', validateAuthToken(["admin", "Operativo", "Supervisor","Coordinador"]), ReportesDieselRoutes.generarPDFMultiplesMeses);
router.get('/reportes/diesel/anual/:ano', validateAuthToken(["admin", "Operativo", "Supervisor","Coordinador"]), ReportesDieselRoutes.generarPDFAnual); // 
// Reporte semanal
router.get('/reportes/diesel/semanal/:mes/:ano/:semana', validateAuthToken(["admin", "Operativo", "Supervisor","Coordinador"]), ReportesDieselRoutes.generarPDFSemanal);

export default router;