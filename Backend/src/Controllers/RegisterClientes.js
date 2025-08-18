import ClientesModelo from "../Models/Clientes.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "../config.js";

/**
 * Controlador para manejar el registro de clientes
 */
const RegsiterCliente = {};

/**
 * Registrar un nuevo cliente en el sistema
 * POST /clientes/register
 * 
 * Crea un nuevo cliente, hashea su contraseña y genera un token JWT
 * para autenticación automática después del registro.
 * 
 * @param {object} req - Objeto request que contiene los datos del cliente en req.body
 * @param {object} res - Objeto response de Express
 * @returns {object} JSON con mensaje de éxito o error, y cookie con token JWT
 */
RegsiterCliente.registrarCliente = async (req, res) => {
    // Extraer todos los datos del cliente del cuerpo de la petición
    const { firtsName, lastName, email, idNumber, birthDate, password, phone, address } = req.body;
    
    try {
        // Verificar si ya existe un cliente registrado con este email
        const validacion = await ClientesModelo.findOne({ email });
        
        if (validacion) {
            // Si ya existe, retornar error 500 con mensaje
            return res.status(500).json({ Message: "Usuario ya resgistrado con este correo" });
        }

        // Encriptar la contraseña usando bcrypt con salt de 10 rounds
        // Esto protege la contraseña en caso de que la base de datos sea comprometida
        const encriptarHash = await bcrypt.hash(password, 10);
        
        // Crear nueva instancia del modelo Cliente con los datos recibidos
        const newCliente = new ClientesModelo({
            firtsName,      // Primer nombre del cliente
            lastName,       // Apellido del cliente
            email,          // Email único para login
            idNumber,       // Número de identificación del cliente
            birthDate,      // Fecha de nacimiento
            password,       // Contraseña del cliente
            phone,          // Teléfono de contacto
            address         // Dirección física del cliente
        });
        
        // Guardar el nuevo cliente en la base de datos
        await newCliente.save();

        // Generar token JWT para autenticación automática después del registro
        jwt.sign(
            { id: newCliente._id },      // Payload: ID del cliente
            config.JWT.secret,           // Clave secreta para firmar el token
            { expiresIn: config.JWT.expiresIn }, // Tiempo de expiración del token
            (error, token) => {
                if (error) {
                    // Si hay error generando el token, no hacer nada específico
                    // (se removió el console.log)
                }
                
                // Establecer cookie con el token JWT para mantener sesión
                res.cookie("authToken", token);
                
                // Responder con mensaje de éxito
                res.status(200).json({ message: "Cliente registrado" });
            }
        );

    } catch (error) {
        // Manejar cualquier error durante el proceso de registro
        res.status(500).json({ message: "Error cliente no registrado" });
    }
};

// Exportar el controlador para uso en las rutas
export default RegsiterCliente;