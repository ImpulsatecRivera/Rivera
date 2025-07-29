import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const viajeSchema = new Schema({
  quoteId: {
    type: Schema.Types.ObjectId,
    ref: 'Cotizaciones',
    required: true
  },
  tripDescription: {
    type: String,
    required: true,
    trim: true
  },
  truckId: {
    type: Schema.Types.ObjectId,
    ref: 'Camiones',
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
  ruta: {
    origen: {
      nombre: {
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
      }
    },
    destino: {
      nombre: {
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
      }
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
  estado: {
    actual: {
      type: String,
      enum: ['pendiente', 'en_curso', 'completado', 'cancelado', 'retrasado'],
      default: 'pendiente'
    },
    fechaCambio: {
      type: Date,
      default: Date.now
    }
  },
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
    }
  },
  carga: {
    descripcion: String
  },
  conductor: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'Motorista'
    },
    nombre: String,
    telefono: String
  }
}, {
  timestamps: true,
  versionKey: '__v',
  collection: "Viajes" 
});

export default model("Viajes", viajeSchema);
