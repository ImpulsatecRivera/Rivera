// src/Routes/ViajesRoutes.js
import express from 'express';
import ViajesController from '../Controllers/Viajes.js'; // Tu controller existente

const router = express.Router();

// 🔹 TUS RUTAS EXISTENTES (mantén las que ya tienes)
router.get('/', ViajesController.getAllViajes); // o la que ya tengas

// 🆕 NUEVAS RUTAS PARA EL MAPA
router.get('/map-data', ViajesController.getMapData);
router.put('/update-location/:viajeId', ViajesController.updateLocation);
router.get("/estadisticas", ViajesController.getTripStats);
router.get("/completados", ViajesController.getCompletedTrips);
router.get("/cargas/frecuentes", ViajesController.getCargaStats);



export default router;