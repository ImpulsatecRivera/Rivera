import express from "express"
import cotizacionesController from "../Controllers/CotizacionesController.js"
import validateAuthToken from "../Middlewares/validateAuthToken.js";

const router = express.Router();

// GET - Requiere sesión (admin, Operativo, Supervisor, cliente, motorista)
router.get("/", validateAuthToken(["admin","Operativo","Supervisor","cliente","motorista", "auxiliar"]), cotizacionesController.getAllCotizaciones);

// POST - Admin y empleados (Operativo, Supervisor) pueden crear
router.post("/", validateAuthToken(["admin","Operativo","Supervisor"]), cotizacionesController.createCotizacion);

// GET by ID - Requiere sesión (admin, Operativo, Supervisor, cliente, motorista)
router.get('/:id', validateAuthToken(["admin","Operativo","Supervisor","cliente","motorista", "auxiliar"]), cotizacionesController.getCotizacionById);

// DELETE - Solo Admin
router.delete('/:id', validateAuthToken(["admin"]), cotizacionesController.deleteCotizacion);

// PUT - Admin, Supervisor pueden editar
router.put("/:id", validateAuthToken(["admin","Supervisor"]), cotizacionesController.updateCotizacion);

export default router; 