// 📁 Backend/src/services/AutoUpdateService.js
// SERVICIO CORREGIDO - SIN BUCLES INFINITOS

import ViajesModel from '../Models/Viajes.js';

class AutoUpdateService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.updateInterval = 120000; // 🔧 CAMBIADO: 2 minutos en lugar de 30 segundos
    this.startTime = null;
  }

  // 🚀 Iniciar el servicio
  start() {
    if (this.isRunning) {
      console.log('⚠️ AutoUpdateService ya está corriendo');
      return;
    }

    console.log('🚀 Iniciando AutoUpdateService...');
    this.isRunning = true;
    this.startTime = Date.now();

    // Ejecutar inmediatamente
    this.updateViajes();

    // Configurar intervalo MÁS LARGO
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

  // 🔄 Función principal de actualización
  async updateViajes() {
    try {
      console.log('🔄 Ejecutando actualización automática de viajes...');
      const now = new Date();

      // 1️⃣ BUSCAR VIAJES QUE NECESITAN ACTUALIZARSE
      const viajesParaActualizar = await ViajesModel.find({
        'estado.autoActualizar': true,
        'estado.actual': { 
          $in: ['pendiente', 'en_curso', 'retrasado'] // 🔧 REMOVIDO 'programado'
        }
      });

      console.log(`📦 Encontrados ${viajesParaActualizar.length} viajes para revisar`);

      // 🛑 SI NO HAY VIAJES, NO HACER NADA
      if (viajesParaActualizar.length === 0) {
        console.log('✅ No hay viajes para actualizar');
        return;
      }

      let actualizados = 0;

      for (const viaje of viajesParaActualizar) {
        try {
          const wasUpdated = await this.processViaje(viaje, now);
          if (wasUpdated) actualizados++;
        } catch (error) {
          console.error(`❌ Error procesando viaje ${viaje._id}:`, error.message);
        }
      }

      if (actualizados > 0) {
        console.log(`✅ ${actualizados} viajes actualizados`);
      } else {
        console.log('📊 No se requirieron actualizaciones');
      }

    } catch (error) {
      console.error('💥 Error en updateViajes:', error);
    }
  }

  // 🎯 Procesar un viaje individual con sistema híbrido
  async processViaje(viaje, now) {
    let updated = false;
    const estadoAnterior = viaje.estado.actual;

    console.log(`🔍 Procesando viaje ${viaje._id} - Estado: ${viaje.estado.actual}`);

    // 🚀 AUTO-INICIAR VIAJE (pendiente → en_curso)
    if (viaje.estado.actual === 'pendiente' && viaje.departureTime <= now) {
      
      console.log(`🚀 Iniciando viaje ${viaje._id} automáticamente`);
      
      viaje.estado.actual = 'en_curso';
      viaje.estado.fechaCambio = now;
      viaje.horarios.salidaReal = viaje.horarios.salidaReal || now;
      
      // Agregar checkpoint de inicio automático
      this.addCheckpoint(viaje, 'inicio_automatico', 5, 'Viaje iniciado automáticamente', now);
      
      // Agregar al historial
      viaje.estado.historial.push({
        estadoAnterior: estadoAnterior,
        estadoNuevo: 'en_curso',
        fecha: now,
        motivo: 'automatico_hora_salida'
      });

      updated = true;
    }

    // 📈 ACTUALIZAR PROGRESO HÍBRIDO (si está en curso)
    if (viaje.estado.actual === 'en_curso' || viaje.estado.actual === 'retrasado') {
      const progresoActualizado = this.updateHybridProgress(viaje, now);
      if (progresoActualizado) {
        updated = true;
      }
    }

    // ✅ AUTO-COMPLETAR VIAJE - CONDICIÓN MEJORADA
    if ((viaje.estado.actual === 'en_curso' || viaje.estado.actual === 'retrasado')) {
      
      const progreso = viaje.tracking?.progreso?.porcentaje || 0;
      const pasaronDosHoras = now >= new Date(viaje.arrivalTime.getTime() + 2 * 60 * 60 * 1000);
      
      // 🔧 CONDICIONES MÁS FLEXIBLES PARA COMPLETAR:
      const debeCompletar = (
        progreso >= 90 && viaje.arrivalTime <= now // 90% y pasó la hora
      ) || (
        progreso >= 75 && pasaronDosHoras // 75% y pasaron 2 horas
      ) || (
        progreso >= 100 // Si llega a 100% de cualquier forma
      );
      
      if (debeCompletar) {
        console.log(`✅ Completando viaje ${viaje._id} automáticamente (progreso: ${progreso}%)`);
        
        viaje.estado.actual = 'completado';
        viaje.estado.fechaCambio = now;
        viaje.horarios.llegadaReal = now;
        
        // Forzar progreso a 100%
        viaje.tracking.progreso.porcentaje = 100;
        
        // Agregar checkpoint de finalización
        this.addCheckpoint(viaje, 'finalizacion_automatica', 100, 'Viaje completado automáticamente', now);
        
        // Agregar al historial
        viaje.estado.historial.push({
          estadoAnterior: estadoAnterior,
          estadoNuevo: 'completado',
          fecha: now,
          motivo: 'automatico_completado'
        });
        
        updated = true;
      }
    }

    // ⚠️ MARCAR COMO RETRASADO - LÓGICA MEJORADA PARA VIAJES CORTOS
    if (viaje.estado.actual === 'en_curso') {
      const tiempoTotal = new Date(viaje.arrivalTime) - new Date(viaje.departureTime);
      const tiempoTotalMinutos = tiempoTotal / (1000 * 60);
      
      // 🔧 GRACIA PROPORCIONAL: mínimo 5 min, máximo 30 min
      let tiempoGracia;
      if (tiempoTotalMinutos <= 10) {
        tiempoGracia = 2 * 60000; // 2 minutos para viajes ≤ 10 min
      } else if (tiempoTotalMinutos <= 30) {
        tiempoGracia = 5 * 60000; // 5 minutos para viajes ≤ 30 min
      } else {
        tiempoGracia = 15 * 60000; // 15 minutos para viajes largos
      }
      
      const tiempoLimiteRetraso = new Date(viaje.arrivalTime.getTime() + tiempoGracia);
      
      if (now >= tiempoLimiteRetraso && viaje.tracking.progreso.porcentaje < 90) {
        console.log(`⚠️ Marcando viaje ${viaje._id} como retrasado (gracia: ${tiempoGracia/60000} min)`);
        
        viaje.estado.actual = 'retrasado';
        viaje.estado.fechaCambio = now;
        
        // Agregar checkpoint de retraso
        this.addCheckpoint(viaje, 'retraso_detectado', viaje.tracking.progreso.porcentaje, `Retraso detectado automáticamente (gracia: ${tiempoGracia/60000} min)`, now);
        
        // Agregar alerta
        viaje.alertas.push({
          tipo: 'retraso',
          mensaje: `Viaje retrasado - Programado para ${viaje.arrivalTime.toLocaleString()}`,
          fecha: now,
          prioridad: 'alta'
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

  // 📈 ACTUALIZAR PROGRESO HÍBRIDO - VERSIÓN CORREGIDA
  updateHybridProgress(viaje, now) {
    try {
      const progresoAnterior = viaje.tracking?.progreso?.porcentaje || 0;
      const nuevoProgreso = this.calculateHybridProgress(viaje, now);
      
      // 🔧 CONDICIONES MEJORADAS PARA ACTUALIZAR PROGRESO:
      const debeActualizar = (
        // Caso 1: Progreso normal (avanza y cambio significativo)
        (nuevoProgreso > progresoAnterior && Math.abs(nuevoProgreso - progresoAnterior) >= 3) ||
        
        // Caso 2: Viaje retrasado (permite avance más gradual)
        (viaje.estado.actual === 'retrasado' && nuevoProgreso > progresoAnterior && Math.abs(nuevoProgreso - progresoAnterior) >= 1) ||
        
        // Caso 3: Progreso muy bajo (permitir cualquier avance)
        (progresoAnterior <= 10 && nuevoProgreso > progresoAnterior) ||
        
        // Caso 4: Checkpoint manual reciente (forzar actualización)
        this.hasRecentManualCheckpoint(viaje, now)
      );
      
      if (debeActualizar) {
        viaje.tracking.progreso.porcentaje = nuevoProgreso;
        viaje.tracking.progreso.ultimaActualizacion = now;
        
        console.log(`📈 Progreso actualizado: ${progresoAnterior}% → ${nuevoProgreso}% (viaje ${viaje._id}) [${viaje.estado.actual}]`);
        return true;
      } else {
        console.log(`📊 Sin cambio significativo: ${progresoAnterior}% → ${nuevoProgreso}% (viaje ${viaje._id})`);
      }
      
      return false;
    } catch (error) {
      console.error(`Error actualizando progreso híbrido:`, error);
      return false;
    }
  }

  // 🆕 MÉTODO AUXILIAR: Verificar si hay checkpoint manual reciente
  hasRecentManualCheckpoint(viaje, now) {
    const checkpoints = viaje.tracking?.checkpoints || [];
    const ultimoCheckpoint = checkpoints[checkpoints.length - 1];
    
    if (!ultimoCheckpoint) return false;
    
    const esManual = ultimoCheckpoint.reportadoPor === 'manual' || 
                     ultimoCheckpoint.tipo.includes('manual');
    
    const esReciente = (now - new Date(ultimoCheckpoint.timestamp)) < (10 * 60 * 1000); // 10 minutos
    
    return esManual && esReciente;
  }

  // 🧠 CALCULAR PROGRESO HÍBRIDO - VERSIÓN MEJORADA PARA RETRASADOS
  calculateHybridProgress(viaje, now) {
    try {
      // 1️⃣ OBTENER ÚLTIMO CHECKPOINT VÁLIDO
      const ultimoCheckpoint = this.getLastValidCheckpoint(viaje);
      
      // 2️⃣ CALCULAR PROGRESO POR TIEMPO
      const progresoTiempo = this.calculateTimeBasedProgress(viaje, now);
      
      // 3️⃣ LÓGICA ESPECIAL PARA VIAJES RETRASADOS
      if (viaje.estado.actual === 'retrasado') {
        console.log(`⚠️ Calculando progreso para viaje RETRASADO ${viaje._id}`);
        
        if (ultimoCheckpoint && this.isCheckpointRecent(ultimoCheckpoint, now)) {
          // Para retrasados: progreso más conservador desde checkpoint
          const tiempoDesdeCheckpoint = now - new Date(ultimoCheckpoint.timestamp);
          const incrementoReducido = this.calculateTimeIncrement(viaje, tiempoDesdeCheckpoint) * 0.5; // 50% del incremento normal
          
          const progresoFinal = Math.min(95, ultimoCheckpoint.progreso + incrementoReducido);
          
          console.log(`📍 Progreso RETRASADO desde checkpoint: ${ultimoCheckpoint.progreso}% + ${incrementoReducido}% = ${progresoFinal}%`);
          return Math.round(progresoFinal);
          
        } else {
          // Para retrasados sin checkpoint: progreso por tiempo pero más lento
          const progresoReducido = Math.min(progresoTiempo * 0.7, 85); // 70% del progreso normal, máximo 85%
          const ultimoProgresoConocido = ultimoCheckpoint?.progreso || 5;
          const progresoFinal = Math.max(ultimoProgresoConocido, progresoReducido);
          
          console.log(`⏰ Progreso RETRASADO por tiempo: ${progresoReducido}% (mínimo: ${ultimoProgresoConocido}%)`);
          return Math.round(progresoFinal);
        }
      }
      
      // 4️⃣ LÓGICA NORMAL PARA VIAJES EN CURSO
      if (ultimoCheckpoint && this.isCheckpointRecent(ultimoCheckpoint, now)) {
        // Usar checkpoint como base y calcular desde ahí
        const tiempoDesdeCheckpoint = now - new Date(ultimoCheckpoint.timestamp);
        const incrementoPorTiempo = this.calculateTimeIncrement(viaje, tiempoDesdeCheckpoint);
        
        const progresoFinal = Math.min(100, ultimoCheckpoint.progreso + incrementoPorTiempo);
        
        console.log(`📍 Progreso desde checkpoint: ${ultimoCheckpoint.progreso}% + ${incrementoPorTiempo}% = ${progresoFinal}%`);
        return Math.round(progresoFinal);
        
      } else {
        // Usar tiempo como fallback, pero nunca retroceder
        const ultimoProgresoConocido = ultimoCheckpoint?.progreso || 0;
        const progresoFinal = Math.max(ultimoProgresoConocido, progresoTiempo);
        
        console.log(`⏰ Progreso por tiempo: ${progresoTiempo}% (mínimo: ${ultimoProgresoConocido}%)`);
        return Math.round(progresoFinal);
      }
      
    } catch (error) {
      console.error('Error calculando progreso híbrido:', error);
      return viaje.tracking?.progreso?.porcentaje || 0;
    }
  }

  // 🕒 CALCULAR PROGRESO POR TIEMPO - VERSIÓN MEJORADA
  calculateTimeBasedProgress(viaje, now) {
    try {
      const salidaReal = viaje.horarios?.salidaReal || viaje.departureTime;
      const llegadaProgramada = viaje.arrivalTime;
      
      const tiempoTranscurrido = now - new Date(salidaReal);
      const tiempoTotal = new Date(llegadaProgramada) - new Date(salidaReal);
      
      if (tiempoTotal <= 0) return 5;
      if (tiempoTranscurrido <= 0) return 5;
      
      // Progreso lineal basado en tiempo
      let progreso = (tiempoTranscurrido / tiempoTotal) * 100;
      
      // Ajustes realistas según el estado
      if (viaje.estado.actual === 'retrasado') {
        // Para retrasados: progreso más conservador
        progreso = progreso * 0.8; // 80% del progreso calculado
        if (progreso < 5) progreso = 5;
        if (progreso > 85) progreso = 85; // Máximo 85% para retrasados por tiempo
      } else {
        // Para viajes normales
        if (progreso < 5) progreso = 5;
        if (progreso > 100) progreso = 100;
      }
      
      // Agregar variación menor (±1%) para simular condiciones reales
      const variacion = Math.random() * 2 - 1;
      progreso += variacion;
      
      return Math.max(5, Math.min(progreso, viaje.estado.actual === 'retrasado' ? 85 : 100));
      
    } catch (error) {
      console.error('Error calculando progreso por tiempo:', error);
      return 5;
    }
  }

  // ⏱️ CALCULAR INCREMENTO DE TIEMPO DESDE CHECKPOINT
  calculateTimeIncrement(viaje, tiempoTranscurrido) {
    try {
      const tiempoTotal = new Date(viaje.arrivalTime) - new Date(viaje.departureTime);
      const incrementoMaximo = 30; // 🔧 CAMBIADO: Máximo 30% de incremento
      
      const horasTranscurridas = tiempoTranscurrido / (1000 * 60 * 60);
      const incremento = (horasTranscurridas / (tiempoTotal / (1000 * 60 * 60))) * incrementoMaximo;
      
      return Math.min(incrementoMaximo, Math.max(0, incremento));
      
    } catch (error) {
      return 0;
    }
  }

  // 📍 OBTENER ÚLTIMO CHECKPOINT VÁLIDO
  getLastValidCheckpoint(viaje) {
    const checkpoints = viaje.tracking?.checkpoints || [];
    
    return checkpoints
      .filter(cp => cp.progreso >= 0 && cp.progreso <= 100)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  }

  // ⏰ VERIFICAR SI CHECKPOINT ES RECIENTE (menos de 4 horas)
  isCheckpointRecent(checkpoint, now) {
    const tiempoDiferencia = now - new Date(checkpoint.timestamp);
    const cuatroHoras = 4 * 60 * 60 * 1000; // 🔧 CAMBIADO: 4 horas en lugar de 2
    
    return tiempoDiferencia <= cuatroHoras;
  }

  // 📍 AGREGAR CHECKPOINT
  addCheckpoint(viaje, tipo, progreso, descripcion, timestamp = new Date()) {
    try {
      if (!viaje.tracking.checkpoints) {
        viaje.tracking.checkpoints = [];
      }

      const nuevoCheckpoint = {
        tipo: tipo,
        progreso: Math.min(100, Math.max(0, progreso)),
        descripcion: descripcion,
        timestamp: timestamp,
        reportadoPor: 'automatico'
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

  // 📊 Obtener estadísticas del servicio
  getStats() {
    return {
      isRunning: this.isRunning,
      updateInterval: this.updateInterval,
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }

  // ⚙️ Configurar intervalo de actualización
  setUpdateInterval(milliseconds) {
    const minInterval = 60000; // Mínimo 1 minuto
    this.updateInterval = Math.max(minInterval, milliseconds);
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
    
    console.log(`⚙️ Intervalo de actualización cambiado a ${this.updateInterval / 1000}s`);
  }

  // 🔧 Forzar actualización manual
  async forceUpdate() {
    console.log('🔧 Forzando actualización manual...');
    await this.updateViajes();
  }

  // 📋 Obtener estado de viajes activos
  async getActiveTripsStatus() {
    try {
      const viajes = await ViajesModel.find({
        'estado.actual': { $in: ['pendiente', 'en_curso', 'retrasado'] } // 🔧 REMOVIDO 'programado'
      })
      .select('_id estado tracking departureTime arrivalTime tripDescription')
      .sort({ departureTime: 1 });

      return viajes.map(viaje => ({
        id: viaje._id,
        description: viaje.tripDescription,
        status: viaje.estado.actual,
        progress: viaje.tracking?.progreso?.porcentaje || 0,
        departureTime: viaje.departureTime,
        arrivalTime: viaje.arrivalTime,
        lastUpdate: viaje.tracking?.progreso?.ultimaActualizacion
      }));

    } catch (error) {
      console.error('Error obteniendo estado de viajes activos:', error);
      return [];
    }
  }
}

// 🌟 Crear instancia singleton
const autoUpdateService = new AutoUpdateService();

export default autoUpdateService;