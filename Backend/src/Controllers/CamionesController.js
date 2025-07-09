import camionesMod from "../Models/Camiones.js";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

const camionesController = {};

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

// Obtener todos los camiones
camionesController.get = async (req, res) => {
  try {
    const camiones = await camionesMod.find();
    res.status(200).json(camiones);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener camiones", error: error.message });
  }
};

// Agregar un nuevo camión
camionesController.post = async (req, res) => {
  try {
    const {
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
    } = req.body;

    let imgUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["png", "jpg", "jpeg"],
      });
      imgUrl = result.secure_url;
    }

    const newCamion = new camionesMod({
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
      img: imgUrl,
    });

    await newCamion.save();
    res.status(200).json({ message: "Camión agregado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar camión", error: error.message });
  }
};

// Actualizar un camión
camionesController.put = async (req, res) => {
  try {
    const {
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
    } = req.body;

    let imgUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["png", "jpg", "jpeg"],
      });
      imgUrl = result.secure_url;
    }

    await camionesMod.findByIdAndUpdate(
      req.params.id,
      {
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
        img: imgUrl,
      },
      { new: true }
    );

    res.status(200).json({ message: "Camión actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar camión", error: error.message });
  }
};

// Eliminar un camión
camionesController.delete = async (req, res) => {
  try {
    const deleteCamion = await camionesMod.findByIdAndDelete(req.params.id);
    if (!deleteCamion) {
      return res.status(404).json({ message: "Camión no encontrado" });
    }
    res.status(200).json({ message: "Camión eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar camión", error: error.message });
  }
};

export default camionesController;