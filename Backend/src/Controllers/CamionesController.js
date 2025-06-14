import camionesMod from "../Models/Camiones.js";
import {v2 as cloudinary} from "cloudinary";
import { config } from "../config.js";

const camionesController={};

cloudinary.config({
    cloud_name: config.cloudinary.cloudinary_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret,
  });

camionesController.get= async (req,res) =>{
    const newCamion = await camionesMod.find();
    res.json(newCamion);
}

camionesController.post = async(req,res) => {
const {name,brand,model,State,gasolineLevel,age,ciculatioCard,licensePlate,description,supplierId,driverId} = req.body;
let imgUrl= "";
if(req.file){
    const resul = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["png","jpg","jpeg"],
    });
    imgUrl = resul.secure_url;
}

const newCamion = new camionesMod({name,brand,model,State,gasolineLevel,age,ciculatioCard,licensePlate,description,supplierId,driverId,img:imgUrl})
await newCamion.save();
res.status(200).json({Message: "Camion agregado correctamente"});
};

camionesController.put = async (req,res) =>{
const {name,brand,model,State,gasolineLevel,age,ciculatioCard,licensePlate,description,supplierId,driverId} = req.body;
let imgUrl= "";
if(req.file){
    const resul = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["png","jpg","jpeg"],
    });
    imgUrl = resul.secure_url;
}

await camionesMod.findByIdAndUpdate(req.params.id,{
    name,
    brand,
    model,
    State,
    gasolineLevel,
    age,
    ciculatioCard,
    licensePlate,
    description,
    supplierId,
    driverId,
    img:imgUrl
},
{new:true}
);
res.status(200).json({Message: "Camion actualizado correctamente"})
};

camionesController.delete = async (req,res) => {
    const deleteCamion = await camionesMod.findByIdAndDelete(req.params.id);
    if(!deleteCamion){
        return res.status(404).json({Message: "Camion no encontrado"});
    }
    res.status(200).json({Message: "Camion eliminado correctamente"})
};


export default camionesController;