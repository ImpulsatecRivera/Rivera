// Routes/CallRoutes.js
import express from 'express';
import CallController from '../Controllers/CallControler.js';
import { authMiddleware } from '../Middlewares/auth.js'; // Tu middleware

const router = express.Router();

// Crear sesión de llamada (protegido con auth)
router.post('/create-session', authMiddleware, CallController.createCallSession);

// Webhook de Twilio cuando llaman (público - Twilio lo llama)
router.post('/webhook/incoming', CallController.handleIncomingCall);

// Webhook de status (opcional)
router.post('/webhook/status', CallController.handleCallStatus);

export default router;