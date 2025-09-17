// 📁 Backend/src/Controllers/AutoUpdateController.js
// CONTROLLER MEJORADO CON CONFIGURACIÓN FLEXIBLE AUTOMÁTICO/MANUAL

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
      message: 'Servicio de actualización automática iniciado con configuración flexible',
      status: autoUpdateService.getStats(),
      features: [
        'Configuración flexible por viaje',
        'Auto-inicio configurable',
        'Estrategias de progreso seleccionables',
        'Pausar/Reanudar viajes',
        'Validación de operaciones manuales',
        'Precedencia manual sobre automático'
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

// 📊 Obtener estado del servicio CON CONFIGURACIONES
AutoUpdateController.getServiceStatus = async (req, res) => {
  try {
    const stats = autoUpdateService.getStats();
    const activeTrips = await autoUpdateService.getActiveTripsStatus();
    
    // 📈 Estadísticas de configuración
    const configStats = {
      viajesConAutoInicio: activeTrips.filter(t => t.metodosActivos.autoInicio).length,
      viajesSinAutoInicio: activeTrips.filter(t => !t.metodosActivos.autoInicio).length,
      viajesConAutoCompletado: activeTrips.filter(t => t.metodosActivos.autoCompletado).length,
      estrategias: {
        automatico: activeTrips.filter(t => t.metodosActivos.estrategiaProgreso === 'automatico').length,
        manual: activeTrips.filter(t => t.metodosActivos.estrategiaProgreso === 'manual').length,
        hibrido: activeTrips.filter(t => t.metodosActivos.estrategiaProgreso === 'hibrido').length
      },
      viajesPausados: activeTrips.filter(t => t.status === 'pausado').length
    };
    
    res.status(200).json({
      success: true,
      data: {
        service: stats,
        activeTrips: activeTrips,
        totalActiveTrips: activeTrips.length,
        configurationStatistics: configStats,
        systemType: 'flexible_configuration',
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
      message: 'Actualización manual ejecutada con sistema flexible',
      data: {
        updatedAt: new Date().toISOString(),
        activeTrips: activeTrips,
        processedCount: activeTrips.length,
        configuracionesProcessed: {
          automaticos: activeTrips.filter(t => t.metodosActivos.estrategiaProgreso === 'automatico').length,
          manuales: activeTrips.filter(t => t.metodosActivos.estrategiaProgreso === 'manual').length,
          hibridos: activeTrips.filter(t => t.metodosActivos.estrategiaProgreso === 'hibrido').length
        }
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

// 🆕 NUEVO: Configurar comportamiento de un viaje específico
AutoUpdateController.configureTrip = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { 
      autoInicio, 
      autoCompletado, 
      estrategiaProgreso,
      requiereConfirmacionManual,
      ignoreDelayDetection 
    } = req.body;
    
    const viaje = await ViajesModel.findById(viajeId);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }
    
    // Validar estrategia de progreso
    const estrategiasValidas = ['automatico', 'manual', 'hibrido'];
    if (estrategiaProgreso && !estrategiasValidas.includes(estrategiaProgreso)) {
      return res.status(400).json({
        success: false,
        message: 'Estrategia de progreso inválida. Use: automatico, manual, hibrido'
      });
    }
    
    // Inicializar configuración si no existe
    if (!viaje.configuracion) {
      viaje.configuracion = {};
    }
    
    // Actualizar configuración
    if (autoInicio !== undefined) viaje.configuracion.autoInicio = autoInicio;
    if (autoCompletado !== undefined) viaje.configuracion.autoCompletado = autoCompletado;
    if (estrategiaProgreso !== undefined) viaje.configuracion.estrategiaProgreso = estrategiaProgreso;
    if (requiereConfirmacionManual !== undefined) viaje.configuracion.requiereConfirmacionManual = requiereConfirmacionManual;
    if (ignoreDelayDetection !== undefined) viaje.configuracion.ignoreDelayDetection = ignoreDelayDetection;
    
    // Agregar timestamp de configuración
    viaje.configuracion.ultimaConfiguracion = new Date();
    viaje.configuracion.configuradoPor = 'usuario'; // Podrías agregar autenticación aquí
    
    await viaje.save();
    
    res.status(200).json({
      success: true,
      message: 'Configuración del viaje actualizada exitosamente',
      data: {
        viajeId: viajeId,
        configuracionAnterior: req.body, // Para comparar
        configuracionActual: viaje.configuracion,
        estadoViaje: viaje.estado.actual
      }
    });
    
  } catch (error) {
    console.error('❌ Error configurando viaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando configuración del viaje',
      error: error.message
    });
  }
};

// 🆕 NUEVO: Obtener configuración de un viaje
AutoUpdateController.getTripConfiguration = async (req, res) => {
  try {
    const { viajeId } = req.params;
    
    const viaje = await ViajesModel.findById(viajeId)
      .select('configuracion estado tripDescription departureTime arrivalTime')
      .lean();
    
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }
    
    // Configuración por defecto si no existe
    const configDefault = {
      autoInicio: true,
      autoCompletado: true,
      estrategiaProgreso: 'hibrido',
      requiereConfirmacionManual: false,
      ignoreDelayDetection: false
    };
    
    const configuracionActual = { ...configDefault, ...viaje.configuracion };
    
    res.status(200).json({
      success: true,
      data: {
        viajeId: viajeId,
        descripcion: viaje.tripDescription,
        estado: viaje.estado,
        configuracion: configuracionActual,
        configuracionPersonalizada: !!viaje.configuracion,
        horarios: {
          salida: viaje.departureTime,
          llegada: viaje.arrivalTime
        }
      },
      message: 'Configuración del viaje obtenida exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo configuración del viaje',
      error: error.message
    });
  }
};

// 📋 Obtener viajes activos con configuración detallada
AutoUpdateController.getActiveTrips = async (req, res) => {
  try {
    console.log('🔄 Obteniendo viajes activos con configuración flexible...');
    
    const activeTrips = await autoUpdateService.getActiveTripsStatus();
    
    // 📊 Enriquecer datos con información detallada
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
            .select('tracking.checkpoints tracking.progreso tracking.puntoActualRuta estado configuracion')
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
                rutaInfo: ultimoCheckpoint.rutaInfo
              } : null,
              totalCheckpoints: viaje.tracking?.checkpoints?.length || 0,
              progressMethod: viaje.tracking?.progreso?.metodoCalculo || 'hibrido',
              rutaDetallada: rutaDetallada,
              puntoActualRuta: viaje.tracking?.puntoActualRuta,
              // 🆕 Información de configuración detallada
              configuracionCompleta: viaje.configuracion || {},
              esConfigurable: {
                puedeIniciarManual: !trip.metodosActivos.autoInicio || trip.status === 'programado',
                puedeProgresarManual: trip.metodosActivos.estrategiaProgreso !== 'automatico',
                puedeCompletarManual: !trip.metodosActivos.autoCompletado || trip.status === 'en_curso',
                puedePausar: ['en_curso', 'retrasado'].includes(trip.status)
              }
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
        type: 'flexible_configuration_system',
        features: [
          'auto_start_configurable', 
          'progress_strategy_selection', 
          'manual_override', 
          'pause_resume',
          'auto_complete_configurable',
          'route_integration',
          'conflict_validation'
        ]
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

// 🎯 Actualizar un viaje específico manualmente CON VALIDACIÓN
AutoUpdateController.updateSpecificTrip = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { action, progress, descripcion, puntoRuta, confirmarOverride } = req.body; 
    
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
    
    // 🔍 VALIDAR OPERACIÓN MANUAL
    const validacion = autoUpdateService.validateManualOperation(viaje, action);
    
    if (!validacion.valid) {
      return res.status(400).json({
        success: false,
        message: validacion.error,
        data: {
          requiresConfirmation: validacion.requiresConfirmation,
          currentConfiguration: viaje.configuracion
        }
      });
    }
    
    // Si hay advertencias y no se confirmó el override
    if ((validacion.warning || validacion.takesPrecedence) && !confirmarOverride) {
      return res.status(409).json({
        success: false,
        message: validacion.warning,
        data: {
          requiresConfirmation: true,
          warning: validacion.warning,
          takesPrecedence: validacion.takesPrecedence,
          temporaryOverride: validacion.temporaryOverride,
          currentConfiguration: viaje.configuracion
        }
      });
    }
    
    const now = new Date();
    let updated = false;
    let checkpointAgregado = null;
    const rutaInfo = autoUpdateService.getRutaInfo(viaje);
    
    switch (action) {
      case 'start':
        if (['programado', 'listo', 'pendiente'].includes(viaje.estado.actual)) {
          viaje.estado.actual = 'en_curso';
          viaje.estado.fechaCambio = now;
          viaje.horarios.salidaReal = now;
          
          // Si había auto-inicio, marcar que se overrideó
          if (viaje.configuracion?.autoInicio) {
            viaje.configuracion.manualOverride = {
              accion: 'inicio_manual',
              fecha: now,
              razon: 'Usuario inició manualmente antes del auto-inicio'
            };
          }
          
          checkpointAgregado = autoUpdateService.addCheckpointConRuta(
            viaje, 
            'inicio_manual', 
            10, 
            descripcion || 'Viaje iniciado manualmente',
            now,
            rutaInfo
          );
          
          updated = true;
          console.log(`🚀 Viaje ${viajeId} iniciado manualmente`);
        }
        break;
        
      case 'complete':
        if (['en_curso', 'retrasado', 'pausado'].includes(viaje.estado.actual)) {
          viaje.estado.actual = 'completado';
          viaje.estado.fechaCambio = now;
          viaje.horarios.llegadaReal = now;
          
          // Marcar override si tenía auto-completado
          if (viaje.configuracion?.autoCompletado) {
            viaje.configuracion.manualOverride = {
              accion: 'completado_manual',
              fecha: now,
              razon: 'Usuario completó manualmente'
            };
          }
          
          checkpointAgregado = autoUpdateService.addCheckpointConRuta(
            viaje,
            'finalizacion_manual',
            100,
            descripcion || 'Viaje completado manualmente',
            now,
            rutaInfo
          );
          
          updated = true;
          console.log(`✅ Viaje ${viajeId} completado manualmente`);
        }
        break;
        
      case 'progress':
        if (progress !== undefined && ['en_curso', 'retrasado', 'pausado'].includes(viaje.estado.actual)) {
          const nuevoProgreso = Math.max(0, Math.min(100, progress));
          
          // Marcar override temporal para estrategia automática
          if (viaje.configuracion?.estrategiaProgreso === 'automatico') {
            viaje.configuracion.temporaryOverride = {
              accion: 'progreso_manual',
              fecha: now,
              expira: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 horas
              valorAnterior: viaje.tracking?.progreso?.porcentaje
            };
          }
          
          if (puntoRuta !== undefined && rutaInfo) {
            const puntoValido = Math.max(0, Math.min(rutaInfo.totalPuntos - 1, puntoRuta));
            viaje.tracking.puntoActualRuta = {
              indice: puntoValido,
              punto: rutaInfo.puntos[puntoValido],
              progresoPunto: nuevoProgreso,
              timestamp: now
            };
          }
          
          checkpointAgregado = autoUpdateService.addCheckpointConRuta(
            viaje,
            'progreso_manual',
            nuevoProgreso,
            descripcion || `Progreso actualizado manualmente a ${nuevoProgreso}%`,
            now,
            rutaInfo
          );
          
          // Auto-completar si llega a 100%
          if (nuevoProgreso >= 100) {
            viaje.estado.actual = 'completado';
            viaje.estado.fechaCambio = now;
            viaje.horarios.llegadaReal = now;
          }
          
          updated = true;
          console.log(`📈 Progreso actualizado manualmente a ${nuevoProgreso}%`);
        }
        break;
        
      case 'checkpoint':
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
          console.log(`📍 Checkpoint personalizado agregado: ${tipo}`);
        }
        break;

      case 'route_point':
        if (puntoRuta !== undefined && rutaInfo && ['en_curso', 'retrasado'].includes(viaje.estado.actual)) {
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
            descripcion || `Llegada a punto ${puntoValido}: ${rutaInfo.puntos[puntoValido]?.descripcion}`,
            now,
            rutaInfo
          );
          
          updated = true;
          console.log(`🗺️ Punto de ruta actualizado: ${puntoValido}`);
        }
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Acción no válida. Use: start, progress, complete, checkpoint, route_point'
        });
    }
    
    if (updated) {
      // Agregar al historial
      viaje.estado.historial.push({
        estadoAnterior: viaje.estado.actual,
        estadoNuevo: viaje.estado.actual,
        fecha: now,
        motivo: `manual_${action}`,
        override: validacion.takesPrecedence || validacion.temporaryOverride
      });
      
      await viaje.save();
      
      res.status(200).json({
        success: true,
        message: `Viaje ${action} ejecutado manualmente`,
        data: {
          id: viaje._id,
          status: viaje.estado.actual,
          progress: viaje.tracking.progreso.porcentaje,
          lastUpdate: now,
          checkpointAdded: checkpointAgregado,
          validation: validacion,
          override: {
            applied: validacion.takesPrecedence || validacion.temporaryOverride,
            type: validacion.takesPrecedence ? 'permanent' : 'temporary'
          },
          rutaInfo: rutaInfo ? {
            totalPuntos: rutaInfo.totalPuntos,
            puntoActual: viaje.tracking?.puntoActualRuta?.indice || 0
          } : null
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el viaje',
        currentState: viaje.estado.actual,
        validation: validacion
      });
    }
    
  } catch (error) {
    console.error('❌ Error actualizando viaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar viaje',
      error: error.message
    });
  }
};

