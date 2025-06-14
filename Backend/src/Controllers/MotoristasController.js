import { json } from "express";
import motoristalModel from "../Models/Motorista.js";

const motoristasCon={};

motoristasCon.get = async (req , res) =>{
    const newMotorista = await motoristalModel.find();
    res.status(200).json(newMotorista);
};

motoristasCon.post = async ( req ,res) => {
    const {name,lastName,id,birthDate,password,phone,address,circulationCard} = req.body;

    const newmotorista = new motoristalModel({name,lastName,id,birthDate,password,phone,address,circulationCard});
    await newmotorista.save();

    res.status(200).json({Message:"Motorista agregado correctamente"});
};

motoristasCon.put = async ( req ,res) =>{
    const {name,lastName,id,birthDate,password,phone,address,circulationCard}=req.body;
    await motoristalModel.findByIdAndUpdate(req.params.id,{
        name,lastName,id,birthDate,password,phone,address,circulationCard
    },
{new:true});

res.status(200).json({Message:"Motorista editado correctamente"});
}


motoristasCon.delete = async(req,res)=>{
    const deleteMotorista = await motoristalModel.findByIdAndDelete(req.params.id);
    if(!deleteMotorista){
        return  res.status(400).json({Message: "Motorista no localizado"})
    }
    res.status(200).json({Message: "Motorista eliminado correctamente"});
};

export default motoristasCon;