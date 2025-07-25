import adminModel from "../Models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {config} from "../config.js";


const Register={};

Register.registerAdmin = async(req,res) =>{
    const {name,lastName,phone,address,email,password,birthDate,dui}=req.body;

    try {
        const validacion= await adminModel.findOne({email})
        if(validacion){
            return res.status(500).json({Message:"Usuario ya resgistrado con este correo"})
        }

        const encriptarHash = await bcrypt.hash(password,10)

        const newAdmin =   new adminModel({
        name,lastName,phone,address,email,password,birthDate,dui
        });

        await newAdmin.save();

        jwt.sign(
            {id:newAdmin._id},
            config.JWT.secret,
            {expiresIn:config.JWT.expiresIn},
            (error,token) => {
                if (error) console.log("error" + error)
                    res.cookie("authToken", token)
                    res.status(200).json({ message: "Administrador registrado" })
            }
        )
    } catch (error) {
        console.log("error: " + error);
            res.status(500).json({ message: "Error administrador no registrado"});
    }
}

export default Register;