// 🆕 NUEVO: Pausar viaje
AutoUpdateController.pauseTrip = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { reason } = req.body;
    
    const result = await autoUpdateService.pauseTrip(viajeId, reason);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        viajeId: viajeId,
        estadoAnterior: result.estadoAnterior,
        estadoNuevo: result.estadoNuevo,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error pausando viaje:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 🆕 NUEVO: Reanudar viaje
AutoUpdateController.resumeTrip = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { reason } = req.body;
    
    const result = await autoUpdateService.resumeTrip(viajeId, reason);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        viajeId: viajeId,
        estadoAnterior: result.estadoAnterior,
        estadoNuevo: result.estadoNuevo,
        tiempoPausado: result.tiempoPausado,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error reanudando viaje:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 🆕 NUEVO: Resetear configuración a valores por defecto
AutoUpdateController.resetTripConfiguration = async (req, res) => {
  try {
    const { viajeId } = req.params;
    
    const viaje = await ViajesModel.findById(viajeId);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }
    
    const configAnterior = { ...viaje.configuracion };
    
    // Resetear a configuración por defecto
    viaje.configuracion = {
      autoInicio: true,
      autoCompletado: true,
      estrategiaProgreso: 'hibrido',
      requiereConfirmacionManual: false,
      ignoreDelayDetection: false,
      ultimaConfiguracion: new Date(),
      configuradoPor: 'reset_automatico',
      resetDesde: configAnterior
    };
    
    await viaje.save();
    
    res.status(200).json({
      success: true,
      message: 'Configuración reseteada a valores por defecto',
      data: {
        viajeId: viajeId,
        configuracionAnterior: configAnterior,
        configuracionNueva: viaje.configuracion
      }
    });
    
  } catch (error) {
    console.error('❌ Error reseteando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error reseteando configuración',
      error: error.message
    });
  }
};

