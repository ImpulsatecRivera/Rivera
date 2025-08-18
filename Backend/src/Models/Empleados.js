/**
 * Esquema de Mongoose para la colección de Empleados
 * Define la estructura y validaciones de los documentos de empleados en MongoDB
 */

import { Schema, model } from "mongoose";

/**
 * Definición del esquema para la colección de Empleados
 * Contiene toda la información personal, laboral y de contacto de los empleados del sistema
 */
const empleadoSchema = new Schema({
    // Información personal básica
    name: {
        type: String,      // Nombre del empleado
        required: true     // Campo obligatorio para identificación
    },
    lastName: {
        type: String,      // Apellido del empleado
        required: true     // Campo obligatorio para identificación completa
    },
    
    // Información de contacto y acceso
    email: {
        type: String,      // Correo electrónico del empleado (usado para login)
        required: true,    // Campo obligatorio
        unique: true       // Debe ser único en toda la colección (no puede haber duplicados)
    },
    
    // Información de identificación legal
    dui: {
        type: String,      // Documento Único de Identidad (específico de El Salvador)
        required: true,    // Campo obligatorio para verificación legal
        unique: true       // Debe ser único (no puede haber dos empleados con el mismo DUI)
    },
    birthDate: {
        type: Date,        // Fecha de nacimiento del empleado
        required: true     // Campo obligatorio para validar edad laboral
    },
    
    // Información de seguridad
    password: {
        type: String,      // Contraseña hasheada para acceso al sistema
        required: true     // Campo obligatorio para autenticación
    },
    
    // Información de contacto
    phone: {
        type: String,      // Número de teléfono del empleado
        required: true     // Campo obligatorio para comunicación laboral
    },
    address: {
        type: String,      // Dirección física completa del empleado
        required: true     // Campo obligatorio para registros de recursos humanos
    },
    
    // Información multimedia
    img: {
        type: String,      // URL de la foto del empleado (generalmente desde Cloudinary)
        required: true     // Campo obligatorio para identificación visual en el sistema
    }
}, {
    // Opciones del esquema
    timestamps: true,        // Agrega automáticamente campos createdAt y updatedAt
    strict: false,           // Permite campos adicionales no definidos en el esquema
    collection: "Empleados"  // Fuerza el nombre exacto de la colección en MongoDB
});

/**
 * Middleware pre-save: Se ejecuta antes de guardar un documento
 * 
 * IMPORTANTE: Eliminar datos anteriores si hay conflictos
 * Este middleware previene conflictos entre el campo 'id' y '_id' de MongoDB
 */
empleadoSchema.pre('save', function() {
    // Verificar si existe un campo 'id' que sea diferente al '_id' de MongoDB
    if (this.id && this.id !== this._id) {
        // Eliminar el campo 'id' conflictivo para evitar problemas de duplicación
        delete this.id;
    }
});

/**
 * Exportar el modelo basado en el esquema
 * Este modelo se usará para realizar operaciones CRUD en la colección Empleados
 */
export default model("Empleados", empleadoSchema);