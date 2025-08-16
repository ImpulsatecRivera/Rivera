// src/Routes/ViajesRoutes.js - VERSIÓN COMPLETAMENTE CORREGIDA
import express from "express";
import ViajesController from "../Controllers/Viajes.js";

const router = express.Router();

// =====================================================
// 🚨 ORDEN CRÍTICO: RUTAS ESPECÍFICAS PRIMERO, GENÉRICAS AL FINAL
// =====================================================

// =====================================================
// 📍 RUTAS DE DATOS DEL MAPA Y MÉTRICAS (MÁS ESPECÍFICAS PRIMERO)
// =====================================================

// GET /api/viajes/map-data - Datos del mapa principal
router.get("/map-data", ViajesController.getMapData);

// GET /api/viajes/real-time-metrics - Métricas en tiempo real
router.get("/real-time-metrics", ViajesController.getRealTimeMetrics);

// GET /api/viajes/metrics/realtime - Alias para métricas
router.get("/metrics/realtime", ViajesController.getRealTimeMetrics);

// GET /api/viajes/metrics/efficiency - Métricas de eficiencia
router.get("/metrics/efficiency", ViajesController.getEfficiencyMetrics);

// GET /api/viajes/metrics/average-time - Tiempo promedio de viaje
router.get("/metrics/average-time", ViajesController.getTiempoPromedioViaje);

// GET /api/viajes/metrics/capacity - Capacidad de carga
router.get("/metrics/capacity", ViajesController.getCapacidadCarga);

// =====================================================
// 📊 RUTAS DE DASHBOARD Y ESTADÍSTICAS
// =====================================================

// GET /api/viajes/dashboard/data - Dashboard principal
router.get("/dashboard/data", ViajesController.getDashboardData);

// GET /api/viajes/stats/quick - Estadísticas rápidas
router.get("/stats/quick", ViajesController.getQuickStats);

// GET /api/viajes/stats/period - Estadísticas por período
router.get("/stats/period", ViajesController.getTripStats);

// GET /api/viajes/search/advanced - Búsqueda avanzada
router.get("/search/advanced", ViajesController.searchViajes);

// =====================================================
// 📦 RUTAS DE ANÁLISIS DE CARGAS (TODAS LAS VARIANTES)
// =====================================================

// GET /api/viajes/cargo/distribution - Distribución de cargas
router.get("/cargo/distribution", ViajesController.getCargaDistribution);

// GET /api/viajes/cargo/types - Tipos de cargas únicas
router.get("/cargo/types", ViajesController.getTiposDeCargas);

// GET /api/viajes/cargo/stats - Estadísticas de cargas
router.get("/cargo/stats", ViajesController.getCargaStats);

// GET /api/viajes/cargo/subcategories - Top subcategorías
router.get("/cargo/subcategories", ViajesController.getTopSubcategorias);

// GET /api/viajes/cargo/category/:categoria - Detalles por categoría
router.get("/cargo/category/:categoria", ViajesController.getCargaDetailsByCategory);

// =====================================================
// 📅 RUTAS DE ORGANIZACIÓN TEMPORAL
// =====================================================

// GET /api/viajes/schedule/days - Viajes organizados por días
router.get("/schedule/days", ViajesController.getViajesPorDias);

// GET /api/viajes/completed/list - Viajes completados
router.get("/completed/list", ViajesController.getCompletedTrips);

// GET /api/viajes/completed - Alias para viajes completados
router.get("/completed", ViajesController.getCompletedTrips);

// =====================================================
// 👥 RUTAS POR RECURSOS ESPECÍFICOS (CON PARÁMETROS)
// =====================================================

// GET /api/viajes/conductor/:conductorId - Viajes por conductor
router.get("/conductor/:conductorId", ViajesController.getViajesByConductor);

// GET /api/viajes/truck/:truckId - Viajes por camión
router.get("/truck/:truckId", ViajesController.getViajesByTruck);

// =====================================================
// 🔧 RUTAS DE DEBUGGING (SOLO EN DESARROLLO)
// =====================================================

