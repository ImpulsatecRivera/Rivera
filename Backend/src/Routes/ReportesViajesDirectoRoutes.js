import express from "express";
import ReportesViajesDirecto from "../Controllers/ReportesVijaesDirectoCon.js";
import { authMiddleware } from "../Middleware/auth.js";

const router = express.Router();

// ✅ Obtener clientes con viajes del mes
router.get("/clientes/:mes/:ano", authMiddleware, ReportesViajesDirecto.obtenerClientesMes);

// ✅ PDF 1: Resumen mensual (Imagen 3) — ahora usa la versión que agrupa semanas Tue-Sun
router.get("/resumen-mes/:mes/:ano", authMiddleware, ReportesViajesDirecto.generarPDFResumenMensualV2);

// ✅ PDF X: Resumen por método de pago (efectivo / cheque / transferencia)
// Uso:
//   GET /api/reportes-directos/resumen-mes-metodo/:mes/:ano
//   - :mes  -> número del mes (1 - 12)
//   - :ano  -> año en formato YYYY (ej: 2025)
// Respuesta:
//   - 200: application/pdf (disponible como attachment). El PDF contiene totales por cliente y columnas para EFECTIVO / CHEQUE / TRANSFERENCIA / OTRO.
// Errores comunes:
//   - 400: Mes inválido
//   - 404: No se encontraron viajes para el periodo especificado
router.get("/resumen-mes-metodo/:mes/:ano", authMiddleware, ReportesViajesDirecto.generarPDFResumenPorMetodoPago);

// ✅ PDF 2: Individual por cliente
router.get("/individual/:clienteNombre/:mes/:ano", authMiddleware, ReportesViajesDirecto.generarPDFClienteIndividual);

// ✅ PDF 3: Con crédito fiscal (Imagen 2)
router.get("/credito-fiscal/:mes/:ano", authMiddleware, ReportesViajesDirecto.generarPDFCreditoFiscal);

// 🆕 PDF: CUADRO COMPARATIVO EFECTIVO POR AÑO
// Uso:
//   GET /api/reportes-directos/comparativo-efectivo/:ano
//   - :ano  -> año en formato YYYY (obligatorio)
// Respuesta:
//   - 200: application/pdf (attachment) — tabla por cliente y por mes con viajes y monto (solo EFECTIVO)
router.get("/comparativo-efectivo/:ano", authMiddleware, ReportesViajesDirecto.generarPDFComparativoEfectivo);

// ✅ PDF 4: Consolidado anual (Imagen 4 - landscape) - MANTENER para compatibilidad
router.get("/consolidado/:ano", authMiddleware, ReportesViajesDirecto.generarPDFConsolidadoAnual);

// 🆕 PDF 5: CONSOLIDADO UNIVERSAL (semanal, mensual, trimestral, semestral, 9meses, anual)
router.get("/consolidado-periodo", authMiddleware, ReportesViajesDirecto.generarPDFConsolidadoPeriodo);

export default router;