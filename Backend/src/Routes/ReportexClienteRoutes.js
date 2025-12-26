import express from "express";
import ReportesViajesRoutes from "../Controllers/ReporteViajexCliente.js";
import ViajesxCliente from "../Models/ViajesPorClientes.js";

const router = express.Router();

// Reportes PDF
router.get("/pdf-tabla/:mes/:ano", ReportesViajesRoutes.generarPDFEstiloTabla);
router.get("/pdf-individual/:id", ReportesViajesRoutes.generarPDFClienteIndividual);
router.post("/pdf-comparativo", ReportesViajesRoutes.generarPDFComparativoMeses);
router.get("/pdf-consolidado/:ano", ReportesViajesRoutes.generarPDFConsolidadoAnual);

// ✅ NUEVO: Lista de reportes (clientes) disponibles para ese mes/año
router.get("/clientes-mes/:mes/:ano", async (req, res) => {
  try {
    const mesNum = parseInt(req.params.mes, 10);
    const anoNum = parseInt(req.params.ano, 10);

    if (!mesNum || mesNum < 1 || mesNum > 12 || !anoNum) {
      return res.status(400).json({
        success: false,
        message: "Mes o año inválido",
      });
    }

    const rows = await ViajesxCliente.find({
      mes: mesNum,
      año: anoNum,
      estado: "ACTIVO",
    })
      .select("_id clienteNombre totalViajes montoTotalGeneral")
      .sort({ clienteNombre: 1 });

    return res.json({
      success: true,
      count: rows.length,
      data: rows.map((r) => ({
        id: r._id, // 👈 este ID es el que usa /pdf-individual/:id (findById)
        clienteNombre: r.clienteNombre,
        totalViajes: r.totalViajes || 0,
        montoTotalGeneral: r.montoTotalGeneral || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al cargar clientes del mes",
      error: error.message,
    });
  }
});

export default router;
