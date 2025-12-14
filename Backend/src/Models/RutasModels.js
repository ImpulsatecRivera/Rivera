import { Schema, model } from "mongoose";

const ubicacionesSchema = new Schema({
  // Identificador único de la ubicación
  ubicacionId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true
    // Ej: "UBI001", "UBI002"
  },
  
  // Nombre de la ubicación
  nombre: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true
    // Ej: "DIANA", "TAPASCO", "SARAM", "DR. GOMEZ"
  },
  
  // Dirección completa
  direccion: {
    type: String,
    trim: true,
    uppercase: true
    // Ej: "COL. ESCALÓN, CALLE PRINCIPAL #123"
  },
  
  
  
  // Municipio/Ciudad
  municipio: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  // Departamento
  departamento: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  // Coordenadas GPS (opcional)
  coordenadas: {
    latitud: Number,
    longitud: Number
  },
  
  // Referencias adicionales
  referencias: {
    type: String,
    trim: true
    // Ej: "FRENTE A GASOLINERA PUMA"
  },
  
  // Contacto en la ubicación
  contacto: {
    nombre: String,
    telefono: String,
    relacion: String // Ej: "PROPIETARIO", "ENCARGADO"
  },
  
  // Estadísticas de uso
  estadisticas: {
    totalViajes: {
      type: Number,
      default: 0
    },
    ultimoViaje: Date,
    frecuencia: {
      type: String,
      enum: ["DIARIA", "SEMANAL", "MENSUAL", "OCASIONAL"],
      default: "OCASIONAL"
    }
  },
  
  // Estado
  activa: {
    type: Boolean,
    default: true
  },
  
  // Notas adicionales
  notas: String
  
}, { 
  timestamps: true 
});

// Índices
ubicacionesSchema.index({ nombre: 1 });
ubicacionesSchema.index({ municipio: 1, departamento: 1 });
ubicacionesSchema.index({ activa: 1 });

// Método estático: Generar ubicacionId automático
ubicacionesSchema.statics.generarUbicacionId = async function() {
  const ultimaUbicacion = await this.findOne()
    .sort({ ubicacionId: -1 })
    .select('ubicacionId');
  
  if (!ultimaUbicacion) {
    return "UBI001";
  }
  
  const numero = parseInt(ultimaUbicacion.ubicacionId.replace('UBI', '')) + 1;
  return `UBI${String(numero).padStart(3, '0')}`;
};

// Método estático: Buscar ubicación por nombre
ubicacionesSchema.statics.buscarPorNombre = async function(nombre) {
  return await this.findOne({
    nombre: nombre.toUpperCase(),
    activa: true
  });
};

// Método estático: Obtener ubicaciones más frecuentes
ubicacionesSchema.statics.obtenerMasFrecuentes = async function(limite = 10) {
  return await this.find({ activa: true })
    .sort({ 'estadisticas.totalViajes': -1 })
    .limit(limite);
};

// Método de instancia: Actualizar estadísticas
ubicacionesSchema.methods.actualizarEstadisticas = async function() {
  // Este método se llamará desde el modelo Viajes cuando se registre un viaje
  this.estadisticas.totalViajes += 1;
  this.estadisticas.ultimoViaje = new Date();
  
  // Determinar frecuencia basada en total de viajes y tiempo
  if (this.estadisticas.totalViajes > 50) {
    this.estadisticas.frecuencia = "DIARIA";
  } else if (this.estadisticas.totalViajes > 20) {
    this.estadisticas.frecuencia = "SEMANAL";
  } else if (this.estadisticas.totalViajes > 5) {
    this.estadisticas.frecuencia = "MENSUAL";
  }
  
  return await this.save();
};

export default model("Ubicaciones", ubicacionesSchema);

