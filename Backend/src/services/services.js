// Backend/src/Services/AutoUpdateService.js
import cron from 'node-cron';
import ViajesModel from '../Models/Viajes.js';

class AutoUpdateService {
  constructor() {
    this.isRunning = false;
    this.jobs = []; // Para guardar referencia de los cron jobs
  }

  // 🚀 INICIAR SERVICIO
  start() {
    if (this.isRunning) {
      console.log('⚠️ El servicio de auto-actualización ya está corriendo');
      return;
    }

    console.log('🚀 Iniciando servicio de auto-actualización de viajes...');

    // ⏰ CADA MINUTO - Verificar y actualizar estados
    const jobMinuto = cron.schedule('* * * * *', async () => {
      await this.forceUpdateStates();
    }, {
      scheduled: false // No iniciar automáticamente
    });

    // ⏰ CADA 5 MINUTOS - Actualizar progreso
    const jobProgreso = cron.schedule('*/5 * * * *', async () => {
      await this.updateProgress();
    }, {
      scheduled: false
    });

    // ⏰ CADA HORA - Limpiar datos antiguos
    const jobLimpieza = cron.schedule('0 * * * *', async () => {
      await this.cleanup();
    }, {
      scheduled: false
    });

    // Iniciar todos los jobs
    jobMinuto.start();
    jobProgreso.start();
    jobLimpieza.start();

    // Guardar referencias
    this.jobs = [jobMinuto, jobProgreso, jobLimpieza];
    this.isRunning = true;

    console.log('✅ Servicio de auto-actualización iniciado correctamente');
    console.log('⏰ Ejecutándose cada minuto para verificar estados');
  }

  // 🔄 FORZAR ACTUALIZACIÓN DE ESTADOS
  async forceUpdateStates() {
    try {
      const viajes = await ViajesModel.find({
        'estado.autoActualizar': true,
        'estado.actual': { $in: ['pendiente', 'en_curso'] }
      });

      let viajesActualizados = 0;

      for (const viaje of viajes) {
        const estadoAnterior = viaje.estado.actual;
        await viaje.save(); // El middleware pre-save maneja la lógica
        
        // Verificar si cambió
        const viajeActualizado = await ViajesModel.findById(viaje._id);
        if (viajeActualizado.estado.actual !== estadoAnterior) {
          viajesActualizados++;
          console.log(`📋 Viaje ${viaje._id} cambió de '${estadoAnterior}' a '${viajeActualizado.estado.actual}'`);
        }
      }

      if (viajesActualizados > 0) {
        console.log(`🔄 ${viajesActualizados} viajes actualizados automáticamente`);
      }

    } catch (error) {
      console.error('❌ Error en auto-actualización de estados:', error.message);
    }
  }

  // 📈 ACTUALIZAR PROGRESO AUTOMÁTICO
  async updateProgress() {
    try {
      const viajesEnCurso = await ViajesModel.find({
        'estado.actual': { $in: ['en_curso', 'retrasado'] },
        'tracking.progreso.calculoAutomatico': true
      });

      for (const viaje of viajesEnCurso) {
        viaje.actualizarProgreso();
        await viaje.save();
      }

      if (viajesEnCurso.length > 0) {
        console.log(`📈 Progreso actualizado para ${viajesEnCurso.length} viajes en curso`);
      }

    } catch (error) {
      console.error('❌ Error actualizando progreso:', error.message);
    }
  }

  // 🧹 LIMPIAR DATOS ANTIGUOS
  async cleanup() {
    try {
      const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Limpiar historial de ubicaciones muy antiguo
      const resultado = await ViajesModel.updateMany(
        {},
        {
          $pull: {
            'tracking.historialUbicaciones': {
              timestamp: { $lt: hace7Dias }
            }
          }
        }
      );

      console.log(`🧹 Limpieza completada - Historial antiguo removido`);

    } catch (error) {
      console.error('❌ Error en limpieza:', error.message);
    }
  }

  // 📊 OBTENER ESTADÍSTICAS DEL SERVICIO
  async getStats() {
    try {
      const stats = await ViajesModel.aggregate([
        {
          $group: {
            _id: '$estado.actual',
            count: { $sum: 1 },
            ultimaActualizacion: { $max: '$estado.fechaCambio' }
          }
        }
      ]);

      const alertasActivas = await ViajesModel.aggregate([
        { $unwind: '$alertas' },
        {
          $match: {
            'alertas.resuelta': false
          }
        },
        {
          $group: {
            _id: '$alertas.tipo',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        servicioActivo: this.isRunning,
        ultimaEjecucion: new Date(),
        estadoPorTipo: stats,
        alertasActivas: alertasActivas,
        jobsActivos: this.jobs.length
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error.message);
      return {
        servicioActivo: this.isRunning,
        error: error.message
      };
    }
  }

  // 🛑 DETENER SERVICIO
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ El servicio no está corriendo');
      return;
    }

    // Detener todos los cron jobs
    this.jobs.forEach(job => {
      job.stop();
      job.destroy();
    });

    this.jobs = [];
    this.isRunning = false;
    console.log('🛑 Servicio de auto-actualización detenido');
  }

  // 🔄 REINICIAR SERVICIO
  restart() {
    console.log('🔄 Reiniciando servicio de auto-actualización...');
    this.stop();
    setTimeout(() => {
      this.start();
    }, 1000);
  }
}

// Exportar una instancia única (Singleton)
export default new AutoUpdateService();