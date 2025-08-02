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
<<<<<<< HEAD
=======
router.patch('/:viajeId/location', ViajesController.updateLocation);
router.get('/cargas/distribucion',ViajesController.getCargaDistribution)
>>>>>>> 1d053d4 (trbajando aun en graficas y en el service auto)


router.get('/cargas/distribucion', ViajesController.getCargaDistribution);

router.patch('/:viajeId/location', ViajesController.updateLocation);
router.patch('/:viajeId/complete', ViajesController.completeTrip);


router.get('/:viajeId', ViajesController.getTripDetails); // Detalles de un viaje específico

export default router;