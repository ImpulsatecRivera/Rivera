// 📁 Backend/src/Routes/autoUpdateRoutes.js
// RUTAS PARA EL SERVICIO DE ACTUALIZACIÓN AUTOMÁTICA

import { Router } from 'express';
import AutoUpdateController from '../Controllers/autoUpdateController.js';

const router = Router();

// 🚀 Gestión del servicio
router.post('/start', AutoUpdateController.startService);
router.post('/stop', AutoUpdateController.stopService);
router.get('/status', AutoUpdateController.getServiceStatus);

// 🔧 Operaciones manuales
router.post('/force-update', AutoUpdateController.forceUpdate);
router.post('/set-interval', AutoUpdateController.setInterval);

// 📋 Información de viajes
router.get('/active-trips', AutoUpdateController.getActiveTrips);
router.patch('/trip/:viajeId', AutoUpdateController.updateSpecificTrip);

export default router;