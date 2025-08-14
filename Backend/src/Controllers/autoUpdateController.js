// 📁 Backend/src/Controllers/AutoUpdateController.js
// CONTROLLER MEJORADO CON INTEGRACIÓN DE COTIZACIONES Y RUTAS

import autoUpdateService from '../services/autoUpdateService.js';
import ViajesModel from '../Models/Viajes.js';
import CotizacionesModel from '../Models/CotizacionesModel.js';

const AutoUpdateController = {};

// 🚀 Iniciar servicio de actualización automática
AutoUpdateController.startService = async (req, res) => {
  try {
    autoUpdateService.start();
    
    res.status(200).json({
      success: true,
      message: 'Servicio de actualización automática iniciado con integración de rutas',
      status: autoUpdateService.getStats(),
      features: [
        'Auto-inicio a la hora programada',
        'Progreso híbrido (tiempo + checkpoints + ruta)',
        'Integración con cotizaciones y rutas',
        'Checkpoints con información geográfica',
        'Auto-completar inteligente basado en destino'
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

// 📊 Obtener estado del servicio CON INFORMACIÓN DE RUTAS
AutoUpdateController.getServiceStatus = async (req, res) => {
  try {
    const stats = autoUpdateService.getStats();
    const activeTrips = await autoUpdateService.getActiveTripsStatus();
    
    // 📈 Estadísticas adicionales de rutas
    const rutaStats = {
      viajesConRuta: activeTrips.filter(t => t.rutaInfo).length,
      viajesSinRuta: activeTrips.filter(t => !t.rutaInfo).length,
      totalPuntosRuta: activeTrips.reduce((sum, t) => sum + (t.rutaInfo?.totalPuntos || 0), 0),
      distanciaTotal: activeTrips.reduce((sum, t) => sum + (t.rutaInfo?.distanciaTotal || 0), 0)
    };
    
    res.status(200).json({
      success: true,
      data: {
        service: stats,
        activeTrips: activeTrips,
        totalActiveTrips: activeTrips.length,
        rutaStatistics: rutaStats,
        systemType: 'hybrid_progress_with_routes',
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
      message: 'Actualización manual ejecutada con sistema híbrido y rutas',
      data: {
        updatedAt: new Date().toISOString(),
        activeTrips: activeTrips,
        processedCount: activeTrips.length,
        rutasProcessed: activeTrips.filter(t => t.rutaInfo).length
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

// 📋 Obtener viajes activos con progreso híbrido Y RUTAS
AutoUpdateController.getActiveTrips = async (req, res) => {
  try {
    console.log('🔄 Obteniendo viajes activos con sistema híbrido y rutas...');
    
    const activeTrips = await autoUpdateService.getActiveTripsStatus();
    
    // 📊 Enriquecer datos con información detallada de checkpoints y rutas
    const enrichedTrips = await Promise.all(
      activeTrips.map(async (trip) => {
        try {
          const viaje = await ViajesModel.findById(trip.id)
            .populate({
              path: 'cotizacionId',
              select: 'ruta origen destino distanciaKm tiempoEstimado detalles',
              populate: {
                path: 'ruta',
                select: 'puntos coordenadas descripcion distancia orden nombre'
              }
            })
            .select('tracking.checkpoints tracking.progreso tracking.puntoActualRuta estado')
            .lean();
          
          if (viaje) {
            const ultimoCheckpoint = viaje.tracking?.checkpoints?.length > 0 
              ? viaje.tracking.checkpoints[viaje.tracking.checkpoints.length - 1]
              : null;
            
            // 🗺️ Información detallada de la ruta
            const rutaDetallada = viaje.cotizacionId?.ruta ? {
              id: viaje.cotizacionId._id,
              puntos: Array.isArray(viaje.cotizacionId.ruta) 
                ? viaje.cotizacionId.ruta 
                : viaje.cotizacionId.ruta.puntos || [],
              origen: viaje.cotizacionId.origen,
              destino: viaje.cotizacionId.destino,
              distanciaTotal: viaje.cotizacionId.distanciaKm,
              tiempoEstimado: viaje.cotizacionId.tiempoEstimado,
              puntoActualEstimado: viaje.tracking?.puntoActualRuta
            } : null;
            
            return {
              ...trip,
              lastCheckpoint: ultimoCheckpoint ? {
                tipo: ultimoCheckpoint.tipo,
                descripcion: ultimoCheckpoint.descripcion,
                timestamp: ultimoCheckpoint.timestamp,
                progreso: ultimoCheckpoint.progreso,
                rutaInfo: ultimoCheckpoint.rutaInfo // 🆕 Info de ruta en checkpoint
              } : null,
              totalCheckpoints: viaje.tracking?.checkpoints?.length || 0,
              progressMethod: ultimoCheckpoint && 
                autoUpdateService.isCheckpointRecent(ultimoCheckpoint, new Date()) 
                ? 'checkpoint' 
                : 'time_based',
              rutaDetallada: rutaDetallada, // 🆕 Información completa de ruta
              puntoActualRuta: viaje.tracking?.puntoActualRuta // 🆕 Punto actual en la ruta
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
        type: 'hybrid_progress_with_routes',
        features: [
          'auto_start', 
          'time_calculation', 
          'manual_checkpoints', 
          'auto_complete',
          'route_integration',
          'distance_based_progress',
          'route_point_tracking'
        ]
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo viajes activos con rutas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo viajes activos',
      error: error.message
    });
  }
};

// 🎯 Actualizar un viaje específico manualmente CON INFORMACIÓN DE RUTA
AutoUpdateController.updateSpecificTrip = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { action, progress, descripcion, puntoRuta } = req.body; 
    
    console.log(`🎯 Actualizando viaje ${viajeId} - Acción: ${action}`);
    
    const viaje = await ViajesModel.findById(viajeId)
      .populate({
        path: 'cotizacionId',
        select: 'ruta origen destino distanciaKm',
        populate: {
          path: 'ruta',
          select: 'puntos coordenadas descripcion orden'
        }
      });
    
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }
    
    const now = new Date();
    let updated = false;
    let checkpointAgregado = null;
    
    // 🗺️ Obtener información de ruta
    const rutaInfo = autoUpdateService.getRutaInfo(viaje);
    
    switch (action) {
      case 'start':
        if (viaje.estado.actual === 'programado' || viaje.estado.actual === 'pendiente') {
          viaje.estado.actual = 'en_curso';
          viaje.estado.fechaCambio = now;
          viaje.horarios.salidaReal = now;
          
          // Agregar checkpoint manual de inicio con info de ruta
          checkpointAgregado = autoUpdateService.addCheckpointConRuta(
            viaje, 
            'inicio_manual', 
            10, 
            descripcion || 'Viaje iniciado manualmente',
            now,
            rutaInfo
          );
          
          updated = true;
          console.log(`🚀 Viaje ${viajeId} iniciado manualmente${rutaInfo ? ' con ruta' : ''}`);
        }
        break;
        
      case 'complete':
        if (viaje.estado.actual === 'en_curso' || viaje.estado.actual === 'retrasado') {
          viaje.estado.actual = 'completado';
          viaje.estado.fechaCambio = now;
          viaje.horarios.llegadaReal = now;
          
          // Agregar checkpoint manual de finalización con info de destino
          checkpointAgregado = autoUpdateService.addCheckpointConRuta(
            viaje,
            'finalizacion_manual',
            100,
            descripcion || 'Viaje completado manualmente',
            now,
            rutaInfo
          );
          
          updated = true;
          console.log(`✅ Viaje ${viajeId} completado manualmente${rutaInfo ? ' en destino' : ''}`);
        }
        break;
        
      case 'progress':
        if (progress !== undefined && 
            (viaje.estado.actual === 'en_curso' || viaje.estado.actual === 'retrasado')) {
          
          const nuevoProgreso = Math.max(0, Math.min(100, progress));
          
          // 🆕 Si se especifica un punto de ruta, actualizar también
          if (puntoRuta !== undefined && rutaInfo) {
            const puntoValido = Math.max(0, Math.min(rutaInfo.totalPuntos - 1, puntoRuta));
            viaje.tracking.puntoActualRuta = {
              indice: puntoValido,
              punto: rutaInfo.puntos[puntoValido],
              progresoPunto: nuevoProgreso,
              timestamp: now
            };
          }
          
          // Agregar checkpoint manual de progreso con info de ruta
          checkpointAgregado = autoUpdateService.addCheckpointConRuta(
            viaje,
            'progreso_manual',
            nuevoProgreso,
            descripcion || `Progreso actualizado manualmente a ${nuevoProgreso}%${puntoRuta !== undefined ? ` (punto ${puntoRuta})` : ''}`,
            now,
            rutaInfo
          );
          
          // Si llega a 100%, completar automáticamente
          if (nuevoProgreso >= 100) {
            viaje.estado.actual = 'completado';
            viaje.estado.fechaCambio = now;
            viaje.horarios.llegadaReal = now;
          }
          
          updated = true;
          console.log(`📈 Progreso de viaje ${viajeId} actualizado a ${nuevoProgreso}%${puntoRuta !== undefined ? ` en punto ${puntoRuta}` : ''}`);
        }
        break;
        
      case 'checkpoint':
        // 📍 Agregar checkpoint personalizado con info de ruta
        const { tipo, progreso: checkpointProgress } = req.body;
        
        if (tipo && checkpointProgress !== undefined) {
          checkpointAgregado = autoUpdateService.addCheckpointConRuta(
            viaje,
            tipo,
            checkpointProgress,
            descripcion || `Checkpoint ${tipo}`,
            now,
            rutaInfo
          );
          
          updated = true;
          console.log(`📍 Checkpoint personalizado agregado: ${tipo} - ${checkpointProgress}%`);
        }
        break;

      case 'route_point':
        // 🆕 NUEVA ACCIÓN: Actualizar punto específico en la ruta
        if (puntoRuta !== undefined && rutaInfo && 
            (viaje.estado.actual === 'en_curso' || viaje.estado.actual === 'retrasado')) {
          
          const puntoValido = Math.max(0, Math.min(rutaInfo.totalPuntos - 1, puntoRuta));
          const progresoCalculado = Math.round((puntoValido / (rutaInfo.totalPuntos - 1)) * 100);
          
          viaje.tracking.puntoActualRuta = {
            indice: puntoValido,
            punto: rutaInfo.puntos[puntoValido],
            progresoPunto: progresoCalculado,
            timestamp: now
          };
          
          checkpointAgregado = autoUpdateService.addCheckpointConRuta(
            viaje,
            'punto_ruta_manual',
            progresoCalculado,
            descripcion || `Llegada a punto ${puntoValido}: ${rutaInfo.puntos[puntoValido]?.descripcion || 'Punto de ruta'}`,
            now,
            rutaInfo
          );
          
          updated = true;
          console.log(`🗺️ Punto de ruta actualizado: ${puntoValido}/${rutaInfo.totalPuntos - 1}`);
        }
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Acción no válida. Use: start, progress, complete, checkpoint, route_point'
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
      const progresoRecalculado = autoUpdateService.calculateHybridProgressConRuta(viaje, now, rutaInfo);
      
      res.status(200).json({
        success: true,
        message: `Viaje ${action === 'progress' ? 'actualizado' : 
                 action === 'start' ? 'iniciado' : 
                 action === 'complete' ? 'completado' : 
                 action === 'route_point' ? 'punto de ruta actualizado' : 'modificado'} manualmente`,
        data: {
          id: viaje._id,
          status: viaje.estado.actual,
          progress: progresoRecalculado,
          lastUpdate: now,
          checkpointAdded: checkpointAgregado,
          totalCheckpoints: viaje.tracking?.checkpoints?.length || 0,
          progressMethod: 'manual_update',
          // 🆕 Información de ruta actualizada
          rutaInfo: rutaInfo ? {
            totalPuntos: rutaInfo.totalPuntos,
            puntoActual: viaje.tracking?.puntoActualRuta?.indice || 0,
            distanciaTotal: rutaInfo.distanciaTotal
          } : null,
          puntoActualRuta: viaje.tracking?.puntoActualRuta
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el viaje. Verifique el estado actual y los parámetros.',
        currentState: viaje.estado.actual,
        rutaInfo: rutaInfo ? {
          disponible: true,
          totalPuntos: rutaInfo.totalPuntos
        } : { disponible: false }
      });
    }
    
  } catch (error) {
    console.error('❌ Error actualizando viaje específico con ruta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar viaje',
      error: error.message
    });
  }
};

// 🆕 Obtener información detallada de ruta de un viaje
AutoUpdateController.getTripRoute = async (req, res) => {
  try {
    const { viajeId } = req.params;
    
    const viaje = await ViajesModel.findById(viajeId)
      .populate({
        path: 'cotizacionId',
        select: 'ruta origen destino distanciaKm tiempoEstimado detalles',
        populate: {
          path: 'ruta',
          select: 'puntos coordenadas descripcion distancia orden nombre'
        }
      })
      .select('tracking.puntoActualRuta tracking.progreso estado tripDescription')
      .lean();
    
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }
    
    const rutaInfo = autoUpdateService.getRutaInfo(viaje);
    
    if (!rutaInfo) {
      return res.status(404).json({
        success: false,
        message: 'Este viaje no tiene información de ruta asociada',
        data: {
          viajeId: viajeId,
          cotizacionId: viaje.cotizacionId?._id || null
        }
      });
    }
    
    // 🗺️ Preparar información detallada de la ruta
    const rutaDetallada = {
      viajeId: viajeId,
      cotizacionId: viaje.cotizacionId._id,
      origen: rutaInfo.origen,
      destino: rutaInfo.destino,
      distanciaTotal: rutaInfo.distanciaTotal,
      tiempoEstimado: rutaInfo.tiempoEstimado,
      totalPuntos: rutaInfo.totalPuntos,
      puntos: rutaInfo.puntos.map((punto, index) => ({
        indice: index,
        ...punto,
        esActual: viaje.tracking?.puntoActualRuta?.indice === index,
        esCompleto: viaje.tracking?.puntoActualRuta?.indice > index
      })),
      puntoActual: viaje.tracking?.puntoActualRuta || null,
      progresoActual: viaje.tracking?.progreso?.porcentaje || 0,
      estadoViaje: viaje.estado
    };
    
    res.status(200).json({
      success: true,
      data: rutaDetallada,
      message: 'Información de ruta obtenida exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo ruta del viaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de ruta',
      error: error.message
    });
  }
};

// 🆕 NUEVO: Obtener historial de checkpoints de un viaje CON RUTAS
AutoUpdateController.getTripCheckpoints = async (req, res) => {
  try {
    const { viajeId } = req.params;
    
    const viaje = await ViajesModel.findById(viajeId)
      .populate({
        path: 'cotizacionId',
        select: 'ruta origen destino',
        populate: {
          path: 'ruta',
          select: 'puntos descripcion orden'
        }
      })
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
    const rutaInfo = autoUpdateService.getRutaInfo(viaje);
    
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

    const checkpointsConRuta = checkpoints.filter(cp => cp.rutaInfo).length;
    
    res.status(200).json({
      success: true,
      data: {
        viajeId: viajeId,
        descripcion: viaje.tripDescription,
        estadoActual: viaje.estado,
        progresoActual: progresoActual,
        checkpoints: checkpoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        ultimoCheckpoint: ultimoCheckpoint,
        rutaInfo: rutaInfo,
        estadisticas: {
          totalCheckpoints: checkpoints.length,
          checkpointsManuales: checkpointsManuales,
          checkpointsAutomaticos: checkpointsAutomaticos,
          checkpointsConRuta: checkpointsConRuta,
          progresoMinimo: checkpoints.length > 0 ? Math.min(...checkpoints.map(cp => cp.progreso)) : 0,
          progresoMaximo: checkpoints.length > 0 ? Math.max(...checkpoints.map(cp => cp.progreso)) : 0
        }
      },
      message: 'Historial de checkpoints con rutas obtenido exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo checkpoints con rutas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de checkpoints',
      error: error.message
    });
  }
};

// 🆕 NUEVO: Obtener resumen de progreso híbrido CON RUTAS
AutoUpdateController.getProgressSummary = async (req, res) => {
  try {
    const { viajeId } = req.params;
    
    const viaje = await ViajesModel.findById(viajeId)
      .populate({
        path: 'cotizacionId',
        select: 'ruta origen destino distanciaKm tiempoEstimado',
        populate: {
          path: 'ruta',
          select: 'puntos descripcion orden'
        }
      });
    
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }
    
    const rutaInfo = autoUpdateService.getRutaInfo(viaje);
    const now = new Date();
    
    // Usar métodos del servicio para obtener resumen completo
    const resumen = {
      viajeId: viajeId,
      estadoActual: viaje.estado.actual,
      progresoActual: viaje.tracking?.progreso?.porcentaje || 0,
      progresoTiempo: autoUpdateService.calculateTimeBasedProgress(viaje, now),
      progresoDistancia: rutaInfo ? autoUpdateService.calculateDistanceBasedProgress(viaje, now, rutaInfo) : null,
      ultimoCheckpoint: autoUpdateService.getLastValidCheckpoint(viaje),
      metodoCalculo: autoUpdateService.getLastValidCheckpoint(viaje) &&
        autoUpdateService.isCheckpointRecent(autoUpdateService.getLastValidCheckpoint(viaje), now)
        ? 'checkpoint'
        : rutaInfo ? 'hibrido_ruta' : 'tiempo',
      tiempoTranscurrido: Math.round((now - new Date(viaje.departureTime)) / (1000 * 60)), // minutos
      tiempoRestante: Math.round((new Date(viaje.arrivalTime) - now) / (1000 * 60)), // minutos
      totalCheckpoints: viaje.tracking?.checkpoints?.length || 0,
      // 🆕 Información específica de ruta
      rutaInfo: rutaInfo ? {
        totalPuntos: rutaInfo.totalPuntos,
        puntoActual: viaje.tracking?.puntoActualRuta?.indice || 0,
        puntosRestantes: rutaInfo.totalPuntos - (viaje.tracking?.puntoActualRuta?.indice || 0) - 1,
        distanciaTotal: rutaInfo.distanciaTotal,
        origen: rutaInfo.origen,
        destino: rutaInfo.destino,
        progresoRuta: rutaInfo.totalPuntos > 0 ? 
          Math.round(((viaje.tracking?.puntoActualRuta?.indice || 0) / (rutaInfo.totalPuntos - 1)) * 100) : 0
      } : null
    };
    
    res.status(200).json({
      success: true,
      data: resumen,
      message: 'Resumen de progreso híbrido con rutas obtenido exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo resumen de progreso con rutas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de progreso',
      error: error.message
    });
  }
};

export default AutoUpdateController;