//  Backend/src/Models/Viajes.js
// MODELO OPTIMIZADO CON AUTO-POBLACIÓN Y CAMPOS INTELIGENTES

import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const viajeSchema = new Schema({
  // 🔗 REFERENCIAS A OTRAS COLECCIONES (solo IDs)
  quoteId: {
    type: Schema.Types.ObjectId,
    ref: 'Cotizaciones', // Se auto-puebla desde la cotización
    required: true
  },
  
  truckId: {
    type: Schema.Types.ObjectId,
    ref: 'Camiones', // Se auto-puebla desde camiones
    required: true
  },
  
  conductorId: {
    type: Schema.Types.ObjectId,
    ref: 'Motorista', // Solo ID, datos se pueblan automáticamente
    required: true
  },
  
  // 📝 CAMPOS QUE SE AUTO-COMPLETAN DESDE LA COTIZACIÓN
  tripDescription: {
    type: String,
    required: true,
    trim: true
    // Este campo se llena automáticamente desde quoteDescription
  },
  
  // 🗺️ RUTA - SE AUTO-COMPLETA DESDE LA COTIZACIÓN
  ruta: {
    origen: {
      nombre: {
        type: String,
        required: true
        // Auto-completado desde travelLocations
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
        // Estas coordenadas se pueden obtener de una API de geocoding
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
        required: true
        // Auto-completado desde travelLocations
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
      tipo: {
        type: String,
        enum: ['terminal', 'ciudad', 'puerto', 'bodega', 'cliente'],
        default: 'ciudad'
      }
    },
    
    // 📊 DATOS CALCULADOS AUTOMÁTICAMENTE
    distanciaTotal: {
      type: Number,
      min: 0
      // Se calcula automáticamente con API de mapas
    },
    tiempoEstimado: {
      type: Number, // en minutos
      min: 0
      // Se calcula automáticamente basado en distancia
    },
    
    rutaOptimizada: {
      type: [[Number]],
      select: false
    }
  },

  // ⏰ HORARIOS - ALGUNOS AUTO-CALCULADOS
  departureTime: {
    type: Date,
    required: true
    // Se puede auto-sugerir basado en deliveryDate de la cotización
  },
  
  arrivalTime: {
    type: Date,
    required: true
    // Se calcula automáticamente: departureTime + tiempoEstimado
  },
  
  horarios: {
    salidaReal: Date,
    llegadaEstimada: Date,
    llegadaReal: Date,
    ultimaActualizacion: {
      type: Date,
      default: Date.now
    }
  },
  
  // 📦 CARGA - SIMPLIFICADA PERO FLEXIBLE
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
      required: true,
      default: 'otros'
    },
    
    subcategoria: {
      type: String,
      trim: true,
      maxlength: 100
    },
    
    descripcion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    
    // ⚖️ INFORMACIÓN BÁSICA DE PESO Y VOLUMEN
    peso: {
      valor: {
        type: Number,
        min: 0,
        required: true
      },
      unidad: {
        type: String,
        enum: ['kg', 'ton', 'lb'],
        default: 'kg'
      }
    },
    
    volumen: {
      valor: Number,
      unidad: {
        type: String,
        enum: ['m3', 'ft3'],
        default: 'm3'
      }
    },
    
    // 🚨 CLASIFICACIÓN DE RIESGO SIMPLIFICADA
    clasificacionRiesgo: {
      type: String,
      enum: ['normal', 'fragil', 'peligroso', 'perecedero', 'biologico'],
      default: 'normal'
    },
    
    // 🌡️ CONDICIONES ESPECIALES (SOLO LAS IMPORTANTES)
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
      }
    },
    
    // 💰 VALOR DECLARADO
    valorDeclarado: {
      monto: Number,
      moneda: {
        type: String,
        enum: ['USD', 'SVC'],
        default: 'USD'
      }
    }
  },
  
  // 📊 ESTADO CON AUTO-ACTUALIZACIÓN
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
      estadoAnterior: String,
      estadoNuevo: String,
      fecha: {
        type: Date,
        default: Date.now
      },
      motivo: String
    }]
  },
  
  // 📍 TRACKING HÍBRIDO
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
    
    // 📍 CHECKPOINTS HÍBRIDOS
    checkpoints: [{
      tipo: String,
      progreso: Number,
      descripcion: String,
      timestamp: Date,
      reportadoPor: {
        type: String,
        default: 'manual'
      },
      ubicacion: {
        lat: Number,
        lng: Number
      }
    }],
    
    historialUbicaciones: {
      type: [{
        lat: Number,
        lng: Number,
        timestamp: Date,
        velocidad: Number
      }],
      select: false,
      validate: {
        validator: function(array) {
          return array.length <= 100;
        },
        message: 'Máximo 100 puntos de historial permitidos'
      }
    }
  },
  
  // 💰 COSTOS CALCULADOS
  costos: {
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
  
  // 🚨 ALERTAS SIMPLIFICADAS
  alertas: [{
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
  
  // 🌡️ CONDICIONES DEL VIAJE
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

// 🔄 MIDDLEWARE PRE-SAVE MEJORADO
viajeSchema.pre('save', async function(next) {
  const ahora = new Date();
  
  // 🔄 AUTO-COMPLETAR DATOS DESDE LA COTIZACIÓN (solo en creación)
  if (this.isNew && this.quoteId) {
    try {
      const cotizacion = await mongoose.model('Cotizaciones').findById(this.quoteId);
      if (cotizacion) {
        // Auto-completar descripción si no existe
        if (!this.tripDescription && cotizacion.quoteDescription) {
          this.tripDescription = cotizacion.quoteDescription;
        }
        
        // Auto-completar ubicaciones si no existen
        if (cotizacion.travelLocations && !this.ruta.origen.nombre) {
          const locations = cotizacion.travelLocations.split(',').map(l => l.trim());
          if (locations.length >= 2) {
            this.ruta.origen.nombre = locations[0];
            this.ruta.destino.nombre = locations[1];
          }
        }
        
        // Auto-sugerir fecha de salida basada en deliveryDate
        if (!this.departureTime && cotizacion.deliveryDate) {
          // Sugerir salida 1 día antes de la entrega
          this.departureTime = new Date(cotizacion.deliveryDate.getTime() - 24 * 60 * 60 * 1000);
        }
      }
    } catch (error) {
      console.log('No se pudo auto-completar desde cotización:', error.message);
    }
  }
  
  // 🕐 AUTO-CALCULAR HORA DE LLEGADA
  if (this.departureTime && this.ruta.tiempoEstimado && !this.arrivalTime) {
    this.arrivalTime = new Date(this.departureTime.getTime() + (this.ruta.tiempoEstimado * 60 * 1000));
  }
  
  // 💰 AUTO-CALCULAR COSTO TOTAL
  this.costos.total = (this.costos.combustible || 0) + 
                      (this.costos.peajes || 0) + 
                      (this.costos.conductor || 0) + 
                      (this.costos.otros || 0);
  
  // 🔄 LÓGICA DE AUTO-ACTUALIZACIÓN DE ESTADO
  if (this.estado.autoActualizar) {
    const estadoAnterior = this.estado.actual;
    
    // Auto-iniciar viajes
    if (this.estado.actual === 'pendiente' && this.departureTime <= ahora) {
      this.estado.actual = 'en_curso';
      this.estado.fechaCambio = ahora;
      this.horarios.salidaReal = this.horarios.salidaReal || ahora;
      
      this.estado.historial.push({
        estadoAnterior: 'pendiente',
        estadoNuevo: 'en_curso',
        fecha: ahora,
        motivo: 'automatico'
      });
    }
    
    // Auto-completar viajes
    if (this.estado.actual === 'en_curso' && 
        this.arrivalTime <= ahora && 
        this.tracking.progreso.porcentaje >= 95) {
      
      this.estado.actual = 'completado';
      this.estado.fechaCambio = ahora;
      this.horarios.llegadaReal = ahora;
      this.tracking.progreso.porcentaje = 100;
      
      this.estado.historial.push({
        estadoAnterior: 'en_curso',
        estadoNuevo: 'completado',
        fecha: ahora,
        motivo: 'automatico'
      });
    }
    
    // Auto-marcar retrasos (con gracia proporcional)
    if (this.estado.actual === 'en_curso') {
      const tiempoTotal = this.arrivalTime - this.departureTime;
      const tiempoTotalMinutos = tiempoTotal / (1000 * 60);
      
      let tiempoGracia;
      if (tiempoTotalMinutos <= 10) {
        tiempoGracia = 2 * 60000; // 2 minutos
      } else if (tiempoTotalMinutos <= 30) {
        tiempoGracia = 5 * 60000; // 5 minutos
      } else {
        tiempoGracia = 15 * 60000; // 15 minutos
      }
      
      const tiempoLimiteRetraso = new Date(this.arrivalTime.getTime() + tiempoGracia);
      
      if (ahora >= tiempoLimiteRetraso && this.tracking.progreso.porcentaje < 90) {
        this.estado.actual = 'retrasado';
        this.estado.fechaCambio = ahora;
        
        this.alertas.push({
          tipo: 'retraso',
          mensaje: `Viaje retrasado - Programado para ${this.arrivalTime.toLocaleString()}`,
          fecha: ahora,
          prioridad: 'alta'
        });
        
        this.estado.historial.push({
          estadoAnterior: 'en_curso',
          estadoNuevo: 'retrasado',
          fecha: ahora,
          motivo: 'automatico'
        });
      }
    }
  }
  
  this.horarios.ultimaActualizacion = ahora;
  next();
});

// 📊 MÉTODOS VIRTUALES
viajeSchema.virtual('duracionProgramada').get(function() {
  return Math.floor((this.arrivalTime - this.departureTime) / (1000 * 60));
});

// 🔍 ÍNDICES OPTIMIZADOS
viajeSchema.index({ 'estado.actual': 1 });
viajeSchema.index({ departureTime: 1 });
viajeSchema.index({ quoteId: 1 });
viajeSchema.index({ truckId: 1 });
viajeSchema.index({ conductorId: 1 });

// 📱 MÉTODO ESTÁTICO MEJORADO PARA DATOS DEL MAPA
viajeSchema.statics.getMapData = async function() {
  return this.find({ 
    'estado.actual': { $in: ['pendiente', 'en_curso', 'retrasado', 'completado'] } 
  })
  .populate('truckId', 'marca modelo placa nombre')
  .populate('conductorId', 'nombre telefono')
  .populate('quoteId', 'quoteDescription price status')
  .select('-tracking.historialUbicaciones -ruta.rutaOptimizada')
  .sort({ departureTime: 1 })
  .lean();
};

export default model("Viajes", viajeSchema);