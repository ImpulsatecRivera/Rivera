/**
 * Esquema de Mongoose para la colección de Camiones
 * Define la estructura y validaciones de los documentos de camiones en MongoDB
 */

import { Schema, model } from "mongoose";

/**
 * Definición del esquema para la colección de Camiones
 * Contiene toda la información necesaria para gestionar los vehículos de la flota
 */
const camioneSchema = new Schema({
  // Información básica del camión
  name: {
    type: String,      // Nombre o identificador del camión
    required: false    // Campo opcional - usaremos la placa como identificador
  },
  brand: {
    type: String,      // Marca del camión (ej: Ford, Chevrolet, Mercedes)
    required: false    // Campo opcional
  },
  model: {
    type: String,      // Modelo específico del camión
    required: false    // Campo opcional
  },
  
  // Estado operacional del camión
  state: {
    type: String,      // Estado actual: "DISPONIBLE", "EN RUTA", "MANTENIMIENTO", etc.
    required: false,   // Campo opcional - valor por defecto: DISPONIBLE
    default: "DISPONIBLE"
  },
  
  // Información del combustible
  gasolineLevel: {
    type: Number,      // Nivel de gasolina (generalmente escala 1-4)
    required: false,   // Campo opcional - valor por defecto: 4
    default: 4
  },
  
  // Información técnica del vehículo
  age: {
    type: Number,      // Año de fabricación del camión
    required: false    // Campo opcional
  },
  
  // Documentación legal del vehículo
  ciculatioCard: {
    type: Date,        // Fecha de vencimiento de la tarjeta de circulación
    required: false    // Campo opcional
  },
  circulationCardImage: {
    type: String,      // URL de la imagen de la tarjeta de circulación
    required: false    // Campo opcional
  },
  licensePlate: {
    type: String,      // Placa de matrícula del vehículo (debe ser única)
    required: true     // Campo obligatorio para identificación
  },
  
  // Información adicional
  description: {
    type: String,      // Descripción detallada del camión, características especiales
    required: false    // Campo opcional
  },
  
  // Relaciones con otras colecciones (Referencias)
  driverId: {
    type: Schema.Types.ObjectId,  // Referencia al conductor asignado al camión
    required: false              // Campo opcional
  },
  
  // Multimedia
  img: {
    type: String,      // URL de la imagen del camión (generalmente desde Cloudinary)
    required: false    // Campo opcional
  }
}, {
  // Opciones del esquema
  strict: false,       // Permite campos adicionales no definidos en el esquema
  timestamps: true,    // Agrega automáticamente campos createdAt y updatedAt
  collection: "Camiones" // Fuerza el nombre exacto de la colección en MongoDB
});

/**
 * Exportar el modelo basado en el esquema
 * Este modelo se usará para realizar operaciones CRUD en la colección Camiones
 */
export default model("Camiones", camioneSchema);