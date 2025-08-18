import motoristalModel from "../Models/Motorista.js";
import camioneModel from "../Models/Camiones.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

/**
 * Controlador para manejar operaciones CRUD de motoristas
 */
const motoristasCon = {};

/**
 * Configuración de Cloudinary para manejo de imágenes de motoristas
 */
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

/**
 * Obtener todos los motoristas registrados
 * GET /motoristas
 * @param {object} req - Objeto request de Express
 * @param {object} res - Objeto response de Express
 * @returns {object} JSON con lista de motoristas o mensaje de error
 */
motoristasCon.get = async (req, res) => {
  try {
    // Obtener todos los motoristas de la base de datos
    const newMotorista = await motoristalModel.find();
    
    // Responder con status 200 (OK) y la lista de motoristas
    res.status(200).json(newMotorista);
  } catch (error) {
    // En caso de error, responder con status 500 (Error interno del servidor)
    res.status(500).json({ message: "Error al obtener motoristas", error: error.message });
  }
};

/**
 * Obtener un motorista específico por ID junto con su camión asignado
 * GET /motoristas/:id
 * @param {object} req - Objeto request de Express (contiene el ID en req.params.id)
 * @param {object} res - Objeto response de Express
 * @returns {object} JSON con datos del motorista y su camión, o mensaje de error
 */
motoristasCon.getById = async (req, res) => {
  try {
    // Buscar el motorista por ID en la base de datos
    const motorista = await motoristalModel.findById(req.params.id);
    
    // Verificar si el motorista existe
    if (!motorista) {
      return res.status(404).json({ message: "Motorista no encontrado" });
    }

    // Buscar el camión asignado a este motorista usando su ID como driverId
    const camion = await camioneModel.findOne({ driverId: motorista._id });
    
    // Construir objeto completo con datos del motorista y camión
    const motoristaCompleto = {
      ...motorista.toObject(), // Convertir documento mongoose a objeto JS
      camionAsignado: camion ? {
        _id: camion._id,
        name: camion.name,
        brand: camion.brand,
        model: camion.model,
        licensePlate: camion.licensePlate,
        state: camion.state,
        gasolineLevel: camion.gasolineLevel,
        img: camion.img
      } : null // Si no tiene camión asignado, mostrar null
    };
    
    // Responder con los datos completos del motorista
    res.status(200).json(motoristaCompleto);
  } catch (error) {
    // Manejar errores de la operación
    res.status(500).json({ message: "Error al obtener motorista", error: error.message });
  }
};

/**
 * Función auxiliar para generar email automático basado en nombre y apellido
 * @param {string} name - Nombre del motorista
 * @param {string} lastName - Apellido del motorista
 * @returns {string} Email único generado con formato nombre.apellido@rivera.com
 */
const generarEmail = async (name, lastName) => {
  const dominio = "rivera.com";
  
  // Crear base del email en minúsculas
  let base = `${name.toLowerCase()}.${lastName.toLowerCase()}`;
  let email = `${base}@${dominio}`;
  let contador = 1;

  // Verificar si el email ya existe y generar uno único
  while (await motoristalModel.findOne({ email })) {
    email = `${base}${contador}@${dominio}`;
    contador++; // Incrementar contador hasta encontrar email único
  }

  return email;
};

/**
 * Registrar nuevo motorista en el sistema
 * POST /motoristas
 * @param {object} req - Objeto request que contiene los datos del motorista en req.body
 * @param {object} res - Objeto response de Express
 * @returns {object} JSON con mensaje de éxito o error
 */
motoristasCon.post = async (req, res) => {
  try {
    // Extraer datos del cuerpo de la petición
    const { name, lastName, id, birthDate, password, phone, address, circulationCard } = req.body;

    // Generar email automático basado en nombre y apellido
    const email = await generarEmail(name, lastName);

    // Verificar si ya existe un motorista con este email
    const validarMotorista = await motoristalModel.findOne({ email });
    if (validarMotorista) {
      return res.status(400).json({ message: "Motorista ya registrado" });
    }

    // Manejo de imagen subida a Cloudinary
    let imgUrl = "";
    if (req.file) {
      // Subir imagen a Cloudinary si se proporcionó archivo
      const resul = await cloudinary.uploader.upload(req.file.path, {
        folder: "public", // Carpeta donde se almacenará
        allowed_formats: ["png", "jpg", "jpeg"], // Formatos permitidos
      });
      imgUrl = resul.secure_url; // URL segura de la imagen subida
    }

    // Encriptar contraseña usando bcryptjs con salt de 10 rounds
    const contraHash = await bcryptjs.hash(password, 10);

    // Crear nuevo documento de motorista con los datos proporcionados
    const newmotorista = new motoristalModel({
      name,
      lastName,
      email,
      id,
      birthDate,
      password: contraHash, // Contraseña encriptada
      phone,
      address,
      circulationCard,
      img: imgUrl, // URL de la imagen o string vacío si no hay imagen
    });

    // Guardar el nuevo motorista en la base de datos
    await newmotorista.save();

    // Responder con mensaje de éxito
    res.status(200).json({ Message: "Motorista agregado correctamente" });
  } catch (error) {
    // Manejar errores durante el registro
    res.status(500).json({ message: "Error al agregar motoristas", error: error.message });
  }
};

