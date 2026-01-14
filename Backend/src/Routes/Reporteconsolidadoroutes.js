// Backend/src/Routes/ReporteConsolidadoRoutes.js
// Rutas para generar reportes consolidados por camión

import express from 'express';
import ReporteConsolidadoController from '../Controllers/ReporteConsolidadoController.js';
import { validateAuthToken } from '../Middlewares/validateAuthToken.js';
const router = express.Router();

// 1. Reporte mensual consolidado (incluye días trabajados)
// GET /api/reporte-consolidado/mensual/:mes/:ano/:diasTrabajados
router.get('/mensual/:mes/:ano/:diasTrabajados', validateAuthToken(["admin", "Operativo", "Supervisor"]), ReporteConsolidadoController.generarPDFMensual);

// 2. Reporte multi-mes consolidado
// POST /api/reporte-consolidado/multi-mes
// Body: { meses: [1, 2, 3], ano: 2025 }
router.post('/multi-mes', validateAuthToken(["admin", "Operativo", "Supervisor"]), ReporteConsolidadoController.generarPDFMultiMes);

// 3. Reporte anual consolidado
// GET /api/reporte-consolidado/anual/:ano
router.get('/anual/:ano', validateAuthToken(["admin", "Operativo", "Supervisor"]), ReporteConsolidadoController.generarPDFAnual);

export default router;