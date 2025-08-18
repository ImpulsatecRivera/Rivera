import adminModel from "../Models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "../config.js";

/**
 * Controlador para manejar el registro de administradores
 */
const Register = {};

/**
 * Registrar un nuevo administrador en el sistema
 * POST /admin/register
 * 
 * Crea un nuevo administrador, hashea su contraseña y genera un token JWT
 * para autenticación automática después del registro.
 * 
 * @param {object} req - Objeto request que contiene los datos del admin en req.body
 * @param {object} res - Objeto response de Express
 * @returns {object} JSON con mensaje de éxito o error, y cookie con token JWT
 */
Register.registerAdmin = async (req, res) => {
    // Extraer todos los datos del administrador del cuerpo de la petición
    const { name, lastName, phone, address, email, password, birthDate, dui } = req.body;

    try {
        // Verificar si ya existe un administrador registrado con este email
        const validacion = await adminModel.findOne({ email });
        
        if (validacion) {
            // Si ya existe, retornar error 500 con mensaje
            return res.status(500).json({ Message: "Usuario ya resgistrado con este correo" });
        }

        // Encriptar la contraseña usando bcrypt con salt de 10 rounds
        // Esto protege la contraseña en caso de que la base de datos sea comprometida
        const encriptarHash = await bcrypt.hash(password, 10);

        // Crear nueva instancia del modelo Admin con los datos recibidos
        const newAdmin = new adminModel({
            name,           // Nombre del administrador
            lastName,       // Apellido del administrador
            phone,          // Teléfono de contacto
            address,        // Dirección física
            email,          // Email único para login
            password,       // Contraseña (debería ser encriptarHash)
            birthDate,      // Fecha de nacimiento
            dui            // Documento único de identidad
        });

        // Guardar el nuevo administrador en la base de datos
        await newAdmin.save();

        // Generar token JWT para autenticación automática después del registro
        jwt.sign(
            { id: newAdmin._id },    // Payload: ID del administrador
            config.JWT.secret,       // Clave secreta para firmar el token
            { expiresIn: config.JWT.expiresIn }, // Tiempo de expiración del token
            (error, token) => {
                if (error) {
                    // Si hay error generando el token, no hacer nada específico
                    // (se removió el console.log)
                }
                
                // Establecer cookie con el token JWT para mantener sesión
                res.cookie("authToken", token);
                
                // Responder con mensaje de éxito
                res.status(200).json({ message: "Administrador registrado" });
            }
        );
    } catch (error) {
        // Manejar cualquier error durante el proceso de registro
        // (se removió el console.log del error)
        res.status(500).json({ message: "Error administrador no registrado" });
    }
};

// Exportar el controlador para uso en las rutas
export default Register;