import express from "express";
import ViajesxClienteCon from "../Controllers/ViajesxClienteController.js";

const router = express.Router();

// ============================================
// RUTAS GET - Consultas
// ============================================

// GET ALL: Obtener reportes
router.get("/", ViajesxClienteCon.getReportes);

// GET: Obtener reportes pendientes de pago
router.get("/pendientes", ViajesxClienteCon.getReportesPendientes);

// GET ONE: Obtener un reporte específico
router.get("/:id", ViajesxClienteCon.getReporteById);

// ============================================
// RUTAS POST - Generar reportes
// ============================================

// POST: Generar reporte de un cliente
router.post("/generar", ViajesxClienteCon.generarReporte);

// POST: Generar reportes masivos (todos los clientes del mes)
router.post("/generar-masivo", ViajesxClienteCon.generarReportesMasivo);

// ============================================
// RUTAS PUT - Actualizar
// ============================================

// PUT: Actualizar reporte
router.put("/:id", ViajesxClienteCon.updateReporte);

// PUT: Registrar pago
router.put("/:id/registrar-pago", ViajesxClienteCon.registrarPago);

// PUT: Cerrar reporte
router.put("/:id/cerrar", ViajesxClienteCon.cerrarReporte);

// PUT: Regenerar reporte
router.put("/:id/regenerar", ViajesxClienteCon.regenerarReporte);

// ============================================
// RUTAS DELETE
// ============================================

// DELETE: Eliminar reporte
router.delete("/:id", ViajesxClienteCon.deleteReporte);

export default router;