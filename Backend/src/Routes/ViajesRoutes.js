// src/Routes/ViajesRoutes.js - NUEVO DESDE CERO
import express from "express";
import ViajesController from "../Controllers/Viajes.js";
import { validateAuthToken } from "../Middlewares/validateAuthToken.js";
const router = express.Router();

// =====================================================
// RUTAS GET - SIN PARÁMETROS (PRIMERO)
// =====================================================

// Datos del mapa - RUTA PRINCIPAL DEL FRONTEND
router.get("/map-data", validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getMapData);

// Estadísticas y métricas
router.get("/trip-stats", validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getTripStats);
router.get("/carga-distribution", validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getCargaDistribution);
router.get("/real-time-metrics", validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getRealTimeMetrics);
router.get("/dashboard/data", validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getDashboardData);
router.get("/efficiency-metrics", validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getEfficiencyMetrics);

// Análisis de cargas
router.get("/cargo-stats",validateAuthToken(["admin", "Operativo", "Supervisor" , "motorista", "auxiliar"]), ViajesController.getCargaStats);
router.get("/tipos-cargas",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getTiposDeCargas);
router.get("/subcategorias",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getTopSubcategorias);

// Tiempo y capacidad
router.get("/tiempo-promedio",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getTiempoPromedioViaje);
router.get("/capacidad-carga",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getCapacidadCarga);

// Organización temporal
router.get("/por-dias",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getViajesPorDias);
router.get("/completed",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getCompletedTrips);

// Búsqueda y filtros
router.get("/search",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.searchViajes);
router.get("/quick-stats",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getQuickStats);

// =====================================================
// RUTAS DE DEBUGGING (SOLO DESARROLLO)
// =====================================================
if (process.env.NODE_ENV === 'development') {
  router.get("/debug/cargo",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.debugCargas);
  router.get("/debug/estados",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.debugEstados);
}

// =====================================================
// RUTAS POST/PUT/DELETE (SIN PARÁMETROS)
// =====================================================

// Crear viaje
router.post("/",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.addViaje);

// =====================================================
// RUTAS CON PARÁMETROS (AL FINAL)
// =====================================================

// Análisis por categoría específica
router.get("/cargo/category/:categoria",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getCargaDetailsByCategory);

// Viajes por recursos específicos
router.get("/conductor/:conductorId",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getViajesByConductor);
router.get("/truck/:truckId",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getViajesByTruck);
// Operaciones sobre viajes específicos
router.put("/:viajeId",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.editViaje);
router.delete("/:viajeId",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.deleteViaje);

// Actualizaciones específicas
router.patch("/:viajeId/location",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.updateLocation);
router.patch("/:viajeId/progress",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.updateTripProgress);
router.patch("/:viajeId/complete",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.completeTrip);
router.patch("/:viajeId/cancel",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.cancelTrip);
router.patch("/:viajeId/reactivate",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.reactivateTrip);

// Información específica del viaje
router.get("/:viajeId/history",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getTripHistory);
router.get("/:viajeId",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getTripDetails);

// Ruta general (DEBE IR AL FINAL)
router.get("/",validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), ViajesController.getAllViajes);
export default router;