import { Schema, model } from "mongoose";

/*
  MODELO REFACTORIZADO: ViajesPorClientes
  
  Este modelo ahora se enfoca EXCLUSIVAMENTE en:
  - Generar reportes mensuales agregados
  - Facturación mensual por cliente
  - Consolidación de datos para análisis
  
  Los viajes individuales se registran en el modelo "Viajes"
  Este modelo se puede generar/actualizar automáticamente desde "Viajes"
*/

const viajesClienteSchema = new Schema({
  // ID único del reporte (por cliente-mes)
  reporteId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true
    // Ej: "REP001", "REP002"
  },
  
  // ========================================
  // DATOS DEL CLIENTE
  // ========================================
  
  clienteId: {
  type: Schema.Types.ObjectId,
  ref: "Clientes",
  required: false  // ← O simplemente elimina la línea "required"
},
  
  clienteNombre: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  
  // ========================================
  // PERIODO DEL REPORTE
  // ========================================
  
  mes: {
    type: Number,
    min: 1,
    max: 12,
    required: true
  },
  
  año: {
    type: Number,
    required: true
  },
  
  periodoTexto: {
    type: String
    // Ej: "ENERO 2025"
  },
  
  // ========================================
  // RESUMEN DE RUTAS DEL MES
  // ========================================
  
  rutas: [{
    // Origen y destino
    origen: {
      ubicacionId: {
        type: Schema.Types.ObjectId,
        ref: "Ubicaciones"
      },
      texto: {
        type: String,
        required: true,
        uppercase: true
      }
    },
    
    destino: {
      ubicacionId: {
        type: Schema.Types.ObjectId,
        ref: "Ubicaciones"
      },
      texto: {
        type: String,
        required: true,
        uppercase: true
      }
    },
    
    rutaCompleta: {
      type: String,
      uppercase: true
    },
    
    // Consolidado del mes
    cantidadViajes: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    
    montoPorViaje: {
      type: Number,
      required: true,
      min: 0
    },
    
    montoTotal: {
      type: Number,
      min: 0
    },
    
    // Referencias a los viajes individuales
    viajesIds: [{
      type: Schema.Types.ObjectId,
      ref: "Viajes"
    }],
    
    // Fechas
    primerViaje: Date,
    ultimoViaje: Date
  }],
  
  // ========================================
  // TOTALES DEL CLIENTE EN EL MES
  // ========================================
  
  totalViajes: {
    type: Number,
    default: 0
  },
  
  montoTotalGeneral: {
    type: Number,
    default: 0
  },
  
  // ========================================
  // DETALLES DE PAGO
  // ========================================
  
  estadoPago: {
    type: String,
    enum: ["PENDIENTE", "PAGADO_PARCIAL", "PAGADO_TOTAL"],
    default: "PENDIENTE"
  },
  
  montoPagado: {
    type: Number,
    default: 0
  },
  
  saldoPendiente: {
    type: Number,
    default: 0
  },
  
  pagos: [{
    fecha: Date,
    monto: Number,
    metodoPago: String,
    referencia: String,
    notas: String
  }],
  
  // ========================================
  // INFO ADICIONAL
  // ========================================
  
  telefono: String,
  email: String,
  
  estado: {
    type: String,
    enum: ["ACTIVO", "INACTIVO", "CERRADO"],
    default: "ACTIVO"
  },
  
  notas: String,
  
  // Fecha de generación del reporte
  fechaGeneracion: {
    type: Date,
    default: Date.now
  }
  
}, { 
  timestamps: true 
});

// ========================================
// MIDDLEWARES
// ========================================

// Calcular totales antes de guardar
viajesClienteSchema.pre('save', function(next) {
  let totalViajes = 0;
  let montoTotalGeneral = 0;
  
  // Calcular periodo texto
  const meses = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
  ];
  this.periodoTexto = `${meses[this.mes - 1]} ${this.año}`;
  
  // Calcular totales por ruta
  this.rutas.forEach(ruta => {
    // Generar rutaCompleta
    if (ruta.origen.texto && ruta.destino.texto) {
      ruta.rutaCompleta = `${ruta.origen.texto}/${ruta.destino.texto}`;
    }
    
    // Calcular monto total de la ruta
    if (ruta.cantidadViajes && ruta.montoPorViaje) {
      ruta.montoTotal = ruta.cantidadViajes * ruta.montoPorViaje;
    }
    
    // Sumar a totales generales
    totalViajes += ruta.cantidadViajes || 0;
    montoTotalGeneral += ruta.montoTotal || 0;
  });
  
  this.totalViajes = totalViajes;
  this.montoTotalGeneral = montoTotalGeneral;
  
  // Calcular saldo pendiente
  this.saldoPendiente = this.montoTotalGeneral - (this.montoPagado || 0);
  
  // Determinar estado de pago
  if (this.montoPagado === 0) {
    this.estadoPago = "PENDIENTE";
  } else if (this.montoPagado >= this.montoTotalGeneral) {
    this.estadoPago = "PAGADO_TOTAL";
  } else {
    this.estadoPago = "PAGADO_PARCIAL";
  }
  
  next();
});

