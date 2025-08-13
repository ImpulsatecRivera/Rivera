import express from 'express';
import ViajesController from '../Controllers/Viajes.js';

const router = express.Router();

// =====================================================
// ROUTER BÁSICO FUNCIONAL
// =====================================================

// Verificar qué métodos existen realmente
console.log('\n🔍 VERIFICANDO MÉTODOS DISPONIBLES EN EL CONTROLADOR:');
const availableMethods = Object.keys(ViajesController).filter(key => 
  typeof ViajesController[key] === 'function'
);

console.log('✅ Métodos disponibles:', availableMethods);

// =====================================================
// RUTAS BÁSICAS CON VERIFICACIÓN
// =====================================================

// Solo registrar rutas para métodos que existen
if (ViajesController.getAllViajes) {
  router.get('/', ViajesController.getAllViajes);
  console.log('✅ Registrada: GET /');
}

if (ViajesController.getTripDetails) {
  router.get('/:viajeId', ViajesController.getTripDetails);
  console.log('✅ Registrada: GET /:viajeId');
}

if (ViajesController.updateLocation) {
  router.patch('/:viajeId/location', ViajesController.updateLocation);
  console.log('✅ Registrada: PATCH /:viajeId/location');
}

if (ViajesController.completeTrip) {
  router.patch('/:viajeId/complete', ViajesController.completeTrip);
  console.log('✅ Registrada: PATCH /:viajeId/complete');
}

// =====================================================
// MÉTODOS HÍBRIDOS SI EXISTEN
// =====================================================

if (ViajesController.getMapData) {
  router.get('/map-data', ViajesController.getMapData);
  console.log('✅ Registrada: GET /map-data (híbrida)');
} else {
  // Crear endpoint temporal con datos mock
  router.get('/map-data', (req, res) => {
    console.log('⚠️ getMapData no existe, devolviendo datos mock');
    res.json({
      success: true,
      data: {
        locations: [],
        routes: [],
        cities: [
          { name: "San Salvador", coords: [13.6929, -89.2182] },
          { name: "Santa Ana", coords: [13.9942, -89.5592] },
          { name: "San Miguel", coords: [13.4833, -88.1833] }
        ],
        statistics: {
          total_routes: 0,
          active_routes: 0,
          completed_routes: 0,
          pending_routes: 0
        },
        lastUpdate: new Date().toISOString(),
        dataSource: "mock_data"
      },
      message: "Datos mock - método getMapData no implementado"
    });
  });
  console.log('⚠️ Registrada: GET /map-data (MOCK)');
}

if (ViajesController.getViajesPorDias) {
  router.get('/por-dias', ViajesController.getViajesPorDias);
  console.log('✅ Registrada: GET /por-dias (híbrida)');
} else {
  router.get('/por-dias', (req, res) => {
    console.log('⚠️ getViajesPorDias no existe, devolviendo datos mock');
    res.json({
      success: true,
      data: [],
      estadisticas: {
        totalDias: 0,
        totalRegistros: 0,
        registrosHoy: 0
      },
      message: "Método getViajesPorDias no implementado"
    });
  });
  console.log('⚠️ Registrada: GET /por-dias (MOCK)');
}

// =====================================================
// MÉTODOS FALTANTES CON RESPUESTAS MOCK
// =====================================================

// Estadísticas
if (!ViajesController.getTripStats) {
  router.get('/estadisticas', (req, res) => {
    res.json({
      success: true,
      data: [],
      message: "Método getTripStats no implementado - usar controlador híbrido"
    });
  });
  console.log('⚠️ Registrada: GET /estadisticas (MOCK)');
}

// Viajes completados
if (!ViajesController.getCompletedTrips) {
  router.get('/completados', (req, res) => {
    res.json({
      success: true,
      data: [],
      total: 0,
      message: "Método getCompletedTrips no implementado - usar controlador híbrido"
    });
  });
  console.log('⚠️ Registrada: GET /completados (MOCK)');
}

