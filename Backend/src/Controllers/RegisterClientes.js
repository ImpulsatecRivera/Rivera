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
// En RegisterClientes.js, reemplaza la función registrarCliente con:

RegsiterCliente.registrarCliente = async (req, res) => {
  const { 
    firstName, 
    lastName, 
    email, 
    idNumber, 
    birthDate, 
    password, 
    phone, 
    address,
    profileImage, // Para Base64
    imageType     // Para Base64
  } = req.body;

  console.log('Datos recibidos:', {
    firstName, lastName, email, idNumber, birthDate, phone, address,
    tieneImagenFormData: !!req.file,
    tieneImagenBase64: !!profileImage,
    contentType: req.get('Content-Type')
  });

  try {
    const validacion = await ClientesModelo.findOne({ email });
    
    if (validacion) {
      if (req.file && req.file.filename) {
        await deleteImageFromCloudinary(req.file.filename);
      }
      return res.status(400).json({
        message: "Usuario ya registrado con este correo",
        success: false
      });
    }

    const encriptarHash = await bcrypt.hash(password, 10);

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

    // MANEJAR IMAGEN - FormData O Base64
    if (req.file) {
      // CASO 1: FormData
      try {
        clienteData.profileImage = {
          url: req.file.path,
          public_id: req.file.filename
        };
        console.log('✅ Imagen FormData agregada:', req.file.path);
      } catch (imageError) {
        console.error("❌ Error procesando imagen FormData:", imageError);
        if (req.file.filename) {
          await deleteImageFromCloudinary(req.file.filename);
        }
      }
    } else if (profileImage && typeof profileImage === 'string') {
      // CASO 2: Base64
      try {
        console.log('📤 Procesando imagen Base64...');
        
        const result = await cloudinary.uploader.upload(profileImage, {
          folder: "clientes_profiles",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          transformation: [
            { width: 500, height: 500, crop: "fill", quality: "auto" }
          ],
          public_id: `cliente_${Date.now()}_${Math.round(Math.random() * 1E9)}`
        });

        clienteData.profileImage = {
          url: result.secure_url,
          public_id: result.public_id
        };
        console.log('✅ Imagen Base64 agregada:', result.secure_url);
      } catch (imageError) {
        console.error("❌ Error procesando imagen Base64:", imageError);
      }
    } else {
      console.log('ℹ️ Registro sin imagen (opcional)');
    }

    const newCliente = new ClientesModelo(clienteData);
    await newCliente.save();
    
    console.log('✅ Cliente guardado exitosamente:', newCliente._id);

    // Resto igual...
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

        res.cookie("authToken", token, {
          httpOnly: true,
          sameSite: "Lax",
          secure: process.env.NODE_ENV === 'production'
        });

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