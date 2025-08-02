// 📁 Backend/src/services/AutoUpdateService.js
// SERVICIO PARA ACTUALIZACIÓN AUTOMÁTICA DE VIAJES

import ViajesModel from '../Models/Viajes.js';

class AutoUpdateService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.updateInterval = 30000; // 30 segundos
  }

  // 🚀 Iniciar el servicio de actualización automática
  start() {
    if (this.isRunning) {
      console.log('⚠️ AutoUpdateService ya está corriendo');
      return;
    }

    console.log('🚀 Iniciando AutoUpdateService...');
    this.isRunning = true;

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

  // 🔄 Función principal de actualización
  async updateViajes() {
    try {
      console.log('🔄 Ejecutando actualización automática de viajes...');
      const now = new Date();

      // 1️⃣ BUSCAR VIAJES QUE NECESITAN ACTUALIZARSE
      const viajesParaActualizar = await ViajesModel.find({
        'estado.autoActualizar': true,
        'estado.actual': { $in: ['pendiente', 'en_curso'] }
      });

      console.log(`📦 Encontrados ${viajesParaActualizar.length} viajes para revisar`);

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
      }

    } catch (error) {
      console.error('💥 Error en updateViajes:', error);
    }
  }

  // 🎯 Procesar un viaje individual
  async processViaje(viaje, now) {
    let updated = false;
    const estadoAnterior = viaje.estado.actual;

    // 📅 INICIAR VIAJE (si ya pasó la hora de salida)
    if (viaje.estado.actual === 'pendiente' && viaje.departureTime <= now) {
      viaje.estado.actual = 'en_curso';
      viaje.estado.fechaCambio = now;
      viaje.horarios.salidaReal = viaje.horarios.salidaReal || now;
      
      // Agregar al historial
      viaje.estado.historial.push({
        estadoAnterior: 'pendiente',
        estadoNuevo: 'en_curso',
        fecha: now,
        motivo: 'automatico'
      });

      // Inicializar progreso
      viaje.tracking.progreso.porcentaje = 5; // 5% al iniciar
      viaje.tracking.progreso.ultimaActualizacion = now;

      updated = true;
      console.log(`🚀 Viaje ${viaje._id} iniciado automáticamente`);
    }

    // 📈 ACTUALIZAR PROGRESO (si está en curso)
    if (viaje.estado.actual === 'en_curso') {
      const nuevoProgreso = this.calculateProgress(viaje, now);
      
      if (Math.abs(nuevoProgreso - viaje.tracking.progreso.porcentaje) >= 1) {
        viaje.tracking.progreso.porcentaje = nuevoProgreso;
        viaje.tracking.progreso.ultimaActualizacion = now;
        updated = true;
      }
    }

    // ✅ COMPLETAR VIAJE (si ya pasó la hora de llegada Y progreso >= 95%)
    if (viaje.estado.actual === 'en_curso' && 
        viaje.arrivalTime <= now && 
        viaje.tracking.progreso.porcentaje >= 95) {
      
      viaje.estado.actual = 'completado';
      viaje.estado.fechaCambio = now;
      viaje.horarios.llegadaReal = now;
      viaje.tracking.progreso.porcentaje = 100;
      
      // Agregar al historial
      viaje.estado.historial.push({
        estadoAnterior: 'en_curso',
        estadoNuevo: 'completado',
        fecha: now,
        motivo: 'automatico'
      });
      
      updated = true;
      console.log(`✅ Viaje ${viaje._id} completado automáticamente`);
    }

    // ⚠️ MARCAR COMO RETRASADO (si pasó 15 min de la hora de llegada)
    if (viaje.estado.actual === 'en_curso' && 
        viaje.arrivalTime <= new Date(now.getTime() - 15 * 60000) && // 15 min de gracia
        viaje.tracking.progreso.porcentaje < 95) {
      
      viaje.estado.actual = 'retrasado';
      viaje.estado.fechaCambio = now;
      
      // Agregar alerta
      viaje.alertas.push({
        tipo: 'retraso',
        mensaje: `Viaje retrasado - Programado para ${viaje.arrivalTime.toLocaleString()}`,
        fecha: now,
        prioridad: 'alta'
      });
      
      updated = true;
      console.log(`⚠️ Viaje ${viaje._id} marcado como retrasado`);
    }

    // 💾 GUARDAR CAMBIOS
    if (updated) {
      viaje.horarios.ultimaActualizacion = now;
      await viaje.save();
    }

    return updated;
  }

  // 📊 Calcular progreso basado en tiempo
  calculateProgress(viaje, now) {
    try {
      const salidaReal = viaje.horarios.salidaReal || viaje.departureTime;
      const tiempoTranscurrido = now - salidaReal;
      const tiempoTotal = viaje.arrivalTime - viaje.departureTime;

      if (tiempoTotal <= 0) return 0;

      // Calcular progreso lineal basado en tiempo
      let progreso = (tiempoTranscurrido / tiempoTotal) * 100;

      // Ajustes para hacer más realista
      if (progreso < 5) progreso = 5;   // Mínimo 5% al iniciar
      if (progreso > 95) progreso = 95; // Máximo 95% hasta llegar

      // Agregar un poco de randomness para simular GPS real
      const variance = Math.random() * 4 - 2; // ±2%
      progreso += variance;

      // Asegurar que no retroceda mucho
      const progresoAnterior = viaje.tracking.progreso.porcentaje || 0;
      if (progreso < progresoAnterior - 5) {
        progreso = progresoAnterior - 1; // Solo puede retroceder 1%
      }

      return Math.max(0, Math.min(95, Math.round(progreso)));

    } catch (error) {
      console.error(`Error calculando progreso para viaje ${viaje._id}:`, error);
      return viaje.tracking.progreso.porcentaje || 0;
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
    this.updateInterval = milliseconds;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
    
    console.log(`⚙️ Intervalo de actualización cambiado a ${milliseconds / 1000}s`);
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
        'estado.actual': { $in: ['pendiente', 'en_curso', 'retrasado'] }
      })
      .select('_id estado tracking departureTime arrivalTime tripDescription')
      .sort({ departureTime: 1 });

      return viajes.map(viaje => ({
        id: viaje._id,
        description: viaje.tripDescription,
        status: viaje.estado.actual,
        progress: viaje.tracking.progreso.porcentaje || 0,
        departureTime: viaje.departureTime,
        arrivalTime: viaje.arrivalTime,
        lastUpdate: viaje.tracking.progreso.ultimaActualizacion
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