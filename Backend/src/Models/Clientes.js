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
    required: true,    // Campo obligatorio, debe ser único para autenticación
    unique: true       // ✅ AGREGAR unique para evitar duplicados
  },
  
  // ✅ INFORMACIÓN DE GOOGLE OAUTH
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true       // sparse permite múltiples documentos con null
  },
  profilePicture: { 
    type: String 
  },
  isGoogleUser: { 
    type: Boolean, 
    default: false 
  },
  emailVerified: { 
    type: Boolean, 
    default: false 
  },
  
  // ✅ INFORMACIÓN OPCIONAL PARA USUARIOS DE GOOGLE
  // Información de identificación
  idNumber: {
    type: String,      // Número de identificación personal (DUI, cédula, etc.)
    required: function() {
      return !this.isGoogleUser; // Solo requerido si NO es usuario de Google
    }
  },
  birthDate: {
    type: Date,        // Fecha de nacimiento del cliente
    required: function() {
      return !this.isGoogleUser; // Solo requerido si NO es usuario de Google
    }
  },
  
  // Información de seguridad
  password: {
    type: String,      // Contraseña hasheada para acceso al sistema
    required: function() {
      return !this.isGoogleUser; // Solo requerido si NO es usuario de Google
    }
  },
  
  // Información de contacto físico
  phone: {
    type: String,      // Número de teléfono del cliente
    required: function() {
      return !this.isGoogleUser; // Solo requerido si NO es usuario de Google
    }
  },
  address: {
    type: String,      // Dirección física completa del cliente
    required: function() {
      return !this.isGoogleUser; // Solo requerido si NO es usuario de Google
    }
  },

  // ✅ CAMPOS ADICIONALES PARA COMPLETAR PERFIL DESPUÉS
  profileCompleted: {
    type: Boolean,
    default: function() {
      return !this.isGoogleUser; // true para usuarios normales, false para Google users
    }
  },
  
  // Campos que el usuario puede llenar después
  temporaryPhone: { type: String }, // Teléfono temporal hasta completar perfil
  temporaryAddress: { type: String }, // Dirección temporal
  
}, {
  // Opciones del esquema
  timestamps: true,      // Agrega automáticamente campos createdAt y updatedAt
  strict: false,         // Permite campos adicionales no definidos en el esquema
  collection: "Clientes" // Fuerza el nombre exacto de la colección en MongoDB
});

/**
 * Middleware para validaciones adicionales
 */
clienteSchema.pre('save', function(next) {
  // Si es usuario de Google, marcar como verificado
  if (this.isGoogleUser && this.googleId) {
    this.emailVerified = true;
  }
  
  // Validar que usuarios no-Google tengan los campos requeridos
  if (!this.isGoogleUser) {
    const requiredFields = ['idNumber', 'birthDate', 'password', 'phone', 'address'];
    const missingFields = requiredFields.filter(field => !this[field]);
    
    if (missingFields.length > 0) {
      return next(new Error(`Campos requeridos faltantes para usuario regular: ${missingFields.join(', ')}`));
    }
  }
  
  next();
});

/**
 * Método para verificar si el perfil está completo
 */
clienteSchema.methods.isProfileComplete = function() {
  if (!this.isGoogleUser) return true;
  
  // Para usuarios de Google, verificar campos mínimos
  return !!(this.phone && this.address && this.idNumber && this.birthDate);
};

/**
 * Método para obtener nombre completo
 */
clienteSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`.trim();
};

/**
 * Exportar el modelo basado en el esquema
 * Este modelo se usará para realizar operaciones CRUD en la colección Clientes
 */
export default model("Clientes", clienteSchema);