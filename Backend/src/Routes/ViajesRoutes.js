// src/Routes/ViajesRoutes.js - ORDEN CORREGIDO CON ALIASES ORGANIZADOS
import express from "express";
import ViajesController from "../Controllers/Viajes.js";

const router = express.Router();

// =====================================================
// 🚨 RUTAS QUE USA EL FRONTEND - PRIORIDAD MÁXIMA
// =====================================================

// ✅ ESTAS SON LAS RUTAS QUE ESTÁ LLAMANDO TU FRONTEND
router.get("/trip-stats", ViajesController.getTripStats);
router.get("/carga-distribution", ViajesController.getCargaDistribution);

// =====================================================
// 📍 RUTAS DE DATOS DEL MAPA Y MÉTRICAS
// =====================================================

router.get("/map-data", ViajesController.getMapData);
router.get("/real-time-metrics", ViajesController.getRealTimeMetrics);

// =====================================================
// 📊 RUTAS DE DASHBOARD Y ESTADÍSTICAS ORGANIZADAS
// =====================================================

router.get("/dashboard/data", ViajesController.getDashboardData);
router.get("/metrics/realtime", ViajesController.getRealTimeMetrics);
router.get("/metrics/efficiency", ViajesController.getEfficiencyMetrics);

// ✅ RUTA PRINCIPAL + ALIAS INMEDIATO
router.get("/metrics/average-time", ViajesController.getTiempoPromedioViaje);
router.get("/tiempo-promedio", ViajesController.getTiempoPromedioViaje); // 🔄 Alias movido aquí

// ✅ RUTA PRINCIPAL + ALIAS INMEDIATO
router.get("/metrics/capacity", ViajesController.getCapacidadCarga);
router.get("/capacidad-carga", ViajesController.getCapacidadCarga); // 🔄 Alias movido aquí

// =====================================================
// 📦 RUTAS DE ANÁLISIS DE CARGAS
// =====================================================

router.get("/cargo/distribution", ViajesController.getCargaDistribution);
router.get("/cargo/types", ViajesController.getTiposDeCargas);
router.get("/tipos-cargas", ViajesController.getTiposDeCargas); // 🔄 Alias movido aquí

router.get("/cargo/stats", ViajesController.getCargaStats);
router.get("/carga-stats", ViajesController.getCargaStats); // 🔄 Alias movido aquí

router.get("/cargo/subcategories", ViajesController.getTopSubcategorias);
router.get("/subcategorias", ViajesController.getTopSubcategorias); // 🔄 Alias movido aquí

router.get("/cargo/category/:categoria", ViajesController.getCargaDetailsByCategory);
router.get("/carga-details/:categoria", ViajesController.getCargaDetailsByCategory); // 🔄 Alias movido aquí

// =====================================================
// 📅 RUTAS DE ORGANIZACIÓN TEMPORAL
// =====================================================

router.get("/schedule/days", ViajesController.getViajesPorDias);
router.get("/por-dias", ViajesController.getViajesPorDias); // 🔄 Alias movido aquí

router.get("/completed/list", ViajesController.getCompletedTrips);
router.get("/completed", ViajesController.getCompletedTrips);

// =====================================================
// 🔍 RUTAS DE BÚSQUEDA Y FILTROS
// =====================================================

router.get("/search/advanced", ViajesController.searchViajes);
router.get("/stats/quick", ViajesController.getQuickStats);
router.get("/stats/period", ViajesController.getTripStats);

// =====================================================
// 👥 RUTAS POR RECURSOS ESPECÍFICOS
// =====================================================

router.get("/conductor/:conductorId", ViajesController.getViajesByConductor);
router.get("/truck/:truckId", ViajesController.getViajesByTruck);

// =====================================================
// 🔧 RUTAS DE DEBUGGING (SOLO EN DESARROLLO)
// =====================================================

if (process.env.NODE_ENV === 'development') {
  router.get("/debug/cargo", ViajesController.debugCargas);
  router.get("/debug/estados", ViajesController.debugEstados);
}

// =====================================================
// 🆕 RUTAS POST/PUT/PATCH
// =====================================================

router.post("/", ViajesController.addViaje);

// =====================================================
// 🛠️ RUTAS DE ACTUALIZACIÓN CON PARÁMETROS
// =====================================================

router.patch("/:viajeId/location", ViajesController.updateLocation);
router.patch("/:viajeId/progress", ViajesController.updateTripProgress);
router.patch("/:viajeId/complete", ViajesController.completeTrip);
router.patch("/:viajeId/cancel", ViajesController.cancelTrip);
router.patch("/:viajeId/reactivate", ViajesController.reactivateTrip);

// =====================================================
// 📋 RUTAS CON PARÁMETROS INDIVIDUALES
// =====================================================

router.get("/:viajeId/history", ViajesController.getTripHistory);
router.get("/:viajeId", ViajesController.getTripDetails);

// =====================================================
// 🌐 RUTA GENÉRICA FINAL
// =====================================================

router.get("/", ViajesController.getAllViajes);

// =====================================================
// 🚨 MIDDLEWARE DE MANEJO DE ERRORES
// =====================================================
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de viajes:', {
    error: error.message,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    params: req.params,
    timestamp: new Date().toISOString()
  });
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación en datos del viaje',
      errors: Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }))
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID de viaje inválido proporcionado',
      field: error.path,
      value: error.value
    });
  }

  if (error.message.includes('not found') || error.message.includes('no encontrado')) {
    return res.status(404).json({
      success: false,
      message: 'Viaje no encontrado'
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Ya existe un viaje con datos similares',
      field: Object.keys(error.keyPattern || {})[0] || 'unknown'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Error interno en el módulo de viajes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

export default router;