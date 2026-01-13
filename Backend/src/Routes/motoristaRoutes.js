import express from "express";
import motoristasCon from "../Controllers/MotoristasController.js";
import multer from "multer";
import { authMiddleware } from "../Middleware/auth.js";
import { requireRole, requireAdmin } from "../Middleware/roleMiddleware.js";

const router = express.Router();
const upload = multer({dest: "public/"});

// 1. RUTAS BÁSICAS (sin parámetros específicos)
router.route("/")
  .get(authMiddleware, motoristasCon.get)
  .post(authMiddleware, requireRole("Operativo", "Supervisor"), upload.single("img"), motoristasCon.post);

// 2. RUTAS ESPECÍFICAS PRIMERO (antes de las rutas con :id genérico)
// Ruta para obtener todos los viajes programados (sin ID específico)
router.get("/viajes-programados/todos", authMiddleware, motoristasCon.getAllViajesProgramados);

// 3. RUTAS CON ID ESPECÍFICO (después de las rutas literales)
// Rutas para viajes de un motorista específico
router.get("/:id/viajes-programados", authMiddleware, motoristasCon.getViajesProgramados);
router.get("/:id/historial-completo", authMiddleware, motoristasCon.getHistorialCompleto);
router.get("/:id/debug-viajes", authMiddleware, motoristasCon.debugViajes);

// Ruta genérica para obtener motorista por ID
router.get("/:id", authMiddleware, motoristasCon.getById);

// 4. RUTAS DE MODIFICACIÓN (PUT/DELETE) - Admin, Supervisor pueden editar
router.route("/:id")
  .put(authMiddleware, requireRole("Supervisor"), upload.single("img"), motoristasCon.put)
  .delete(authMiddleware, requireAdmin, motoristasCon.delete);

export default router;