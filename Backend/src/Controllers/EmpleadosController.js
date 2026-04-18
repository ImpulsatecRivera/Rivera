import empleadosModel from "../Models/Empleados.js";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

const empleadosCon = {};

/**
 * Configuración de Cloudinary para manejo de imágenes de empleados
 */
cloudinary.config({
    cloud_name: config.cloudinary.cloudinary_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret,
});

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
 * Función para validar DUI de El Salvador
 * @param {string} dui - DUI a validar
 * @returns {boolean} - true si es válido
 */
const validateDUI = (dui) => {
    // Remover guiones y espacios para validar solo números
    const duiNumbers = dui?.replace(/\D/g, '');
    return duiNumbers && duiNumbers.length === 9;
};

/**
 * Función para validar número de teléfono de El Salvador
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - true si es válido
 */
const validatePhone = (phone) => {
    // El Salvador usa números de 8 dígitos
    const phoneNumbers = phone?.replace(/\D/g, '');
    return phoneNumbers && phoneNumbers.length === 8;
};

/**
 * Función para validar fecha de nacimiento
 * @param {string} birthDate - Fecha a validar
 * @returns {boolean} - true si es válido
 */
const validateBirthDate = (birthDate) => {
    const date = new Date(birthDate);
    const now = new Date();
    const minAge = new Date(now.getFullYear() - 70, now.getMonth(), now.getDate()); // 70 años máximo
    const maxAge = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate()); // 18 años mínimo
    
    return date >= minAge && date <= maxAge && !isNaN(date.getTime());
};

/**
 * Función para validar contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} - {isValid: boolean, message: string}
 */
const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return {
            isValid: false,
            message: "La contraseña debe tener al menos 8 caracteres"
        };
    }
    
    // Al menos una letra mayúscula, una minúscula y un número
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        return {
            isValid: false,
            message: "La contraseña debe contener al menos una letra mayúscula, una minúscula y un número"
        };
    }
    
    return { isValid: true, message: "" };
};

/**
 * Función para validar salario
 * @param {number} salario - Salario a validar
 * @returns {object} - {isValid: boolean, message: string}
 */
