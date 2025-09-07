// 📁 Backend/src/services/AutoUpdateService.js
// SERVICIO MEJORADO CON CONFIGURACIÓN FLEXIBLE AUTOMÁTICO/MANUAL

import ViajesModel from '../Models/Viajes.js';
import CotizacionesModel from '../Models/CotizacionesModel.js';

class AutoUpdateService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.updateInterval = 120000; // 2 minutos
    this.startTime = null;
  }

  // 🚀 Iniciar el servicio
  start() {
    if (this.isRunning) {
      console.log('⚠️ AutoUpdateService ya está corriendo');
      return;
    }

    console.log('🚀 Iniciando AutoUpdateService con configuración flexible...');
    this.isRunning = true;
    this.startTime = Date.now();

    // Ejecutar inmediatamente
    this.updateViajes();

    // Configurar intervalo
    this.intervalId = setInterval(() => {
      this.updateViajes();
    }, this.updateInterval);

    console.log(`✅ AutoUpdateService iniciado (intervalo: ${this.updateInterval / 1000}s)`);
  }

  // ⏹️ Detener el servicio
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ AutoUpdateService no está corriendo');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('⏹️ AutoUpdateService detenido');
  }

  // 🔄 Función principal de actualización CON CONFIGURACIÓN FLEXIBLE
  async updateViajes() {
    try {
      console.log('🔄 Ejecutando actualización automática con configuración flexible...');
      const now = new Date();

      // 1️⃣ BUSCAR VIAJES CON CONFIGURACIÓN
      const viajesParaActualizar = await ViajesModel.find({
        'estado.autoActualizar': true,
        'estado.actual': { 
          $in: ['programado', 'listo', 'pendiente', 'en_curso', 'retrasado', 'pausado']
        }
      }).populate({
        path: 'cotizacionId',
        select: 'ruta origen destino distanciaKm tiempoEstimado detalles',
        populate: {
          path: 'ruta',
          select: 'puntos coordenadas descripcion distancia orden'
        }
      });

      console.log(`📦 Encontrados ${viajesParaActualizar.length} viajes para revisar`);

      if (viajesParaActualizar.length === 0) {
        console.log('✅ No hay viajes para actualizar');
        return;
      }

      let actualizados = 0;

      for (const viaje of viajesParaActualizar) {
        try {
          const wasUpdated = await this.processViajeConConfiguracion(viaje, now);
          if (wasUpdated) actualizados++;
        } catch (error) {
          console.error(`❌ Error procesando viaje ${viaje._id}:`, error.message);
        }
      }

      if (actualizados > 0) {
        console.log(`✅ ${actualizados} viajes actualizados con configuración flexible`);
      } else {
        console.log('📊 No se requirieron actualizaciones');
      }

    } catch (error) {
      console.error('💥 Error en updateViajes:', error);
    }
  }

  // 🎯 Procesar un viaje individual CON CONFIGURACIÓN FLEXIBLE
  async processViajeConConfiguracion(viaje, now) {
    let updated = false;
    const estadoAnterior = viaje.estado.actual;
    const config = viaje.configuracion || {};

    console.log(`🔍 Procesando viaje ${viaje._id} - Estado: ${viaje.estado.actual} - Config: ${JSON.stringify(config)}`);

    // 🗺️ OBTENER INFORMACIÓN DE RUTA
    const rutaInfo = this.getRutaInfo(viaje);
    if (rutaInfo) {
      console.log(`🗺️ Ruta detectada: ${rutaInfo.totalPuntos} puntos, ${rutaInfo.distanciaTotal}km`);
    }

    // 🚀 AUTO-INICIAR VIAJE CON VALIDACIÓN DE CONFIGURACIÓN
    if (this.shouldAutoStart(viaje, now, config)) {
      console.log(`🚀 Iniciando viaje ${viaje._id} automáticamente (config: autoInicio=${config.autoInicio})`);
      
      viaje.estado.actual = 'en_curso';
      viaje.estado.fechaCambio = now;
      viaje.horarios.salidaReal = viaje.horarios.salidaReal || now;
      
      this.addCheckpointConRuta(viaje, 'inicio_automatico', 5, 'Viaje iniciado automáticamente', now, rutaInfo);
      
      viaje.estado.historial.push({
        estadoAnterior: estadoAnterior,
        estadoNuevo: 'en_curso',
        fecha: now,
        motivo: 'automatico_hora_salida',
        configuracion: config
      });

      updated = true;
    }

    // 📈 ACTUALIZAR PROGRESO SEGÚN ESTRATEGIA CONFIGURADA
    if (this.shouldUpdateProgress(viaje, config)) {
      const progresoActualizado = this.updateProgressByStrategy(viaje, now, rutaInfo, config);
      if (progresoActualizado) {
        updated = true;
      }
    }

    // ✅ AUTO-COMPLETAR VIAJE CON VALIDACIÓN DE CONFIGURACIÓN
    if (this.shouldAutoComplete(viaje, now, config)) {
      const progreso = viaje.tracking?.progreso?.porcentaje || 0;
      
      console.log(`✅ Completando viaje ${viaje._id} automáticamente (progreso: ${progreso}%, config: autoCompletado=${config.autoCompletado})`);
      
      viaje.estado.actual = 'completado';
      viaje.estado.fechaCambio = now;
      viaje.horarios.llegadaReal = now;
      viaje.tracking.progreso.porcentaje = 100;
      
      this.addCheckpointConRuta(viaje, 'finalizacion_automatica', 100, 'Viaje completado automáticamente', now, rutaInfo);
      
      viaje.estado.historial.push({
        estadoAnterior: estadoAnterior,
        estadoNuevo: 'completado',
        fecha: now,
        motivo: 'automatico_completado',
        configuracion: config
      });
      
      updated = true;
    }

    // ⚠️ MARCAR COMO RETRASADO (siempre activo, independiente de configuración)
    if (viaje.estado.actual === 'en_curso' && !config.ignoreDelayDetection) {
      const tiempoRetraso = this.calculateDelayWithRoute(viaje, now, rutaInfo);
      
      if (tiempoRetraso.isDelayed) {
        console.log(`⚠️ Marcando viaje ${viaje._id} como retrasado (${tiempoRetraso.reason})`);
        
        viaje.estado.actual = 'retrasado';
        viaje.estado.fechaCambio = now;
        
        this.addCheckpointConRuta(
          viaje, 
          'retraso_detectado', 
          viaje.tracking.progreso.porcentaje, 
          `Retraso detectado: ${tiempoRetraso.reason}`, 
          now, 
          rutaInfo
        );
        
        viaje.alertas.push({
          tipo: 'retraso',
          mensaje: `Viaje retrasado - ${tiempoRetraso.reason}`,
          fecha: now,
          prioridad: 'alta',
          configuracion: config,
          rutaInfo: rutaInfo ? {
            puntoActual: rutaInfo.puntoActualEstimado,
            distanciaRestante: rutaInfo.distanciaRestante
          } : null
        });
        
        updated = true;
      }
    }

    // 💾 GUARDAR CAMBIOS
    if (updated) {
      viaje.horarios.ultimaActualizacion = now;
      await viaje.save();
      console.log(`💾 Viaje ${viaje._id} actualizado y guardado con configuración`);
    }

    return updated;
  }

  // 🔧 NUEVAS FUNCIONES DE VALIDACIÓN DE CONFIGURACIÓN

  shouldAutoStart(viaje, now, config) {
    const autoInicio = config.autoInicio !== false; // Por defecto true
    const requiereConfirmacion = config.requiereConfirmacionManual === true;
    const esHoraSalida = viaje.departureTime <= now;
    const estadoPermitido = ['programado', 'listo', 'pendiente'].includes(viaje.estado.actual);

    return estadoPermitido && esHoraSalida && autoInicio && !requiereConfirmacion;
  }

  shouldUpdateProgress(viaje, config) {
    const estrategia = config.estrategiaProgreso || 'hibrido';
    const estadosActivos = ['en_curso', 'retrasado', 'pausado'];
    
    // No actualizar si está pausado y no es híbrido
    if (viaje.estado.actual === 'pausado' && estrategia !== 'hibrido') {
      return false;
    }

    return estadosActivos.includes(viaje.estado.actual) && estrategia !== 'manual';
  }

  shouldAutoComplete(viaje, now, config) {
    const autoCompletado = config.autoCompletado !== false; // Por defecto true
    const estadosPermitidos = ['en_curso', 'retrasado'];
    const progreso = viaje.tracking?.progreso?.porcentaje || 0;
    const pasaronDosHoras = now >= new Date(viaje.arrivalTime.getTime() + 2 * 60 * 60 * 1000);
    
    if (!autoCompletado || !estadosPermitidos.includes(viaje.estado.actual)) {
      return false;
    }

    const rutaInfo = this.getRutaInfo(viaje);
    
    const debeCompletar = (
      progreso >= 90 && viaje.arrivalTime <= now
    ) || (
      progreso >= 75 && pasaronDosHoras
    ) || (
      progreso >= 100
    ) || (
      this.isAtFinalDestination(viaje, rutaInfo)
    );
    
    return debeCompletar;
  }

  // 📈 ACTUALIZAR PROGRESO SEGÚN ESTRATEGIA
  updateProgressByStrategy(viaje, now, rutaInfo, config) {
    const estrategia = config.estrategiaProgreso || 'hibrido';
    
    try {
      let nuevoProgreso;
      
      switch (estrategia) {
        case 'automatico':
          nuevoProgreso = this.calculateTimeBasedProgress(viaje, now);
          break;
          
        case 'manual':
          // No actualizar automáticamente en modo manual
          return false;
          
        case 'hibrido':
        default:
          return this.updateHybridProgressConRuta(viaje, now, rutaInfo);
      }
      
      const progresoAnterior = viaje.tracking?.progreso?.porcentaje || 0;
      const debeActualizar = Math.abs(nuevoProgreso - progresoAnterior) >= 3;
      
      if (debeActualizar) {
        viaje.tracking.progreso.porcentaje = nuevoProgreso;
        viaje.tracking.progreso.ultimaActualizacion = now;
        viaje.tracking.progreso.metodoCalculo = estrategia;
        
        console.log(`📈 Progreso actualizado (${estrategia}): ${progresoAnterior}% → ${nuevoProgreso}%`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error actualizando progreso con estrategia ${estrategia}:`, error);
      return false;
    }
  }

  // 🛠️ VALIDACIÓN PARA OPERACIONES MANUALES
  validateManualOperation(viaje, action) {
    const config = viaje.configuracion || {};
    const now = new Date();
    
    // Validar acción de inicio manual
    if (action === 'start') {
      if (config.autoInicio && viaje.departureTime <= now) {
        return {
          valid: true,
          warning: 'Este viaje tiene auto-inicio habilitado. La acción manual tomará precedencia.',
          takesPrecedence: true
        };
      }
      
      if (config.requiereConfirmacionManual && !config.confirmacionRecibida) {
        return {
          valid: false,
          error: 'Este viaje requiere confirmación manual antes de iniciar.',
          requiresConfirmation: true
        };
      }
    }
    
    // Validar progreso manual
    if (action === 'progress' && config.estrategiaProgreso === 'automatico') {
      return {
        valid: true,
        warning: 'Este viaje está configurado para progreso automático. El update manual tomará precedencia temporalmente.',
        temporaryOverride: true
      };
    }
    
    // Validar completado manual
    if (action === 'complete' && config.autoCompletado) {
      return {
        valid: true,
        warning: 'Este viaje tiene auto-completado habilitado. La acción manual tomará precedencia.',
        takesPrecedence: true
      };
    }
    
    return { valid: true };
  }

  // 🎮 PAUSAR/REANUDAR VIAJE
  async pauseTrip(viajeId, reason = 'Pausado manualmente') {
    try {
      const viaje = await ViajesModel.findById(viajeId);
      if (!viaje) {
        throw new Error('Viaje no encontrado');
      }
      
      if (!['en_curso', 'retrasado'].includes(viaje.estado.actual)) {
        throw new Error('Solo se pueden pausar viajes en curso o retrasados');
      }
      
      const now = new Date();
      const estadoAnterior = viaje.estado.actual;
      
      viaje.estado.actual = 'pausado';
      viaje.estado.fechaCambio = now;
      viaje.estado.pausaInfo = {
        fechaPausa: now,
        estadoAnterior: estadoAnterior,
        motivo: reason
      };
      
      this.addCheckpointConRuta(viaje, 'pausa_manual', viaje.tracking.progreso.porcentaje, reason, now);
      
      await viaje.save();
      
      return {
        success: true,
        message: 'Viaje pausado exitosamente',
        estadoAnterior: estadoAnterior,
        estadoNuevo: 'pausado'
      };
      
    } catch (error) {
      console.error('Error pausando viaje:', error);
      throw error;
    }
  }

  async resumeTrip(viajeId, reason = 'Reanudado manualmente') {
    try {
      const viaje = await ViajesModel.findById(viajeId);
      if (!viaje) {
        throw new Error('Viaje no encontrado');
      }
      
      if (viaje.estado.actual !== 'pausado') {
        throw new Error('Solo se pueden reanudar viajes pausados');
      }
      
      const now = new Date();
      const estadoAnterior = viaje.estado.pausaInfo?.estadoAnterior || 'en_curso';
      
      viaje.estado.actual = estadoAnterior;
      viaje.estado.fechaCambio = now;
      
      // Calcular tiempo pausado
      const tiempoPausado = now - new Date(viaje.estado.pausaInfo.fechaPausa);
      
      this.addCheckpointConRuta(
        viaje, 
        'reanudacion_manual', 
        viaje.tracking.progreso.porcentaje, 
        `${reason} (Pausado ${Math.round(tiempoPausado / (1000 * 60))} minutos)`, 
        now
      );
      
      // Limpiar info de pausa
      viaje.estado.pausaInfo = undefined;
      
      await viaje.save();
      
      return {
        success: true,
        message: 'Viaje reanudado exitosamente',
        estadoAnterior: 'pausado',
        estadoNuevo: estadoAnterior,
        tiempoPausado: Math.round(tiempoPausado / (1000 * 60))
      };
      
    } catch (error) {
      console.error('Error reanudando viaje:', error);
      throw error;
    }
  }

  // ... (mantener todas las funciones auxiliares anteriores)
  getRutaInfo(viaje) {
    try {
      if (!viaje.cotizacionId || !viaje.cotizacionId.ruta) {
        return null;
      }

      const ruta = viaje.cotizacionId.ruta;
      const puntos = Array.isArray(ruta) ? ruta : (ruta.puntos || []);
      
      return {
        totalPuntos: puntos.length,
        puntos: puntos.sort((a, b) => (a.orden || 0) - (b.orden || 0)),
        distanciaTotal: viaje.cotizacionId.distanciaKm || 0,
        tiempoEstimado: viaje.cotizacionId.tiempoEstimado || 0,
        origen: viaje.cotizacionId.origen,
        destino: viaje.cotizacionId.destino
      };
    } catch (error) {
      console.error('Error obteniendo info de ruta:', error);
      return null;
    }
  }

  updateHybridProgressConRuta(viaje, now, rutaInfo) {
    try {
      const progresoAnterior = viaje.tracking?.progreso?.porcentaje || 0;
      const nuevoProgreso = this.calculateHybridProgressConRuta(viaje, now, rutaInfo);
      
      const debeActualizar = (
        (nuevoProgreso > progresoAnterior && Math.abs(nuevoProgreso - progresoAnterior) >= 3) ||
        (viaje.estado.actual === 'retrasado' && nuevoProgreso > progresoAnterior && Math.abs(nuevoProgreso - progresoAnterior) >= 1) ||
        (progresoAnterior <= 10 && nuevoProgreso > progresoAnterior) ||
        this.hasRecentManualCheckpoint(viaje, now)
      );
      
      if (debeActualizar) {
        viaje.tracking.progreso.porcentaje = nuevoProgreso;
        viaje.tracking.progreso.ultimaActualizacion = now;
        viaje.tracking.progreso.metodoCalculo = 'hibrido';
        
        if (rutaInfo) {
          const puntoActual = this.estimateCurrentRoutePoint(viaje, nuevoProgreso, rutaInfo);
          viaje.tracking.puntoActualRuta = puntoActual;
        }
        
        console.log(`📈 Progreso híbrido actualizado: ${progresoAnterior}% → ${nuevoProgreso}% (viaje ${viaje._id})`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error actualizando progreso híbrido:`, error);
      return false;
    }
  }

  calculateHybridProgressConRuta(viaje, now, rutaInfo) {
    try {
      const ultimoCheckpoint = this.getLastValidCheckpoint(viaje);
      const progresoTiempo = this.calculateTimeBasedProgress(viaje, now);
      
      let progresoDistancia = null;
      if (rutaInfo && rutaInfo.distanciaTotal > 0) {
        progresoDistancia = this.calculateDistanceBasedProgress(viaje, now, rutaInfo);
      }

      if (viaje.estado.actual === 'retrasado') {
        if (ultimoCheckpoint && this.isCheckpointRecent(ultimoCheckpoint, now)) {
          const tiempoDesdeCheckpoint = now - new Date(ultimoCheckpoint.timestamp);
          const incrementoReducido = this.calculateTimeIncrement(viaje, tiempoDesdeCheckpoint) * 0.5;
          return Math.min(95, ultimoCheckpoint.progreso + incrementoReducido);
        } else {
          const progresoBase = progresoDistancia ? 
            Math.min(progresoTiempo, progresoDistancia) : 
            progresoTiempo;
          return Math.min(progresoBase * 0.7, 85);
        }
      }

      if (ultimoCheckpoint && this.isCheckpointRecent(ultimoCheckpoint, now)) {
        const tiempoDesdeCheckpoint = now - new Date(ultimoCheckpoint.timestamp);
        const incrementoPorTiempo = this.calculateTimeIncrement(viaje, tiempoDesdeCheckpoint);
        
        if (progresoDistancia !== null) {
          const progresoCheckpoint = ultimoCheckpoint.progreso + incrementoPorTiempo;
          const progresoFinal = (progresoCheckpoint * 0.7) + (progresoDistancia * 0.3);
          return Math.min(100, progresoFinal);
        }
        
        return Math.min(100, ultimoCheckpoint.progreso + incrementoPorTiempo);
      } else {
        const ultimoProgresoConocido = ultimoCheckpoint?.progreso || 0;
        const progresoFinal = progresoDistancia !== null ? 
          Math.max(ultimoProgresoConocido, progresoTiempo, progresoDistancia) :
          Math.max(ultimoProgresoConocido, progresoTiempo);
        
        return Math.round(progresoFinal);
      }
      
    } catch (error) {
      console.error('Error calculando progreso híbrido:', error);
      return viaje.tracking?.progreso?.porcentaje || 0;
    }
  }

  calculateDistanceBasedProgress(viaje, now, rutaInfo) {
    try {
      const tiempoTranscurrido = now - new Date(viaje.horarios?.salidaReal || viaje.departureTime);
      const tiempoTotal = new Date(viaje.arrivalTime) - new Date(viaje.departureTime);
      
      if (tiempoTotal <= 0 || tiempoTranscurrido <= 0) return 5;
      
      let progresoPorDistancia = (tiempoTranscurrido / tiempoTotal) * 100;
      
      if (rutaInfo.totalPuntos > 0) {
        const factorComplejidad = Math.min(1.2, 1 + (rutaInfo.totalPuntos - 2) * 0.05);
        progresoPorDistancia *= factorComplejidad;
      }
      
      return Math.max(5, Math.min(95, progresoPorDistancia));
      
    } catch (error) {
      console.error('Error calculando progreso por distancia:', error);
      return null;
    }
  }

  estimateCurrentRoutePoint(viaje, progreso, rutaInfo) {
    try {
      if (!rutaInfo || rutaInfo.totalPuntos === 0) return null;
      
      const indiceEstimado = Math.floor((progreso / 100) * (rutaInfo.totalPuntos - 1));
      const puntoActual = rutaInfo.puntos[indiceEstimado];
      
      return {
        indice: indiceEstimado,
        punto: puntoActual,
        progresoPunto: progreso,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('Error estimando punto actual:', error);
      return null;
    }
  }

  isAtFinalDestination(viaje, rutaInfo) {
    try {
      if (!rutaInfo || !viaje.tracking?.puntoActualRuta) return false;
      
      const puntoActual = viaje.tracking.puntoActualRuta.indice;
      const ultimoPunto = rutaInfo.totalPuntos - 1;
      
      return puntoActual >= ultimoPunto && viaje.tracking.progreso.porcentaje >= 90;
      
    } catch (error) {
      return false;
    }
  }

  calculateDelayWithRoute(viaje, now, rutaInfo) {
    try {
      const tiempoTotal = new Date(viaje.arrivalTime) - new Date(viaje.departureTime);
      const tiempoTotalMinutos = tiempoTotal / (1000 * 60);
      
      let tiempoGracia;
      if (tiempoTotalMinutos <= 10) {
        tiempoGracia = 2 * 60000;
      } else if (tiempoTotalMinutos <= 30) {
        tiempoGracia = 5 * 60000;
      } else {
        tiempoGracia = 15 * 60000;
      }
      
      if (rutaInfo && rutaInfo.totalPuntos > 3) {
        tiempoGracia *= 1.2;
      }
      
      const tiempoLimiteRetraso = new Date(viaje.arrivalTime.getTime() + tiempoGracia);
      const progreso = viaje.tracking?.progreso?.porcentaje || 0;
      
      if (now >= tiempoLimiteRetraso && progreso < 90) {
        return {
          isDelayed: true,
          reason: rutaInfo ? 
            `Ruta compleja (${rutaInfo.totalPuntos} puntos), gracia: ${tiempoGracia/60000} min` :
            `Gracia estándar: ${tiempoGracia/60000} min`
        };
      }
      
      return { isDelayed: false };
      
    } catch (error) {
      console.error('Error calculando retraso:', error);
      return { isDelayed: false };
    }
  }

  addCheckpointConRuta(viaje, tipo, progreso, descripcion, timestamp = new Date(), rutaInfo = null) {
    try {
      if (!viaje.tracking.checkpoints) {
        viaje.tracking.checkpoints = [];
      }

      const nuevoCheckpoint = {
        tipo: tipo,
        progreso: Math.min(100, Math.max(0, progreso)),
        descripcion: descripcion,
        timestamp: timestamp,
        reportadoPor: 'automatico',
        rutaInfo: rutaInfo ? {
          puntoEstimado: this.estimateCurrentRoutePoint(viaje, progreso, rutaInfo),
          distanciaTotal: rutaInfo.distanciaTotal,
          totalPuntos: rutaInfo.totalPuntos
        } : null
      };

      viaje.tracking.checkpoints.push(nuevoCheckpoint);
      viaje.tracking.progreso.porcentaje = nuevoCheckpoint.progreso;
      viaje.tracking.progreso.ultimaActualizacion = timestamp;

      console.log(`📍 Checkpoint agregado: ${tipo} - ${progreso}% - ${descripcion}`);
      return nuevoCheckpoint;

    } catch (error) {
      console.error('Error agregando checkpoint:', error);
      return null;
    }
  }

  // Funciones auxiliares existentes...
  hasRecentManualCheckpoint(viaje, now) {
    const checkpoints = viaje.tracking?.checkpoints || [];
    const ultimoCheckpoint = checkpoints[checkpoints.length - 1];
    
    if (!ultimoCheckpoint) return false;
    
    const esManual = ultimoCheckpoint.reportadoPor === 'manual' || 
                     ultimoCheckpoint.tipo.includes('manual');
    const esReciente = (now - new Date(ultimoCheckpoint.timestamp)) < (10 * 60 * 1000);
    
    return esManual && esReciente;
  }

  calculateTimeBasedProgress(viaje, now) {
    try {
      const salidaReal = viaje.horarios?.salidaReal || viaje.departureTime;
      const llegadaProgramada = viaje.arrivalTime;

      const tiempoTranscurrido = now - new Date(salidaReal);
      const tiempoTotal = new Date(llegadaProgramada) - new Date(salidaReal);

      if (tiempoTotal <= 0 || tiempoTranscurrido <= 0) return 5;

      let progreso = (tiempoTranscurrido / tiempoTotal) * 100;
      const minutosTotales = tiempoTotal / (1000 * 60);

      if (minutosTotales <= 4) {
        progreso *= 2.0;
      } else if (minutosTotales <= 10) {
        progreso *= 1.6;
      } else if (minutosTotales <= 30) {
        progreso *= 1.3;
      } else if (minutosTotales <= 90) {
        progreso *= 1.0;
      } else {
        progreso *= 0.9;
      }

      if (viaje.estado.actual === 'retrasado') {
        progreso = Math.min(progreso * 0.8, 85);
      } else {
        progreso = Math.min(progreso, 100);
      }

      const variacion = Math.random() * 2 - 1;
      progreso += variacion;

      return Math.max(5, Math.min(progreso, 100));
    } catch (error) {
      console.error('Error calculando progreso por tiempo:', error);
      return 5;
    }
  }

  calculateTimeIncrement(viaje, tiempoTranscurrido) {
    try {
      const tiempoTotal = new Date(viaje.arrivalTime) - new Date(viaje.departureTime);
      const incrementoMaximo = 30;
      
      const horasTranscurridas = tiempoTranscurrido / (1000 * 60 * 60);
      const incremento = (horasTranscurridas / (tiempoTotal / (1000 * 60 * 60))) * incrementoMaximo;
      
      return Math.min(incrementoMaximo, Math.max(0, incremento));
      
    } catch (error) {
      return 0;
    }
  }

  getLastValidCheckpoint(viaje) {
    const checkpoints = viaje.tracking?.checkpoints || [];
    
    return checkpoints
      .filter(cp => cp.progreso >= 0 && cp.progreso <= 100)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  }

  isCheckpointRecent(checkpoint, now) {
    const tiempoDiferencia = now - new Date(checkpoint.timestamp);
    const cuatroHoras = 4 * 60 * 60 * 1000;
    
    return tiempoDiferencia <= cuatroHoras;
  }

  // 📊 Obtener estadísticas del servicio
  getStats() {
    return {
      isRunning: this.isRunning,
      updateInterval: this.updateInterval,
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
      features: [
        'configuracion_flexible',
        'auto_manual_hybrid', 
        'pause_resume',
        'strategy_selection',
        'route_integration',
        'conflict_resolution'
      ]
    };
  }

  setUpdateInterval(milliseconds) {
    const minInterval = 60000;
    this.updateInterval = Math.max(minInterval, milliseconds);
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
    
    console.log(`⚙️ Intervalo actualizado a ${this.updateInterval / 1000}s`);
  }

  async forceUpdate() {
    console.log('🔧 Forzando actualización manual...');
    await this.updateViajes();
  }

  async getActiveTripsStatus() {
    try {
      const viajes = await ViajesModel.find({
        'estado.actual': { $in: ['programado', 'listo', 'pendiente', 'en_curso', 'retrasado', 'pausado'] }
      })
      .populate({
        path: 'cotizacionId',
        select: 'ruta origen destino distanciaKm tiempoEstimado',
        populate: {
          path: 'ruta',
          select: 'puntos coordenadas descripcion distancia orden'
        }
      })
      .select('_id estado tracking departureTime arrivalTime tripDescription cotizacionId configuracion')
      .sort({ departureTime: 1 });

      return viajes.map(viaje => {
        const rutaInfo = this.getRutaInfo(viaje);
        const config = viaje.configuracion || {};
        
        return {
          id: viaje._id,
          description: viaje.tripDescription,
          status: viaje.estado.actual,
          progress: viaje.tracking?.progreso?.porcentaje || 0,
          departureTime: viaje.departureTime,
          arrivalTime: viaje.arrivalTime,
          lastUpdate: viaje.tracking?.progreso?.ultimaActualizacion,
          configuracion: config,
          rutaInfo: rutaInfo ? {
            totalPuntos: rutaInfo.totalPuntos,
            distanciaTotal: rutaInfo.distanciaTotal,
            origen: rutaInfo.origen,
            destino: rutaInfo.destino,
            puntoActualEstimado: viaje.tracking?.puntoActualRuta?.indice || 0
          } : null,
          cotizacionId: viaje.cotizacionId?._id,
          metodosActivos: {
            autoInicio: config.autoInicio !== false,
            autoCompletado: config.autoCompletado !== false,
            estrategiaProgreso: config.estrategiaProgreso || 'hibrido'
          }
        };
      });

    } catch (error) {
      console.error('Error obteniendo viajes activos:', error);
      return [];
    }
  }
}

const autoUpdateService = new AutoUpdateService();
export default autoUpdateService;