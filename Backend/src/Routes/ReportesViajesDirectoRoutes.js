import express from "express";
import ReportesViajesDirecto from "../Controllers/ReportesVijaesDirectoCon.js";

const router = express.Router();

// ✅ Obtener clientes con viajes del mes
router.get("/clientes/:mes/:ano", ReportesViajesDirecto.obtenerClientesMes);

// ✅ PDF 1: Resumen mensual (Imagen 3)
router.get("/resumen-mes/:mes/:ano", ReportesViajesDirecto.generarPDFResumenMensual);

// ✅ PDF 2: Individual por cliente
router.get("/individual/:clienteNombre/:mes/:ano", ReportesViajesDirecto.generarPDFClienteIndividual);

// ✅ PDF 3: Con crédito fiscal (Imagen 2)
router.get("/credito-fiscal/:mes/:ano", ReportesViajesDirecto.generarPDFCreditoFiscal);

// ✅ PDF 4: Consolidado anual (Imagen 4 - landscape)
router.get("/consolidado/:ano", ReportesViajesDirecto.generarPDFConsolidadoAnual);

export default router;