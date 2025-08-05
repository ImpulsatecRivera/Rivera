// 📁 Backend/src/Controllers/AutoUpdateController.js
// CONTROLLER ACTUALIZADO PARA SISTEMA HÍBRIDO

import autoUpdateService from '../services/autoUpdateService.js';
import ViajesModel from '../Models/Viajes.js';

const AutoUpdateController = {};

// 🚀 Iniciar servicio de actualización automática
AutoUpdateController.startService = async (req, res) => {
  try {
    autoUpdateService.start();
    
    res.status(200).json({
      success: true,
      message: 'Servicio de actualización automática iniciado con sistema híbrido',
      status: autoUpdateService.getStats(),
      features: [
        'Auto-inicio a la hora programada',
        'Progreso híbrido (tiempo + checkpoints)',
        'Checkpoints manuales disponibles',
        'Auto-completar inteligente'
      ]
    });
    
  } catch (error) {
    console.error('❌ Error iniciando servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error iniciando servicio de actualización',
      error: error.message
    });
  }
};

// ⏹️ Detener servicio
AutoUpdateController.stopService = async (req, res) => {
  try {
    autoUpdateService.stop();
    
    res.status(200).json({
      success: true,
      message: 'Servicio de actualización automática detenido',
      status: autoUpdateService.getStats()
    });
    
  } catch (error) {
    console.error('❌ Error deteniendo servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error deteniendo servicio',
      error: error.message
    });
  }
};

