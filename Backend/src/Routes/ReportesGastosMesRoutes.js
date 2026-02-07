import express from 'express';
import ReportesGastosMesController from '../Controllers/ReportesGastosMesController.js';
import { validateAuthToken } from '../Middlewares/validateAuthToken.js';
const router = express.Router();

// POST /api/reporte/gastos-mes/pdf -> genera y descarga PDF consolidado mensual
router.post('/pdf', validateAuthToken(["admin", "Operativo", "Supervisor","Coordinador"]), ReportesGastosMesController.generarPDFMensualConsolidado);

export default router;
