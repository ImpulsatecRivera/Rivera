import express from "express";
import motoristasCon from "../Controllers/MotoristasController.js";
import multer from "multer";
import { validateAuthToken } from "../Middlewares/validateAuthToken.js";

const router = express.Router();
const upload = multer({dest: "public/"});

// 1. RUTAS BÁSICAS (sin parámetros específicos)
router.route("/")
  // GET: Allow Admin, Operativo, Supervisor to list motoristas (view-only)
  .get(validateAuthToken(["admin","Operativo","Supervisor","Coordinador"]), motoristasCon.get)
  // POST: Only Admin can create motoristas
  .post(validateAuthToken(["admin","Operativo","Supervisor","Coordinador"]), upload.single("img"), motoristasCon.post);

// 2. RUTAS ESPECÍFICAS PRIMERO (antes de las rutas con :id genérico)
// Ruta para obtener todos los viajes programados (sin ID específico)
router.get("/viajes-programados/todos",validateAuthToken(["admin","Operativo","Supervisor","motorista","Coordinador"]), motoristasCon.getAllViajesProgramados);

// 3. RUTAS CON ID ESPECÍFICO (después de las rutas literales)
// Rutas para viajes de un motorista específico
router.get("/:id/viajes-programados",validateAuthToken(["admin","Operativo","Supervisor","motorista","Coordinador"]), motoristasCon.getViajesProgramados);
router.get("/:id/historial-completo", validateAuthToken(["admin","Operativo","Supervisor","motorista","Coordinador"]),  motoristasCon.getHistorialCompleto);
router.get("/:id/debug-viajes", validateAuthToken(["admin","Operativo","Supervisor","motorista","Coordinador"]),  motoristasCon.debugViajes);

// Ruta genérica para obtener motorista por ID
// Allow Admin and Operativo/Supervisor to view any motorista, and allow a Motorista to view their own profile
router.get("/:id", validateAuthToken(["admin","Operativo","Supervisor","motorista","Coordinador"]), motoristasCon.getById);

// 4. RUTAS DE MODIFICACIÓN
// PUT: Allow Admin and Motorista (only to edit own profile)
// DELETE: Only Admin
router.route("/:id")
  .put(validateAuthToken(["admin","Operativo","Supervisor","motorista","Coordinador"]), upload.single("img"), motoristasCon.put)
  .delete(validateAuthToken(["admin"]), motoristasCon.delete);

export default router;