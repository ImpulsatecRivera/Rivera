// 📁 Backend/src/services/AutoUpdateService.js
// SERVICIO MEJORADO CON INTEGRACIÓN DE COTIZACIONES Y RUTAS

import ViajesModel from '../Models/Viajes.js';
import CotizacionesModel from '../Models/CotizacionesModel.js'; // 🆕 Importar modelo de cotizaciones

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

    console.log('🚀 Iniciando AutoUpdateService con integración de rutas...');
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

  // 🔄 Función principal de actualización CON INTEGRACIÓN DE RUTAS
  async updateViajes() {
    try {
      console.log('🔄 Ejecutando actualización automática de viajes con rutas...');
      const now = new Date();

      // 1️⃣ BUSCAR VIAJES CON INFORMACIÓN DE COTIZACIÓN Y RUTA
      const viajesParaActualizar = await ViajesModel.find({
        'estado.autoActualizar': true,
        'estado.actual': { 
          $in: ['pendiente', 'en_curso', 'retrasado']
        }
      }).populate({
        path: 'cotizacionId',
        select: 'ruta origen destino distanciaKm tiempoEstimado detalles',
        populate: {
          path: 'ruta',
          select: 'puntos coordenadas descripcion distancia orden'
        }
      });

      console.log(`📦 Encontrados ${viajesParaActualizar.length} viajes para revisar (con rutas)`);

      if (viajesParaActualizar.length === 0) {
        console.log('✅ No hay viajes para actualizar');
        return;
      }

      let actualizados = 0;

      for (const viaje of viajesParaActualizar) {
        try {
          const wasUpdated = await this.processViajeConRuta(viaje, now);
          if (wasUpdated) actualizados++;
        } catch (error) {
          console.error(`❌ Error procesando viaje ${viaje._id}:`, error.message);
        }
      }

      if (actualizados > 0) {
        console.log(`✅ ${actualizados} viajes actualizados con información de ruta`);
      } else {
        console.log('📊 No se requirieron actualizaciones');
      }

    } catch (error) {
      console.error('💥 Error en updateViajes:', error);
    }
  }

  // 🎯 Procesar un viaje individual CON INFORMACIÓN DE RUTA
  async processViajeConRuta(viaje, now) {
    let updated = false;
    const estadoAnterior = viaje.estado.actual;

    console.log(`🔍 Procesando viaje ${viaje._id} - Estado: ${viaje.estado.actual}`);

    // 🗺️ OBTENER INFORMACIÓN DE RUTA SI EXISTE
    const rutaInfo = this.getRutaInfo(viaje);
    if (rutaInfo) {
      console.log(`🗺️ Ruta detectada: ${rutaInfo.totalPuntos} puntos, ${rutaInfo.distanciaTotal}km`);
    }

    // 🚀 AUTO-INICIAR VIAJE (pendiente → en_curso)
    if (viaje.estado.actual === 'pendiente' && viaje.departureTime <= now) {
      console.log(`🚀 Iniciando viaje ${viaje._id} automáticamente`);
      
      viaje.estado.actual = 'en_curso';
      viaje.estado.fechaCambio = now;
      viaje.horarios.salidaReal = viaje.horarios.salidaReal || now;
      
      // Agregar checkpoint de inicio con info de ruta
      this.addCheckpointConRuta(viaje, 'inicio_automatico', 5, 'Viaje iniciado automáticamente', now, rutaInfo);
      
      viaje.estado.historial.push({
        estadoAnterior: estadoAnterior,
        estadoNuevo: 'en_curso',
        fecha: now,
        motivo: 'automatico_hora_salida'
      });

      updated = true;
    }

    // 📈 ACTUALIZAR PROGRESO HÍBRIDO CON INFORMACIÓN DE RUTA
    if (viaje.estado.actual === 'en_curso' || viaje.estado.actual === 'retrasado') {
      const progresoActualizado = this.updateHybridProgressConRuta(viaje, now, rutaInfo);
      if (progresoActualizado) {
        updated = true;
      }
    }

    // ✅ AUTO-COMPLETAR VIAJE CON VALIDACIÓN DE RUTA
    if ((viaje.estado.actual === 'en_curso' || viaje.estado.actual === 'retrasado')) {
      const progreso = viaje.tracking?.progreso?.porcentaje || 0;
      const pasaronDosHoras = now >= new Date(viaje.arrivalTime.getTime() + 2 * 60 * 60 * 1000);
      
      // 🔧 CONDICIONES MEJORADAS CON INFORMACIÓN DE RUTA
      const debeCompletar = (
        progreso >= 90 && viaje.arrivalTime <= now
      ) || (
        progreso >= 75 && pasaronDosHoras
      ) || (
        progreso >= 100
      ) || (
        // 🆕 NUEVA CONDICIÓN: Si llegó al último punto de la ruta
        this.isAtFinalDestination(viaje, rutaInfo)
      );
      
      if (debeCompletar) {
        console.log(`✅ Completando viaje ${viaje._id} automáticamente (progreso: ${progreso}%)`);
        
        viaje.estado.actual = 'completado';
        viaje.estado.fechaCambio = now;
        viaje.horarios.llegadaReal = now;
        viaje.tracking.progreso.porcentaje = 100;
        
        // Agregar checkpoint de finalización con info de destino
        this.addCheckpointConRuta(viaje, 'finalizacion_automatica', 100, 'Viaje completado automáticamente', now, rutaInfo);
        
        viaje.estado.historial.push({
          estadoAnterior: estadoAnterior,
          estadoNuevo: 'completado',
          fecha: now,
          motivo: 'automatico_completado'
        });
        
        updated = true;
      }
    }

    // ⚠️ MARCAR COMO RETRASADO CON ANÁLISIS DE RUTA
    if (viaje.estado.actual === 'en_curso') {
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
      console.log(`💾 Viaje ${viaje._id} actualizado y guardado`);
    }

    return updated;
  }

  // 🗺️ OBTENER INFORMACIÓN DE RUTA
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

  // 📈 ACTUALIZAR PROGRESO HÍBRIDO CON INFORMACIÓN DE RUTA
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
        
        // 🆕 Agregar información de punto actual estimado en la ruta
        if (rutaInfo) {
          const puntoActual = this.estimateCurrentRoutePoint(viaje, nuevoProgreso, rutaInfo);
          viaje.tracking.puntoActualRuta = puntoActual;
        }
        
        console.log(`📈 Progreso actualizado: ${progresoAnterior}% → ${nuevoProgreso}% (viaje ${viaje._id}) [${viaje.estado.actual}]`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error actualizando progreso híbrido con ruta:`, error);
      return false;
    }
  }

  // 🧠 CALCULAR PROGRESO HÍBRIDO CON INFORMACIÓN DE RUTA
  calculateHybridProgressConRuta(viaje, now, rutaInfo) {
    try {
      const ultimoCheckpoint = this.getLastValidCheckpoint(viaje);
      const progresoTiempo = this.calculateTimeBasedProgress(viaje, now);
      
      // 🆕 Si tenemos información de ruta, usar progreso basado en distancia
      let progresoDistancia = null;
      if (rutaInfo && rutaInfo.distanciaTotal > 0) {
        progresoDistancia = this.calculateDistanceBasedProgress(viaje, now, rutaInfo);
      }

      // 🔄 LÓGICA HÍBRIDA MEJORADA
      if (viaje.estado.actual === 'retrasado') {
        if (ultimoCheckpoint && this.isCheckpointRecent(ultimoCheckpoint, now)) {
          const tiempoDesdeCheckpoint = now - new Date(ultimoCheckpoint.timestamp);
          const incrementoReducido = this.calculateTimeIncrement(viaje, tiempoDesdeCheckpoint) * 0.5;
          return Math.min(95, ultimoCheckpoint.progreso + incrementoReducido);
        } else {
          // Para retrasados: usar el menor entre tiempo y distancia
          const progresoBase = progresoDistancia ? 
            Math.min(progresoTiempo, progresoDistancia) : 
            progresoTiempo;
          return Math.min(progresoBase * 0.7, 85);
        }
      }

      // 🎯 LÓGICA NORMAL CON INFORMACIÓN DE RUTA
      if (ultimoCheckpoint && this.isCheckpointRecent(ultimoCheckpoint, now)) {
        const tiempoDesdeCheckpoint = now - new Date(ultimoCheckpoint.timestamp);
        const incrementoPorTiempo = this.calculateTimeIncrement(viaje, tiempoDesdeCheckpoint);
        
        // 🆕 Si tenemos progreso por distancia, hacer promedio ponderado
        if (progresoDistancia !== null) {
          const progresoCheckpoint = ultimoCheckpoint.progreso + incrementoPorTiempo;
          const progresoFinal = (progresoCheckpoint * 0.7) + (progresoDistancia * 0.3);
          return Math.min(100, progresoFinal);
        }
        
        return Math.min(100, ultimoCheckpoint.progreso + incrementoPorTiempo);
      } else {
        const ultimoProgresoConocido = ultimoCheckpoint?.progreso || 0;
        
        // 🆕 Usar el mayor entre tiempo y distancia (si está disponible)
        const progresoFinal = progresoDistancia !== null ? 
          Math.max(ultimoProgresoConocido, progresoTiempo, progresoDistancia) :
          Math.max(ultimoProgresoConocido, progresoTiempo);
        
        return Math.round(progresoFinal);
      }
      
    } catch (error) {
      console.error('Error calculando progreso híbrido con ruta:', error);
      return viaje.tracking?.progreso?.porcentaje || 0;
    }
  }

  // 🆕 CALCULAR PROGRESO BASADO EN DISTANCIA
  calculateDistanceBasedProgress(viaje, now, rutaInfo) {
    try {
      // Esta es una implementación básica que puedes mejorar
      // con datos reales de GPS o estimaciones más sofisticadas
      
      const tiempoTranscurrido = now - new Date(viaje.horarios?.salidaReal || viaje.departureTime);
      const tiempoTotal = new Date(viaje.arrivalTime) - new Date(viaje.departureTime);
      
      if (tiempoTotal <= 0 || tiempoTranscurrido <= 0) return 5;
      
      // Progreso lineal basado en tiempo, pero ajustado por la ruta
      let progresoPorDistancia = (tiempoTranscurrido / tiempoTotal) * 100;
      
      // 🔧 Ajustar según características de la ruta
      if (rutaInfo.totalPuntos > 0) {
        // Si hay muchos puntos intermedios, el progreso puede ser más variable
        const factorComplejidad = Math.min(1.2, 1 + (rutaInfo.totalPuntos - 2) * 0.05);
        progresoPorDistancia *= factorComplejidad;
      }
      
      return Math.max(5, Math.min(95, progresoPorDistancia));
      
    } catch (error) {
      console.error('Error calculando progreso por distancia:', error);
      return null;
    }
  }

  // 🎯 ESTIMAR PUNTO ACTUAL EN LA RUTA
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

  // 🎯 VERIFICAR SI LLEGÓ AL DESTINO FINAL
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

  // ⚠️ CALCULAR RETRASO CON ANÁLISIS DE RUTA
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
      
      // 🆕 Ajustar gracia según complejidad de la ruta
      if (rutaInfo && rutaInfo.totalPuntos > 3) {
        tiempoGracia *= 1.2; // 20% más de gracia para rutas complejas
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

  // 📍 AGREGAR CHECKPOINT CON INFORMACIÓN DE RUTA
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
        // 🆕 Información adicional de ruta
        rutaInfo: rutaInfo ? {
          puntoEstimado: this.estimateCurrentRoutePoint(viaje, progreso, rutaInfo),
          distanciaTotal: rutaInfo.distanciaTotal,
          totalPuntos: rutaInfo.totalPuntos
        } : null
      };

      viaje.tracking.checkpoints.push(nuevoCheckpoint);
      viaje.tracking.progreso.porcentaje = nuevoCheckpoint.progreso;
      viaje.tracking.progreso.ultimaActualizacion = timestamp;

      console.log(`📍 Checkpoint con ruta agregado: ${tipo} - ${progreso}% - ${descripcion}`);
      return nuevoCheckpoint;

    } catch (error) {
      console.error('Error agregando checkpoint con ruta:', error);
      return null;
    }
  }

  // ... (mantener todos los métodos auxiliares anteriores)
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
      features: ['ruta_integration', 'hybrid_progress', 'route_checkpoints']
    };
  }

  setUpdateInterval(milliseconds) {
    const minInterval = 60000;
    this.updateInterval = Math.max(minInterval, milliseconds);
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
    
    console.log(`⚙️ Intervalo de actualización cambiado a ${this.updateInterval / 1000}s`);
  }

  async forceUpdate() {
    console.log('🔧 Forzando actualización manual con rutas...');
    await this.updateViajes();
  }

  // 📋 Obtener estado de viajes activos CON INFORMACIÓN DE RUTA
  async getActiveTripsStatus() {
    try {
      const viajes = await ViajesModel.find({
        'estado.actual': { $in: ['pendiente', 'en_curso', 'retrasado'] }
      })
      .populate({
        path: 'cotizacionId',
        select: 'ruta origen destino distanciaKm tiempoEstimado',
        populate: {
          path: 'ruta',
          select: 'puntos coordenadas descripcion distancia orden'
        }
      })
      .select('_id estado tracking departureTime arrivalTime tripDescription cotizacionId')
      .sort({ departureTime: 1 });

      return viajes.map(viaje => {
        const rutaInfo = this.getRutaInfo(viaje);
        
        return {
          id: viaje._id,
          description: viaje.tripDescription,
          status: viaje.estado.actual,
          progress: viaje.tracking?.progreso?.porcentaje || 0,
          departureTime: viaje.departureTime,
          arrivalTime: viaje.arrivalTime,
          lastUpdate: viaje.tracking?.progreso?.ultimaActualizacion,
          // 🆕 Información de ruta
          rutaInfo: rutaInfo ? {
            totalPuntos: rutaInfo.totalPuntos,
            distanciaTotal: rutaInfo.distanciaTotal,
            origen: rutaInfo.origen,
            destino: rutaInfo.destino,
            puntoActualEstimado: viaje.tracking?.puntoActualRuta?.indice || 0
          } : null,
          cotizacionId: viaje.cotizacionId?._id
        };
      });

    } catch (error) {
      console.error('Error obteniendo estado de viajes activos con rutas:', error);
      return [];
    }
  }
}

// 🌟 Crear instancia singleton
const autoUpdateService = new AutoUpdateService();

export default autoUpdateService;