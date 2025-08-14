// Routes/viajes.js - RUTAS PARA VIAJES
import express from "express";
import ViajesController from "../Controllers/Viajes.js";

const router = express.Router();

// =====================================================
// 📍 RUTAS PRINCIPALES DEL MAPA Y DATOS EN TIEMPO REAL
// =====================================================
router.route("/map-data").get(ViajesController.getMapData);
router.route("/real-time-metrics").get(ViajesController.getRealTimeMetrics);

// =====================================================
// 📊 RUTAS DE ANÁLISIS Y ESTADÍSTICAS
// =====================================================
router.route("/carga-distribution").get(ViajesController.getCargaDistribution);
router.route("/carga-details/:categoria").get(ViajesController.getCargaDetailsByCategory);
router.route("/subcategorias").get(ViajesController.getTopSubcategorias);
router.route("/tipos-cargas").get(ViajesController.getTiposDeCargas);
router.route("/trip-stats").get(ViajesController.getTripStats);
router.route("/carga-stats").get(ViajesController.getCargaStats);

// =====================================================
// 📅 RUTAS DE ORGANIZACIÓN TEMPORAL
// =====================================================
router.route("/por-dias").get(ViajesController.getViajesPorDias);
router.route("/completed").get(ViajesController.getCompletedTrips);


// En tu archivo routes/viajes.js
router.get('/tiempo-promedio', ViajesController.getTiempoPromedioViaje);
router.get('/capacidad-carga', ViajesController.getCapacidadCarga);
 // Opcional: todas las métricas en una sola llamada

// =====================================================
// 🚛 RUTAS DE GESTIÓN DE VIAJES INDIVIDUALES
// =====================================================
router.route("/:viajeId").get(ViajesController.getTripDetails);
router.route("/:viajeId/location").patch(ViajesController.updateLocation);
router.route("/:viajeId/progress").patch(ViajesController.updateTripProgress);
router.route("/:viajeId/complete").patch(ViajesController.completeTrip);

// =====================================================
// 📋 RUTAS GENERALES DE VIAJES
// =====================================================
router.route("/").get(ViajesController.getAllViajes);

// =====================================================
// 🔧 RUTAS DE DEBUGGING Y DESARROLLO
// =====================================================
router.route("/debug/cargas").get(ViajesController.debugCargas);
router.route("/debug/estados").get(ViajesController.debugEstados);

export default router;