//  Backend/src/Models/Cotizaciones.js
// ESQUEMA FINAL DE COTIZACIONES - DOCUMENTO PRINCIPAL
 
import mongoose from 'mongoose';
const { Schema, model } = mongoose;
 
const cotizacionSchema = new Schema({
  // 🔗 REFERENCIA AL CLIENTE
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Clientes',
    required: true
  },
 
  // 📝 INFORMACIÓN BÁSICA DE LA COTIZACIÓN
  quoteDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
 
  quoteName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
 
  travelLocations: {
    type: String,
    required: true,
    trim: true
  },
 
  truckType: {
    type: String,
    enum: [
      'alimentos_perecederos', 'alimentos_no_perecederos', 'bebidas',
      'materiales_construccion', 'textiles', 'electronicos', 'medicamentos',
      'maquinaria', 'vehiculos', 'quimicos', 'combustibles', 'papel_carton',
      'muebles', 'productos_agricolas', 'metales', 'plasticos',
      'vidrio_ceramica', 'productos_limpieza', 'cosmeticos', 'juguetes',
      'seco', 'refrigerado', 'otros'
    ],
    required: true,
    default: 'otros'
  },
 
  deliveryDate: {
    type: Date,
    required: true
  },
 
  paymentMethod: {
    type: String,
    enum: ['efectivo', 'transferencia', 'cheque', 'credito', 'tarjeta'],
    required: true,
    default: 'efectivo'
  },
 
  status: {
    type: String,
    enum: ['pendiente', 'enviada', 'aceptada', 'rechazada', 'ejecutada', 'cancelada'],
    default: 'pendiente'
  },
 
  price: {
    type: Number,
    required: true,
    min: 0
  },
 
  // ===== 1. RUTA =====
 // Cambios en tu modelo Cotizaciones.js para hacerlo más flexible

// ===== 1. RUTA (más flexible) =====
ruta: {
  origen: {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    coordenadas: {
      lat: {
        type: Number,
        // required: false, // ❌ Quitar required
        min: -90,
        max: 90,
        default: 0 // ✅ Valor por defecto
      },
      lng: {
        type: Number,
        // required: false, // ❌ Quitar required
        min: -180,
        max: 180,
        default: 0 // ✅ Valor por defecto
      }
    },
    tipo: {
      type: String,
      enum: ['terminal', 'ciudad', 'puerto', 'bodega', 'cliente'],
      default: 'ciudad'
    }
  },
  destino: {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    coordenadas: {
      lat: {
        type: Number,
        // required: false, // ❌ Quitar required
        min: -90,
        max: 90,
        default: 0 // ✅ Valor por defecto
      },
      lng: {
        type: Number,
        // required: false, // ❌ Quitar required
        min: -180,
        max: 180,
        default: 0 // ✅ Valor por defecto
      }
    },
    tipo: {
      type: String,
      enum: ['terminal', 'ciudad', 'puerto', 'bodega', 'cliente'],
      default: 'ciudad'
    }
  },
  distanciaTotal: {
    type: Number,
    // required: false, // ❌ Quitar required
    min: 0,
    default: 100 // ✅ Valor por defecto
  },
  tiempoEstimado: {
    type: Number,
    // required: false, // ❌ Quitar required
    min: 0,
    default: 2 // ✅ Valor por defecto en horas
  }
},

// ===== 2. CARGA (más flexible) =====
carga: {
  categoria: {
    type: String,
    enum: [
      'alimentos_perecederos', 'alimentos_no_perecederos', 'bebidas',
      'materiales_construccion', 'textiles', 'electronicos', 'medicamentos',
      'maquinaria', 'vehiculos', 'quimicos', 'combustibles', 'papel_carton',
      'muebles', 'productos_agricolas', 'metales', 'plasticos',
      'vidrio_ceramica', 'productos_limpieza', 'cosmeticos', 'juguetes', 'otros'
    ],
    // required: false, // ❌ Quitar required
    default: 'otros'
  },
  
  subcategoria: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  descripcion: {
    type: String,
    required: true, // ✅ Mantener solo este como required
    trim: true,
    maxlength: 500
  },
  
  peso: {
    valor: {
      type: Number,
      // required: false, // ❌ Quitar required
      min: 0,
      default: 1000 // ✅ Valor por defecto
    },
    unidad: {
      type: String,
      enum: ['kg', 'ton', 'lb'],
      default: 'kg'
    }
  },
  
  volumen: {
    valor: {
      type: Number,
      min: 0
      // Sin required ni default - totalmente opcional
    },
    unidad: {
      type: String,
      enum: ['m3', 'ft3'],
      default: 'm3'
    }
  },
  
  clasificacionRiesgo: {
    type: String,
    enum: ['normal', 'fragil', 'peligroso', 'perecedero', 'biologico'],
    default: 'normal'
  },
  
  condicionesEspeciales: {
    temperaturaMinima: Number,
    temperaturaMaxima: Number,
    requiereRefrigeracion: {
      type: Boolean,
      default: false
    },
    esFragil: {
      type: Boolean,
      default: false
    },
    temperaturaControlada: Boolean,
    manejoCuidadoso: Boolean,
    seguroAdicional: Boolean
  },
  
  valorDeclarado: {
    monto: {
      type: Number,
      min: 0
    },
    moneda: {
      type: String,
      enum: ['USD', 'SVC'],
      default: 'USD'
    }
  }
},

// ===== 3. HORARIOS (más flexible) =====
horarios: {
  fechaSalida: {
    type: Date,
    // required: false // ❌ Quitar required - se auto-genera si no se proporciona
  },
  fechaLlegadaEstimada: {
    type: Date,
    // required: false // ❌ Quitar required - se auto-calcula
  },
  tiempoEstimadoViaje: {
    type: Number,
    // required: false, // ❌ Quitar required
    min: 0,
    default: 2 // ✅ Valor por defecto
  },
  flexibilidadHoraria: {
    permitida: {
      type: Boolean,
      default: true
    },
    rangoTolerancia: {
      type: Number,
      default: 2
    }
  },
  horarioPreferido: {
    inicio: String,
    fin: String
  }
},

// ===== 4. COSTOS (más flexible) =====
costos: {
  combustible: {
    type: Number,
    // required: false, // ❌ Quitar required
    min: 0,
    default: 0
  },
  peajes: {
    type: Number,
    // required: false, // ❌ Quitar required
    min: 0,
    default: 0
  },
  conductor: {
    type: Number,
    // required: false, // ❌ Quitar required
    min: 0,
    default: 0
  },
  otros: {
    type: Number,
    min: 0,
    default: 0
  },
  subtotal: {
    type: Number,
    // required: false, // ❌ Quitar required - se calcula automáticamente
    min: 0
  },
  impuestos: {
    type: Number,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    // required: false, // ❌ Quitar required - se calcula automáticamente
    min: 0
  },
  moneda: {
    type: String,
    enum: ['USD', 'SVC'],
    default: 'USD'
  },
  validezCotizacion: {
    type: Date,
    // required: false // ❌ Quitar required - se auto-genera en el middleware
  }
},
 
  // 📊 CAMPOS DE SEGUIMIENTO
  fechaEnvio: Date,
  fechaAceptacion: Date,
  fechaRechazo: Date,
  motivoRechazo: String,
  
  // 📝 OBSERVACIONES Y NOTAS
  observaciones: {
    type: String,
    maxlength: 1000
  },
  
  notasInternas: {
    type: String,
    maxlength: 1000
  }
 
}, {
  timestamps: true,
  versionKey: '__v',
  collection: "Cotizaciones"
});
 
