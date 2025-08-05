// 📁 Backend/src/Routes/autoUpdateRoutes.js
// AGREGAR LAS NUEVAS RUTAS

import { Router } from 'express';
import AutoUpdateController from '../Controllers/autoUpdateController.js';

const router = Router();

// 🚀 Gestión del servicio (existentes)
router.post('/start', AutoUpdateController.startService);
router.post('/stop', AutoUpdateController.stopService);
router.get('/status', AutoUpdateController.getServiceStatus);

// 🔧 Operaciones manuales (existentes)
router.post('/force-update', AutoUpdateController.forceUpdate);
router.post('/set-interval', AutoUpdateController.setInterval);

// 📋 Información de viajes (existentes mejoradas)
router.get('/active-trips', AutoUpdateController.getActiveTrips);
router.patch('/trip/:viajeId', AutoUpdateController.updateSpecificTrip);

// 🆕 NUEVAS RUTAS PARA SISTEMA HÍBRIDO
router.get('/trip/:viajeId/checkpoints', AutoUpdateController.getTripCheckpoints);
router.get('/trip/:viajeId/progress-summary', AutoUpdateController.getProgressSummary);

export default router;