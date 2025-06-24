import { json } from "express";
import motoristalModel from "../Models/Motorista.js";
import bcryptjs from "bcryptjs"; 

const motoristasCon={};

motoristasCon.get = async (req , res) =>{
    const newMotorista = await motoristalModel.find();
    res.status(200).json(newMotorista);
};

//Funcion para crear el email automaticamente a partit del primer nombre y primer apellido
const generarEmail = async (name,lastName) => {
    const dominio = "rivera.com";
    let base = `${name.toLowerCase()}.${lastName.toLowerCase()}`;
    let email = `${base}@${dominio}`;
    let contador = 1

    while (await 
        motoristalModel.findOne({email})){
        email = `${base}${contador}@${dominio}`;
        contador ++;
    }


    return email;
};

motoristasCon.post = async ( req ,res) => {
    const {name,lastName,id,birthDate,password,phone,address,circulationCard} = req.body;
     
     const email = await generarEmail(name,lastName);
     
     const validarMotorista = await motoristalModel.findOne({email})
            if(validarMotorista){
                return res.status(400).json({message: "Motorista ya registrado"});
            };

            const contraHash = await bcryptjs.hash(password,10)

    const newmotorista = new motoristalModel({name,lastName,email,id,birthDate,password:contraHash,phone,address,circulationCard});
    await newmotorista.save();

    res.status(200).json({Message:"Motorista agregado correctamente"});
};

motoristasCon.put = async ( req ,res) =>{
    const {name,lastName,id,birthDate,password,phone,address,circulationCard}=req.body;
                const contraHash = await bcryptjs.hash(password,10)

    await motoristalModel.findByIdAndUpdate(req.params.id,{
        name,lastName,id,birthDate,password:contraHash,phone,address,circulationCard
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