// ========================================
// ÍNDICES
// ========================================

viajesClienteSchema.index({ reporteId: 1 });
viajesClienteSchema.index({ clienteId: 1, mes: 1, año: 1 }, { unique: true });
viajesClienteSchema.index({ clienteNombre: 1 });
viajesClienteSchema.index({ mes: 1, año: 1 });
viajesClienteSchema.index({ estadoPago: 1 });

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Generar reporteId automático
viajesClienteSchema.statics.generarReporteId = async function() {
  const ultimoReporte = await this.findOne()
    .sort({ reporteId: -1 })
    .select('reporteId');
  
  if (!ultimoReporte) {
    return "REP001";
  }
  
  const numero = parseInt(ultimoReporte.reporteId.replace('REP', '')) + 1;
  return `REP${String(numero).padStart(3, '0')}`;
};

// Generar reporte desde viajes individuales
viajesClienteSchema.statics.generarDesdeViajes = async function(clienteId, mes, año) {
  const Viajes = model('Viajes');
  
  // Obtener primer y último día del mes
  const primerDia = new Date(año, mes - 1, 1);
  const ultimoDia = new Date(año, mes, 0, 23, 59, 59);
  
  // Buscar todos los viajes del cliente en ese mes
  const viajes = await Viajes.find({
    clienteId: clienteId,
    fecha: { $gte: primerDia, $lte: ultimoDia },
    estado: "COMPLETADO"
  }).sort({ fecha: 1 });
  
  if (viajes.length === 0) {
    throw new Error('No hay viajes para este cliente en el periodo especificado');
  }
  
  // Agrupar viajes por ruta
  const rutasMap = new Map();
  
  viajes.forEach(viaje => {
    const rutaKey = viaje.rutaCompleta;
    
    if (!rutasMap.has(rutaKey)) {
      rutasMap.set(rutaKey, {
        origen: viaje.origen,
        destino: viaje.destino,
        rutaCompleta: viaje.rutaCompleta,
        cantidadViajes: 0,
        montoPorViaje: viaje.monto,
        viajesIds: [],
        primerViaje: viaje.fecha,
        ultimoViaje: viaje.fecha
      });
    }
    
    const ruta = rutasMap.get(rutaKey);
    ruta.cantidadViajes++;
    ruta.viajesIds.push(viaje._id);
    ruta.ultimoViaje = viaje.fecha;
  });
  
  // Convertir Map a Array
  const rutas = Array.from(rutasMap.values());
  
  // Buscar si ya existe el reporte
  let reporte = await this.findOne({ clienteId, mes, año });
  
  if (reporte) {
    // Actualizar reporte existente
    reporte.rutas = rutas;
    reporte.fechaGeneracion = new Date();
    await reporte.save();
    return reporte;
  }
  
  // Crear nuevo reporte
  const reporteId = await this.generarReporteId();
  
  reporte = await this.create({
    reporteId,
    clienteId,
    clienteNombre: viajes[0].clienteNombre,
    mes,
    año,
    rutas
  });
  
  return reporte;
};

// Obtener reporte mensual completo (todos los clientes)
viajesClienteSchema.statics.obtenerReporteMensual = async function(mes, año) {
  const reportes = await this.find({
    mes: mes,
    año: año,
    estado: "ACTIVO"
  })
  .populate('clienteId')
  .sort({ clienteNombre: 1 });
  
  const granTotal = reportes.reduce((acc, reporte) => ({
    totalViajes: acc.totalViajes + reporte.totalViajes,
    totalMonto: acc.totalMonto + reporte.montoTotalGeneral,
    totalPagado: acc.totalPagado + (reporte.montoPagado || 0),
    totalPendiente: acc.totalPendiente + (reporte.saldoPendiente || 0)
  }), { 
    totalViajes: 0, 
    totalMonto: 0,
    totalPagado: 0,
    totalPendiente: 0
  });
  
  return {
    mes,
    año,
    reportes,
    granTotal
  };
};

// Obtener reportes con saldo pendiente
viajesClienteSchema.statics.obtenerConSaldoPendiente = async function() {
  return await this.find({
    estadoPago: { $in: ["PENDIENTE", "PAGADO_PARCIAL"] },
    estado: "ACTIVO"
  })
  .populate('clienteId')
  .sort({ saldoPendiente: -1 });
};

// ========================================
// MÉTODOS DE INSTANCIA
// ========================================

// Registrar pago
viajesClienteSchema.methods.registrarPago = async function(monto, metodoPago, referencia, notas) {
  this.pagos.push({
    fecha: new Date(),
    monto,
    metodoPago,
    referencia,
    notas
  });
  
  this.montoPagado = (this.montoPagado || 0) + monto;
  
  return await this.save();
};

// Cerrar reporte (finalizar facturación del mes)
viajesClienteSchema.methods.cerrarReporte = async function() {
  this.estado = "CERRADO";
  return await this.save();
};

export default model("ViajesPorClientes", viajesClienteSchema);

