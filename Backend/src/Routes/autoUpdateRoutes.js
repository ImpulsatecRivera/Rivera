// 📁 Backend/src/routes/autoUpdateRoutes.js
// RUTAS ACTUALIZADAS CON CONFIGURACIÓN FLEXIBLE

import express from 'express';
import AutoUpdateController from '../Controllers/autoUpdateController.js';

const router = express.Router();

// ===== RUTAS DE CONTROL DEL SERVICIO =====

// 🚀 Iniciar servicio automático
router.post('/service/start', AutoUpdateController.startService);

// ⏹️ Detener servicio automático  
router.post('/service/stop', AutoUpdateController.stopService);

// 📊 Estado del servicio con estadísticas de configuración
router.get('/service/status', AutoUpdateController.getServiceStatus);

// 🔧 Forzar actualización manual
router.post('/service/force-update', AutoUpdateController.forceUpdate);

// ⚙️ Configurar intervalo de actualización
router.put('/service/interval', AutoUpdateController.setInterval);

// ===== RUTAS DE GESTIÓN DE VIAJES =====

// 📋 Obtener viajes activos con configuración detallada
router.get('/trips/active', AutoUpdateController.getActiveTrips);

// 🎯 Actualizar viaje específico con validación de configuración
router.put('/trips/:viajeId/update', AutoUpdateController.updateSpecificTrip);

// 🗺️ Obtener información de ruta de un viaje
router.get('/trips/:viajeId/route', AutoUpdateController.getTripRoute);

// 📍 Obtener historial de checkpoints con información de ruta
router.get('/trips/:viajeId/checkpoints', AutoUpdateController.getTripCheckpoints);

// 📈 Obtener resumen de progreso híbrido
router.get('/trips/:viajeId/progress-summary', AutoUpdateController.getProgressSummary);

// ===== NUEVAS RUTAS DE CONFIGURACIÓN FLEXIBLE =====

// ⚙️ Configurar comportamiento de un viaje específico
router.put('/trips/:viajeId/configure', AutoUpdateController.configureTrip);

// 📋 Obtener configuración actual de un viaje
router.get('/trips/:viajeId/configuration', AutoUpdateController.getTripConfiguration);

// 🔄 Resetear configuración a valores por defecto
router.post('/trips/:viajeId/reset-configuration', AutoUpdateController.resetTripConfiguration);

// 📊 Obtener historial de overrides manuales
router.get('/trips/:viajeId/overrides', AutoUpdateController.getTripOverrides);

// ===== NUEVAS RUTAS DE CONTROL MANUAL =====

// ⏸️ Pausar viaje manualmente
router.post('/trips/:viajeId/pause', AutoUpdateController.pauseTrip);

// ▶️ Reanudar viaje pausado
router.post('/trips/:viajeId/resume', AutoUpdateController.resumeTrip);

// ===== RUTAS DE CONFIGURACIÓN MASIVA =====

// 🔧 Configurar múltiples viajes a la vez
router.put('/trips/bulk-configure', async (req, res) => {
  try {
    const { viajeIds, configuracion } = req.body;
    
    if (!Array.isArray(viajeIds) || viajeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de IDs de viajes'
      });
    }
    
    const resultados = [];
    
    for (const viajeId of viajeIds) {
      try {
        // Reutilizar la lógica del controller individual
        req.params = { viajeId };
        req.body = configuracion;
        
        // Simular respuesta para capturar resultado
        const mockRes = {
          status: (code) => ({
            json: (data) => ({ statusCode: code, data })
          })
        };
        
        const resultado = await AutoUpdateController.configureTrip(req, mockRes);
        resultados.push({
          viajeId,
          success: resultado.statusCode === 200,
          data: resultado.data
        });
        
      } catch (error) {
        resultados.push({
          viajeId,
          success: false,
          error: error.message
        });
      }
    }
    
    const exitosos = resultados.filter(r => r.success).length;
    const fallidos = resultados.filter(r => !r.success).length;
    
    res.status(200).json({
      success: true,
      message: `Configuración masiva completada: ${exitosos} exitosos, ${fallidos} fallidos`,
      data: {
        total: viajeIds.length,
        exitosos,
        fallidos,
        resultados
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en configuración masiva',
      error: error.message
    });
  }
});

