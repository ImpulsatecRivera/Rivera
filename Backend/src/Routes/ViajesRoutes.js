// src/Routes/ViajesRoutes.js - NUEVO DESDE CERO
import express from "express";
import ViajesController from "../Controllers/Viajes.js";
import { authMiddleware } from "../Middleware/auth.js";
import { requireRole, requireAdmin } from "../Middleware/roleMiddleware.js";

const router = express.Router();

// =====================================================
// RUTAS GET - SIN PARÁMETROS (PRIMERO)
// =====================================================

// Datos del mapa - RUTA PRINCIPAL DEL FRONTEND
router.get("/map-data", authMiddleware, ViajesController.getMapData);

// Estadísticas y métricas
router.get("/trip-stats", authMiddleware, ViajesController.getTripStats);
router.get("/carga-distribution", authMiddleware, ViajesController.getCargaDistribution);
router.get("/real-time-metrics", authMiddleware, ViajesController.getRealTimeMetrics);
router.get("/dashboard/data", authMiddleware, ViajesController.getDashboardData);
router.get("/efficiency-metrics", authMiddleware, ViajesController.getEfficiencyMetrics);

// Análisis de cargas
router.get("/cargo-stats", authMiddleware, ViajesController.getCargaStats);
router.get("/tipos-cargas", authMiddleware, ViajesController.getTiposDeCargas);
router.get("/subcategorias", authMiddleware, ViajesController.getTopSubcategorias);

// Tiempo y capacidad
router.get("/tiempo-promedio", authMiddleware, ViajesController.getTiempoPromedioViaje);
router.get("/capacidad-carga", authMiddleware, ViajesController.getCapacidadCarga);

// Organización temporal
router.get("/por-dias", authMiddleware, ViajesController.getViajesPorDias);
router.get("/completed", authMiddleware, ViajesController.getCompletedTrips);

// Búsqueda y filtros
router.get("/search", authMiddleware, ViajesController.searchViajes);
router.get("/quick-stats", authMiddleware, ViajesController.getQuickStats);

// =====================================================
// RUTAS DE DEBUGGING (SOLO DESARROLLO)
// =====================================================
if (process.env.NODE_ENV === 'development') {
  router.get("/debug/cargo", authMiddleware, ViajesController.debugCargas);
  router.get("/debug/estados", authMiddleware, ViajesController.debugEstados);
}

// =====================================================
// RUTAS POST/PUT/DELETE (SIN PARÁMETROS)
// =====================================================

// Crear viaje
router.post("/", authMiddleware, requireRole("Operativo", "Supervisor"), ViajesController.addViaje);

// =====================================================
// RUTAS CON PARÁMETROS (AL FINAL)
// =====================================================

// Análisis por categoría específica
router.get("/cargo/category/:categoria", authMiddleware, ViajesController.getCargaDetailsByCategory);

// Viajes por recursos específicos
router.get("/conductor/:conductorId", authMiddleware, ViajesController.getViajesByConductor);
router.get("/truck/:truckId", authMiddleware, ViajesController.getViajesByTruck);

// Operaciones sobre viajes específicos
router.put("/:viajeId", authMiddleware, requireRole("Supervisor"), ViajesController.editViaje);
router.delete("/:viajeId", authMiddleware, requireAdmin, ViajesController.deleteViaje);

// Actualizaciones específicas
router.patch("/:viajeId/location", authMiddleware, requireRole("Operativo", "Supervisor"), ViajesController.updateLocation);
router.patch("/:viajeId/progress", authMiddleware, requireRole("Operativo", "Supervisor"), ViajesController.updateTripProgress);
router.patch("/:viajeId/complete", authMiddleware, requireRole("Operativo", "Supervisor"), ViajesController.completeTrip);
router.patch("/:viajeId/cancel", authMiddleware, requireRole("Supervisor"), ViajesController.cancelTrip);
router.patch("/:viajeId/reactivate", authMiddleware, requireRole("Supervisor"), ViajesController.reactivateTrip);

// Información específica del viaje
router.get("/:viajeId/history", authMiddleware, ViajesController.getTripHistory);
router.get("/:viajeId", authMiddleware, ViajesController.getTripDetails);

// Ruta general (DEBE IR AL FINAL)
router.get("/", authMiddleware, ViajesController.getAllViajes);

export default router;