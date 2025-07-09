import empleadosModel from "../Models/Empleados.js";
import bcryptjs from "bcryptjs"; 

const empleadosCon = {};

// Obtener todos los empleados
empleadosCon.get = async (req, res) => {
  try {
    const empleados = await empleadosModel.find();
    res.status(200).json(empleados);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener empleados", error: error.message });
  }
};

// Generar email automáticamente
const generarEmail = async (name, lastName) => {
  const dominio = "rivera.com";
  let base = `${name.toLowerCase()}.${lastName.toLowerCase()}`;
  let email = `${base}@${dominio}`;
  let contador = 1;

  while (await empleadosModel.findOne({ email })) {
    email = `${base}${contador}@${dominio}`;
    contador++;
  }

  return email;
};

// Agregar nuevo empleado
empleadosCon.post = async (req, res) => {
  try {
    const { name, lastName, id, birthDate, password, phone, address } = req.body;
    const email = await generarEmail(name, lastName);

    const validarEmpleado = await empleadosModel.findOne({ email });
    if (validarEmpleado) {
      return res.status(400).json({ message: "Empleado ya registrado" });
    }

    const encriptarContraHash = await bcryptjs.hash(password, 10);
    const newEmpleado = new empleadosModel({
      name,
      lastName,
      email,
      id,
      birthDate,
      password: encriptarContraHash,
      phone,
      address,
    });

    await newEmpleado.save();
    res.status(200).json({ message: "Empleado agregado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar empleado", error: error.message });
  }
};

// Editar empleado
empleadosCon.put = async (req, res) => {
  try {
    const { name, lastName, email, id, birthDate, password, phone, address } = req.body;
    const encriptarContraHash = await bcryptjs.hash(password, 10);

    await empleadosModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        lastName,
        email,
        id,
        birthDate,
        password: encriptarContraHash,
        phone,
        address,
      },
      { new: true }
    );

    res.status(200).json({ message: "Empleado actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar empleado", error: error.message });
  }
};

// Eliminar empleado
empleadosCon.delete = async (req, res) => {
  try {
    const deleteEmpleado = await empleadosModel.findByIdAndDelete(req.params.id);
    if (!deleteEmpleado) {
      return res.status(404).json({ message: "Empleado no localizado" });
    }
    res.status(200).json({ message: "Empleado eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el empleado", error: error.message });
  }
};

export default empleadosCon;
