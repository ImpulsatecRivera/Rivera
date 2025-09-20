import ClientesModelo from "../Models/Clientes.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "../config.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

/**
 * Configuración de Multer con Cloudinary para subida OPCIONAL de imágenes
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "clientes_profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 500, height: 500, crop: "fill", quality: "auto" }
    ],
    public_id: (req, file) => `cliente_${Date.now()}_${Math.round(Math.random() * 1E9)}`
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

/**
 * Middleware para subida OPCIONAL de imagen de perfil
 */
export const uploadProfileImage = upload.single('profileImage');

/**
 * Función auxiliar para eliminar imagen si hay error
 */
const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
    console.log(`Imagen eliminada: ${publicId}`);
  } catch (error) {
    console.error("Error eliminando imagen:", error);
  }
};

/**
 * Controlador para manejar SOLO el registro de clientes
 */
const RegsiterCliente = {};

/**
 * Registrar un nuevo cliente en el sistema (con imagen OPCIONAL)
 * POST /clientes/
 */
RegsiterCliente.registrarCliente = async (req, res) => {
  const { 
    firstName, 
    lastName, 
    email, 
    idNumber, 
    birthDate, 
    password, 
    phone, 
    address 
  } = req.body;

  console.log('Datos recibidos:', {
    firstName, lastName, email, idNumber, birthDate, phone, address,
    tieneImagen: !!req.file
  });

  try {
    // Verificar si el usuario ya existe
    const validacion = await ClientesModelo.findOne({ email });
    
    if (validacion) {
      // Si hay imagen pero el usuario ya existe, eliminarla
      if (req.file && req.file.filename) {
        await deleteImageFromCloudinary(req.file.filename);
      }
      return res.status(400).json({
        message: "Usuario ya registrado con este correo",
        success: false
      });
    }

    // Encriptar contraseña
    const encriptarHash = await bcrypt.hash(password, 10);

    // Preparar datos del cliente
    const clienteData = {
      firstName,
      lastName,
      email,
      idNumber,
      birthDate,
      password: encriptarHash,
      phone,
      address
    };

    // Solo agregar imagen SI existe (OPCIONAL)
    if (req.file) {
      try {
        clienteData.profileImage = {
          url: req.file.path,
          public_id: req.file.filename
        };
        console.log('Imagen de perfil agregada:', req.file.path);
      } catch (imageError) {
        console.error("Error procesando imagen:", imageError);
        // Si hay error con la imagen, eliminarla pero continuar sin imagen
        if (req.file.filename) {
          await deleteImageFromCloudinary(req.file.filename);
        }
        console.log('Continuando registro sin imagen debido a error');
      }
    } else {
      console.log('Registro sin imagen (opcional)');
    }

    // Crear nuevo cliente
    const newCliente = new ClientesModelo(clienteData);
    await newCliente.save();
    
    console.log('Cliente guardado exitosamente:', newCliente._id);

    // Generar token JWT
    jwt.sign(
      { id: newCliente._id, userType: "Cliente" },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn },
      (error, token) => {
        if (error) {
          console.error("Error generando token:", error);
          return res.status(500).json({ 
            message: "Error al generar token",
            success: false 
          });
        }

        console.log('Token generado exitosamente');

        // Establecer cookie con el token JWT
        res.cookie("authToken", token, {
          httpOnly: true,
          sameSite: "Lax",
          secure: process.env.NODE_ENV === 'production'
        });

        // Respuesta exitosa
        res.status(200).json({
          message: "Cliente registrado exitosamente",
          userType: "Cliente",
          user: {
            id: newCliente._id,
            email: newCliente.email,
            nombre: `${firstName} ${lastName}`,
            firstName: firstName,
            lastName: lastName,
            profileImage: newCliente.profileImage || null
          },
          token: token,
          success: true
        });
      }
    );

  } catch (error) {
    console.error("Error en registro:", error);
    
    // Si hay imagen subida pero hay error, eliminarla
    if (req.file && req.file.filename) {
      await deleteImageFromCloudinary(req.file.filename);
    }
    
    res.status(500).json({
      message: "Error al registrar cliente",
      success: false
    });
  }
};

export default RegsiterCliente;