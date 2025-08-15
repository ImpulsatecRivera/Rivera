import ClientesModelo from "../Models/Clientes.js"
import jwt from "jsonwebtoken"
import bcrypt  from "bcryptjs"
import { config } from "../config.js"


const RegsiterCliente = {}

RegsiterCliente.registrarCliente=async(req,res) =>{
    const {firtsName,lastName,email,idNumber,birthDate,password,phone,address}=req.body;
    try {
        const validacion = await ClientesModelo.findOne({email})
        if(validacion){
            return res.status(500).json({Message:"Usuario ya resgistrado con este correo"})
        }

            const encriptarHash = await bcrypt.hash(password,10)
            const newCliente =   new ClientesModelo({
            firtsName,lastName,email,idNumber,birthDate,password,phone,address
            });
             await newCliente.save();

               jwt.sign(
                         {id:newCliente._id},
                         config.JWT.secret,
                         {expiresIn:config.JWT.expiresIn},
                         (error,token) => {
                             if (error) console.log("error" + error)
                                 res.cookie("authToken", token)
                                 res.status(200).json({ message: "Cliente registrado" })
                         }
                     )

    } catch (error) {
        res.status(500).json({ message: "Error cliente no registrado"});
    }
}

export default RegsiterCliente;