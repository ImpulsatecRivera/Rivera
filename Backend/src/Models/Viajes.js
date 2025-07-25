import {schema,model, Collection} from 'mongoose';
const viajeSchema = new schema({
  // Campos existentes de tu base de datos
  quoteId: {
    type: mongoose.schema.Types.ObjectId,
    ref: 'Quote',
    required: true
  },
  tripDescription: {
    type: String,
    required: true,
    trim: true
  },
  truckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Truck',
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  assistant: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],

  // Información de rutas para mapas
  ruta: {
    origen: {
      nombre: {
        type: String,
        required: true
      },
      direccion: {
        type: String,
        required: true
      },
      coordenadas: {
        lat: {
          type: Number,
          required: true,
          min: -90,
          max: 90
        },
        lng: {
          type: Number,
          required: true,
          min: -180,
          max: 180
        }
      },
      codigoPostal: String
    },
    destino: {
      nombre: {
        type: String,
        required: true
      },
      direccion: {
        type: String,
        required: true
      },
      coordenadas: {
        lat: {
          type: Number,
          required: true,
          min: -90,
          max: 90
        },
        lng: {
          type: Number,
          required: true,
          min: -180,
          max: 180
        }
      },
      codigoPostal: String
    },
    distanciaTotal: {
      type: Number,
      min: 0
    },
    tiempoEstimado: {
      type: Number,
      min: 0
    },
    rutaOptimizada: [[Number]]
  },

  // Estado del viaje
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
    motivo: String
  },

  // Tracking en tiempo real
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
      },
      direccion: {
        type: Number,
        min: 0,
        max: 360
      }
    },
    historialUbicaciones: [{
      lat: Number,
      lng: Number,
      timestamp: {
        type: Date,
        default: Date.now
      },
      velocidad: Number
    }],
    alertas: [{
      tipo: {
        type: String,
        enum: ['retraso', 'desvio', 'parada_no_programada', 'emergencia']
      },
      mensaje: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      coordenadas: {
        lat: Number,
        lng: Number
      }
    }]
  },

  // Información de carga
  carga: {
    descripcion: String,
    peso: {
      type: Number,
      min: 0
    },
    volumen: {
      type: Number,
      min: 0
    },
    valor: {
      type: Number,
      min: 0
    },
    fragil: {
      type: Boolean,
      default: false
    },
    peligrosa: {
      type: Boolean,
      default: false
    },
    temperatura: {
      requerida: Number,
      actual: Number,
      alertas: {
        type: Boolean,
        default: false
      }
    }
  },

  // Información del cliente
  cliente: {
    remitente: {
      nombre: String,
      telefono: String,
      email: String
    },
    destinatario: {
      nombre: String,
      telefono: String,
      email: String
    }
  },

  // Costos
  costos: {
    tarifa: {
      type: Number,
      min: 0
    },
    combustible: {
      type: Number,
      min: 0
    },
    peajes: {
      type: Number,
      min: 0
    },
    otros: {
      type: Number,
      min: 0,
      default: 0
    },
    total: {
      type: Number,
      min: 0
    },
    moneda: {
      type: String,
      enum: ['USD', 'SVC'],
      default: 'USD'
    }
  },

  // Documentos
  documentos: [{
    tipo: {
      type: String,
      enum: ['factura', 'guia_remision', 'foto_carga', 'firma_entrega']
    },
    url: String,
    fechaSubida: {
      type: Date,
      default: Date.now
    },
    descripcion: String
  }],

  // Conductor
  conductor: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    nombre: String,
    telefono: String,
    licencia: String
  },

  // Tiempos reales
  tiempos: {
    salidaReal: Date,
    llegadaReal: Date,
    tiempoTotal: Number,
    retrasosMinutos: {
      type: Number,
      default: 0
    },
    motivosRetraso: [String]
  },

  // Condiciones
  condiciones: {
    clima: {
      type: String,
      enum: ['soleado', 'lluvioso', 'nublado']
    },
    trafico: {
      type: String,
      enum: ['fluido', 'moderado', 'congestionado']
    },
    carreteras: {
      type: String,
      enum: ['buenas', 'regulares', 'malas']
    },
    visibilidad: {
      type: String,
      enum: ['buena', 'regular', 'mala']
    }
  },

  // Evaluación
  evaluacion: {
    calificacionCliente: {
      type: Number,
      min: 1,
      max: 5
    },
    comentariosCliente: String,
    calificacionConductor: {
      type: Number,
      min: 1,
      max: 5
    },
    comentariosConductor: String,
    incidentes: [String]
  }

}, {
  timestamps: true, 
  versionKey: '__v',
  Collection:"Viajes"
});

export default model("Viajes",viajeSchema)