// 📊 Obtener estado del servicio
AutoUpdateController.getServiceStatus = async (req, res) => {
  try {
    const stats = autoUpdateService.getStats();
    const activeTrips = await autoUpdateService.getActiveTripsStatus();
    
    res.status(200).json({
      success: true,
      data: {
        service: stats,
        activeTrips: activeTrips,
        totalActiveTrips: activeTrips.length,
        systemType: 'hybrid_progress',
        lastUpdate: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado del servicio',
      error: error.message
    });
  }
};

// 🔧 Forzar actualización manual
AutoUpdateController.forceUpdate = async (req, res) => {
  try {
    await autoUpdateService.forceUpdate();
    
    const activeTrips = await autoUpdateService.getActiveTripsStatus();
    
    res.status(200).json({
      success: true,
      message: 'Actualización manual ejecutada con sistema híbrido',
      data: {
        updatedAt: new Date().toISOString(),
        activeTrips: activeTrips,
        processedCount: activeTrips.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error en actualización manual:', error);
    res.status(500).json({
      success: false,
      message: 'Error en actualización manual',
      error: error.message
    });
  }
};

// ⚙️ Configurar intervalo de actualización
AutoUpdateController.setInterval = async (req, res) => {
  try {
    const { seconds } = req.body;
    
    if (!seconds || seconds < 10) {
      return res.status(400).json({
        success: false,
        message: 'El intervalo debe ser mínimo 10 segundos'
      });
    }
    
    autoUpdateService.setUpdateInterval(seconds * 1000);
    
    res.status(200).json({
      success: true,
      message: `Intervalo de actualización configurado a ${seconds} segundos`,
      status: autoUpdateService.getStats()
    });
    
  } catch (error) {
    console.error('❌ Error configurando intervalo:', error);
    res.status(500).json({
      success: false,
      message: 'Error configurando intervalo',
      error: error.message
    });
  }
};

// 📋 Obtener viajes activos con progreso híbrido
AutoUpdateController.getActiveTrips = async (req, res) => {
  try {
    console.log('🔄 Obteniendo viajes activos con sistema híbrido...');
    
    const activeTrips = await autoUpdateService.getActiveTripsStatus();
    
    // 📊 Enriquecer datos con información de checkpoints
    const enrichedTrips = await Promise.all(
      activeTrips.map(async (trip) => {
        try {
          const viaje = await ViajesModel.findById(trip.id)
            .select('tracking.checkpoints tracking.progreso estado')
            .lean();
          
          if (viaje) {
            const ultimoCheckpoint = viaje.tracking?.checkpoints?.length > 0 
              ? viaje.tracking.checkpoints[viaje.tracking.checkpoints.length - 1]
              : null;
            
            return {
              ...trip,
              lastCheckpoint: ultimoCheckpoint ? {
                tipo: ultimoCheckpoint.tipo,
                descripcion: ultimoCheckpoint.descripcion,
                timestamp: ultimoCheckpoint.timestamp,
                progreso: ultimoCheckpoint.progreso
              } : null,
              totalCheckpoints: viaje.tracking?.checkpoints?.length || 0,
              progressMethod: ultimoCheckpoint && 
                autoUpdateService.isCheckpointRecent(ultimoCheckpoint, new Date()) 
                ? 'checkpoint' 
                : 'time_based'
            };
          }
          
          return trip;
        } catch (error) {
          console.error(`Error enriqueciendo viaje ${trip.id}:`, error);
          return trip;
        }
      })
    );
    
    res.status(200).json({
      success: true,
      data: enrichedTrips,
      count: enrichedTrips.length,
      timestamp: new Date().toISOString(),
      systemInfo: {
        type: 'hybrid_progress',
        features: ['auto_start', 'time_calculation', 'manual_checkpoints', 'auto_complete']
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo viajes activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo viajes activos',
      error: error.message
    });
  }
};

// 🎯 Actualizar un viaje específico manualmente (MEJORADO)
AutoUpdateController.updateSpecificTrip = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { action, progress, descripcion } = req.body; 
    
    console.log(`🎯 Actualizando viaje ${viajeId} - Acción: ${action}`);
    
    const viaje = await ViajesModel.findById(viajeId);
    
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }
    
    const now = new Date();
    let updated = false;
    let checkpointAgregado = null;
    
    switch (action) {
      case 'start':
        if (viaje.estado.actual === 'programado' || viaje.estado.actual === 'pendiente') {
          viaje.estado.actual = 'en_curso';
          viaje.estado.fechaCambio = now;
          viaje.horarios.salidaReal = now;
          
          // Agregar checkpoint manual de inicio
          checkpointAgregado = autoUpdateService.addCheckpoint(
            viaje, 
            'inicio_manual', 
            10, 
            descripcion || 'Viaje iniciado manualmente'
          );
          
          updated = true;
          console.log(`🚀 Viaje ${viajeId} iniciado manualmente`);
        }
        break;
        
      case 'complete':
        if (viaje.estado.actual === 'en_curso' || viaje.estado.actual === 'retrasado') {
          viaje.estado.actual = 'completado';
          viaje.estado.fechaCambio = now;
          viaje.horarios.llegadaReal = now;
          
          // Agregar checkpoint manual de finalización
          checkpointAgregado = autoUpdateService.addCheckpoint(
            viaje,
            'finalizacion_manual',
            100,
            descripcion || 'Viaje completado manualmente'
          );
          
          updated = true;
          console.log(`✅ Viaje ${viajeId} completado manualmente`);
        }
        break;
        
      case 'progress':
        if (progress !== undefined && 
            (viaje.estado.actual === 'en_curso' || viaje.estado.actual === 'retrasado')) {
          
          const nuevoProgreso = Math.max(0, Math.min(100, progress));
          
          // Agregar checkpoint manual de progreso
          checkpointAgregado = autoUpdateService.addCheckpoint(
            viaje,
            'progreso_manual',
            nuevoProgreso,
            descripcion || `Progreso actualizado manualmente a ${nuevoProgreso}%`
          );
          
          // Si llega a 100%, completar automáticamente
          if (nuevoProgreso >= 100) {
            viaje.estado.actual = 'completado';
            viaje.estado.fechaCambio = now;
            viaje.horarios.llegadaReal = now;
          }
          
          updated = true;
          console.log(`📈 Progreso de viaje ${viajeId} actualizado a ${nuevoProgreso}%`);
        }
        break;
        
      case 'checkpoint':
        // 📍 Nuevo: Agregar checkpoint personalizado
        const { tipo, progreso: checkpointProgress } = req.body;
        
        if (tipo && checkpointProgress !== undefined) {
          checkpointAgregado = autoUpdateService.addCheckpoint(
            viaje,
            tipo,
            checkpointProgress,
            descripcion || `Checkpoint ${tipo}`
          );
          
          updated = true;
          console.log(`📍 Checkpoint personalizado agregado: ${tipo} - ${checkpointProgress}%`);
        }
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Acción no válida. Use: start, progress, complete, checkpoint'
        });
    }
    
    if (updated) {
      // Agregar al historial de estado
      viaje.estado.historial.push({
        estadoAnterior: viaje.estado.actual,
        estadoNuevo: viaje.estado.actual,
        fecha: now,
        motivo: `manual_${action}`
      });
      
      await viaje.save();
      
      // 🔄 Recalcular progreso híbrido después de la actualización
      const progresoRecalculado = autoUpdateService.calculateHybridProgress(viaje, now);
      
      res.status(200).json({
        success: true,
        message: `Viaje ${action === 'progress' ? 'actualizado' : 
                 action === 'start' ? 'iniciado' : 
                 action === 'complete' ? 'completado' : 'modificado'} manualmente`,
        data: {
          id: viaje._id,
          status: viaje.estado.actual,
          progress: progresoRecalculado,
          lastUpdate: now,
          checkpointAdded: checkpointAgregado,
          totalCheckpoints: viaje.tracking?.checkpoints?.length || 0,
          progressMethod: 'manual_update'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el viaje. Verifique el estado actual y los parámetros.',
        currentState: viaje.estado.actual
      });
    }
    
  } catch (error) {
    console.error('❌ Error actualizando viaje específico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar viaje',
      error: error.message
    });
  }
};