// 📊 Obtener estadísticas de configuración global
router.get('/configuration/statistics', async (req, res) => {
  try {
    const ViajesModel = (await import('../Models/Viajes.js')).default;
    
    const stats = await ViajesModel.getEstadisticasConfiguracion();
    
    // Estadísticas adicionales por estado
    const statsPorEstado = await ViajesModel.aggregate([
      {
        $group: {
          _id: '$estado.actual',
          count: { $sum: 1 },
          conAutoInicio: {
            $sum: { $cond: [{ $ne: ['$configuracion.autoInicio', false] }, 1, 0] }
          },
          conAutoCompletado: {
            $sum: { $cond: [{ $ne: ['$configuracion.autoCompletado', false] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        global: stats,
        porEstado: statsPorEstado,
        timestamp: new Date().toISOString()
      },
      message: 'Estadísticas de configuración obtenidas exitosamente'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
});

// ===== RUTAS DE TESTING Y DEBUGGING =====

// 🧪 Crear viaje de prueba con configuración específica
router.post('/testing/create-test-trip', async (req, res) => {
  try {
    const ViajesModel = (await import('../Models/Viajes.js')).default;
    const { 
      configuracion, 
      descripcion = 'Viaje de prueba',
      minutosHastaSalida = 5,
      duracionMinutos = 30 
    } = req.body;
    
    const now = new Date();
    const salida = new Date(now.getTime() + minutosHastaSalida * 60000);
    const llegada = new Date(salida.getTime() + duracionMinutos * 60000);
    
    const viajeTest = new ViajesModel({
      tripDescription: descripcion,
      departureTime: salida,
      arrivalTime: llegada,
      configuracion: {
        autoInicio: true,
        autoCompletado: true,
        estrategiaProgreso: 'hibrido',
        ...configuracion
      },
      flags: {
        esPrueba: true
      },
      creadoPor: 'testing'
    });
    
    await viajeTest.save();
    
    res.status(201).json({
      success: true,
      message: 'Viaje de prueba creado exitosamente',
      data: {
        viajeId: viajeTest._id,
        descripcion: viajeTest.tripDescription,
        configuracion: viajeTest.configuracion,
        salida: viajeTest.departureTime,
        llegada: viajeTest.arrivalTime
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creando viaje de prueba',
      error: error.message
    });
  }
});

// 🧹 Limpiar viajes de prueba
router.delete('/testing/cleanup', async (req, res) => {
  try {
    const ViajesModel = (await import('../Models/Viajes.js')).default;
    
    const resultado = await ViajesModel.deleteMany({
      'flags.esPrueba': true
    });
    
    res.status(200).json({
      success: true,
      message: `${resultado.deletedCount} viajes de prueba eliminados`,
      data: {
        eliminados: resultado.deletedCount
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error limpiando viajes de prueba',
      error: error.message
    });
  }
});

// 🔍 Validar configuración sin aplicar
router.post('/configuration/validate', async (req, res) => {
  try {
    const { configuracion } = req.body;
    
    const errores = [];
    const advertencias = [];
    
    // Validaciones básicas
    if (configuracion.requiereConfirmacionManual && !configuracion.autoInicio) {
      errores.push('No se puede requerir confirmación manual si auto-inicio está deshabilitado');
    }
    
    if (configuracion.estrategiaProgreso && 
        !['automatico', 'manual', 'hibrido'].includes(configuracion.estrategiaProgreso)) {
      errores.push('Estrategia de progreso debe ser: automatico, manual o hibrido');
    }
    
    // Advertencias
    if (configuracion.estrategiaProgreso === 'manual' && configuracion.autoInicio) {
      advertencias.push('Estrategia manual con auto-inicio puede causar inconsistencias');
    }
    
    if (configuracion.ignoreDelayDetection) {
      advertencias.push('Ignorar detección de retrasos puede afectar la calidad del tracking');
    }
    
    const esValida = errores.length === 0;
    
    res.status(200).json({
      success: true,
      data: {
        esValida,
        errores,
        advertencias,
        configuracion
      },
      message: esValida ? 'Configuración válida' : 'Configuración tiene errores'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error validando configuración',
      error: error.message
    });
  }
});

export default router;