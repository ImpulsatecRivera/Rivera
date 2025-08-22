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
 */
RegsiterCliente.registrarCliente = async (req, res) => {
    // ✅ CORREGIDO: Cambiar firtsName por firstName
    const { firstName, lastName, email, idNumber, birthDate, password, phone, address } = req.body;
    
    console.log('📋 Datos recibidos en backend:', {
        firstName,
        lastName,
        email,
        idNumber,
        birthDate,
        phone,
        address,
        passwordReceived: !!password
    });
    
    try {
        // Verificar si ya existe un cliente registrado con este email
        const validacion = await ClientesModelo.findOne({ email });
        
        if (validacion) {
            return res.status(400).json({ 
                message: "Usuario ya registrado con este correo" 
            });
        }

        // Encriptar la contraseña
        const encriptarHash = await bcrypt.hash(password, 10);
        
        // ✅ CORREGIDO: Crear nueva instancia con firstName correcto
        const newCliente = new ClientesModelo({
            firstName,      // ✅ Corregido de firtsName a firstName
            lastName,
            email,
            idNumber,
            birthDate,
            password: encriptarHash,
            phone,
            address
        });
        
        // Guardar el nuevo cliente en la base de datos
        await newCliente.save();
        console.log('✅ Cliente guardado exitosamente:', newCliente._id);

        // Generar token JWT
        jwt.sign(
            { id: newCliente._id, userType: "Cliente" },
            config.JWT.secret,
            { expiresIn: config.JWT.expiresIn },
            (error, token) => {
                if (error) {
                    console.error("Error generando token:", error);
                    return res.status(500).json({ message: "Error al generar token" });
                }
                
                // Establecer cookie con el token JWT
                res.cookie("authToken", token, {
                    httpOnly: true,
                    sameSite: "Lax",
                    secure: false
                });
                
                // Responder con mensaje de éxito
                res.status(200).json({ 
                    message: "Cliente registrado exitosamente",
                    userType: "Cliente",
                    user: {
                        id: newCliente._id,
                        email: newCliente.email,
                        nombre: `${firstName} ${lastName}` // ✅ Corregido
                    }
                });
            }
        );

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ message: "Error cliente no registrado" });
    }
};

export default RegsiterCliente;