// 🆕 NUEVO: Obtener historial de checkpoints de un viaje
AutoUpdateController.getTripCheckpoints = async (req, res) => {
  try {
    const { viajeId } = req.params;
    
    const viaje = await ViajesModel.findById(viajeId)
      .select('tracking.checkpoints tracking.progreso estado tripDescription')
      .lean();
    
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }
    
    const checkpoints = viaje.tracking?.checkpoints || [];
    const progresoActual = viaje.tracking?.progreso?.porcentaje || 0;
    
    // Calcular métricas
    const ultimoCheckpoint = checkpoints.length > 0 
      ? checkpoints[checkpoints.length - 1] 
      : null;
    
    const checkpointsManuales = checkpoints.filter(cp => 
      cp.reportadoPor === 'manual' || cp.tipo.includes('manual')
    ).length;
    
    const checkpointsAutomaticos = checkpoints.filter(cp => 
      cp.reportadoPor === 'automatico' || cp.tipo.includes('automatico')
    ).length;
    
    res.status(200).json({
      success: true,
      data: {
        viajeId: viajeId,
        descripcion: viaje.tripDescription,
        estadoActual: viaje.estado.actual,
        progresoActual: progresoActual,
        checkpoints: checkpoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        ultimoCheckpoint: ultimoCheckpoint,
        estadisticas: {
          totalCheckpoints: checkpoints.length,
          checkpointsManuales: checkpointsManuales,
          checkpointsAutomaticos: checkpointsAutomaticos,
          progresoMinimo: checkpoints.length > 0 ? Math.min(...checkpoints.map(cp => cp.progreso)) : 0,
          progresoMaximo: checkpoints.length > 0 ? Math.max(...checkpoints.map(cp => cp.progreso)) : 0
        }
      },
      message: 'Historial de checkpoints obtenido exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo checkpoints:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de checkpoints',
      error: error.message
    });
  }
};

// 🆕 NUEVO: Obtener resumen de progreso híbrido
AutoUpdateController.getProgressSummary = async (req, res) => {
  try {
    const { viajeId } = req.params;
    
    const viaje = await ViajesModel.findById(viajeId);
    
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }
    
    // Usar método del servicio para obtener resumen
    const resumen = {
      viajeId: viajeId,
      estadoActual: viaje.estado.actual,
      progresoActual: viaje.tracking?.progreso?.porcentaje || 0,
      progresoTiempo: autoUpdateService.calculateTimeBasedProgress(viaje, new Date()),
      ultimoCheckpoint: autoUpdateService.getLastValidCheckpoint(viaje),
      metodoCalculo: autoUpdateService.getLastValidCheckpoint(viaje) &&
        autoUpdateService.isCheckpointRecent(autoUpdateService.getLastValidCheckpoint(viaje), new Date())
        ? 'checkpoint'
        : 'tiempo',
      tiempoTranscurrido: Math.round((new Date() - new Date(viaje.departureTime)) / (1000 * 60)), // minutos
      tiempoRestante: Math.round((new Date(viaje.arrivalTime) - new Date()) / (1000 * 60)), // minutos
      totalCheckpoints: viaje.tracking?.checkpoints?.length || 0
    };
    
    res.status(200).json({
      success: true,
      data: resumen,
      message: 'Resumen de progreso híbrido obtenido exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo resumen de progreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de progreso',
      error: error.message
    });
  }
};

export default AutoUpdateController;