// 🆕 NUEVO: Obtener historial de overrides
AutoUpdateController.getTripOverrides = async (req, res) => {
  try {
    const { viajeId } = req.params;
    
    const viaje = await ViajesModel.findById(viajeId)
      .select('configuracion estado.historial tracking.checkpoints tripDescription')
      .lean();
    
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }
    
    const overrides = {
      manualOverride: viaje.configuracion?.manualOverride || null,
      temporaryOverride: viaje.configuracion?.temporaryOverride || null,
      historialOverrides: viaje.estado?.historial?.filter(h => h.override) || [],
      checkpointsManuales: viaje.tracking?.checkpoints?.filter(c => 
        c.reportadoPor === 'manual' || c.tipo.includes('manual')
      ) || []
    };
    
    res.status(200).json({
      success: true,
      data: {
        viajeId: viajeId,
        descripcion: viaje.tripDescription,
        overrides: overrides,
        totalOverrides: Object.values(overrides).flat().length
      },
      message: 'Historial de overrides obtenido exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo overrides:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo historial de overrides',
      error: error.message
    });
  }
};

// Mantener todos los endpoints anteriores...
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
      .select('tracking.puntoActualRuta tracking.progreso estado tripDescription configuracion')
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
        message: 'Este viaje no tiene información de ruta asociada'
      });
    }
    
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
      estadoViaje: viaje.estado,
      configuracion: viaje.configuracion
    };
    
    res.status(200).json({
      success: true,
      data: rutaDetallada,
      message: 'Información de ruta obtenida exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo ruta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de ruta',
      error: error.message
    });
  }
};

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
      .select('tracking.checkpoints tracking.progreso estado tripDescription configuracion')
      .lean();
    
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }
    
    const checkpoints = viaje.tracking?.checkpoints || [];
    const rutaInfo = autoUpdateService.getRutaInfo(viaje);
    
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
        configuracion: viaje.configuracion,
        progresoActual: viaje.tracking?.progreso?.porcentaje || 0,
        checkpoints: checkpoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        rutaInfo: rutaInfo,
        estadisticas: {
          totalCheckpoints: checkpoints.length,
          checkpointsManuales: checkpointsManuales,
          checkpointsAutomaticos: checkpointsAutomaticos,
          checkpointsConRuta: checkpointsConRuta,
          progresoMinimo: checkpoints.length > 0 ? Math.min(...checkpoints.map(cp => cp.progreso)) : 0,
          progresoMaximo: checkpoints.length > 0 ? Math.max(...checkpoints.map(cp => cp.progreso)) : 0
        }
      }
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
    const config = viaje.configuracion || {};
    
    const resumen = {
      viajeId: viajeId,
      estadoActual: viaje.estado.actual,
      configuracion: config,
      progresoActual: viaje.tracking?.progreso?.porcentaje || 0,
      progresoTiempo: autoUpdateService.calculateTimeBasedProgress(viaje, now),
      progresoDistancia: rutaInfo ? autoUpdateService.calculateDistanceBasedProgress(viaje, now, rutaInfo) : null,
      ultimoCheckpoint: autoUpdateService.getLastValidCheckpoint(viaje),
      metodoCalculo: viaje.tracking?.progreso?.metodoCalculo || config.estrategiaProgreso || 'hibrido',
      tiempoTranscurrido: Math.round((now - new Date(viaje.departureTime)) / (1000 * 60)),
      tiempoRestante: Math.round((new Date(viaje.arrivalTime) - now) / (1000 * 60)),
      totalCheckpoints: viaje.tracking?.checkpoints?.length || 0,
      rutaInfo: rutaInfo ? {
        totalPuntos: rutaInfo.totalPuntos,
        puntoActual: viaje.tracking?.puntoActualRuta?.indice || 0,
        puntosRestantes: rutaInfo.totalPuntos - (viaje.tracking?.puntoActualRuta?.indice || 0) - 1,
        distanciaTotal: rutaInfo.distanciaTotal,
        origen: rutaInfo.origen,
        destino: rutaInfo.destino,
        progresoRuta: rutaInfo.totalPuntos > 0 ? 
          Math.round(((viaje.tracking?.puntoActualRuta?.indice || 0) / (rutaInfo.totalPuntos - 1)) * 100) : 0
      } : null,
      overrides: {
        manual: viaje.configuracion?.manualOverride || null,
        temporal: viaje.configuracion?.temporaryOverride || null
      }
    };
    
    res.status(200).json({
      success: true,
      data: resumen,
      message: 'Resumen de progreso con configuración obtenido exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo resumen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de progreso',
      error: error.message
    });
  }
};

export default AutoUpdateController;