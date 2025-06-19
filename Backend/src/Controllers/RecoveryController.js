import EmpleadosModel from "../Models/Empleados.js"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import { EnviarEmail,html } from "../Utils/RecoveryPass.js"
import  {config} from "../config.js"

const RecoveryPass = {}

RecoveryPass.requestCode = async (req,res) => {
    const {email}=req.body;

    try{
        let userFound = await EmpleadosModel.findOne({email});
        let userType = "Empleado"

        if(!userFound){
            return res.status(400).json({Message: "Usuario no existente"});
        }

        const codex = Math.floor(10000 + Math.random() * 90000).toString();

        const token = jwt.sign(
            {email,codex,userType,verified:false},
            config.JWT.secret,
            {expiresIn: "20m"}
        )

        res.cookie("tokenRecoveryCode",token,{
            maxAge: 20*60*1000,
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
        });

        await EnviarEmail(
            email,
            "Tu código de verificación",
            "Hola, este es tu código de verificación para recuperar tu contraseña.",
            html(codex)
        )
        res.status(200).json({ message: "Correo enviado con el código de verificación" });

    }catch(error){
        console.error("Error en requestCode:", error);
        res.status(500).json({ message: "Error al solicitar el código" });
    }
};

export default RecoveryPass;