import express from "express";
import ViajesOperativosController from "../Controllers/ViajesOperativosCon.js";
import { authMiddleware } from "../Middleware/auth.js";
import { requireRole, requireAdmin } from "../Middleware/roleMiddleware.js";

const router = express.Router();

// ✅ Crear viaje operativo (sin cotización)
router.post("/crear", authMiddleware, requireRole("Operativo", "Supervisor"), ViajesOperativosController.crearViajeOperativo);

// ✅ Listar viajes operativos
router.get("/listar", authMiddleware, ViajesOperativosController.listarViajesOperativos);

// ✅ Obtener programación del día (vista pizarra)
router.get("/programacion/:fecha", authMiddleware, ViajesOperativosController.obtenerProgramacionDia);

// 🆕 Completar TODOS los viajes operativos
router.put("/completar-todos", authMiddleware, requireRole("Supervisor"), ViajesOperativosController.completarTodosLosViajes);

// 🆕 Completar UN viaje operativo específico
router.put("/completar/:viajeId", authMiddleware, requireRole("Operativo", "Supervisor"), ViajesOperativosController.completarViajeOperativo);

// 🆕 Actualizar estado de un viaje operativo
router.patch("/actualizar-estado/:viajeId", authMiddleware, requireRole("Operativo", "Supervisor"), ViajesOperativosController.actualizarEstado);

export default router;