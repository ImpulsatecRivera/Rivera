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
  
  // ⏰ HORARIOS MEJORADOS PARA AUTO-ACTUALIZACIÓN
  departureTime: {
    type: Date,
    required: true
  },
  
  arrivalTime: {
    type: Date,
    required: true
  },
  
  // 🆕 TIEMPOS ADICIONALES PARA CONTROL
  horarios: {
    salidaReal: Date,           // Cuando realmente salió
    llegadaEstimada: Date,      // Estimación actualizada en tiempo real
    llegadaReal: Date,          // Cuando realmente llegó
    ultimaActualizacion: {
      type: Date,
      default: Date.now
    }
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
      },
      // 🆕 TIPO DE UBICACIÓN PARA FRONTEND
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
      // 🆕 TIPO DE UBICACIÓN PARA FRONTEND
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
    },
    tiempoEstimado: {
      type: Number, // en minutos
      min: 0
    },
    
    // 🛣️ RUTA DETALLADA OPCIONAL (para GPS avanzado)
    rutaOptimizada: {
      type: [[Number]],
      select: false // No incluir por defecto en queries
    }
  },
  
  // 📊 ESTADO CON AUTO-ACTUALIZACIÓN MEJORADO
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
    
    // 🔄 CONFIGURACIÓN PARA AUTO-UPDATE
    autoActualizar: {
      type: Boolean,
      default: true
    },
    
    // 📋 HISTORIAL DE CAMBIOS
    historial: [{
      estadoAnterior: String,
      estadoNuevo: String,
      fecha: {
        type: Date,
        default: Date.now
      },
      motivo: String // 'automatico', 'manual', 'gps', etc.
    }]
  },
  
  // 📍 TRACKING MEJORADO
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
    
    // 📈 PROGRESO CALCULADO AUTOMÁTICAMENTE
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
    
    // 🕒 HISTORIAL COMPACTO DE UBICACIONES
    historialUbicaciones: {
      type: [{
        lat: Number,
        lng: Number,
        timestamp: Date,
        velocidad: Number
      }],
      select: false, // No incluir por defecto
      validate: {
        validator: function(array) {
          return array.length <= 100; // Máximo 100 puntos
        },
        message: 'Máximo 100 puntos de historial permitidos'
      }
    }
  },
  
  // 📦 CARGA MEJORADA
  carga: {
    descripcion: {
      type: String,
      required: true
    },
    peso: {
      valor: Number,
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
    tipo: {
      type: String,
      enum: ['general', 'fragil', 'peligrosa', 'refrigerada', 'liquida'],
      default: 'general'
    },
    valor: Number // Valor monetario de la carga
  },
  
  // 👤 CONDUCTOR
  conductor: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'Motorista',
      required: true
    },
    nombre: String,    // Backup si no se puede hacer populate
    telefono: String   // Backup si no se puede hacer populate
  },
  
  // 💰 INFORMACIÓN FINANCIERA OPCIONAL
  costos: {
    combustible: {
      type: Number,
      default: 0
    },
    peajes: {
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
  
  // 🚨 ALERTAS Y NOTIFICACIONES
  alertas: [{
    tipo: {
      type: String,
      enum: ['retraso', 'desviacion', 'emergencia', 'mantenimiento', 'llegada', 'salida']
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
  
  // 🌡️ CONDICIONES ESPECIALES
  condiciones: {
    clima: String,              // 'soleado', 'lluvia', 'tormenta'
    trafico: String,            // 'normal', 'pesado', 'congestion'
    carretera: String,          // 'buena', 'regular', 'mala'
    observaciones: String
  }
  
}, {
  timestamps: true,
  versionKey: '__v',
  collection: "Viajes"
});

// 🔄 MIDDLEWARE PRE-SAVE PARA AUTO-ACTUALIZACIÓN
viajeSchema.pre('save', function(next) {
  const ahora = new Date();
  
  // Solo auto-actualizar si está habilitado
  if (this.estado.autoActualizar) {
    const estadoAnterior = this.estado.actual;
    
    // 🚀 AUTO-INICIAR VIAJES (si ya pasó la hora de salida)
    if (this.estado.actual === 'pendiente' && this.departureTime <= ahora) {
      this.estado.actual = 'en_curso';
      this.estado.fechaCambio = ahora;
      this.horarios.salidaReal = this.horarios.salidaReal || ahora;
      
      // Agregar al historial
      this.estado.historial.push({
        estadoAnterior: 'pendiente',
        estadoNuevo: 'en_curso',
        fecha: ahora,
        motivo: 'automatico'
      });
      
      console.log(`🚀 Viaje ${this._id} iniciado automáticamente`);
    }
    
    // ✅ AUTO-COMPLETAR VIAJES (si ya pasó la hora de llegada Y progreso >= 95%)
    if (this.estado.actual === 'en_curso' && 
        this.arrivalTime <= ahora && 
        this.tracking.progreso.porcentaje >= 95) {
      
      this.estado.actual = 'completado';
      this.estado.fechaCambio = ahora;
      this.horarios.llegadaReal = ahora;
      this.tracking.progreso.porcentaje = 100;
      
      // Agregar al historial
      this.estado.historial.push({
        estadoAnterior: 'en_curso',
        estadoNuevo: 'completado',
        fecha: ahora,
        motivo: 'automatico'
      });
      
      console.log(`✅ Viaje ${this._id} completado automáticamente`);
    }
    
    // ⚠️ AUTO-MARCAR RETRASOS (si pasó 30 min de la hora de llegada y progreso < 95%)
    if (this.estado.actual === 'en_curso' && 
        this.arrivalTime <= new Date(ahora.getTime() - 30 * 60000) && // 30 min de gracia
        this.tracking.progreso.porcentaje < 95) {
      
      this.estado.actual = 'retrasado';
      this.estado.fechaCambio = ahora;
      
      // Agregar alerta de retraso
      this.alertas.push({
        tipo: 'retraso',
        mensaje: `Viaje retrasado - Programado para ${this.arrivalTime.toLocaleString()}`,
        fecha: ahora,
        prioridad: 'alta'
      });
      
      // Agregar al historial
      this.estado.historial.push({
        estadoAnterior: 'en_curso',
        estadoNuevo: 'retrasado',
        fecha: ahora,
        motivo: 'automatico'
      });
      
      console.log(`⚠️ Viaje ${this._id} marcado como retrasado`);
    }
  }
  
  // 🕐 Actualizar timestamp de horarios
  this.horarios.ultimaActualizacion = ahora;
  
  next();
});

// 📊 MÉTODOS VIRTUALES
viajeSchema.virtual('duracionProgramada').get(function() {
  return Math.floor((this.arrivalTime - this.departureTime) / (1000 * 60)); // en minutos
});

viajeSchema.virtual('duracionReal').get(function() {
  if (this.horarios.salidaReal && this.horarios.llegadaReal) {
    return Math.floor((this.horarios.llegadaReal - this.horarios.salidaReal) / (1000 * 60));
  }
  return null;
});

viajeSchema.virtual('retrasoEnMinutos').get(function() {
  if (this.horarios.llegadaReal && this.arrivalTime) {
    return Math.floor((this.horarios.llegadaReal - this.arrivalTime) / (1000 * 60));
  }
  return null;
});

viajeSchema.virtual('estadoColor').get(function() {
  const colores = {
    'pendiente': 'yellow',
    'en_curso': 'blue', 
    'completado': 'green',
    'retrasado': 'orange',
    'cancelado': 'red'
  };
  return colores[this.estado.actual] || 'gray';
});

// 🔍 ÍNDICES PARA PERFORMANCE
viajeSchema.index({ 'estado.actual': 1 });
viajeSchema.index({ departureTime: 1 });
viajeSchema.index({ arrivalTime: 1 });
viajeSchema.index({ 'ruta.origen.nombre': 1 });
viajeSchema.index({ 'ruta.destino.nombre': 1 });
viajeSchema.index({ 'tracking.ubicacionActual.timestamp': 1 });
viajeSchema.index({ createdAt: 1 });

// 📱 MÉTODO ESTÁTICO PARA DATOS DEL MAPA
viajeSchema.statics.getMapData = async function() {
  return this.find({ 
    'estado.actual': { $in: ['pendiente', 'en_curso', 'retrasado', 'completado'] } 
  })
  .populate('truckId', 'brand model licensePlate name marca modelo placa nombre')
  .populate('conductor.id', 'nombre telefono')
  .select('-tracking.historialUbicaciones -ruta.rutaOptimizada') // Excluir datos pesados
  .sort({ departureTime: 1 })
  .lean();
};

// 🔄 MÉTODO PARA ACTUALIZAR PROGRESO
viajeSchema.methods.actualizarProgreso = function() {
  if (this.tracking.calculoAutomatico && 
      this.tracking.ubicacionActual.lat && 
      this.tracking.ubicacionActual.lng) {
    
    const ahora = new Date();
    const tiempoTranscurrido = ahora - (this.horarios.salidaReal || this.departureTime);
    const tiempoTotal = this.arrivalTime - this.departureTime;
    
    // Calcular progreso basado en tiempo (simplificado)
    let progresoTemporal = Math.min(95, (tiempoTranscurrido / tiempoTotal) * 100);
    
    // Asegurar que no retroceda
    this.tracking.progreso.porcentaje = Math.max(
      this.tracking.progreso.porcentaje, 
      Math.max(0, progresoTemporal)
    );
    
    this.tracking.progreso.ultimaActualizacion = ahora;
    
    console.log(`📈 Progreso actualizado para viaje ${this._id}: ${this.tracking.progreso.porcentaje}%`);
  }
};

// 📍 MÉTODO PARA AGREGAR UBICACIÓN AL HISTORIAL
viajeSchema.methods.agregarUbicacion = function(lat, lng, velocidad = 0) {
  // Agregar ubicación actual
  this.tracking.ubicacionActual = {
    lat,
    lng,
    timestamp: new Date(),
    velocidad,
    direccion: this.tracking.ubicacionActual.direccion || 0
  };
  
  // Agregar al historial (mantener solo últimas 50 ubicaciones)
  if (!this.tracking.historialUbicaciones) {
    this.tracking.historialUbicaciones = [];
  }
  
  this.tracking.historialUbicaciones.push({
    lat,
    lng,
    timestamp: new Date(),
    velocidad
  });
  
  // Mantener solo las últimas 50 ubicaciones
  if (this.tracking.historialUbicaciones.length > 50) {
    this.tracking.historialUbicaciones = this.tracking.historialUbicaciones.slice(-50);
  }
  
  // Actualizar progreso automáticamente
  this.actualizarProgreso();
};

export default model("Viajes", viajeSchema);