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

RecoveryPass.verifyCode = async (req, res) => {
    const { code } = req.body;
   
    try {
      
      const token = req.cookies.tokenRecoveryCode;
   
      const decoded = jsonwebtoken.verify(token, config.JWT.secret);
   
      if (decoded.code !== code) {
        return res.json({ message: "Invalid code" });
      }
   
      const newToken = jsonwebtoken.sign(
        {
          email: decoded.email,
          code: decoded.code,
          userType: decoded.userType,
          verified: true,
        },
        config.JWT.secret,
        { expiresIn: "20m" }
      );
   
      res.cookie("tokenRecoveryCode", newToken, { maxAge: 20 * 60 * 1000 });
   
      res.json({ message: "Code verified successfully" });
    } catch (error) {
      console.log("error" + error);
    }
  };

RecoveryPass.newPassword = async (req, res) => {
    const { newPassword } = req.body;
   
    try {
      const token = req.cookies.tokenRecoveryCode;
   
      const decoded = jsonwebtoken.verify(token, config.JWT.secret);
   
      if (!decoded.verified) {
        return res.json({ message: "Code not verified" });
      }
   
      const { email, userType } = decoded;
   
      const hashedPassword = await bcryptjs.hash(newPassword, 10);
   
      let updatedUser;
   
      if (userType === "Empleados") {
        updatedUser = await employeesModel.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
          );
      }
   
      res.clearCookie("tokenRecoveryCode");
   
      res.json({ message: "Password updated" });
    } catch (error) {
      console.log("error" + error);
    }
  };

export default RecoveryPass;