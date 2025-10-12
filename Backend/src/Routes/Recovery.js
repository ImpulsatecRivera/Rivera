import express from "express";
import RecoveryPass from "../Controllers/RecoveryController.js";

const router=express.Router();

//Ruta para enviar el codigo mediante el email o sms
router.route("/requestCode").post(RecoveryPass.requestCode);

router.route("/sendVerificationForRegistration").post(RecoveryPass.sendVerificationForRegistration);

//Ruta para verificar el codigo enviado
router.route("/verifyCode").post(RecoveryPass.verifyCode);
router.post('/verifyCodeForRegistration', RecoveryPass.verifyCodeForRegistration);

//Ruta para actualizar mi contrasela despues de hacer los dos paso anteriores
router.route("/newPassword").post(RecoveryPass.newPassword);

//Ruta para loguiarse mediante un codigo de verificacion
router.route("/loginCode").post(RecoveryPass.IniciarSesionConCodigo);

export default router;