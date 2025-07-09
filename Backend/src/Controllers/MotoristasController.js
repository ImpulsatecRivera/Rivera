import motoristalModel from "../Models/Motorista.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

const motoristasCon = {};

cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

motoristasCon.get = async (req, res) => {
  try {
    const newMotorista = await motoristalModel.find();
    res.status(200).json(newMotorista);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener motoristas", error: error.message });
  }
};

// Función para generar email automáticamente
const generarEmail = async (name, lastName) => {
  const dominio = "rivera.com";
  let base = `${name.toLowerCase()}.${lastName.toLowerCase()}`;
  let email = `${base}@${dominio}`;
  let contador = 1;

  while (await motoristalModel.findOne({ email })) {
    email = `${base}${contador}@${dominio}`;
    contador++;
  }

  return email;
};

motoristasCon.post = async (req, res) => {
  try {
    const { name, lastName, id, birthDate, password, phone, address, circulationCard } = req.body;

    const email = await generarEmail(name, lastName);

    const validarMotorista = await motoristalModel.findOne({ email });
    if (validarMotorista) {
      return res.status(400).json({ message: "Motorista ya registrado" });
    }

    let imgUrl = "";
    if (req.file) {
      const resul = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["png", "jpg", "jpeg"],
      });
      imgUrl = resul.secure_url;
    }

    const contraHash = await bcryptjs.hash(password, 10);

    const newmotorista = new motoristalModel({
      name,
      lastName,
      email,
      id,
      birthDate,
      password: contraHash,
      phone,
      address,
      circulationCard,
      img: imgUrl,
    });

    await newmotorista.save();

    res.status(200).json({ Message: "Motorista agregado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar motoristas", error: error.message });
  }
};

motoristasCon.put = async (req, res) => {
  try {
    console.log("=== PUT MOTORISTA BACKEND ===");
    console.log("ID recibido:", req.params.id);
    console.log("Datos recibidos:", req.body);

    const motoristaId = req.params.id;
    const { name, lastName, password, phone, address, circulationCard } = req.body;

    const motoristaExistente = await motoristalModel.findById(motoristaId);
    if (!motoristaExistente) {
      return res.status(404).json({ message: "Motorista no encontrado" });
    }

    let imgUrl = "";
    if (req.file) {
      const resul = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["png", "jpg", "jpeg"],
      });
      imgUrl = resul.secure_url;
    }

    const updateData = {
      name: name?.trim() || motoristaExistente.name,
      lastName: lastName?.trim() || motoristaExistente.lastName,
      phone: phone?.trim() || motoristaExistente.phone,
      address: address?.trim() || motoristaExistente.address,
      circulationCard: circulationCard?.trim() || motoristaExistente.circulationCard,
      img: imgUrl?.trim() || motoristaExistente.img,
      email: motoristaExistente.email,
      id: motoristaExistente.id,
      birthDate: motoristaExistente.birthDate,
    };

    if (name?.trim() || lastName?.trim()) {
      const nombreFinal = name?.trim() || motoristaExistente.name;
      const apellidoFinal = lastName?.trim() || motoristaExistente.lastName;
      updateData.email = await generarEmail(nombreFinal, apellidoFinal);
    }

    if (password?.trim()) {
      updateData.password = await bcryptjs.hash(password.trim(), 10);
    } else {
      updateData.password = motoristaExistente.password;
    }

    const motoristaActualizado = await motoristalModel.findByIdAndUpdate(
      motoristaId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!motoristaActualizado) {
      return res.status(404).json({ message: "Error al actualizar motorista" });
    }

    res.status(200).json({
      message: "Motorista editado correctamente",
      motorista: motoristaActualizado,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar motorista",
      error: error.message,
    });
  }
};

motoristasCon.delete = async (req, res) => {
  try {
    const deleteMotorista = await motoristalModel.findByIdAndDelete(req.params.id);
    if (!deleteMotorista) {
      return res.status(400).json({ Message: "Motorista no localizado" });
    }
    res.status(200).json({ Message: "Motorista eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar motoristas", error: error.message });
  }
};

export default motoristasCon;
