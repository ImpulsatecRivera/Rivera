import motoristalModel from "../Models/Motorista.js";
import bcryptjs from "bcryptjs";

const motoristasCon = {};

// Obtener todos los motoristas
motoristasCon.get = async (req, res) => {
  try {
    const motoristas = await motoristalModel.find();
    res.status(200).json(motoristas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener motoristas", error: error.message });
  }
};

// Generar email automáticamente
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

// Registrar nuevo motorista
motoristasCon.post = async (req, res) => {
  try {
    const { name, lastName, id, birthDate, password, phone, address, circulationCard } = req.body;

    const email = await generarEmail(name, lastName);

    const existeMotorista = await motoristalModel.findOne({ email });
    if (existeMotorista) {
      return res.status(400).json({ message: "Motorista ya registrado" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newMotorista = new motoristalModel({
      name,
      lastName,
      email,
      id,
      birthDate,
      password: hashedPassword,
      phone,
      address,
      circulationCard
    });

    await newMotorista.save();
    res.status(200).json({ message: "Motorista agregado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar motorista", error: error.message });
  }
};

// Actualizar motorista
motoristasCon.put = async (req, res) => {
  try {
    const { name, lastName, id, birthDate, password, phone, address, circulationCard } = req.body;

    const email = await generarEmail(name, lastName);
    const hashedPassword = await bcryptjs.hash(password, 10);

    const updated = await motoristalModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        lastName,
        email,
        id,
        birthDate,
        password: hashedPassword,
        phone,
        address,
        circulationCard
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Motorista no encontrado" });
    }

    res.status(200).json({ message: "Motorista editado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar motorista", error: error.message });
  }
};

// Eliminar motorista
motoristasCon.delete = async (req, res) => {
  try {
    const deleted = await motoristalModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Motorista no localizado" });
    }
    res.status(200).json({ message: "Motorista eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar motorista", error: error.message });
  }
};

export default motoristasCon;
