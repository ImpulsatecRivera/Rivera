// 📁 Backend/src/Controllers/AutoUpdateController.js
// CONTROLLER PARA GESTIONAR EL SERVICIO DE ACTUALIZACIÓN AUTOMÁTICA

import autoUpdateService from '../services/services.js';

const AutoUpdateController = {};

// 🚀 Iniciar servicio de actualización automática
AutoUpdateController.startService = async (req, res) => {
  try {
    autoUpdateService.start();
    
    res.status(200).json({
      success: true,
      message: 'Servicio de actualización automática iniciado',
      status: autoUpdateService.getStats()
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
        totalActiveTrips: activeTrips.length
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
      message: 'Actualización manual ejecutada',
      data: {
        updatedAt: new Date().toISOString(),
        activeTrips: activeTrips
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

// 📋 Obtener viajes activos con progreso en tiempo real
AutoUpdateController.getActiveTrips = async (req, res) => {
  try {
    const activeTrips = await autoUpdateService.getActiveTripsStatus();
    
    res.status(200).json({
      success: true,
      data: activeTrips,
      count: activeTrips.length,
      timestamp: new Date().toISOString()
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

// 🎯 Actualizar un viaje específico manualmente
AutoUpdateController.updateSpecificTrip = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { action, progress } = req.body; // action: 'start', 'complete', 'progress'
    
    const ViajesModel = (await import('../Models/Viajes.js')).default;
    const viaje = await ViajesModel.findById(viajeId);
    
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }
    
    const now = new Date();
    let updated = false;
    
    switch (action) {
      case 'start':
        if (viaje.estado.actual === 'pendiente') {
          viaje.estado.actual = 'en_curso';
          viaje.estado.fechaCambio = now;
          viaje.horarios.salidaReal = now;
          viaje.tracking.progreso.porcentaje = 5;
          updated = true;
        }
        break;
        
      case 'complete':
        if (viaje.estado.actual === 'en_curso' || viaje.estado.actual === 'retrasado') {
          viaje.estado.actual = 'completado';
          viaje.estado.fechaCambio = now;
          viaje.horarios.llegadaReal = now;
          viaje.tracking.progreso.porcentaje = 100;
          updated = true;
        }
        break;
        
      case 'progress':
        if (progress !== undefined && (viaje.estado.actual === 'en_curso' || viaje.estado.actual === 'retrasado')) {
          viaje.tracking.progreso.porcentaje = Math.max(0, Math.min(100, progress));
          viaje.tracking.progreso.ultimaActualizacion = now;
          updated = true;
        }
        break;
    }
    
    if (updated) {
      await viaje.save();
    }
    
    res.status(200).json({
      success: true,
      message: `Viaje ${action === 'progress' ? 'actualizado' : action === 'start' ? 'iniciado' : 'completado'} manualmente`,
      data: {
        id: viaje._id,
        status: viaje.estado.actual,
        progress: viaje.tracking.progreso.porcentaje,
        lastUpdate: viaje.tracking.progreso.ultimaActualizacion
      }
    });
    
  } catch (error) {
    console.error('❌ Error actualizando viaje específico:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando viaje',
      error: error.message
    });
  }
};

export default AutoUpdateController;