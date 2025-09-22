import clienteModel from "../Models/Clientes.js";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const clienteCon = {};

/**
 * Configuración de Multer para manejar archivos de imagen
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Verificar que sea una imagen
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB
  }
});

/**
 * Middleware para subir imagen de perfil
 */
clienteCon.uploadProfileImage = upload.single('profileImage');

/**
 * Función para subir imagen a Cloudinary
 * @param {Buffer} buffer - Buffer del archivo
 * @param {string} clienteId - ID del cliente
 * @returns {Promise<object>} - Resultado de Cloudinary
 */
const uploadToCloudinary = (buffer, clienteId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'profile_images',
        public_id: `cliente_${clienteId}_${Date.now()}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        overwrite: true,
        invalidate: true
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

/**
 * Función para eliminar imagen de Cloudinary
 * @param {string} publicId - Public ID de la imagen en Cloudinary
 * @returns {Promise<object>} - Resultado de la eliminación
 */
const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Función para extraer public_id de URL de Cloudinary
 * @param {string} url - URL de Cloudinary
 * @returns {string} - Public ID extraído
 */
const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  const urlParts = url.split('/');
  const versionIndex = urlParts.findIndex(part => part.startsWith('v'));
  if (versionIndex !== -1 && versionIndex < urlParts.length - 1) {
    const pathAfterVersion = urlParts.slice(versionIndex + 1).join('/');
    return pathAfterVersion.replace(/\.[^/.]+$/, ''); // Remover extensión
  }
  
  return null;
};

/**
 * Función para validar si un ID de MongoDB es válido
 * @param {string} id - ID a validar
 * @returns {boolean} - true si es válido, false si no
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Función para validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Función para validar número de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - true si es válido
 */
const validatePhone = (phone) => {
  // Permite formatos: +123456789, 123-456-7890, (123) 456-7890, 123.456.7890
  const phoneRegex = /^[\+]?[\d\s\(\)\-\.]{8,15}$/;
  return phoneRegex.test(phone?.replace(/\s/g, ''));
};

/**
 * Función para validar fecha de nacimiento
 * @param {string} birthDate - Fecha a validar
 * @returns {boolean} - true si es válido
 */
const validateBirthDate = (birthDate) => {
  const date = new Date(birthDate);
  const now = new Date();
  const minAge = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate()); // 120 años máximo
  const maxAge = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate()); // 13 años mínimo
  
  return date >= minAge && date <= maxAge;
};

/**
 * Función para validar número de identificación
 * @param {string} idNumber - Número de ID a validar
 * @returns {boolean} - true si es válido
 */
const validateIdNumber = (idNumber) => {
  // Formato básico: 8-15 dígitos
  const idRegex = /^\d{8,15}$/;
  return idRegex.test(idNumber?.replace(/[-\s]/g, ''));
};

/**
 * Función para validar contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} - {isValid: boolean, message: string}
 */
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: "La contraseña debe tener al menos 6 caracteres"
    };
  }
  
  // Al menos una letra y un número
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      message: "La contraseña debe contener al menos una letra y un número"
    };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Función para validar campos requeridos
 * @param {object} data - Datos a validar
 * @param {array} requiredFields - Campos requeridos
 * @returns {object} - {isValid: boolean, missingFields: array}
 */
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => 
    !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
  );
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Obtener todos los clientes
 * GET /clientes
 */
clienteCon.get = async (req, res) => {
  try {
    // Obtener todos los clientes con paginación opcional
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Validar parámetros de paginación
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Parámetros de paginación inválidos",
        error: "La página debe ser >= 1 y el límite entre 1-100"
      });
    }

    // Obtener clientes con conteo total
    const [clientes, totalClientes] = await Promise.all([
      clienteModel.find()
        .select('-password') // Excluir contraseñas de la respuesta
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      clienteModel.countDocuments()
    ]);

    if (!clientes || clientes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No se encontraron clientes",
        data: {
          clientes: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalClientes: 0,
            clientesPerPage: limit
          }
        }
      });
    }

    // Calcular información de paginación
    const totalPages = Math.ceil(totalClientes / limit);

    res.status(200).json({
      success: true,
      message: "Clientes obtenidos exitosamente",
      data: {
        clientes,
        pagination: {
          currentPage: page,
          totalPages,
          totalClientes,
          clientesPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al obtener clientes",
      error: error.message
    });
  }
};

/**
 * Obtener un cliente específico por su ID
 * GET /clientes/:id
 */
clienteCon.getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de cliente inválido",
        error: "El ID proporcionado no tiene un formato válido de MongoDB"
      });
    }

    // Buscar el cliente por ID, excluyendo la contraseña por seguridad
    const cliente = await clienteModel.findById(id).select('-password');
    
    // Verificar si el cliente existe
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
        error: `No existe un cliente con el ID: ${id}`
      });
    }

    // Calcular información adicional útil
    const fechaRegistro = new Date(cliente.createdAt);
    const fechaActualizacion = cliente.updatedAt ? new Date(cliente.updatedAt) : null;
    const ahora = new Date();
    
    // Calcular días desde el registro
    const diasDesdeRegistro = Math.floor((ahora - fechaRegistro) / (1000 * 60 * 60 * 24));
    
    // Calcular edad si tiene fecha de nacimiento
    let edad = null;
    if (cliente.birthDate) {
      const fechaNacimiento = new Date(cliente.birthDate);
      edad = ahora.getFullYear() - fechaNacimiento.getFullYear();
      const mesActual = ahora.getMonth();
      const mesNacimiento = fechaNacimiento.getMonth();
      
      if (mesActual < mesNacimiento || (mesActual === mesNacimiento && ahora.getDate() < fechaNacimiento.getDate())) {
        edad--;
      }
    }

    // Determinar estado de actividad del cliente
    const hace30Dias = new Date(ahora.getTime() - (30 * 24 * 60 * 60 * 1000));
    const hace7Dias = new Date(ahora.getTime() - (7 * 24 * 60 * 60 * 1000));
    const hace24Horas = new Date(ahora.getTime() - (24 * 60 * 60 * 1000));
    
    let estadoActividad = "inactivo";
    let ultimaActividad = cliente.ultimoAcceso || cliente.updatedAt || cliente.createdAt;
    
    if (ultimaActividad >= hace24Horas) {
      estadoActividad = "online";
    } else if (ultimaActividad >= hace7Dias) {
      estadoActividad = "activo";
    } else if (ultimaActividad >= hace30Dias) {
      estadoActividad = "poco_activo";
    }

    // Estructurar respuesta completa con información enriquecida
    const response = {
      success: true,
      message: "Información del cliente obtenida exitosamente",
      data: {
        // Información básica del cliente
        cliente: {
          id: cliente._id,
          firstName: cliente.firstName,
          lastName: cliente.lastName,
          nombreCompleto: `${cliente.firstName} ${cliente.lastName}`,
          email: cliente.email,
          phone: cliente.phone || "No registrado",
          address: cliente.address || "No registrada",
          idNumber: cliente.idNumber,
          birthDate: cliente.birthDate,
          profileImage: cliente.profileImage || null,
          edad: edad ? `${edad} años` : "No disponible"
        },

        // Información de fechas y actividad
        actividad: {
          estadoActividad,
          fechaRegistro: fechaRegistro.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          diasDesdeRegistro,
          ultimaActualizacion: fechaActualizacion ? fechaActualizacion.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : "Sin actualizaciones",
          ultimoAcceso: cliente.ultimoAcceso ? new Date(cliente.ultimoAcceso).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : "No registrado"
        },

        // Metadatos útiles
        metadatos: {
          idOriginal: cliente._id,
          tipoUsuario: "Cliente",
          perfilCompleto: !!(cliente.firstName && cliente.lastName && cliente.email && cliente.phone && cliente.address),
          camposCompletos: [
            cliente.firstName ? "nombre" : null,
            cliente.lastName ? "apellido" : null,
            cliente.email ? "email" : null,
            cliente.phone ? "teléfono" : null,
            cliente.address ? "dirección" : null,
            cliente.birthDate ? "fecha_nacimiento" : null,
            cliente.idNumber ? "identificación" : null,
            cliente.profileImage ? "imagen_perfil" : null
          ].filter(Boolean),
          camposFaltantes: [
            !cliente.firstName ? "nombre" : null,
            !cliente.lastName ? "apellido" : null,
            !cliente.email ? "email" : null,
            !cliente.phone ? "teléfono" : null,
            !cliente.address ? "dirección" : null,
            !cliente.birthDate ? "fecha_nacimiento" : null,
            !cliente.idNumber ? "identificación" : null,
            !cliente.profileImage ? "imagen_perfil" : null
          ].filter(Boolean)
        }
      },

      // Información de la consulta
      consultaInfo: {
        fechaConsulta: ahora.toISOString(),
        idConsultado: id,
        tipoConsulta: "cliente_individual",
        version: "1.0"
      }
    };

    res.status(200).json(response);

  } catch (error) {
    // Manejo específico de errores de MongoDB
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de cliente con formato inválido",
        error: "El ID proporcionado no tiene el formato correcto de MongoDB"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor al obtener cliente",
      error: error.message,
      errorDetails: {
        tipo: error.name,
        codigo: error.code || "UNKNOWN"
      }
    });
  }
};

/**
 * Actualizar cliente existente con soporte para imagen de perfil
 * PUT /clientes/:id
 */
/**
 * Actualizar cliente existente con soporte para imagen de perfil
 * PUT /clientes/:id
 */
clienteCon.PutClientes = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de cliente inválido",
        error: "El ID proporcionado no tiene un formato válido"
      });
    }

    // Verificar que el cliente existe
    const clienteActual = await clienteModel.findById(id);
    if (!clienteActual) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
        error: `No existe un cliente con el ID: ${id}`
      });
    }

    // Preparar datos para actualización
    const datosActualizados = {};

    // CASO 1: Si hay archivo de imagen (multipart/form-data)
    if (req.file) {
      try {
        console.log('Procesando imagen de perfil...');
        
        // Si ya tiene una imagen, obtener el public_id para eliminarla después
        let imagenAnteriorPublicId = null;
        if (clienteActual.profileImage) {
          imagenAnteriorPublicId = extractPublicId(clienteActual.profileImage);
        }

        // Subir nueva imagen a Cloudinary
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer, id);
        
        // Agregar URL de la nueva imagen a los datos a actualizar
        datosActualizados.profileImage = cloudinaryResult.secure_url;

        // Eliminar imagen anterior de Cloudinary si existe
        if (imagenAnteriorPublicId) {
          try {
            await deleteFromCloudinary(imagenAnteriorPublicId);
            console.log('Imagen anterior eliminada de Cloudinary');
          } catch (deleteError) {
            console.warn('No se pudo eliminar la imagen anterior de Cloudinary:', deleteError.message);
          }
        }

        // Actualizar timestamp
        datosActualizados.updatedAt = new Date();

        // Realizar la actualización solo de la imagen
        const clienteActualizado = await clienteModel.findByIdAndUpdate(
          id,
          datosActualizados,
          { new: true, runValidators: true }
        ).select('-password');

        return res.status(200).json({
          success: true,
          message: "Imagen de perfil actualizada correctamente",
          data: {
            cliente: clienteActualizado,
            cambios: {
              imagenActualizada: true,
              fechaActualizacion: datosActualizados.updatedAt.toISOString(),
              imagenInfo: {
                nuevaUrl: datosActualizados.profileImage,
                imagenAnteriorEliminada: !!imagenAnteriorPublicId,
                tipoArchivo: req.file.mimetype,
                tamaño: `${(req.file.size / 1024).toFixed(2)} KB`
              }
            }
          }
        });

      } catch (cloudinaryError) {
        console.error('Error de Cloudinary:', cloudinaryError);
        return res.status(500).json({
          success: false,
          message: "Error al subir imagen a Cloudinary",
          error: cloudinaryError.message
        });
      }
    }

    // CASO 2: Si es JSON (application/json) - Actualizar datos de texto
    else if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      console.log('Procesando actualización de datos de texto...');
      
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

      // Validaciones específicas por campo si se proporcionan
      if (email && !validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Formato de email inválido",
          error: "Por favor proporciona un email válido"
        });
      }

      if (phone && !validatePhone(phone)) {
        return res.status(400).json({
          success: false,
          message: "Formato de teléfono inválido",
          error: "El teléfono debe tener entre 8-15 dígitos"
        });
      }

      if (idNumber && !validateIdNumber(idNumber)) {
        return res.status(400).json({
          success: false,
          message: "Número de identificación inválido",
          error: "El número de identificación debe tener entre 8-15 dígitos"
        });
      }

      if (birthDate && !validateBirthDate(birthDate)) {
        return res.status(400).json({
          success: false,
          message: "Fecha de nacimiento inválida",
          error: "La fecha debe corresponder a una persona entre 13 y 120 años"
        });
      }

      if (password) {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: "Contraseña inválida",
            error: passwordValidation.message
          });
        }
      }

      // Verificar unicidad de email si se está actualizando
      if (email && email !== clienteActual.email) {
        const emailExists = await clienteModel.findOne({
          email: email.toLowerCase(),
          _id: { $ne: id }
        });
        
        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: "Email duplicado",
            error: "Ya existe otro cliente registrado con este email"
          });
        }
      }

      // Verificar unicidad de número de identificación si se está actualizando
      if (idNumber && idNumber !== clienteActual.idNumber) {
        const idExists = await clienteModel.findOne({
          idNumber,
          _id: { $ne: id }
        });
        
        if (idExists) {
          return res.status(409).json({
            success: false,
            message: "Número de identificación duplicado",
            error: "Ya existe otro cliente con este número de identificación"
          });
        }
      }

      // Preparar datos para actualización (solo campos proporcionados)
      if (firstName) datosActualizados.firstName = firstName.trim();
      if (lastName) datosActualizados.lastName = lastName.trim();
      if (email) datosActualizados.email = email.toLowerCase().trim();
      if (idNumber) datosActualizados.idNumber = idNumber.trim();
      if (birthDate) datosActualizados.birthDate = birthDate;
      if (phone) datosActualizados.phone = phone.trim();
      if (address !== undefined) datosActualizados.address = address?.trim();

      // Hash de la contraseña si se proporciona
      if (password) {
        datosActualizados.password = await bcryptjs.hash(password, 12);
      }

      // Actualizar timestamp de última modificación
      datosActualizados.updatedAt = new Date();

      // Realizar la actualización
      const clienteActualizado = await clienteModel.findByIdAndUpdate(
        id,
        datosActualizados,
        { new: true, runValidators: true }
      ).select('-password');

      return res.status(200).json({
        success: true,
        message: "Cliente actualizado correctamente",
        data: {
          cliente: clienteActualizado,
          cambios: {
            camposActualizados: Object.keys(datosActualizados).filter(key => key !== 'updatedAt'),
            fechaActualizacion: datosActualizados.updatedAt.toISOString()
          }
        }
      });
    }

    // CASO 3: Si no hay archivo ni datos JSON válidos
    else {
      return res.status(400).json({
        success: false,
        message: "No se proporcionaron datos para actualizar",
        error: "Debe enviar datos JSON o una imagen de perfil"
      });
    }

  } catch (error) {
    console.error('Error en PutClientes:', error);
    
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: "Datos duplicados",
        error: `Ya existe un cliente con ese ${field}`
      });
    }

    // Manejar errores de Multer
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: "Archivo demasiado grande",
          error: "La imagen debe ser menor a 5MB"
        });
      }
    }

    // Manejar errores de validación de archivo
    if (error.message === 'Solo se permiten archivos de imagen') {
      return res.status(400).json({
        success: false,
        message: "Tipo de archivo inválido",
        error: "Solo se permiten archivos de imagen (JPG, PNG, GIF, etc.)"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al actualizar cliente",
      error: error.message
    });
  }
};

/**
 * Eliminar cliente
 * DELETE /clientes/:id
 */
clienteCon.deleteClientes = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de cliente inválido",
        error: "El ID proporcionado no tiene un formato válido"
      });
    }

    // Buscar el cliente antes de eliminarlo para obtener la imagen
    const clienteAEliminar = await clienteModel.findById(id);
    
    if (!clienteAEliminar) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
        error: `No existe un cliente con el ID: ${id}`
      });
    }

    // Eliminar imagen de Cloudinary si existe
    if (clienteAEliminar.profileImage) {
      const publicId = extractPublicId(clienteAEliminar.profileImage);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (cloudinaryError) {
          console.warn('No se pudo eliminar la imagen de Cloudinary:', cloudinaryError.message);
        }
      }
    }

    // Eliminar el cliente de la base de datos
    const deletedCliente = await clienteModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Cliente eliminado correctamente",
      data: {
        clienteEliminado: {
          id: deletedCliente._id,
          nombre: `${deletedCliente.firstName} ${deletedCliente.lastName}`,
          email: deletedCliente.email,
          imagenEliminada: !!deletedCliente.profileImage
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al eliminar cliente",
      error: error.message
    });
  }
};

/**
 * Obtener métricas detalladas de usuarios activos
 * GET /clientes/usuarios-activos
 */
clienteCon.getUsuariosActivos = async (req, res) => {
  try {
    // Definir rangos de tiempo para análisis de actividad
    const ahora = new Date();
    const hace30Dias = new Date(ahora.getTime() - (30 * 24 * 60 * 60 * 1000));
    const hace7Dias = new Date(ahora.getTime() - (7 * 24 * 60 * 60 * 1000));
    const hace24Horas = new Date(ahora.getTime() - (24 * 60 * 60 * 1000));

    // Agregación compleja para calcular múltiples métricas de actividad
    const metricas = await clienteModel.aggregate([
      {
        $facet: {
          // Conteo total de usuarios registrados
          totalUsuarios: [
            { $count: "total" }
          ],
          
          // Usuarios activos en los últimos 30 días
          usuariosActivos30Dias: [
            {
              $match: {
                $or: [
                  { ultimoAcceso: { $gte: hace30Dias } },
                  { updatedAt: { $gte: hace30Dias } },
                  { createdAt: { $gte: hace30Dias } }
                ]
              }
            },
            { $count: "activos" }
          ],

          // Usuarios muy activos en los últimos 7 días
          usuariosMuyActivos: [
            {
              $match: {
                $or: [
                  { ultimoAcceso: { $gte: hace7Dias } },
                  { updatedAt: { $gte: hace7Dias } }
                ]
              }
            },
            { $count: "muyActivos" }
          ],

          // Usuarios online en las últimas 24 horas
          usuariosOnline: [
            {
              $match: {
                $or: [
                  { ultimoAcceso: { $gte: hace24Horas } },
                  { updatedAt: { $gte: hace24Horas } }
                ]
              }
            },
            { $count: "online" }
          ],

          // Tendencia de registro de usuarios por mes
          usuariosPorPeriodo: [
            {
              $match: {
                createdAt: { $exists: true }
              }
            },
            {
              $group: {
                _id: {
                  año: { $year: "$createdAt" },
                  mes: { $month: "$createdAt" }
                },
                nuevosUsuarios: { $sum: 1 }
              }
            },
            { $sort: { "_id.año": -1, "_id.mes": -1 } },
            { $limit: 6 } // Últimos 6 meses
          ],

          // Distribución de usuarios por nivel de actividad
          distribucionActividad: [
            {
              $addFields: {
                estadoActividad: {
                  $cond: {
                    if: { $gte: ["$ultimoAcceso", hace24Horas] },
                    then: "online",
                    else: {
                      $cond: {
                        if: { $gte: ["$ultimoAcceso", hace7Dias] },
                        then: "activo",
                        else: {
                          $cond: {
                            if: { $gte: ["$ultimoAcceso", hace30Dias] },
                            then: "poco_activo",
                            else: "inactivo"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            {
              $group: {
                _id: "$estadoActividad",
                cantidad: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // Procesar y estructurar los resultados de la agregación
    const resultados = metricas[0];
    
    const totalUsuarios = resultados.totalUsuarios[0]?.total || 0;
    const usuariosActivos = resultados.usuariosActivos30Dias[0]?.activos || 0;
    const usuariosMuyActivos = resultados.usuariosMuyActivos[0]?.muyActivos || 0;
    const usuariosOnline = resultados.usuariosOnline[0]?.online || 0;

    // Calcular tendencias comparando con el período anterior (30-60 días atrás)
    const hace60Dias = new Date(ahora.getTime() - (60 * 24 * 60 * 60 * 1000));
    const usuariosActivosAnterior = await clienteModel.countDocuments({
      $or: [
        { 
          ultimoAcceso: { 
            $gte: hace60Dias, 
            $lt: hace30Dias 
          } 
        },
        { 
          updatedAt: { 
            $gte: hace60Dias, 
            $lt: hace30Dias 
          } 
        }
      ]
    });

    // Calcular porcentaje de cambio en la tendencia
    const tendencia = usuariosActivosAnterior > 0 
      ? ((usuariosActivos - usuariosActivosAnterior) / usuariosActivosAnterior * 100).toFixed(1)
      : usuariosActivos > 0 ? "+100" : "0";

    // Estructurar respuesta completa con todas las métricas
    const response = {
      success: true,
      data: {
        // Métricas principales de actividad
        usuariosActivos: {
          total: usuariosActivos,
          porcentaje: totalUsuarios > 0 ? ((usuariosActivos / totalUsuarios) * 100).toFixed(1) : "0",
          tendencia: tendencia > 0 ? `+${tendencia}%` : `${tendencia}%`,
          tipoCambio: tendencia > 0 ? "positive" : tendencia < 0 ? "negative" : "neutral"
        },

        // Desglose detallado de métricas
        detalles: {
          totalUsuarios,
          usuariosOnline,
          usuariosMuyActivos,
          usuariosActivos,
          usuariosInactivos: totalUsuarios - usuariosActivos
        },

        // Distribución por tipo de actividad
        distribucion: resultados.distribucionActividad.reduce((acc, item) => {
          acc[item._id || 'sin_datos'] = item.cantidad;
          return acc;
        }, {}),

        // Descripción de los períodos utilizados
        periodos: {
          online: "Últimas 24 horas",
          muyActivos: "Últimos 7 días", 
          activos: "Últimos 30 días",
          tendencia: "Comparado con mes anterior"
        }
      },

      // Metadatos de la consulta
      metadata: {
        fechaConsulta: ahora.toISOString(),
        criterioActividad: "ultimoAcceso o updatedAt en últimos 30 días",
        totalRegistros: totalUsuarios,
        version: "1.0"
      },

      message: `${usuariosActivos} usuarios activos de ${totalUsuarios} registrados`
    };

    res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor al calcular usuarios activos", 
      error: error.message 
    });
  }
};

/**
 * Obtener resumen rápido de usuarios para métricas del dashboard
 * GET /clientes/resumen
 */
clienteCon.getResumenUsuarios = async (req, res) => {
  try {
    // Definir período de actividad (últimos 30 días)
    const hace30Dias = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    
    // Ejecutar consultas en paralelo para optimizar rendimiento
    const [total, activos] = await Promise.all([
      clienteModel.countDocuments(),
      clienteModel.countDocuments({
        $or: [
          { ultimoAcceso: { $gte: hace30Dias } },
          { updatedAt: { $gte: hace30Dias } },
          { createdAt: { $gte: hace30Dias } }
        ]
      })
    ]);

    // Calcular métricas adicionales para tendencias
    const hace60Dias = new Date(Date.now() - (60 * 24 * 60 * 60 * 1000));
    const activosAnterior = await clienteModel.countDocuments({
      $or: [
        { ultimoAcceso: { $gte: hace60Dias, $lt: hace30Dias } },
        { updatedAt: { $gte: hace60Dias, $lt: hace30Dias } }
      ]
    });

    // Calcular tendencia real comparando períodos
    let tendencia = "neutral";
    let cambio = "0%";
    
    if (activosAnterior > 0) {
      const diferencia = ((activos - activosAnterior) / activosAnterior * 100);
      cambio = diferencia > 0 ? `+${diferencia.toFixed(1)}%` : `${diferencia.toFixed(1)}%`;
      tendencia = diferencia > 0 ? "positive" : diferencia < 0 ? "negative" : "neutral";
    } else if (activos > 0) {
      cambio = "+100%";
      tendencia = "positive";
    }

    // Respuesta optimizada para dashboards
    res.status(200).json({
      success: true,
      data: {
        usuariosActivos: activos.toLocaleString(),
        totalUsuarios: total.toLocaleString(),
        porcentajeActividad: total > 0 ? ((activos / total) * 100).toFixed(1) : "0",
        tendencia,
        cambio
      },
      metadata: {
        fechaConsulta: new Date().toISOString(),
        periodo: "Últimos 30 días"
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor al obtener resumen de usuarios", 
      error: error.message 
    });
  }
};

export default clienteCon;