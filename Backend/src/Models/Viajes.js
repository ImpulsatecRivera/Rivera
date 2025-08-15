//  Backend/src/Models/Viajes.js
// ESQUEMA FINAL DE VIAJES - DATOS OPERATIVOS
 
import mongoose from 'mongoose';
const { Schema, model } = mongoose;
 
const viajeSchema = new Schema({
  // 🔗 REFERENCIAS A OTRAS COLECCIONES
  quoteId: {
    type: Schema.Types.ObjectId,
    ref: 'Cotizaciones',
    required: true
  },
 
  truckId: {
    type: Schema.Types.ObjectId,
    ref: 'Camiones',
    required: true
  },
 
  conductorId: {
    type: Schema.Types.ObjectId,
    ref: 'Motorista',
    required: true
  },
 
  // 📝 DESCRIPCIÓN DEL VIAJE
  tripDescription: {
    type: String,
    required: true,
    trim: true
  },
 
  // ⏰ HORARIOS PRINCIPALES
  departureTime: {
    type: Date,
    required: true
  },
 
  arrivalTime: {
    type: Date,
    required: true
  },
 
  // ⏰ TIEMPOS REALES
  tiemposReales: {
    ultimaActualizacion: {
      type: Date,
      default: Date.now
    },
    salidaReal: Date,
    llegadaReal: Date,
    tiempoRealViaje: Number // en minutos
  },
 
  // 📊 ESTADO DEL VIAJE
  estado: {
    actual: {
      type: String,
      enum: ['pendiente', 'en_curso', 'completado', 'cancelado', 'retrasado'],
      default: 'pendiente'
    },
    fechaCambio: {
      type: Date,
      default: Date.now
    },
    autoActualizar: {
      type: Boolean,
      default: true
    },
    historial: [{
      estado: String,
      fecha: {
        type: Date,
        default: Date.now
      },
      observacion: String
    }]
  },
 
  // 📍 TRACKING
  tracking: {
    ubicacionActual: {
      lat: Number,
      lng: Number,
      timestamp: {
        type: Date,
        default: Date.now
      },
      velocidad: {
        type: Number,
        min: 0
      }
    },
   
    progreso: {
      porcentaje: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      ultimaActualizacion: {
        type: Date,
        default: Date.now
      },
      calculoAutomatico: {
        type: Boolean,
        default: true
      }
    },
   
    // 📍 CHECKPOINTS
    checkpoints: [{
      nombre: String,
      coordenadas: {
        lat: Number,
        lng: Number
      },
      horaEstimada: Date,
      horaReal: Date,
      completado: Boolean
    }]
  },
 
  // 💰 COSTOS REALES
  costosReales: {
    combustible: {
      type: Number,
      default: 0
    },
    peajes: {
      type: Number,
      default: 0
    },
    conductor: {
      type: Number,
      default: 0
    },
    otros: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
 
  // 🚨 ALERTAS
  alertas: [{
    _id: {
      type: Schema.Types.ObjectId,
      auto: true
    },
    tipo: {
      type: String,
      enum: ['retraso', 'emergencia', 'llegada', 'salida', 'urgencia']
    },
    mensaje: String,
    fecha: {
      type: Date,
      default: Date.now
    },
    resuelta: {
      type: Boolean,
      default: false
    },
    prioridad: {
      type: String,
      enum: ['baja', 'media', 'alta', 'critica'],
      default: 'media'
    }
  }],
 
  // 🌡 CONDICIONES DEL VIAJE
  condiciones: {
    clima: String,
    trafico: String,
    carretera: String,
    observaciones: String
  }
 
}, {
  timestamps: true,
  versionKey: '__v',
  collection: "Viajes"
});
 
// 🔄 MIDDLEWARE PRE-SAVE
viajeSchema.pre('save', async function(next) {
  const ahora = new Date();
 
  // 🔄 AUTO-COMPLETAR DATOS DESDE LA COTIZACIÓN (solo en creación)
  if (this.isNew && this.quoteId) {
    try {
      const cotizacion = await mongoose.model('Cotizaciones').findById(this.quoteId);
      if (cotizacion) {
        // Auto-completar descripción
        if (!this.tripDescription && cotizacion.quoteDescription) {
          this.tripDescription = cotizacion.quoteDescription;
        }
       
        // Auto-sugerir fechas basadas en cotización
        if (!this.departureTime && cotizacion.horarios && cotizacion.horarios.fechaSalida) {
          this.departureTime = cotizacion.horarios.fechaSalida;
        }
        
        if (!this.arrivalTime && cotizacion.horarios && cotizacion.horarios.fechaLlegadaEstimada) {
          this.arrivalTime = cotizacion.horarios.fechaLlegadaEstimada;
        }
      }
    } catch (error) {
      console.log('No se pudo auto-completar desde cotización:', error.message);
    }
  }
 
  // 💰 AUTO-CALCULAR COSTO TOTAL
  this.costosReales.total = (this.costosReales.combustible || 0) +
                            (this.costosReales.peajes || 0) +
                            (this.costosReales.conductor || 0) +
                            (this.costosReales.otros || 0);
 
  // 🔄 LÓGICA DE AUTO-ACTUALIZACIÓN DE ESTADO
  if (this.estado.autoActualizar) {
    // Auto-iniciar viajes
    if (this.estado.actual === 'pendiente' && this.departureTime <= ahora) {
      this.estado.actual = 'en_curso';
      this.estado.fechaCambio = ahora;
      this.tiemposReales.salidaReal = this.tiemposReales.salidaReal || ahora;
     
      this.estado.historial.push({
        estado: 'en_curso',
        fecha: ahora,
        observacion: 'Viaje iniciado automáticamente'
      });
    }
   
    // Auto-completar viajes
    if (this.estado.actual === 'en_curso' &&
        this.arrivalTime <= ahora &&
        this.tracking.progreso.porcentaje >= 95) {
     
      this.estado.actual = 'completado';
      this.estado.fechaCambio = ahora;
      this.tiemposReales.llegadaReal = ahora;
      this.tracking.progreso.porcentaje = 100;
     
      // Calcular tiempo real del viaje
      if (this.tiemposReales.salidaReal) {
        this.tiemposReales.tiempoRealViaje = Math.floor(
          (ahora - this.tiemposReales.salidaReal) / (1000 * 60)
        );
      }
     
      this.estado.historial.push({
        estado: 'completado',
        fecha: ahora,
        observacion: 'Viaje completado automáticamente'
      });
    }
  }
 
  this.tiemposReales.ultimaActualizacion = ahora;
  next();
});
 
// 📊 MÉTODOS VIRTUALES
viajeSchema.virtual('duracionProgramada').get(function() {
  if (!this.arrivalTime || !this.departureTime) return 0;
  return Math.floor((this.arrivalTime - this.departureTime) / (1000 * 60));
});
 
viajeSchema.virtual('duracionReal').get(function() {
  if (!this.tiemposReales.llegadaReal || !this.tiemposReales.salidaReal) return 0;
  return Math.floor((this.tiemposReales.llegadaReal - this.tiemposReales.salidaReal) / (1000 * 60));
});
 
// 🔍 ÍNDICES OPTIMIZADOS
viajeSchema.index({ 'estado.actual': 1 });
viajeSchema.index({ departureTime: 1 });
viajeSchema.index({ quoteId: 1 });
viajeSchema.index({ truckId: 1 });
viajeSchema.index({ conductorId: 1 });
 
// 📱 MÉTODO ESTÁTICO PARA OBTENER VIAJE CON COTIZACIÓN
viajeSchema.statics.getViajeCompleto = async function(viajeId) {
  return this.aggregate([
    {
      $match: { "_id": new mongoose.Types.ObjectId(viajeId) }
    },
    {
      $lookup: {
        from: "Cotizaciones",
        localField: "quoteId",
        foreignField: "_id",
        as: "cotizacion"
      }
    },
    {
      $unwind: "$cotizacion"
    },
    {
      $addFields: {
        "rutaPlanificada": "$cotizacion.ruta",
        "cargaPlanificada": "$cotizacion.carga",
        "horariosPlanificados": "$cotizacion.horarios",
        "costosPlanificados": "$cotizacion.costos",
        "precoCotizado": "$cotizacion.price",
        "clienteId": "$cotizacion.clientId"
      }
    }
  ]);
};
 
export default model("Viajes", viajeSchema);