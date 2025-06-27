import empleadosModel from "../Models/Empleados.js";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import {v2 as cloudinary} from "cloudinary";
import {config} from "../config.js"


const empleadosCon = {};

cloudinary.config({
    cloud_name: config.cloudinary.cloudinary_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret,
  });

// Obtener empleados
empleadosCon.get = async (req, res) => {
    try {
        const empleados = await empleadosModel.find();
        res.status(200).json(empleados);
    } catch (error) {
        console.error('Error al obtener empleados:', error);
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

// Registrar empleado
empleadosCon.post = async (req, res) => {
    try {
        console.log('Registro de empleado iniciado');
        console.log('Estado de conexión MongoDB:', mongoose.connection.readyState);

        const { name, lastName, dui, birthDate, password, phone, address } = req.body;

        if (!name || !lastName || !dui || !birthDate || !password || !phone || !address) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios",
                missingFields: {
                    name: !name,
                    lastName: !lastName,
                    dui: !dui,
                    birthDate: !birthDate,
                    password: !password,
                    phone: !phone,
                    address: !address
                }
            });
        }

        const duiNumbers = dui.replace(/\D/g, '');
        if (duiNumbers.length !== 9) {
            return res.status(400).json({ message: "El DUI debe tener exactamente 9 dígitos" });
        }

        const phoneNumbers = phone.replace(/\D/g, '');
        if (phoneNumbers.length !== 8) {
            return res.status(400).json({ message: "El teléfono debe tener exactamente 8 dígitos" });
        }

        const email = await generarEmail(name, lastName);

        const validarDUI = await empleadosModel.findOne({ dui });
        if (validarDUI) {
            return res.status(409).json({ message: "Ya existe un empleado registrado con este DUI" });
        }

        const validarEmail = await empleadosModel.findOne({ email });
        if (validarEmail) {
            return res.status(409).json({ message: "Ya existe un empleado registrado con este email" });
        }

        let imgUrl= "";

        if(req.file){
            const resul = await cloudinary.uploader.upload(req.file.path, {
                folder: "public",
                allowed_formats: ["png","jpg","jpeg"],
            });
            imgUrl = resul.secure_url;
        }

        const encriptarContraHash = await bcryptjs.hash(password, 10);

        const newEmpleado = new empleadosModel({
            name,
            lastName,
            email,
            dui,
            birthDate: new Date(birthDate),
            password: encriptarContraHash,
            phone,
            address,
            img:imgUrl
        });

        const empleadoGuardado = await newEmpleado.save();

        console.log('Empleado registrado correctamente');

        res.status(201).json({ 
            message: "Empleado agregado correctamente",
            empleado: {
                id: empleadoGuardado._id,
                name: empleadoGuardado.name,
                lastName: empleadoGuardado.lastName,
                email: empleadoGuardado.email,
                dui: empleadoGuardado.dui,
                birthDate: empleadoGuardado.birthDate,
                phone: empleadoGuardado.phone,
                address: empleadoGuardado.address,
                img : empleadoGuardado.img
            }
        });

    } catch (error) {
        console.error('Error al registrar empleado:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Error de validación",
                error: error.message,
                details: error.errors
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Ya existe un empleado con estos datos",
                error: "Datos duplicados",
                field: Object.keys(error.keyValue)[0]
            });
        }

        res.status(500).json({ 
            message: "Error interno del servidor al registrar empleado", 
            error: error.message 
        });
    }
};

// Actualizar empleado
empleadosCon.put = async (req, res) => {
    try {
        const { name, lastName, email, dui, birthDate, password, phone, address } = req.body;

        let imgUrl= "";

        if(req.file){
            const resul = await cloudinary.uploader.upload(req.file.path, {
                folder: "public",
                allowed_formats: ["png","jpg","jpeg"],
            });
            imgUrl = resul.secure_url;
        }

        const datosActualizados = {
            name,
            lastName,
            email,
            dui,
            birthDate,
            phone,
            address,
            img:imgUrl
        };

        // Solo encriptar y actualizar la contraseña si fue enviada
        if (password) {
            datosActualizados.password = await bcryptjs.hash(password, 10);
        }

        const empleadoActualizado = await empleadosModel.findByIdAndUpdate(
            req.params.id,
            datosActualizados,
            { new: true }
        );

        if (!empleadoActualizado) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }

        console.log(`Empleado actualizado: ${req.params.id}`);
        res.status(200).json({ 
            message: "Empleado actualizado correctamente",
            empleado: empleadoActualizado
        });
    } catch (error) {
        console.error('Error al actualizar empleado:', error);
        res.status(500).json({ message: "Error al actualizar empleado", error: error.message });
    }
};

// Eliminar empleado
empleadosCon.delete = async (req, res) => {
    try {
        const deleteEmpleado = await empleadosModel.findByIdAndDelete(req.params.id);
        if (!deleteEmpleado) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }

        console.log(`Empleado eliminado: ${req.params.id}`);
        res.status(200).json({ message: "Empleado eliminado correctamente" });
    } catch (error) {
        console.error('Error al eliminar empleado:', error);
        res.status(500).json({ message: "Error al eliminar el empleado", error: error.message });
    }
};

export default empleadosCon;
