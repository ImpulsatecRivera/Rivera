//  Backend/src/Models/Viajes.js
// ESQUEMA ADAPTADO - Agregando configuración flexible a tu estructura existente

import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const viajeSchema = new Schema({
  // 🔗 REFERENCIAS A OTRAS COLECCIONES (mantener como está)
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

  // 📝 DESCRIPCIÓN DEL VIAJE (mantener)
  tripDescription: {
    type: String,
    required: true,
    trim: true
  },

  // ⏰ HORARIOS PRINCIPALES (mantener)
  departureTime: {
    type: Date,
    required: true
  },

  arrivalTime: {
    type: Date,
    required: true
  },

  // 🆕 CONFIGURACIÓN FLEXIBLE (NUEVO CAMPO AGREGADO)
  configuracion: {
    // Control de auto-inicio
    autoInicio: {
      type: Boolean,
      default: true
    },

    // Control de auto-completado
    autoCompletado: {
      type: Boolean,
      default: true
    },

    // Estrategia de cálculo de progreso
    estrategiaProgreso: {
      type: String,
      enum: ['automatico', 'manual', 'hibrido'],
      default: 'hibrido'
    },

    // Requerir confirmación manual
    requiereConfirmacionManual: {
      type: Boolean,
      default: false
    },

    // Confirmación recibida
    confirmacionRecibida: {
      type: Boolean,
      default: false
    },

    // Ignorar detección de retrasos
    ignoreDelayDetection: {
      type: Boolean,
      default: false
    },

    // Override manual
    manualOverride: {
      accion: String,
      fecha: Date,
      razon: String
    },

    // Override temporal
    temporaryOverride: {
      accion: String,
      fecha: Date,
      expira: Date,
      valorAnterior: mongoose.Schema.Types.Mixed
    },

    // Metadatos
    ultimaConfiguracion: {
      type: Date,
      default: Date.now
    },
    configuradoPor: {
      type: String,
      default: 'sistema'
    }
  },

  // ⏰ TIEMPOS REALES (mantener como está)
  tiemposReales: {
    ultimaActualizacion: {
      type: Date,
      default: Date.now
    },
    salidaReal: Date,
    llegadaReal: Date,
    tiempoRealViaje: Number // en minutos
  },

  // 📊 ESTADO DEL VIAJE (EXTENDER estados existentes)
  estado: {
    actual: {
      type: String,
      enum: [
        'pendiente', 'en_curso', 'completado', 'cancelado', 'retrasado',
        // 🆕 Nuevos estados agregados
        'programado', 'listo', 'pausado'
      ],
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
    // 🆕 Info de pausa agregada
    pausaInfo: {
      fechaPausa: Date,
      estadoAnterior: String,
      motivo: String
    },
    historial: [{
      estado: String,
      fecha: {
        type: Date,
        default: Date.now
      },
      observacion: String,
      // 🆕 Campos agregados al historial
      estadoAnterior: String,
      estadoNuevo: String,
      motivo: String,
      override: {
        type: Boolean,
        default: false
      },
      configuracion: mongoose.Schema.Types.Mixed
    }]
  },

  // 📍 TRACKING (EXTENDER tracking existente)
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
      },
      // 🆕 Método de cálculo agregado
      metodoCalculo: {
        type: String,
        enum: ['tiempo', 'checkpoint', 'hibrido', 'manual', 'automatico'],
        default: 'hibrido'
      }
    },

    // 🆕 Punto actual en ruta agregado
    puntoActualRuta: {
      indice: Number,
      punto: mongoose.Schema.Types.Mixed,
      progresoPunto: Number,
      timestamp: Date
    },

    // 📍 CHECKPOINTS (EXTENDER checkpoints existentes)
    checkpoints: [{
      // Campos existentes
      nombre: String,
      coordenadas: {
        lat: Number,
        lng: Number
      },
      horaEstimada: Date,
      horaReal: Date,
      completado: Boolean,

      // 🆕 Campos agregados para compatibilidad con sistema flexible
      tipo: String,
      progreso: Number,
      descripcion: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      reportadoPor: {
        type: String,
        enum: ['automatico', 'manual', 'sistema'],
        default: 'automatico'
      },
      rutaInfo: {
        puntoEstimado: mongoose.Schema.Types.Mixed,
        distanciaTotal: Number,
        totalPuntos: Number
      }
    }]
  },

  // 💰 COSTOS REALES (mantener como está)
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

  // 🚨 ALERTAS (EXTENDER alertas existentes)
  alertas: [{
    _id: {
      type: Schema.Types.ObjectId,
      auto: true
    },
    tipo: {
      type: String,
      enum: ['retraso', 'emergencia', 'llegada', 'salida', 'urgencia', 'configuracion', 'sistema']
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
    },
    // 🆕 Campos agregados
    configuracion: mongoose.Schema.Types.Mixed,
    rutaInfo: mongoose.Schema.Types.Mixed
  }],

  // 🌡 CONDICIONES DEL VIAJE (mantener como está)
  condiciones: {
    clima: String,
    trafico: String,
    carretera: String,
    observaciones: String
  },

  // 🆕 FLAGS DE CONTROL (NUEVO CAMPO)
  flags: {
    skipAutoProcessing: {
      type: Boolean,
      default: false,
      expira: Date
    },
    requiereRevision: {
      type: Boolean,
      default: false,
      motivo: String
    },
    esPrueba: {
      type: Boolean,
      default: false
    },
    altaPrioridad: {
      type: Boolean,
      default: false,
      motivo: String
    }
  }

}, {
  timestamps: true,
  versionKey: '__v',
  collection: "Viajes"
});

