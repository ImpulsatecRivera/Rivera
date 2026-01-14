import express from "express";
import ViajesOperativosController from "../Controllers/ViajesOperativosCon.js";
import { validateAuthToken } from "../Middlewares/validateAuthToken.js";
const router = express.Router();

// ✅ Crear viaje operativo (sin cotización)
router.post("/crear", validateAuthToken(["admin", "Operativo", "Supervisor"]), ViajesOperativosController.crearViajeOperativo);

// ✅ Listar viajes operativos
router.get("/listar", validateAuthToken(["admin", "Operativo", "Supervisor", "motorista"]), ViajesOperativosController.listarViajesOperativos);

// ✅ Obtener programación del día (vista pizarra)
router.get("/programacion/:fecha", validateAuthToken(["admin", "Operativo", "Supervisor", "motorista"]), ViajesOperativosController.obtenerProgramacionDia);

// 🆕 Completar TODOS los viajes operativos
router.put("/completar-todos", validateAuthToken(["admin", "Operativo", "Supervisor","motorista"]), ViajesOperativosController.completarTodosLosViajes);

// 🆕 Completar UN viaje operativo específico
router.put("/completar/:viajeId", validateAuthToken(["admin", "Operativo", "Supervisor","motorista"]), ViajesOperativosController.completarViajeOperativo);

// 🆕 Actualizar estado de un viaje operativo
router.patch("/actualizar-estado/:viajeId", validateAuthToken(["admin", "Operativo", "Supervisor","motorista"]), ViajesOperativosController.actualizarEstado);

export default router;