const validateSalario = (salario) => {
    // Convertir a número si viene como string
    const salarioNum = Number(salario);
    
    if (isNaN(salarioNum)) {
        return {
            isValid: false,
            message: "El salario debe ser un número válido"
        };
    }
    
    if (salarioNum < 0) {
        return {
            isValid: false,
            message: "El salario no puede ser negativo"
        };
    }
    
    // Salario mínimo en El Salvador (2024) es aproximadamente $365
    if (salarioNum < 365) {
        return {
            isValid: false,
            message: "El salario no puede ser menor al salario mínimo ($365)"
        };
    }
    
    // Límite razonable superior (opcional)
    if (salarioNum > 100000) {
        return {
            isValid: false,
            message: "El salario no puede exceder los $100,000"
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
 * Función para formatear DUI con guiones
 * @param {string} dui - DUI sin formato
 * @returns {string} - DUI formateado (12345678-9)
 */
const formatDUI = (dui) => {
    const numbers = dui.replace(/\D/g, '');
    return `${numbers.slice(0, 8)}-${numbers.slice(8)}`;
};

/**
 * Función para formatear teléfono
 * @param {string} phone - Teléfono sin formato
 * @returns {string} - Teléfono formateado (1234-5678)
 */
const formatPhone = (phone) => {
    const numbers = phone.replace(/\D/g, '');
    return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
};

/**
 * ✅ NUEVO: Normalización de campos tipo "enum"
 * Esto evita errores como "Rol inválido" cuando el front manda:
 * "Supervisor " (con espacio), "supervisor" (minúsculas), "SUPERVISOR", etc.
 */
const normalizeText = (v) => String(v ?? "").trim();

const normalizeRol = (rol) => {
    const r = normalizeText(rol).toLowerCase();
    if (r === "operativo") return "Operativo";
    if (r === "supervisor") return "Supervisor";
    if (r === "coordinador") return "Coordinador";
    return normalizeText(rol); // si viene raro, quedará raro y fallará en validación
};

const normalizePlanillaTipo = (planillaTipo) => {
    const p = normalizeText(planillaTipo).toLowerCase();
    if (p === "semanal") return "Semanal";
    if (p === "quincenal") return "Quincenal";
    return normalizeText(planillaTipo);
};

const normalizeCuentaDesactivada = (value, defaultValue = false) => {
    if (value === undefined || value === null || value === "") return defaultValue;
    return value === true || value === "true" || value === 1 || value === "1";
};

/**
 * Generar email automático para empleados basado en nombre y apellido
 * @param {string} name - Nombre del empleado
 * @param {string} lastName - Apellido del empleado
 * @param {string} excludeId - ID a excluir en verificación de duplicados (para updates)
 * @returns {string} - Email único generado
 */
const generarEmail = async (name, lastName, excludeId = null) => {
    // Validar que los parámetros existan
    if (!name || !lastName) {
        throw new Error('Nombre y apellido son requeridos para generar el email');
    }

    // Limpiar y normalizar nombre y apellido
    const nombreLimpio = name.trim().toLowerCase().replace(/[^a-z]/g, '');
    const apellidoLimpio = lastName.trim().toLowerCase().replace(/[^a-z]/g, '');
    
    if (!nombreLimpio || !apellidoLimpio) {
        throw new Error('Nombre y apellido deben contener al menos una letra');
    }

    const dominio = "rivera.com";
    let base = `${nombreLimpio}.${apellidoLimpio}`;
    let email = `${base}@${dominio}`;
    let contador = 1;

    // Verificar unicidad del email, excluyendo el ID actual si es una actualización
    const query = { email };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    while (await empleadosModel.findOne(query)) {
        email = `${base}${contador}@${dominio}`;
        contador++;
        query.email = email;
    }

    return email;
};

/**
 * Obtener todos los empleados
 * GET /empleados
 */
empleadosCon.get = async (req, res) => {
    try {
        const soloActivos = String(req.query.soloActivos ?? "").toLowerCase() === "true";
        // Agregar paginación opcional (desactivada por defecto para traer todo)
        const page = parseInt(req.query.page) || 1;
        const limitQuery = req.query.limit ? parseInt(req.query.limit) : null;

        const query = soloActivos ? { cuentaDesactivada: { $ne: true } } : {};
        let empleadosQuery = empleadosModel.find(query).select('-password').sort({ createdAt: -1 });

        let limit = null;
        if (limitQuery !== null) {
            if (isNaN(limitQuery) || limitQuery < 1 || limitQuery > 1000) {
                return res.status(400).json({
                    success: false,
                    message: "Parámetros de paginación inválidos",
                    error: "El límite debe ser entre 1 y 1000"
                });
            }
            limit = limitQuery;
            const skip = (page - 1) * limit;
            empleadosQuery = empleadosQuery.skip(skip).limit(limit);
        }

        // Obtener empleados sin contraseñas y con conteo total
        const [empleados, totalEmpleados] = await Promise.all([
            empleadosQuery,
            empleadosModel.countDocuments()
        ]);

        if (!empleados || empleados.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No se encontraron empleados",
                data: {
                    empleados: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalEmpleados: 0,
                        empleadosPerPage: limit || empleados.length,
                        hasNextPage: false,
                        hasPrevPage: false
                    }
                }
            });
        }

        // Calcular información de paginación
        let totalPages = 1;
        let hasNextPage = false;
        let hasPrevPage = page > 1;
        if (limit !== null) {
            totalPages = Math.ceil(totalEmpleados / limit);
            hasNextPage = page < totalPages;
        }

        res.status(200).json({
            success: true,
            message: "Empleados obtenidos exitosamente",
            data: {
                empleados,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalEmpleados,
                    empleadosPerPage: limit !== null ? limit : empleados.length,
                    hasNextPage,
                    hasPrevPage
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener empleados",
            error: error.message
        });
    }
};

/**
 * Registrar nuevo empleado
 * POST /empleados
 */
empleadosCon.post = async (req, res) => {
    try {
        const { 
            name, 
            lastName, 
            email,
            dui, 
            birthDate, 
            password, 
            phone, 
            address, 
            salario, 
            rol,
            planillaTipo,  // ✅ Nuevo campo agregado
            cuentaDesactivada
        } = req.body;

        /**
         * ✅ NUEVO: normalizar antes de validar (aquí se arregla tu "Rol inválido")
         */
        const rolNormalizado = normalizeRol(rol);
        const planillaTipoNormalizado = normalizePlanillaTipo(planillaTipo);

        // Validar campos requeridos
        const requiredFields = ['name', 'lastName', 'dui', 'birthDate', 'password', 'phone', 'address', 'salario', 'rol', 'planillaTipo']; // ✅ Agregado a requeridos
        const validation = validateRequiredFields(
            { ...req.body, rol: rolNormalizado, planillaTipo: planillaTipoNormalizado },
            requiredFields
        );
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Faltan campos requeridos",
                error: `Los siguientes campos son obligatorios: ${validation.missingFields.join(', ')}`,
                missingFields: validation.missingFields
            });
        }

        // Validar rol (ya normalizado)
        const rolesPermitidos = ['Operativo', 'Supervisor', 'Coordinador'];
        if (!rolesPermitidos.includes(rolNormalizado)) {
            return res.status(400).json({
                success: false,
                message: "Rol inválido",
                error: `El rol debe ser uno de los siguientes: ${rolesPermitidos.join(', ')}`,
                received: rolNormalizado
            });
        }

        // ✅ NUEVO: Validar planillaTipo (ya normalizado)
        const planillasPermitidas = ['Semanal', 'Quincenal'];
        if (!planillasPermitidas.includes(planillaTipoNormalizado)) {
            return res.status(400).json({
                success: false,
                message: "Tipo de planilla inválido",
                error: `El tipo de planilla debe ser uno de los siguientes: ${planillasPermitidas.join(', ')}`,
                received: planillaTipoNormalizado
            });
        }

        // Validar DUI
        if (!validateDUI(dui)) {
            return res.status(400).json({
                success: false,
                message: "DUI inválido",
                error: "El DUI debe tener exactamente 9 dígitos"
            });
        }

        // Validar teléfono
        if (!validatePhone(phone)) {
            return res.status(400).json({
                success: false,
                message: "Teléfono inválido",
                error: "El teléfono debe tener exactamente 8 dígitos"
            });
        }

        // Validar fecha de nacimiento
        if (!validateBirthDate(birthDate)) {
            return res.status(400).json({
                success: false,
                message: "Fecha de nacimiento inválida",
                error: "El empleado debe tener entre 18 y 70 años"
            });
        }

        // Validar contraseña
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Contraseña inválida",
                error: passwordValidation.message
            });
        }

        // Validar salario
        const salarioValidation = validateSalario(salario);
        if (!salarioValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Salario inválido",
                error: salarioValidation.message
            });
        }

        // Validar longitud de campos de texto
        if (name.trim().length < 2 || name.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: "Nombre inválido",
                error: "El nombre debe tener entre 2 y 50 caracteres"
            });
        }

        if (lastName.trim().length < 2 || lastName.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: "Apellido inválido",
                error: "El apellido debe tener entre 2 y 50 caracteres"
            });
        }

        if (address.trim().length < 10 || address.trim().length > 200) {
            return res.status(400).json({
                success: false,
                message: "Dirección inválida",
                error: "La dirección debe tener entre 10 y 200 caracteres"
            });
        }

        // ✅ Validar email proporcionado por el usuario
        if (!email || email.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Email requerido",
                error: "El correo electrónico es obligatorio"
            });
        }

        const emailLimpio = email.trim().toLowerCase();
        if (!validateEmail(emailLimpio)) {
            return res.status(400).json({
                success: false,
                message: "Email inválido",
                error: "Formato de correo electrónico no válido"
            });
        }

        // Verificar duplicados
        const duiFormateado = formatDUI(dui);
        const existingEmployee = await empleadosModel.findOne({
            $or: [
                { dui: duiFormateado },
                { email: emailLimpio }
            ]
        });

        if (existingEmployee) {
            if (existingEmployee.dui === duiFormateado) {
                return res.status(409).json({
                    success: false,
                    message: "DUI duplicado",
                    error: "Ya existe un empleado registrado con este DUI"
                });
            }
            if (existingEmployee.email === email) {
                return res.status(409).json({
                    success: false,
                    message: "Email duplicado",
                    error: "Ya existe un empleado registrado con este email"
                });
            }
        }

        // Manejo de imagen con Cloudinary
        let imgUrl = "";
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "empleados",
                    allowed_formats: ["png", "jpg", "jpeg", "webp"],
                    transformation: [
                        { width: 400, height: 400, crop: "fill", gravity: "face" },
                        { quality: "auto" },
                        { fetch_format: "auto" }
                    ]
                });
                imgUrl = result.secure_url;
            } catch (uploadError) {
                return res.status(400).json({
                    success: false,
                    message: "Error al procesar la imagen",
                    error: "No se pudo subir la imagen proporcionada"
                });
            }
        } else {
            // Imagen por defecto si no se proporciona una
            imgUrl = "https://res.cloudinary.com/default/image/upload/v1/default-avatar.png";
        }

        // Encriptar contraseña
        const hashedPassword = await bcryptjs.hash(password, 12);

        // Crear nuevo empleado
        const newEmpleado = new empleadosModel({
            name: name.trim(),
            lastName: lastName.trim(),
            email: emailLimpio,
            dui: duiFormateado,
            birthDate: birthDate || new Date(),
            password: hashedPassword,
            phone: formatPhone(phone),
            address: address.trim(),
            salario: Number(salario),
            rol: rolNormalizado, // ✅ guardado ya normalizado
            planillaTipo: planillaTipoNormalizado,  // ✅ guardado ya normalizado
            img: imgUrl,
            cuentaDesactivada: normalizeCuentaDesactivada(cuentaDesactivada, false)
        });

        const empleadoGuardado = await newEmpleado.save();

        res.status(201).json({
            success: true,
            message: "Empleado agregado correctamente",
            data: {
                empleado: {
                    id: empleadoGuardado._id,
                    name: empleadoGuardado.name,
                    lastName: empleadoGuardado.lastName,
                    email: empleadoGuardado.email,
                    dui: empleadoGuardado.dui,
                    birthDate: empleadoGuardado.birthDate,
                    phone: empleadoGuardado.phone,
                    address: empleadoGuardado.address,
                    salario: empleadoGuardado.salario,
                    rol: empleadoGuardado.rol,
                    planillaTipo: empleadoGuardado.planillaTipo,  // ✅ Incluido en respuesta
                    img: empleadoGuardado.img
                }
            }
        });

    } catch (error) {
        // Manejo específico de errores de MongoDB
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                error: error.message,
                details: Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message
                }))
            });
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                message: "Datos duplicados",
                error: `Ya existe un empleado con ese ${field}`,
                field
            });
        }

        res.status(500).json({
            success: false,
            message: "Error interno del servidor al registrar empleado",
            error: error.message
        });
    }
};

