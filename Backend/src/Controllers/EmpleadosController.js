import empleadosModel from "../Models/Empleados.js";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

const empleadosCon = {};

empleadosCon.get = async (req, res) => {
    try {
        const empleados = await empleadosModel.find();
        res.status(200).json(empleados);
    } catch (error) {
        console.error('Error al obtener empleados:', error);
        res.status(500).json({ message: "Error al obtener empleados", error: error.message });
    }
};

// Función para crear el email automáticamente
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

empleadosCon.post = async (req, res) => {
    try {
        console.log('=== INICIO DEL CONTROLADOR ===');
        console.log('Estado de conexión MongoDB:', mongoose.connection.readyState);
        console.log('Datos recibidos en el backend:', req.body);
        
        // Extraer datos del cuerpo de la petición
        const { name, lastName, dui, birthDate, password, phone, address } = req.body;

        console.log('Datos extraídos:', { name, lastName, dui, birthDate, password: '***', phone, address });

        // Validar que todos los campos requeridos estén presentes
        if (!name || !lastName || !dui || !birthDate || !password || !phone || !address) {
            console.log('❌ Faltan campos obligatorios');
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

        // Validar formato del DUI (debe tener exactamente 9 dígitos)
        const duiNumbers = dui.replace(/\D/g, '');
        if (duiNumbers.length !== 9) {
            console.log('❌ DUI con formato incorrecto:', dui);
            return res.status(400).json({ 
                message: "El DUI debe tener exactamente 9 dígitos" 
            });
        }

        // Validar formato del teléfono (debe tener exactamente 8 dígitos)
        const phoneNumbers = phone.replace(/\D/g, '');
        if (phoneNumbers.length !== 8) {
            console.log('❌ Teléfono con formato incorrecto:', phone);
            return res.status(400).json({ 
                message: "El teléfono debe tener exactamente 8 dígitos" 
            });
        }

        // Generar email automáticamente
        console.log('🔄 Generando email para:', name, lastName);
        const email = await generarEmail(name, lastName);
        console.log('✅ Email generado:', email);

        // Verificar si ya existe un empleado con el mismo DUI
        console.log('🔄 Verificando DUI existente...');
        const validarDUI = await empleadosModel.findOne({ dui: dui });
        if (validarDUI) {
            console.log('❌ DUI ya existe:', dui);
            return res.status(409).json({ 
                message: "Ya existe un empleado registrado con este DUI" 
            });
        }

        // Verificar si ya existe un empleado con el mismo email
        console.log('🔄 Verificando email existente...');
        const validarEmail = await empleadosModel.findOne({ email });
        if (validarEmail) {
            console.log('❌ Email ya existe:', email);
            return res.status(409).json({
                message: "Ya existe un empleado registrado con este email"
            });
        }

        // Encriptar la contraseña
        console.log('🔄 Encriptando contraseña...');
        const encriptarContraHash = await bcryptjs.hash(password, 10);

        // Crear el objeto del empleado
        const empleadoData = {
            name: name,
            lastName: lastName,
            email: email,
            dui: dui,
            birthDate: new Date(birthDate),
            password: encriptarContraHash,
            phone: phone,
            address: address
        };

        console.log('🔄 Creando empleado con datos:', empleadoData);
        
        // Crear el nuevo empleado
        const newEmpleado = new empleadosModel(empleadoData);

        // Guardar en la base de datos
        console.log('🔄 Guardando empleado en la base de datos...');
        const empleadoGuardado = await newEmpleado.save();
        console.log('✅ Empleado guardado exitosamente con ID:', empleadoGuardado._id);

        // Respuesta exitosa
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
                address: empleadoGuardado.address
            }
        });

    } catch (error) {
        console.error('❌ ERROR COMPLETO EN EL CONTROLADOR:', error);
        console.error('Stack trace:', error.stack);
        
        // Errores específicos de Mongoose
        if (error.name === 'ValidationError') {
            console.error('Error de validación de Mongoose:', error.errors);
            return res.status(400).json({
                message: "Error de validación",
                error: error.message,
                details: error.errors
            });
        }
        
        if (error.code === 11000) {
            console.error('Error de duplicación:', error.keyValue);
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

empleadosCon.put = async (req, res) => {
    try {
        const { name, lastName, email, dui, birthDate, password, phone, address } = req.body;

        const encriptarContraHash = await bcryptjs.hash(password, 10);

        const empleadoActualizado = await empleadosModel.findByIdAndUpdate(
            req.params.id,
            {
                name,
                lastName,
                email,
                dui,
                birthDate,
                password: encriptarContraHash,
                phone,
                address
            },
            { new: true }
        );

        if (!empleadoActualizado) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }

        res.status(200).json({ 
            message: "Empleado actualizado correctamente",
            empleado: empleadoActualizado
        });
    } catch (error) {
        console.error('Error al actualizar empleado:', error);
        res.status(500).json({ message: "Error al actualizar empleado", error: error.message });
    }
};

empleadosCon.delete = async (req, res) => {
    try {
        const deleteEmpleado = await empleadosModel.findByIdAndDelete(req.params.id);
        if (!deleteEmpleado) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }
        res.status(200).json({ message: "Empleado eliminado correctamente" });
    } catch (error) {
        console.error('Error al eliminar empleado:', error);
        res.status(500).json({ message: "Error al eliminar el empleado", error: error.message });
    }
};

export default empleadosCon;