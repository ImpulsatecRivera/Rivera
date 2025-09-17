import express from "express";
import motoristasCon from "../Controllers/MotoristasController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({dest: "public/"});

// 1. RUTAS BÁSICAS (sin parámetros específicos)
router.route("/")
  .get(motoristasCon.get)
  .post(upload.single("img"), motoristasCon.post);

// 2. RUTAS ESPECÍFICAS PRIMERO (antes de las rutas con :id genérico)
// Estas DEBEN ir antes de router.get('/:id') para evitar conflictos

// Ruta para obtener todos los viajes programados (sin ID específico)
router.get("/viajes-programados/todos", motoristasCon.getAllViajesProgramados);

// 3. RUTAS CON ID ESPECÍFICO (después de las rutas literales)
// Rutas para viajes de un motorista específico
router.get("/:id/viajes-programados", motoristasCon.getViajesProgramados);
router.get("/:id/historial-completo", motoristasCon.getHistorialCompleto);

// Ruta genérica para obtener motorista por ID
router.get("/:id", motoristasCon.getById);

// 4. RUTAS DE MODIFICACIÓN (PUT/DELETE)
router.route("/:id")
  .put(upload.single("img"), motoristasCon.put)
  .delete(motoristasCon.delete);

export default router;