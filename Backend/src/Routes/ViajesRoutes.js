// src/Routes/ViajesRoutes.js - NUEVO DESDE CERO
import express from "express";
// import ViajesController from "../Controllers/Viajes.js";
import ViajesController from "../Controllers/controllerdummy.js";
const router = express.Router();

// =====================================================
// RUTAS GET - SIN PARÁMETROS (PRIMERO)
// =====================================================

// Datos del mapa - RUTA PRINCIPAL DEL FRONTEND
router.get("/map-data", ViajesController.getMapData);

// Estadísticas y métricas
router.get("/trip-stats", ViajesController.getTripStats);
router.get("/carga-distribution", ViajesController.getCargaDistribution);
router.get("/real-time-metrics", ViajesController.getRealTimeMetrics);
router.get("/dashboard/data", ViajesController.getDashboardData);
router.get("/efficiency-metrics", ViajesController.getEfficiencyMetrics);

// Análisis de cargas
router.get("/cargo-stats", ViajesController.getCargaStats);
router.get("/tipos-cargas", ViajesController.getTiposDeCargas);
router.get("/subcategorias", ViajesController.getTopSubcategorias);

// Tiempo y capacidad
router.get("/tiempo-promedio", ViajesController.getTiempoPromedioViaje);
router.get("/capacidad-carga", ViajesController.getCapacidadCarga);

// Organización temporal
router.get("/por-dias", ViajesController.getViajesPorDias);
router.get("/completed", ViajesController.getCompletedTrips);

// Búsqueda y filtros
router.get("/search", ViajesController.searchViajes);
router.get("/quick-stats", ViajesController.getQuickStats);

// =====================================================
// RUTAS DE DEBUGGING (SOLO DESARROLLO)
// =====================================================
if (process.env.NODE_ENV === 'development') {
  router.get("/debug/cargo", ViajesController.debugCargas);
  router.get("/debug/estados", ViajesController.debugEstados);
}

// =====================================================
// RUTAS POST/PUT/DELETE (SIN PARÁMETROS)
// =====================================================

// Crear viaje
router.post("/", ViajesController.addViaje);

// =====================================================
// RUTAS CON PARÁMETROS (AL FINAL)
// =====================================================

// Análisis por categoría específica
router.get("/cargo/category/:categoria", ViajesController.getCargaDetailsByCategory);

// Viajes por recursos específicos
router.get("/conductor/:conductorId", ViajesController.getViajesByConductor);
router.get("/truck/:truckId", ViajesController.getViajesByTruck);

// Operaciones sobre viajes específicos
router.put("/:viajeId", ViajesController.editViaje);
router.delete("/:viajeId", ViajesController.deleteViaje);

// Actualizaciones específicas
router.patch("/:viajeId/location", ViajesController.updateLocation);
router.patch("/:viajeId/progress", ViajesController.updateTripProgress);
router.patch("/:viajeId/complete", ViajesController.completeTrip);
router.patch("/:viajeId/cancel", ViajesController.cancelTrip);
router.patch("/:viajeId/reactivate", ViajesController.reactivateTrip);

// Información específica del viaje
router.get("/:viajeId/history", ViajesController.getTripHistory);
router.get("/:viajeId", ViajesController.getTripDetails);

// Ruta general (DEBE IR AL FINAL)
router.get("/", ViajesController.getAllViajes);

export default router;