/**
 * Actualizar datos de un motorista existente
 * PUT /motoristas/:id
 * @param {object} req - Objeto request que contiene el ID en params y datos en body
 * @param {object} res - Objeto response de Express
 * @returns {object} JSON con datos actualizados o mensaje de error
 */
motoristasCon.put = async (req, res) => {
  try {
    // Obtener ID del motorista desde los parámetros de la URL
    const motoristaId = req.params.id;
    
    // Extraer datos del cuerpo de la petición para actualización
    const { name, lastName, password, phone, address, circulationCard } = req.body;

    // Verificar que el motorista existe antes de actualizar
    const motoristaExistente = await motoristalModel.findById(motoristaId);
    if (!motoristaExistente) {
      return res.status(404).json({ message: "Motorista no encontrado" });
    }

    // Manejo de imagen si se proporciona nueva imagen
    let imgUrl = "";
    if (req.file) {
      // Subir nueva imagen a Cloudinary
      const resul = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["png", "jpg", "jpeg"],
      });
      imgUrl = resul.secure_url;
    }

    // Construir objeto de actualización manteniendo datos existentes si no se proporcionan nuevos
    const updateData = {
      name: name?.trim() || motoristaExistente.name, // Usar nuevo nombre o mantener existente
      lastName: lastName?.trim() || motoristaExistente.lastName,
      phone: phone?.trim() || motoristaExistente.phone,
      address: address?.trim() || motoristaExistente.address,
      circulationCard: circulationCard?.trim() || motoristaExistente.circulationCard,
      img: imgUrl?.trim() || motoristaExistente.img, // Nueva imagen o mantener existente
      // Campos que no se modifican en esta actualización
      email: motoristaExistente.email,
      id: motoristaExistente.id,
      birthDate: motoristaExistente.birthDate,
    };

    // Regenerar email si se actualiza nombre o apellido
    if (name?.trim() || lastName?.trim()) {
      const nombreFinal = name?.trim() || motoristaExistente.name;
      const apellidoFinal = lastName?.trim() || motoristaExistente.lastName;
      updateData.email = await generarEmail(nombreFinal, apellidoFinal);
    }

    // Manejar actualización de contraseña
    if (password?.trim()) {
      // Encriptar nueva contraseña si se proporciona
      updateData.password = await bcryptjs.hash(password.trim(), 10);
    } else {
      // Mantener contraseña existente si no se proporciona nueva
      updateData.password = motoristaExistente.password;
    }

    // Ejecutar actualización en la base de datos
    const motoristaActualizado = await motoristalModel.findByIdAndUpdate(
      motoristaId,
      updateData,
      { new: true, runValidators: true } // Retornar documento actualizado y ejecutar validaciones
    );

    // Verificar que la actualización fue exitosa
    if (!motoristaActualizado) {
      return res.status(404).json({ message: "Error al actualizar motorista" });
    }

    // Responder con éxito y datos actualizados
    res.status(200).json({
      message: "Motorista editado correctamente",
      motorista: motoristaActualizado,
    });
  } catch (error) {
    // Manejar errores durante la actualización
    res.status(500).json({
      message: "Error al actualizar motorista",
      error: error.message,
    });
  }
};

/**
 * Eliminar un motorista del sistema
 * DELETE /motoristas/:id
 * @param {object} req - Objeto request que contiene el ID en req.params.id
 * @param {object} res - Objeto response de Express
 * @returns {object} JSON con mensaje de éxito o error
 */
motoristasCon.delete = async (req, res) => {
  try {
    // Buscar y eliminar motorista por ID en una sola operación
    const deleteMotorista = await motoristalModel.findByIdAndDelete(req.params.id);
    
    // Verificar si el motorista existía
    if (!deleteMotorista) {
      return res.status(400).json({ Message: "Motorista no localizado" });
    }
    
    // Responder con mensaje de éxito
    res.status(200).json({ Message: "Motorista eliminado correctamente" });
  } catch (error) {
    // Manejar errores durante la eliminación
    res.status(500).json({ message: "Error al eliminar motoristas", error: error.message });
  }
};

// Exportar el controlador para uso en las rutas
export default motoristasCon;