if (process.env.NODE_ENV === 'development') {
  // GET /api/viajes/debug/cargo - Debug de cargas
  router.get("/debug/cargo", ViajesController.debugCargas);
  
  // GET /api/viajes/debug/estados - Debug de estados
  router.get("/debug/estados", ViajesController.debugEstados);
}

// =====================================================
// 🆕 RUTAS POST/PUT/PATCH (DESPUÉS DE TODAS LAS GETS ESPECÍFICAS)
// =====================================================

// ✅ POST /api/viajes - CREAR NUEVO VIAJE
router.post("/", ViajesController.addViaje);

// =====================================================
// 🛠️ RUTAS DE ACTUALIZACIÓN CON PARÁMETROS
// =====================================================

// PATCH /api/viajes/:viajeId/location - Actualizar ubicación GPS
router.patch("/:viajeId/location", ViajesController.updateLocation);

// PATCH /api/viajes/:viajeId/progress - Actualizar progreso
router.patch("/:viajeId/progress", ViajesController.updateTripProgress);

// PATCH /api/viajes/:viajeId/complete - Completar viaje manualmente
router.patch("/:viajeId/complete", ViajesController.completeTrip);

// PATCH /api/viajes/:viajeId/cancel - Cancelar viaje
router.patch("/:viajeId/cancel", ViajesController.cancelTrip);

// PATCH /api/viajes/:viajeId/reactivate - Reactivar viaje cancelado
router.patch("/:viajeId/reactivate", ViajesController.reactivateTrip);

// =====================================================
// 📋 RUTAS CON PARÁMETROS INDIVIDUALES (AL FINAL)
// =====================================================

// GET /api/viajes/:viajeId/history - Historial del viaje
router.get("/:viajeId/history", ViajesController.getTripHistory);

// GET /api/viajes/:viajeId - Obtener detalles de un viaje específico
router.get("/:viajeId", ViajesController.getTripDetails);

// =====================================================
// 🌐 RUTA GENÉRICA FINAL (DEBE IR AL ÚLTIMO LUGAR)
// =====================================================

// GET /api/viajes - Obtener todos los viajes (ÚLTIMA RUTA GET)
router.get("/", ViajesController.getAllViajes);

// =====================================================
// 🔄 ALIAS PARA COMPATIBILIDAD (SI LOS NECESITAS)
// =====================================================

// Alias adicionales para rutas comunes
router.get("/carga-distribution", ViajesController.getCargaDistribution);
router.get("/tipos-cargas", ViajesController.getTiposDeCargas);
router.get("/carga-stats", ViajesController.getCargaStats);
router.get("/subcategorias", ViajesController.getTopSubcategorias);
router.get("/carga-details/:categoria", ViajesController.getCargaDetailsByCategory);
router.get("/tiempo-promedio", ViajesController.getTiempoPromedioViaje);
router.get("/capacidad-carga", ViajesController.getCapacidadCarga);
router.get("/por-dias", ViajesController.getViajesPorDias);
router.get("/trip-stats", ViajesController.getTripStats);

// =====================================================
// 🚨 MIDDLEWARE DE MANEJO DE ERRORES ESPECÍFICO
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
  
  // Error de validación de Mongoose
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
  
  // Error de ID inválido (CastError)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID de viaje inválido proporcionado',
      field: error.path,
      value: error.value
    });
  }

  // Error de viaje no encontrado
  if (error.message.includes('not found') || error.message.includes('no encontrado')) {
    return res.status(404).json({
      success: false,
      message: 'Viaje no encontrado'
    });
  }

  // Error de duplicado (código 11000)
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Ya existe un viaje con datos similares',
      field: Object.keys(error.keyPattern || {})[0] || 'unknown'
    });
  }
  
  // Error interno del servidor
  res.status(500).json({
    success: false,
    message: 'Error interno en el módulo de viajes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

// =====================================================
// 📊 MIDDLEWARE DE LOGGING (OPCIONAL)
// =====================================================
if (process.env.NODE_ENV === 'development') {
  router.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`📦 Body:`, req.body);
    }
    next();
  });
}

export default router;