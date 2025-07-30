// src/Routes/autoUpdateRoutes.js
import express from 'express';
import AutoUpdateService from '../services/services.js';

const router = express.Router();

router.get('/status', async (req, res) => {
  try {
    const stats = await AutoUpdateService.getStats();
    res.json({ success: true, data: stats, message: 'Estado del servicio obtenido exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error obteniendo estado del servicio', error: error.message });
  }
});

router.post('/start', (req, res) => {
  try {
    AutoUpdateService.start();
    res.json({ success: true, message: 'Servicio de auto-actualización iniciado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error iniciando servicio', error: error.message });
  }
});

router.post('/stop', (req, res) => {
  try {
    AutoUpdateService.stop();
    res.json({ success: true, message: 'Servicio de auto-actualización detenido exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deteniendo servicio', error: error.message });
  }
});

router.post('/restart', (req, res) => {
  try {
    AutoUpdateService.restart();
    res.json({ success: true, message: 'Servicio de auto-actualización reiniciado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error reiniciando servicio', error: error.message });
  }
});

export default router;
