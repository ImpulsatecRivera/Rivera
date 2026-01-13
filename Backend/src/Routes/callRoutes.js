// Routes/CallRoutes.js
import express from 'express';
import CallController from '../Controllers/CallControler.js';

const router = express.Router();

// Crear sesión de llamada (protegido con auth)
router.post('/create-session', CallController.createCallSession);

// Webhook de Twilio cuando llaman (público - Twilio lo llama)
router.post('/webhook/incoming', CallController.handleIncomingCall);

// Webhook de status (opcional)
router.post('/webhook/status', CallController.handleCallStatus);

export default router;