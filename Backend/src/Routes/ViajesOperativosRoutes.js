import express from "express";
import ViajesOperativosController from "../Controllers/ViajesOperativosCon.js";

const router = express.Router();

// ✅ Crear viaje operativo (sin cotización)
router.post("/crear", ViajesOperativosController.crearViajeOperativo);

// ✅ Listar viajes operativos
router.get("/listar",  ViajesOperativosController.listarViajesOperativos);

// ✅ Obtener programación del día (vista pizarra)
router.get("/programacion/:fecha", ViajesOperativosController.obtenerProgramacionDia);

// 🆕 Completar TODOS los viajes operativos
router.put("/completar-todos",  ViajesOperativosController.completarTodosLosViajes);

// 🆕 Completar UN viaje operativo específico
router.put("/completar/:viajeId", ViajesOperativosController.completarViajeOperativo);

// 🆕 Actualizar estado de un viaje operativo
router.patch("/actualizar-estado/:viajeId", ViajesOperativosController.actualizarEstado);

export default router;