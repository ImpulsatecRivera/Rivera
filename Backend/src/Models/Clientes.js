/**
 * Esquema de Mongoose para la colección de Clientes
 * Define la estructura y validaciones de los documentos de clientes en MongoDB
 */

import { Schema, model } from "mongoose";

/**
 * Definición del esquema para la colección de Clientes
 * Contiene toda la información personal y de contacto de los clientes del sistema
 */
const clienteSchema = new Schema({
  // Información personal básica
  firstName: {
    type: String,      // Primer nombre del cliente
    required: true     // Campo obligatorio para identificación
  },
  lastName: {
    type: String,      // Apellido del cliente
    required: true     // Campo obligatorio para identificación completa
  },
  
  // Información de contacto y acceso
  email: {
    type: String,      // Correo electrónico del cliente (usado para login)
    required: true     // Campo obligatorio, debe ser único para autenticación
  },
  
  // Información de identificación
  idNumber: {
    type: String,      // Número de identificación personal (DUI, cédula, etc.)
    required: true     // Campo obligatorio para verificación de identidad
  },
  birthDate: {
    type: Date,        // Fecha de nacimiento del cliente
    required: true     // Campo obligatorio para validar edad legal
  },
  
  // Información de seguridad
  password: {
    type: String,      // Contraseña hasheada para acceso al sistema
    required: true     // Campo obligatorio para autenticación
  },
  
  // Información de contacto físico
  phone: {
    type: String,      // Número de teléfono del cliente
    required: true     // Campo obligatorio para comunicación
  },
  address: {
    type: String,      // Dirección física completa del cliente
    required: true     // Campo obligatorio para servicios de entrega/pickup
  }
}, {
  // Opciones del esquema
  timestamps: true,      // Agrega automáticamente campos createdAt y updatedAt
  strict: false,         // Permite campos adicionales no definidos en el esquema
  collection: "Clientes" // Fuerza el nombre exacto de la colección en MongoDB
});

/**
 * Exportar el modelo basado en el esquema
 * Este modelo se usará para realizar operaciones CRUD en la colección Clientes
 */
export default model("Clientes", clienteSchema);