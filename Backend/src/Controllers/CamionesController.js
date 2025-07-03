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
    try {
           const newCamion = await camionesMod.find();
    res.json(newCamion);
    } catch (error) {
         res.status(500).json({ message: "Error al obtener camiones", error: error.message });
    }
}

camionesController.post = async (req, res) => {
  try {
    const {
      name,
      brand,
      model,
      state, // ya esperamos `state` directamente
      gasolineLevel,
      age,
      ciculatioCard,
      licensePlate,
      description,
      supplierId,
      driverId
    } = req.body;

    let imgUrl = "";
    if (req.file) {
      const resul = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["png", "jpg", "jpeg"],
      });
      imgUrl = resul.secure_url;
    }

    const newCamion = new camionesMod({
      name,
      brand,
      model,
      state: state?.toUpperCase(), // normalizamos el valor
      gasolineLevel,
      age,
      ciculatioCard,
      licensePlate,
      description,
      supplierId,
      driverId,
      img: imgUrl,
    });

    await newCamion.save();

    res.status(200).json({ message: "Camión agregado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar camión", error: error.message });
  }
};

camionesController.put = async (req, res) => {
  try {
    const {
      name,
      brand,
      model,
      state, // corregido
      gasolineLevel,
      age,
      ciculatioCard,
      licensePlate,
      description,
      supplierId,
      driverId
    } = req.body;

    let imgUrl = "";
    if (req.file) {
      const resul = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["png", "jpg", "jpeg"],
      });
      imgUrl = resul.secure_url;
    }

    const updatedTruck = {
      name,
      brand,
      model,
      state: state?.toUpperCase(), // seguimos normalizando
      gasolineLevel,
      age,
      ciculatioCard,
      licensePlate,
      description,
      supplierId,
      driverId,
    };

    if (imgUrl) {
      updatedTruck.img = imgUrl;
    }

    await camionesMod.findByIdAndUpdate(req.params.id, updatedTruck, { new: true });

    res.status(200).json({ message: "Camión actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar camión", error: error.message });
  }
};



camionesController.delete = async (req,res) => {
    try {
         const deleteCamion = await camionesMod.findByIdAndDelete(req.params.id);
    if(!deleteCamion){
        return res.status(404).json({Message: "Camion no encontrado"});
    }
    res.status(200).json({Message: "Camion eliminado correctamente"})
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar camion", error: error.message });
    }
};


export default camionesController;