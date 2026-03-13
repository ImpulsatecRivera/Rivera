// Backend/src/Routes/ReportesVentasRoutes.js

import express from 'express';
import ReportesVentasController from '../Controllers/ReportesVentasController.js';
import { validateAuthToken } from '../Middlewares/validateAuthToken.js';

const router = express.Router();

// =====================================================
// 1. INFORME VENTAS MENSUAL
// =====================================================
// GET /api/reportesVentas/mensual/:mes/:ano
// Ejemplo: /api/reportesVentas/mensual/4/2025 (Abril 2025)
router.get(
    '/mensual/:mes/:ano',
    validateAuthToken(["admin", "Operativo", "Supervisor","Coordinador"]),
    ReportesVentasController.generarPDFInformeMensual
);

// =====================================================
// 2. RESUMEN VENTAS MENSUAL
// =====================================================
// GET /api/reportesVentas/resumen-mensual/:mes/:ano
// Ejemplo: /api/reportesVentas/resumen-mensual/4/2025
router.get(
    '/resumen-mensual/:mes/:ano',
    validateAuthToken(["admin", "Operativo", "Supervisor","Coordinador"]),
    ReportesVentasController.generarPDFResumenMensual
);

// =====================================================
// 3. COMPARATIVO ANUAL POR CLIENTE
// =====================================================
// GET /api/reportesVentas/comparativo-anual/:ano
// Ejemplo: /api/reportesVentas/comparativo-anual/2025
router.get(
    '/comparativo-anual/:ano',
    validateAuthToken(["admin", "Operativo", "Supervisor","Coordinador"]),
    ReportesVentasController.generarPDFComparativoAnual
);

export default router;