// 🔄 MIDDLEWARE PRE-SAVE MEJORADO
viajeSchema.pre('save', async function (next) {
  const ahora = new Date();
  const config = this.configuracion || {};

  // 🔄 AUTO-COMPLETAR DATOS DESDE LA COTIZACIÓN (mantener tu lógica)
  if (this.isNew && this.quoteId) {
    try {
      const cotizacion = await mongoose.model('Cotizaciones').findById(this.quoteId);
      if (cotizacion) {
        if (!this.tripDescription && cotizacion.quoteDescription) {
          this.tripDescription = cotizacion.quoteDescription;
        }

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

  // Inicializar configuración por defecto si no existe
  if (!this.configuracion) {
    this.configuracion = {
      autoInicio: true,
      autoCompletado: true,
      estrategiaProgreso: 'hibrido',
      requiereConfirmacionManual: false,
      ignoreDelayDetection: false,
      ultimaConfiguracion: ahora,
      configuradoPor: 'sistema_default'
    };
  }

  // Limpiar overrides temporales expirados
  if (config.temporaryOverride &&
    config.temporaryOverride.expira &&
    ahora > config.temporaryOverride.expira) {
    this.configuracion.temporaryOverride = undefined;
  }

  // Limpiar flags expirados
  if (this.flags && this.flags.skipAutoProcessing &&
    this.flags.expira && ahora > this.flags.expira) {
    this.flags.skipAutoProcessing = false;
    this.flags.expira = undefined;
  }

  // 💰 AUTO-CALCULAR COSTO TOTAL (mantener tu lógica)
  this.costosReales.total = (this.costosReales.combustible || 0) +
    (this.costosReales.peajes || 0) +
    (this.costosReales.conductor || 0) +
    (this.costosReales.otros || 0);

  // 🔄 LÓGICA DE AUTO-ACTUALIZACIÓN MEJORADA CON CONFIGURACIÓN
  if (this.estado.autoActualizar && !this.flags?.skipAutoProcessing) {

    // Auto-iniciar viajes CON VALIDACIÓN DE CONFIGURACIÓN
    if (this.estado.actual === 'pendiente' &&
      this.departureTime <= ahora &&
      config.autoInicio !== false &&
      !config.requiereConfirmacionManual) {

      this.estado.actual = 'en_curso';
      this.estado.fechaCambio = ahora;
      this.tiemposReales.salidaReal = this.tiemposReales.salidaReal || ahora;

      this.estado.historial.push({
        estadoAnterior: 'pendiente',
        estadoNuevo: 'en_curso',
        estado: 'en_curso', // mantener compatibilidad
        fecha: ahora,
        observacion: 'Viaje iniciado automáticamente',
        motivo: 'automatico_hora_salida',
        configuracion: config
      });
    }

    // Auto-completar viajes CON VALIDACIÓN DE CONFIGURACIÓN
    if (this.estado.actual === 'en_curso' &&
      this.arrivalTime <= ahora &&
      this.tracking.progreso.porcentaje >= 95 &&
      config.autoCompletado !== false) {

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
        estadoAnterior: 'en_curso',
        estadoNuevo: 'completado',
        estado: 'completado', // mantener compatibilidad
        fecha: ahora,
        observacion: 'Viaje completado automáticamente',
        motivo: 'automatico_completado',
        configuracion: config
      });
    }
  }

  this.tiemposReales.ultimaActualizacion = ahora;
  next();
});

// 📊 MÉTODOS VIRTUALES (mantener los existentes)
viajeSchema.virtual('duracionProgramada').get(function () {
  if (!this.arrivalTime || !this.departureTime) return 0;
  return Math.floor((this.arrivalTime - this.departureTime) / (1000 * 60));
});

viajeSchema.virtual('duracionReal').get(function () {
  if (!this.tiemposReales.llegadaReal || !this.tiemposReales.salidaReal) return 0;
  return Math.floor((this.tiemposReales.llegadaReal - this.tiemposReales.salidaReal) / (1000 * 60));
});

// 🆕 NUEVOS MÉTODOS VIRTUALES
viajeSchema.virtual('tiempoTranscurridoMinutos').get(function () {
  const inicio = this.tiemposReales?.salidaReal || this.departureTime;
  return Math.floor((new Date() - inicio) / (1000 * 60));
});

viajeSchema.virtual('tiempoRestanteMinutos').get(function () {
  return Math.floor((this.arrivalTime - new Date()) / (1000 * 60));
});

// 🆕 MÉTODOS DE INSTANCIA PARA CONFIGURACIÓN
viajeSchema.methods.puedeIniciarseAutomaticamente = function () {
  const config = this.configuracion || {};
  const now = new Date();

  return (
    this.estado.actual === 'pendiente' &&
    this.departureTime <= now &&
    config.autoInicio !== false &&
    !config.requiereConfirmacionManual &&
    !this.flags?.skipAutoProcessing
  );
};

viajeSchema.methods.puedeCompletarseAutomaticamente = function () {
  const config = this.configuracion || {};

  return (
    ['en_curso', 'retrasado'].includes(this.estado.actual) &&
    config.autoCompletado !== false &&
    !this.flags?.skipAutoProcessing
  );
};

viajeSchema.methods.getEstrategiaProgreso = function () {
  return this.configuracion?.estrategiaProgreso || 'hibrido';
};

viajeSchema.methods.tieneOverrideActivo = function () {
  const config = this.configuracion || {};
  const now = new Date();

  if (config.manualOverride) {
    return { tipo: 'manual', data: config.manualOverride };
  }

  if (config.temporaryOverride &&
    config.temporaryOverride.expira &&
    now < config.temporaryOverride.expira) {
    return { tipo: 'temporal', data: config.temporaryOverride };
  }

  return null;
};

// 🔍 ÍNDICES OPTIMIZADOS (mantener los existentes + nuevos)
viajeSchema.index({ 'estado.actual': 1 });
viajeSchema.index({ departureTime: 1 });
viajeSchema.index({ quoteId: 1 });
viajeSchema.index({ truckId: 1 });
viajeSchema.index({ conductorId: 1 });
// 🆕 Nuevos índices
viajeSchema.index({ 'configuracion.autoInicio': 1, 'estado.actual': 1 });
viajeSchema.index({ 'configuracion.estrategiaProgreso': 1 });
viajeSchema.index({ 'flags.skipAutoProcessing': 1, 'flags.expira': 1 });

// 📱 MÉTODO ESTÁTICO MEJORADO (mantener tu método + extensiones)
viajeSchema.statics.getViajeCompleto = async function (viajeId) {
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

// 🆕 NUEVOS MÉTODOS ESTÁTICOS
viajeSchema.statics.findViajesParaAutoProcesamiento = function () {
  return this.find({
    'estado.autoActualizar': true,
    'estado.actual': {
      $in: ['programado', 'pendiente', 'en_curso', 'retrasado', 'pausado']
    },
    'flags.skipAutoProcessing': { $ne: true }
  });
};

viajeSchema.statics.getEstadisticasConfiguracion = async function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalViajes: { $sum: 1 },
        conAutoInicio: {
          $sum: {
            $cond: [{ $ne: ['$configuracion.autoInicio', false] }, 1, 0]
          }
        },
        conAutoCompletado: {
          $sum: {
            $cond: [{ $ne: ['$configuracion.autoCompletado', false] }, 1, 0]
          }
        },
        estrategiaAutomatico: {
          $sum: {
            $cond: [{ $eq: ['$configuracion.estrategiaProgreso', 'automatico'] }, 1, 0]
          }
        },
        estrategiaManual: {
          $sum: {
            $cond: [{ $eq: ['$configuracion.estrategiaProgreso', 'manual'] }, 1, 0]
          }
        },
        estrategiaHibrido: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ['$configuracion.estrategiaProgreso', 'hibrido'] },
                  { $eq: ['$configuracion.estrategiaProgreso', null] }
                ]
              },
              1, 0
            ]
          }
        }
      }
    }
  ]);
};

// Asegurar que los virtuals se incluyan en JSON
viajeSchema.set('toJSON', { virtuals: true });
viajeSchema.set('toObject', { virtuals: true });

export default model("Viajes", viajeSchema);