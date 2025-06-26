import empleadosModel from "../Models/Empleados.js";
import bcryptjs from "bcryptjs"; 

const empleadosCon = {};

empleadosCon.get = async (req , res) => {
    try {
          const newEmpleado= await empleadosModel.find();
    res.status(200).json(newEmpleado);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener empleados", error: error.message });
    }
};

//Funcion para crear el email automaticamente a partir del primer nombre y primer apellido
const generarEmail = async (name,lastName) => {
    const dominio = "rivera.com";
    let base = `${name.toLowerCase()}.${lastName.toLowerCase()}`;
    let email = `${base}@${dominio}`;
    let contador = 1;

    while (await empleadosModel.findOne({email})){
        email = `${base}${contador}@${dominio}`;
        contador ++;
    }

    return email;
};

empleadosCon.post = async (req, res) => {
    try {
        // Log para debugging
        console.log('Datos recibidos en el backend:', req.body);
        
        // Extraer datos del cuerpo de la petición
        const {name, lastName, dui, birthDate, password, phone, address} = req.body;

        // Validar que todos los campos requeridos estén presentes
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

        // Validar formato del DUI (debe tener exactamente 9 dígitos)
        const duiNumbers = dui.replace(/\D/g, '');
        if (duiNumbers.length !== 9) {
            return res.status(400).json({ 
                message: "El DUI debe tener exactamente 9 dígitos" 
            });
        }

        // Validar formato del teléfono (debe tener exactamente 8 dígitos)
        const phoneNumbers = phone.replace(/\D/g, '');
        if (phoneNumbers.length !== 8) {
            return res.status(400).json({ 
                message: "El teléfono debe tener exactamente 8 dígitos" 
            });
        }

        // Generar email automáticamente
        console.log('Generando email para:', name, lastName);
        const email = await generarEmail(name, lastName);
        console.log('Email generado:', email);

        // Verificar si ya existe un empleado con el mismo DUI
        const validarDUI = await empleadosModel.findOne({ dui: dui });
        if (validarDUI) {
            return res.status(409).json({ 
                message: "Ya existe un empleado registrado con este DUI" 
            });
        }

        // Verificar si ya existe un empleado con el mismo email
        const validarEmail = await empleadosModel.findOne({email});
        if(validarEmail){
            return res.status(409).json({
                message: "Ya existe un empleado registrado con este email"
            });
        }

        // Encriptar la contraseña
        const encriptarContraHash = await bcryptjs.hash(password, 10);

        // Crear el nuevo empleado
        console.log('Creando empleado con datos:', {
            name,
            lastName,
            email,
            dui: dui,
            birthDate,
            phone,
            address
        });
        
        const newEmpleado = new empleadosModel({
            name: name,
            lastName: lastName,
            email: email,
            dui: dui, // Usar 'dui' en lugar de 'id'
            birthDate: birthDate,
            password: encriptarContraHash,
            phone: phone,
            address: address
        });

        // Guardar en la base de datos
        console.log('Guardando empleado...');
        await newEmpleado.save();
        console.log('Empleado guardado exitosamente');

        // Respuesta exitosa
        res.status(201).json({ 
            message: "Empleado agregado correctamente",
            empleado: {
                name,
                lastName,
                email,
                dui: dui,
                birthDate,
                phone,
                address
            }
        });

    } catch (error) {
        console.error('Error al registrar empleado:', error);
        res.status(500).json({ 
            message: "Error interno del servidor al registrar empleado", 
            error: error.message 
        });
    }
};

empleadosCon.put = async (req,res) => {
    try {
        const {name, lastName, email, dui, birthDate, password, phone, address} = req.body;

        const encriptarContraHash = await bcryptjs.hash(password, 10);

        await empleadosModel.findByIdAndUpdate(
            req.params.id,{
                name,
                lastName,
                email,
                dui, // Cambiar de 'id' a 'dui'
                birthDate,
                password: encriptarContraHash,
                phone,
                address
            },{new: true}
        );
        res.status(200).json({Message: "Empleado actualizado correctamente"});
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar empleado", error: error.message });
    }
};

empleadosCon.delete = async (req ,res) => {
    try {
        const deleteEmpleado = await empleadosModel.findByIdAndDelete(req.params.id);
        if(!deleteEmpleado){
           return res.status(404).json({Message: "Empleado no encontrado"});
        }
        res.status(200).json({Message: "Empleado eliminado correctamente"});
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el empleado", error: error.message });
    }
};

export default empleadosCon;