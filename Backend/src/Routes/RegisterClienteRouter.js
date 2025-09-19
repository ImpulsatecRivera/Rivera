import express from "express";
import RegsiterCliente, { uploadProfileImage } from "../Controllers/RegisterClientes.js";

const router = express.Router();

/**
 * Ruta para registrar un nuevo cliente (con imagen OPCIONAL)
 * POST /api/clientes/
 * 
 * Body: FormData
 * - firstName: string (required)
 * - lastName: string (required)  
 * - email: string (required)
 * - idNumber: string (required)
 * - birthDate: string (required)
 * - password: string (required)
 * - phone: string (optional)
 * - address: string (optional)
 * - profileImage: File (OPCIONAL) - imagen de perfil
 */
router.route("/").post(uploadProfileImage, RegsiterCliente.registrarCliente);

export default router;