// 🔄 MIDDLEWARE PRE-SAVE
cotizacionSchema.pre('save', function(next) {
  // 💰 AUTO-CALCULAR SUBTOTAL
  this.costos.subtotal = (this.costos.combustible || 0) +
                          (this.costos.peajes || 0) +
                          (this.costos.conductor || 0) +
                          (this.costos.otros || 0);
 
  // 💰 AUTO-CALCULAR TOTAL CON IMPUESTOS
  this.costos.total = this.costos.subtotal + (this.costos.impuestos || 0);
 
  // 🕐 AUTO-CALCULAR TIEMPO ESTIMADO SI NO EXISTE
  if (!this.horarios.tiempoEstimadoViaje && this.ruta.tiempoEstimado) {
    this.horarios.tiempoEstimadoViaje = this.ruta.tiempoEstimado;
  }
 
  // 🕐 AUTO-CALCULAR FECHA DE LLEGADA SI NO EXISTE
  if (!this.horarios.fechaLlegadaEstimada && this.horarios.fechaSalida && this.horarios.tiempoEstimadoViaje) {
    this.horarios.fechaLlegadaEstimada = new Date(
      this.horarios.fechaSalida.getTime() + (this.horarios.tiempoEstimadoViaje * 60 * 60 * 1000)
    );
  }
 
  // 📅 AUTO-ESTABLECER VALIDEZ DE COTIZACIÓN (30 días por defecto)
  if (!this.costos.validezCotizacion) {
    this.costos.validezCotizacion = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
 
  // 🏷 AUTO-COMPLETAR CATEGORÍA DE CARGA DESDE TRUCK TYPE
  if (!this.carga.categoria && this.truckType) {
    this.carga.categoria = this.truckType;
  }
 
  next();
});
 
// 📊 MÉTODOS VIRTUALES
cotizacionSchema.virtual('duracionEstimada').get(function() {
  return this.horarios.tiempoEstimadoViaje || this.ruta.tiempoEstimado || 0;
});
 
cotizacionSchema.virtual('estaVencida').get(function() {
  return this.costos.validezCotizacion < new Date();
});
 
// 🔍 ÍNDICES OPTIMIZADOS
cotizacionSchema.index({ clientId: 1 });
cotizacionSchema.index({ status: 1 });
cotizacionSchema.index({ deliveryDate: 1 });
cotizacionSchema.index({ 'costos.validezCotizacion': 1 });
cotizacionSchema.index({ createdAt: -1 });
cotizacionSchema.index({ 'ruta.origen.nombre': 1, 'ruta.destino.nombre': 1 });
 
// 📱 MÉTODO PARA CREAR VIAJE DESDE COTIZACIÓN
cotizacionSchema.methods.crearViaje = async function(truckId, conductorId) {
  const Viajes = mongoose.model('Viajes');
  
  try {
    const nuevoViaje = new Viajes({
      quoteId: this._id,
      truckId: truckId,
      conductorId: conductorId,
      tripDescription: this.quoteDescription,
      departureTime: this.horarios.fechaSalida,
      arrivalTime: this.horarios.fechaLlegadaEstimada
    });
 
    await nuevoViaje.save();
    
    // Actualizar estado de la cotización
    this.status = 'ejecutada';
    await this.save();
    
    return nuevoViaje;
  } catch (error) {
    throw new Error(Error ,"al crear viaje desde cotización: ${error.message}");
  }
};
 
export default model("Cotizaciones", cotizacionSchema);