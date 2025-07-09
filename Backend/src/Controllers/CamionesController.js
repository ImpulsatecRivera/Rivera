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

// Obtener camión por ID
camionesController.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const camion = await camionesMod.findById(id)
      .populate("driverId")
      .populate("supplierId");

    if (!camion) {
      return res.status(404).json({ message: "Camión no encontrado" });
    }

    res.json(camion);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener camión", error: error.message });
  }
};

// Agregar un nuevo camión
camionesController.post = async (req, res) => {
  try {
    const {
      name,
      brand,
      model,
      state,
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
      state: state?.toUpperCase(),
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
      state,
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
      state: state?.toUpperCase(),
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
