//  Backend/src/Models/Viajes.js
// ESQUEMA COMPLETO - Con todos los campos para reportes PDF

import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const viajeSchema = new Schema({
  // =====================================================
  // 🔗 REFERENCIAS A OTRAS COLECCIONES
  // =====================================================
  quoteId: {
    type: Schema.Types.ObjectId,
    ref: 'Cotizaciones',
    required: function() {
      return this.tipoViaje === 'cotizacion';
    }
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

  // =====================================================
  // 🆕 TIPO DE VIAJE
  // =====================================================
  tipoViaje: {
    type: String,
    enum: ['cotizacion', 'operativo'],
    default: 'cotizacion',
    required: true
  },

  // =====================================================
  // 🆕 PARA VIAJES OPERATIVOS (sin cotización)
  // =====================================================
  clienteOperativo: {
    type: Schema.Types.ObjectId,
    ref: 'Clientes',
    required: function() {
      return this.tipoViaje === 'operativo';
    }
  },

  clienteNombre: {
    type: String,
    trim: true,
    uppercase: true
  },

  // Código/Número de programación (como en la pizarra)
  codigoProgramacion: {
    type: String,
    trim: true,
    uppercase: true
    // Ej: "C-11375", "C-12150"
  },

  // Ruta directa (para viajes operativos)
  rutaDirecta: {
    origen: {
      nombre: {
        type: String,
        trim: true,
        uppercase: true
      },
      coordenadas: {
        lat: Number,
        lng: Number
      }
    },
    destino: {
      nombre: {
        type: String,
        trim: true,
        uppercase: true
      },
      coordenadas: {
        lat: Number,
        lng: Number
      }
    },
    rutaCompleta: {
      type: String,
      uppercase: true
      // Ej: "JULIO/RONALD", "ENOC/YAMAY"
    },
    distanciaTotal: Number,
    tiempoEstimado: Number
  },

  // Carga directa (para viajes operativos)
  cargaDirecta: {
    descripcion: {
      type: String,
      default: 'Carga general'
    },
    peso: {
      valor: Number,
      unidad: {
        type: String,
        default: 'kg'
      }
    },
    tipo: String
  },

  // Monto acordado (para viajes operativos)
  montoAcordado: {
    type: Number,
    default: 0
  },

  // =====================================================
  // 🆕 CAMPOS PARA REPORTES Y FACTURACIÓN
  // =====================================================
  
  // Número correlativo de viaje (por cliente/mes)
  numeroViaje: {
    type: Number,
    // Se genera automáticamente al crear el viaje
  },

  // Número correlativo general (único en todo el sistema)
  numeroViajeGlobal: {
    type: String,
    sparse: true,
    unique: true
    // Ej: "VOP-2025-00001"
  },

  // 💰 DATOS DE FACTURACIÓN (CRÍTICO PARA PDFs)
  facturacion: {
    // Monto sin IVA
    montoSinIVA: {
      type: Number,
      default: 0
    },
    
    // IVA (13% en El Salvador)
    iva: {
      type: Number,
      default: 0
    },
    
    // Monto total con IVA
    montoTotal: {
      type: Number,
      default: 0
    },
    
    // Tipo de consumidor
    tipoConsumidor: {
      type: String,
      enum: ['contribuyente', 'consumidor_final'],
      default: 'contribuyente'
      // contribuyente = crédito fiscal
      // consumidor_final = sin crédito fiscal
    },
    
    // Número de factura (si aplica)
    numeroFactura: {
      type: String,
      trim: true
    },
    
    // Fecha de facturación
    fechaFactura: {
      type: Date
    },
    
    // Estado de pago
    estadoPago: {
      type: String,
      enum: ['pendiente', 'pagado', 'vencido', 'parcial'],
      default: 'pendiente'
    },
    
    // Fecha de pago
    fechaPago: {
      type: Date
    },
    
    // Método de pago
    metodoPago: {
      type: String,
      enum: ['efectivo', 'transferencia', 'cheque', 'credito'],
      default: 'credito'
    },
    
    // Fecha de vencimiento (para créditos)
    fechaVencimiento: {
      type: Date
    },
    
    // Notas de facturación
    notasFacturacion: {
      type: String,
      trim: true
    }
  },

  // 📅 PERÍODO CONTABLE (para agrupar en reportes)
  periodoContable: {
    año: {
      type: Number
    },
    mes: {
      type: Number,
      min: 1,
      max: 12
    },
    semana: {
      type: Number,
      min: 1,
      max: 53
    }
  },

  // 🏷️ CATEGORIZACIÓN PARA REPORTES
  categorizacion: {
    // Tipo de servicio
    tipoServicio: {
      type: String,
      enum: ['regular', 'urgente', 'especial', 'programado'],
      default: 'regular'
    },
    
    // Zona geográfica
    zona: {
      type: String,
      enum: ['urbana', 'rural', 'intermunicipal', 'internacional'],
      default: 'intermunicipal'
    },
    
    // Prioridad
    prioridad: {
      type: String,
      enum: ['baja', 'normal', 'alta', 'urgente'],
      default: 'normal'
    }
  },

  // 📝 OBSERVACIONES Y NOTAS
  observacionesInternas: {
    type: String,
    trim: true
    // Para notas que NO aparecen en PDFs del cliente
  },

  observacionesCliente: {
    type: String,
    trim: true
    // Para notas que SÍ aparecen en PDFs del cliente
  },

  // ✅ APROBACIONES (para viajes operativos)
  aprobaciones: {
    aprobadoPor: {
      type: String,
      trim: true
    },
    fechaAprobacion: {
      type: Date
    },
    requiereAprobacion: {
      type: Boolean,
      default: false
    }
  },

  // 📎 DOCUMENTOS ADJUNTOS
  documentosAdjuntos: [{
    tipo: {
      type: String,
      enum: ['guia', 'factura', 'remision', 'foto', 'firma', 'otro']
    },
    url: String,
    nombre: String,
    fechaSubida: {
      type: Date,
      default: Date.now
    }
  }],

  // =====================================================
  // 📝 DESCRIPCIÓN DEL VIAJE
  // =====================================================
  tripDescription: {
    type: String,
    required: true,
    trim: true
  },

  // =====================================================
  // ⏰ HORARIOS PRINCIPALES
  // =====================================================
  departureTime: {
    type: Date,
    required: true
  },

  arrivalTime: {
    type: Date,
    required: true
  },

  // =====================================================
  // 🆕 CONFIGURACIÓN FLEXIBLE
  // =====================================================
  configuracion: {
    autoInicio: {
      type: Boolean,
      default: true
    },
    autoCompletado: {
      type: Boolean,
      default: true
    },
    estrategiaProgreso: {
      type: String,
      enum: ['automatico', 'manual', 'hibrido'],
      default: 'hibrido'
    },
    requiereConfirmacionManual: {
      type: Boolean,
      default: false
    },
    confirmacionRecibida: {
      type: Boolean,
      default: false
    },
    ignoreDelayDetection: {
      type: Boolean,
      default: false
    },
    manualOverride: {
      accion: String,
      fecha: Date,
      razon: String
    },
    temporaryOverride: {
      accion: String,
      fecha: Date,
      expira: Date,
      valorAnterior: mongoose.Schema.Types.Mixed
    },
    ultimaConfiguracion: {
      type: Date,
      default: Date.now
    },
    configuradoPor: {
      type: String,
      default: 'sistema'
    }
  },

  // =====================================================
  // ⏰ TIEMPOS REALES
  // =====================================================
  tiemposReales: {
    ultimaActualizacion: {
      type: Date,
      default: Date.now
    },
    salidaReal: Date,
    llegadaReal: Date,
    tiempoRealViaje: Number // en minutos
  },

  // =====================================================
  // 📊 ESTADO DEL VIAJE
  // =====================================================
  estado: {
    actual: {
      type: String,
      enum: [
        'pendiente', 'en_curso', 'completado', 'cancelado', 'retrasado',
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

  // =====================================================
  // 📍 TRACKING
  // =====================================================
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
      metodoCalculo: {
        type: String,
        enum: ['tiempo', 'checkpoint', 'hibrido', 'manual', 'automatico'],
        default: 'hibrido'
      }
    },
    puntoActualRuta: {
      indice: Number,
      punto: mongoose.Schema.Types.Mixed,
      progresoPunto: Number,
      timestamp: Date
    },
    checkpoints: [{
      nombre: String,
      coordenadas: {
        lat: Number,
        lng: Number
      },
      horaEstimada: Date,
      horaReal: Date,
      completado: Boolean,
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

  // =====================================================
  // 💰 COSTOS REALES
  // =====================================================
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

  // =====================================================
  // 🚨 ALERTAS
  // =====================================================
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
    configuracion: mongoose.Schema.Types.Mixed,
    rutaInfo: mongoose.Schema.Types.Mixed
  }],

  // =====================================================
  // 🌡 CONDICIONES DEL VIAJE
  // =====================================================
  condiciones: {
    clima: String,
    trafico: String,
    carretera: String,
    observaciones: String
  },

  // =====================================================
  // 🆕 FLAGS DE CONTROL
  // =====================================================
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

// =====================================================
// 🔄 MIDDLEWARE PRE-SAVE MEJORADO
// =====================================================
viajeSchema.pre('save', async function (next) {
  const ahora = new Date();
  const config = this.configuracion || {};

  // 🔄 AUTO-COMPLETAR DATOS DESDE LA COTIZACIÓN
  if (this.isNew && this.quoteId && this.tipoViaje === 'cotizacion') {
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

  // 📊 CALCULAR PERÍODO CONTABLE
  if (this.departureTime) {
    const fecha = new Date(this.departureTime);
    this.periodoContable = {
      año: fecha.getFullYear(),
      mes: fecha.getMonth() + 1,
      semana: getISOWeek(fecha)
    };
  }

  // 💰 CALCULAR FACTURACIÓN (para viajes operativos)
  if (this.tipoViaje === 'operativo' && this.montoAcordado) {
    const montoBase = this.montoAcordado;
    
    // Si no se ha establecido manualmente
    if (!this.facturacion || !this.facturacion.montoSinIVA) {
      const IVA_RATE = 0.13; // 13% El Salvador
      
      this.facturacion = this.facturacion || {};
      
      // Si el cliente es contribuyente (crédito fiscal)
      if (this.facturacion.tipoConsumidor === 'contribuyente' || !this.facturacion.tipoConsumidor) {
        this.facturacion.tipoConsumidor = 'contribuyente';
        this.facturacion.montoSinIVA = montoBase;
        this.facturacion.iva = montoBase * IVA_RATE;
        this.facturacion.montoTotal = montoBase * (1 + IVA_RATE);
      } else {
        // Consumidor final (precio ya incluye IVA)
        this.facturacion.montoTotal = montoBase;
        this.facturacion.montoSinIVA = montoBase / (1 + IVA_RATE);
        this.facturacion.iva = montoBase - this.facturacion.montoSinIVA;
      }
    }
  }

  // 🔢 GENERAR NÚMERO DE VIAJE GLOBAL (si no existe)
  if (this.isNew && this.tipoViaje === 'operativo') {
    if (!this.numeroViajeGlobal) {
      const año = new Date().getFullYear();
      const count = await this.constructor.countDocuments({
        tipoViaje: 'operativo',
        'periodoContable.año': año
      });
      
      const numero = String(count + 1).padStart(5, '0');
      this.numeroViajeGlobal = `VOP-${año}-${numero}`;
    }
  }

  // 💰 AUTO-CALCULAR COSTO TOTAL
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
        estado: 'en_curso',
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
        estado: 'completado',
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

// =====================================================
// 📊 MÉTODOS VIRTUALES
// =====================================================
viajeSchema.virtual('duracionProgramada').get(function () {
  if (!this.arrivalTime || !this.departureTime) return 0;
  return Math.floor((this.arrivalTime - this.departureTime) / (1000 * 60));
});

viajeSchema.virtual('duracionReal').get(function () {
  if (!this.tiemposReales.llegadaReal || !this.tiemposReales.salidaReal) return 0;
  return Math.floor((this.tiemposReales.llegadaReal - this.tiemposReales.salidaReal) / (1000 * 60));
});

viajeSchema.virtual('tiempoTranscurridoMinutos').get(function () {
  const inicio = this.tiemposReales?.salidaReal || this.departureTime;
  return Math.floor((new Date() - inicio) / (1000 * 60));
});

viajeSchema.virtual('tiempoRestanteMinutos').get(function () {
  return Math.floor((this.arrivalTime - new Date()) / (1000 * 60));
});

// =====================================================
// 🆕 MÉTODOS DE INSTANCIA
// =====================================================
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

// =====================================================
// 🔍 ÍNDICES OPTIMIZADOS
// =====================================================
viajeSchema.index({ 'estado.actual': 1 });
viajeSchema.index({ departureTime: 1 });
viajeSchema.index({ quoteId: 1 });
viajeSchema.index({ truckId: 1 });
viajeSchema.index({ conductorId: 1 });
viajeSchema.index({ tipoViaje: 1 });
viajeSchema.index({ clienteOperativo: 1 });
viajeSchema.index({ 'periodoContable.año': 1, 'periodoContable.mes': 1 });
viajeSchema.index({ 'facturacion.estadoPago': 1 });
viajeSchema.index({ numeroViajeGlobal: 1 });
viajeSchema.index({ 'configuracion.autoInicio': 1, 'estado.actual': 1 });
viajeSchema.index({ 'configuracion.estrategiaProgreso': 1 });
viajeSchema.index({ 'flags.skipAutoProcessing': 1, 'flags.expira': 1 });

// =====================================================
// 📱 MÉTODOS ESTÁTICOS
// =====================================================
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
      $unwind: {
        path: "$cotizacion",
        preserveNullAndEmptyArrays: true
      }
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

// =====================================================
// 🆕 MÉTODOS ESTÁTICOS PARA REPORTES
// =====================================================

// Obtener viajes para reporte mensual
viajeSchema.statics.obtenerReporteMensual = function(mes, año) {
  return this.find({
    tipoViaje: 'operativo',
    'estado.actual': 'completado',
    'periodoContable.año': año,
    'periodoContable.mes': mes
  })
  .populate('clienteOperativo', 'nombreComercial nombreEmpresa')
  .populate('truckId', 'licensePlate placa')
  .populate('conductorId', 'name nombre')
  .sort({ clienteNombre: 1, departureTime: 1 })
  .lean();
};

// Obtener resumen por cliente
viajeSchema.statics.obtenerResumenCliente = async function(clienteNombre, mes, año) {
  return this.aggregate([
    {
      $match: {
        tipoViaje: 'operativo',
        clienteNombre: clienteNombre,
        'estado.actual': 'completado',
        'periodoContable.año': año,
        'periodoContable.mes': mes
      }
    },
    {
      $group: {
        _id: '$rutaDirecta.rutaCompleta',
        cantidadViajes: { $sum: 1 },
        montoTotal: { $sum: '$montoAcordado' },
        montoSinIVA: { $sum: '$facturacion.montoSinIVA' },
        iva: { $sum: '$facturacion.iva' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

// Obtener consolidado anual
viajeSchema.statics.obtenerConsolidadoAnual = async function(año) {
  return this.aggregate([
    {
      $match: {
        tipoViaje: 'operativo',
        'estado.actual': 'completado',
        'periodoContable.año': año
      }
    },
    {
      $group: {
        _id: {
          cliente: '$clienteNombre',
          mes: '$periodoContable.mes'
        },
        totalViajes: { $sum: 1 },
        montoTotal: { $sum: '$montoAcordado' }
      }
    },
    {
      $group: {
        _id: '$_id.cliente',
        meses: {
          $push: {
            mes: '$_id.mes',
            viajes: '$totalViajes',
            monto: '$montoTotal'
          }
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

// =====================================================
// FUNCIÓN AUXILIAR PARA CALCULAR SEMANA ISO
// =====================================================
function getISOWeek(date) {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// Asegurar que los virtuals se incluyan en JSON
viajeSchema.set('toJSON', { virtuals: true });
viajeSchema.set('toObject', { virtuals: true });

export default model("Viajes", viajeSchema);