// Cargas frecuentes
if (!ViajesController.getCargaStats) {
  router.get('/cargas/frecuentes', (req, res) => {
    res.json({
      success: true,
      data: [],
      message: "Método getCargaStats no implementado - usar controlador híbrido"
    });
  });
  console.log('⚠️ Registrada: GET /cargas/frecuentes (MOCK)');
}

// Distribución de cargas
if (!ViajesController.getCargaDistribution) {
  router.get('/cargas/distribucion', (req, res) => {
    res.json({
      success: true,
      data: [],
      estadisticas: {
        totalTiposUnicos: 0,
        totalRegistros: 0
      },
      message: "Método getCargaDistribution no implementado - usar controlador híbrido"
    });
  });
  console.log('⚠️ Registrada: GET /cargas/distribucion (MOCK)');
}

// Métricas en tiempo real
if (!ViajesController.getRealTimeMetrics) {
  router.get('/metricas/tiempo-real', (req, res) => {
    res.json({
      success: true,
      data: {
        periodo: {
          fecha: new Date().toISOString().split('T')[0],
          total: 0,
          completados: 0,
          enCurso: 0,
          pendientes: 0
        },
        timestamp: new Date().toISOString()
      },
      message: "Método getRealTimeMetrics no implementado - usar controlador híbrido"
    });
  });
  console.log('⚠️ Registrada: GET /metricas/tiempo-real (MOCK)');
}

// Tipos de cargas
if (!ViajesController.getTiposDeCargas) {
  router.get('/tipos-cargas', (req, res) => {
    res.json({
      success: true,
      data: [],
      total: 0,
      message: "Método getTiposDeCargas no implementado - usar controlador híbrido"
    });
  });
  console.log('⚠️ Registrada: GET /tipos-cargas (MOCK)');
}

// =====================================================
// INSTRUCCIONES PARA IMPLEMENTAR
// =====================================================

console.log('\n📋 RESUMEN DEL ROUTER:');
console.log('✅ Router básico funcionando');
console.log('⚠️ Algunos endpoints devuelven datos mock');
console.log('💡 Para implementar funcionalidad completa:');
console.log('   1. Reemplaza tu controlador con la versión híbrida');
console.log('   2. O agrega los métodos faltantes uno por uno');
console.log('\n🔗 Métodos faltantes más importantes:');
console.log('   - getMapData (para el mapa principal)');
console.log('   - getViajesPorDias (para vista por días)');
console.log('   - getCargaDistribution (para análisis de cargas)');

// =====================================================
// RUTAS DE DESARROLLO Y DEBUG
// =====================================================

if (process.env.NODE_ENV === 'development') {
  // Ruta de debug para ver métodos disponibles
  router.get('/debug/methods', (req, res) => {
    const allProps = Object.getOwnPropertyNames(ViajesController);
    const methods = allProps.filter(prop => typeof ViajesController[prop] === 'function');
    const nonMethods = allProps.filter(prop => typeof ViajesController[prop] !== 'function');

    res.json({
      success: true,
      data: {
        availableMethods: methods,
        totalMethods: methods.length,
        nonFunctionProperties: nonMethods,
        controllerType: typeof ViajesController,
        isHybrid: methods.includes('getMapData') && methods.includes('getCargaDistribution')
      },
      message: "Información de debug del controlador"
    });
  });

  // Ruta para verificar la base de datos
  router.get('/debug/test-db', async (req, res) => {
    try {
      // Importar el modelo directamente
      const ViajesModel = (await import('../Models/Viajes.js')).default;
      const count = await ViajesModel.countDocuments();
      
      res.json({
        success: true,
        data: {
          viajesCount: count,
          modelAvailable: true,
          dbConnected: true
        },
        message: `Base de datos conectada - ${count} viajes encontrados`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: "Error conectando a la base de datos"
      });
    }
  });

  console.log('🐛 Rutas de debug disponibles:');
  console.log('   GET /api/viajes/debug/methods');
  console.log('   GET /api/viajes/debug/test-db');
}

export default router;