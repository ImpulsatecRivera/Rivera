import { BiMessage } from "react-icons/bi";
import empleadosModel from "../Models/Empleados.js";

const empleadosCon = {};

empleadosCon.get = async (req , res) => {
    const newEmpleado= await empleadosModel.find();
    res.status(200).json(newEmpleado);
};

empleadosCon.post = async (req, res) => {
    const {name,lastName,email,id,birthDate,password,phone,address}=req.body;
    const newEmpleado = new empleadosModel({name,lastName,email,id,birthDate,password,phone,address})
    await newEmpleado.save();
    res.status(200).json({Message:"Empleado agregado correctamente"});
}

empleadosCon.put = async (req,res) => {
    const {name,lastName,email,id,birthDate,password,phone,address}=req.body;
    await empleadosModel.findByIdAndUpdate(
        req.params.id,{
            name,
            lastName,
            email,
            id,
            birthDate,
            password,
            phone,
            address
        },{new:true}
    )
    res.status(200).json({Message: "Empleado actualizado correctamente"})
};

empleadosCon.delete = async (req ,res) => {
    const deleteEmpleado = await empleadosModel.findByIdAndDelete(req.params.id);
    if(!deleteEmpleado){
       return  res.status(200).json({Message: "Empleado no localizaco"})
    }
    res.status(200).json({Message: "Empleado eliminado correctamente"});
}


export default empleadosCon;