/**
 * Actualizar empleado existente
 * PUT /empleados/:id
 */
empleadosCon.put = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar que el ID sea válido
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de empleado inválido",
                error: "El ID proporcionado no tiene un formato válido"
            });
        }

        // Verificar que el empleado existe
        const empleadoExistente = await empleadosModel.findById(id);
        if (!empleadoExistente) {
            return res.status(404).json({
                success: false,
                message: "Empleado no encontrado",
                error: `No existe un empleado con el ID: ${id}`
            });
        }

        const { 
            name, 
            lastName,
            email,
            dui, 
            birthDate, 
            password, 
            phone, 
            address, 
            salario, 
            rol,
            planillaTipo,  // ✅ Nuevo campo agregado
            cuentaDesactivada
        } = req.body;

        // ✅ NUEVO: normalizar si vienen estos campos
        const rolNormalizado = (rol !== undefined) ? normalizeRol(rol) : undefined;
        const planillaTipoNormalizado = (planillaTipo !== undefined) ? normalizePlanillaTipo(planillaTipo) : undefined;

        // Validaciones específicas por campo si se proporcionan
        if (name && (name.trim().length < 2 || name.trim().length > 50)) {
            return res.status(400).json({
                success: false,
                message: "Nombre inválido",
                error: "El nombre debe tener entre 2 y 50 caracteres"
            });
        }

        if (lastName && (lastName.trim().length < 2 || lastName.trim().length > 50)) {
            return res.status(400).json({
                success: false,
                message: "Apellido inválido",
                error: "El apellido debe tener entre 2 y 50 caracteres"
            });
        }

        if (dui && !validateDUI(dui)) {
            return res.status(400).json({
                success: false,
                message: "DUI inválido",
                error: "El DUI debe tener exactamente 9 dígitos"
            });
        }

        if (phone && !validatePhone(phone)) {
            return res.status(400).json({
                success: false,
                message: "Teléfono inválido",
                error: "El teléfono debe tener exactamente 8 dígitos"
            });
        }

        if (birthDate && !validateBirthDate(birthDate)) {
            return res.status(400).json({
                success: false,
                message: "Fecha de nacimiento inválida",
                error: "El empleado debe tener entre 18 y 70 años"
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

        if (salario !== undefined) {
            const salarioValidation = validateSalario(salario);
            if (!salarioValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: "Salario inválido",
                    error: salarioValidation.message
                });
            }
        }

        if (address && (address.trim().length < 10 || address.trim().length > 200)) {
            return res.status(400).json({
                success: false,
                message: "Dirección inválida",
                error: "La dirección debe tener entre 10 y 200 caracteres"
            });
        }

        // Validar rol si se proporciona (normalizado)
        if (rolNormalizado !== undefined) {
            const rolesPermitidos = ['Operativo', 'Supervisor', 'Coordinador'];
            if (!rolesPermitidos.includes(rolNormalizado)) {
                return res.status(400).json({
                    success: false,
                    message: "Rol inválido",
                    error: `El rol debe ser uno de los siguientes: ${rolesPermitidos.join(', ')}`,
                    received: rolNormalizado
                });
            }
        }

        // ✅ NUEVO: Validar planillaTipo si se proporciona (normalizado)
        if (planillaTipoNormalizado !== undefined) {
            const planillasPermitidas = ['Semanal', 'Quincenal'];
            if (!planillasPermitidas.includes(planillaTipoNormalizado)) {
                return res.status(400).json({
                    success: false,
                    message: "Tipo de planilla inválido",
                    error: `El tipo de planilla debe ser uno de los siguientes: ${planillasPermitidas.join(', ')}`,
                    received: planillaTipoNormalizado
                });
            }
        }

        // Verificar duplicados si se están actualizando DUI
        if (dui) {
            const duiFormateado = formatDUI(dui);
            const duplicateDUI = await empleadosModel.findOne({
                dui: duiFormateado,
                _id: { $ne: id }
            });
            
            if (duplicateDUI) {
                return res.status(409).json({
                    success: false,
                    message: "DUI duplicado",
                    error: "Ya existe otro empleado registrado con este DUI"
                });
            }
        }

        // Construir objeto de actualización
        const datosActualizados = {};

        // Solo actualizar campos que se enviaron
        if (name) datosActualizados.name = name.trim();
        if (lastName) datosActualizados.lastName = lastName.trim();
        if (dui) datosActualizados.dui = formatDUI(dui);
        if (birthDate) datosActualizados.birthDate = birthDate;
        if (phone) datosActualizados.phone = formatPhone(phone);
        if (address !== undefined) datosActualizados.address = address.trim();
        if (salario !== undefined) datosActualizados.salario = Number(salario);
        if (rolNormalizado !== undefined) datosActualizados.rol = rolNormalizado;
        if (planillaTipoNormalizado !== undefined) datosActualizados.planillaTipo = planillaTipoNormalizado;
        if (cuentaDesactivada !== undefined) {
            datosActualizados.cuentaDesactivada = normalizeCuentaDesactivada(
                cuentaDesactivada,
                empleadoExistente.cuentaDesactivada === true
            );
        }

        // ✅ Actualizar email si se proporciona
        if (email && email.trim() !== "") {
            const emailLimpio = email.trim().toLowerCase();
            if (!validateEmail(emailLimpio)) {
                return res.status(400).json({
                    success: false,
                    message: "Email inválido",
                    error: "Formato de correo electrónico no válido"
                });
            }
            
            // Verificar que el nuevo email no esté duplicado (excluyendo el empleado actual)
            const emailDuplicado = await empleadosModel.findOne({
                email: emailLimpio,
                _id: { $ne: id }
            });
            
            if (emailDuplicado) {
                return res.status(409).json({
                    success: false,
                    message: "Email duplicado",
                    error: "Ya existe otro empleado con este correo electrónico"
                });
            }
            
            datosActualizados.email = emailLimpio;
        }

        // Manejo de imagen si se proporciona
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "empleados",
                    allowed_formats: ["png", "jpg", "jpeg", "webp"],
                    transformation: [
                        { width: 400, height: 400, crop: "fill", gravity: "face" },
                        { quality: "auto" },
                        { fetch_format: "auto" }
                    ]
                });
                datosActualizados.img = result.secure_url;
            } catch (uploadError) {
                return res.status(400).json({
                    success: false,
                    message: "Error al procesar la imagen",
                    error: "No se pudo subir la imagen proporcionada"
                });
            }
        }

        // Encriptar contraseña si fue enviada
        if (password) {
            datosActualizados.password = await bcryptjs.hash(password, 12);
        }

        // Actualizar timestamp
        datosActualizados.updatedAt = new Date();

        // Realizar la actualización
        const empleadoActualizado = await empleadosModel.findByIdAndUpdate(
            id,
            datosActualizados,
            { new: true, runValidators: true }
        ).select('-password'); // Excluir contraseña de la respuesta

        res.status(200).json({
            success: true,
            message: "Empleado actualizado correctamente",
            data: {
                empleado: empleadoActualizado
            }
        });
    } catch (error) {
        // Manejo específico de errores de MongoDB
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                message: "Datos duplicados",
                error: `Ya existe un empleado con ese ${field}`,
                field
            });
        }

        res.status(500).json({
            success: false,
            message: "Error interno del servidor al actualizar empleado",
            error: error.message
        });
    }
};

/**
 * Eliminar empleado
 * DELETE /empleados/:id
 */
empleadosCon.delete = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar que el ID sea válido
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de empleado inválido",
                error: "El ID proporcionado no tiene un formato válido"
            });
        }

        // Intentar eliminar el empleado
        const deletedEmpleado = await empleadosModel.findByIdAndDelete(id);
        
        if (!deletedEmpleado) {
            return res.status(404).json({
                success: false,
                message: "Empleado no encontrado",
                error: `No existe un empleado con el ID: ${id}`
            });
        }

        res.status(200).json({
            success: true,
            message: "Empleado eliminado correctamente",
            data: {
                empleadoEliminado: {
                    id: deletedEmpleado._id,
                    nombre: `${deletedEmpleado.name} ${deletedEmpleado.lastName}`,
                    email: deletedEmpleado.email,
                    dui: deletedEmpleado.dui
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al eliminar empleado",
            error: error.message
        });
    }
};

export default empleadosCon;

/**
 * Registrar nuevo empleado
 * POST /empleados
 */

/**
 * Actualizar empleado existente
 * PUT /empleados/:id
 */
