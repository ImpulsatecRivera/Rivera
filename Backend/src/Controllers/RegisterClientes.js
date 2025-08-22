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
// En tu controlador del backend (RegsiterCliente.js):

RegsiterCliente.registrarCliente = async (req, res) => {
    const { firstName, lastName, email, idNumber, birthDate, password, phone, address } = req.body;
    
    console.log('📋 Datos recibidos en backend:', {
        firstName, lastName, email, idNumber, birthDate, phone, address
    });
    
    try {
        const validacion = await ClientesModelo.findOne({ email });
        
        if (validacion) {
            return res.status(400).json({ 
                message: "Usuario ya registrado con este correo" 
            });
        }

        const encriptarHash = await bcrypt.hash(password, 10);
        
        const newCliente = new ClientesModelo({
            firstName,
            lastName,
            email,
            idNumber,
            birthDate,
            password: encriptarHash,
            phone,
            address
        });
        
        await newCliente.save();
        console.log('✅ Cliente guardado exitosamente:', newCliente._id);

        // ✅ GENERAR TOKEN Y DEVOLVERLO EN LA RESPUESTA
        jwt.sign(
            { id: newCliente._id, userType: "Cliente" },
            config.JWT.secret,
            { expiresIn: config.JWT.expiresIn },
            (error, token) => {
                if (error) {
                    console.error("Error generando token:", error);
                    return res.status(500).json({ message: "Error al generar token" });
                }
                
                console.log('✅ Token generado exitosamente');
                
                // Establecer cookie con el token JWT
                res.cookie("authToken", token, {
                    httpOnly: true,
                    sameSite: "Lax",
                    secure: false
                });
                
                // ✅ RESPUESTA CORREGIDA: INCLUIR TOKEN EN JSON
                res.status(200).json({ 
                    message: "Cliente registrado exitosamente",
                    userType: "Cliente",
                    user: {
                        id: newCliente._id,  // ✅ ASEGURAR QUE EL ID ESTÉ AQUÍ
                        email: newCliente.email,
                        nombre: `${firstName} ${lastName}`,
                        firstName: firstName,
                        lastName: lastName
                    },
                    token: token,  // ✅ INCLUIR EL TOKEN EN LA RESPUESTA
                    success: true  // ✅ AGREGAR FLAG DE ÉXITO
                });
            }
        );

    } catch (error) {
        console.error("💥 Error en registro:", error);
        res.status(500).json({ 
            message: "Error cliente no registrado",
            success: false 
        });
    }
};

export default RegsiterCliente;