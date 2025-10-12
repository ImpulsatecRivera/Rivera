/**
 * Esquema de Mongoose para la colección de Motoristas
 * Define la estructura y validaciones de los documentos de motoristas/conductores en MongoDB
 */

import { Schema, model } from "mongoose";

/**
 * Definición del esquema para la colección de Motoristas
 * Contiene toda la información personal, de identificación y documentación legal
 * requerida para conductores de camiones en el sistema de transporte
 */
const motoristaSchema = new Schema({
    // Información personal básica
    name: {
        type: String,      // Nombre del motorista/conductor
        required: true     // Campo obligatorio para identificación
    },
    lastName: {
        type: String,      // Apellido del motorista/conductor
        required: true     // Campo obligatorio para identificación completa
    },
    
    // Información de identificación legal
    id: {
        type: String,      // Número de identificación (DUI, cédula, etc.)
        required: true     // Campo obligatorio para verificación legal del conductor
    },
    birthDate: {
        type: Date,        // Fecha de nacimiento del motorista
        required: true     // Campo obligatorio para validar edad legal para conducir
    },
    
    // Información de seguridad y acceso
    password: {
        type: String,      // Contraseña hasheada para acceso al sistema
        required: true     // Campo obligatorio para autenticación del motorista
    },
    
    // Información de contacto
    phone: {
        type: String,      // Número de teléfono del motorista
        required: true     // Campo obligatorio para comunicación durante rutas
    },
    address: {
        type: String,      // Dirección física completa del motorista
        required: true     // Campo obligatorio para registros legales y contacto
    },
    
    // Documentación específica para conductores
    circulationCard: {
        type: String,      // Tarjeta de circulación o licencia de conducir
        required: true     // Campo obligatorio para validar capacidad legal de conducir
    },
    phoneVerified: { type: Boolean, default: false }, // ⭐ AGREGAR ESTO
  phoneVerifiedAt: { type: Date }, // ⭐ AGREGAR ESTO (opcional)
    
    // Información multimedia
    img: {
        type: String,      // URL de la foto del motorista (generalmente desde Cloudinary)
        required: true     // Campo obligatorio para identificación visual y seguridad
    }
}, {
    // Opciones del esquema
    timestamps: true,      // Agrega automáticamente campos createdAt y updatedAt
    strict: false,         // Permite campos adicionales no definidos en el esquema
    collection: "Motorista" // Fuerza el nombre exacto de la colección en MongoDB
});

/**
 * Exportar el modelo basado en el esquema
 * Este modelo se usará para realizar operaciones CRUD en la colección Motorista
 * Los motoristas podrán ser asignados a camiones específicos para realizar rutas
 */
export default model("Motorista", motoristaSchema);