import express from "express";
import LoginController from "../Controllers/Login.js"; 

const router = express.Router();

// Ruta POST para login
router.post("/", LoginController.Login);

//  Ruta correcta para verificación
router.get("/check-auth", LoginController.checkAuth);

router.post('/login/google', LoginController.GoogleLogin);

export default router;
