import { Schema, model } from "mongoose";

const viajesSchema = new Schema({
  // ID único del viaje
  viajeId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true
    // Ej: "VIA00001", "VIA00002"
  },
  
  // ========================================
  // DATOS DEL CLIENTE
  // ========================================
  
  // Si es cliente registrado
  clienteId: {
    type: Schema.Types.ObjectId,
    ref: "Clientes" // Referencia a tu modelo de Clientes si existe
    // null si no es cliente registrado
  },
  
  // Datos del cliente (siempre se llenan, ya sea de BD o manual)
  clienteNombre: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
    // Ej: "DIANA", "JUAN PEREZ", "SRA. ROXANA"
  },
  
  clienteTelefono: String,
  
  // ========================================
  // ORIGEN Y DESTINO
  // ========================================
  
  origen: {
    // Si es ubicación recurrente registrada
    ubicacionId: {
      type: Schema.Types.ObjectId,
      ref: "Ubicaciones"
    },
    
    // Nombre/dirección (siempre se llena)
    // Si es recurrente: se copia de Ubicaciones
    // Si NO es recurrente: se escribe manualmente
    texto: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    
    // Indica si es ubicación recurrente o no
    esRecurrente: {
      type: Boolean,
      default: false
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
      trim: true,
      uppercase: true
    },
    
    esRecurrente: {
      type: Boolean,
      default: false
    }
  },
  
  // Ruta completa (generada automáticamente)
  rutaCompleta: {
    type: String,
    uppercase: true
    // Ej: "DIANA/SARAM", "CASA JUAN/HOSPITAL"
  },
  
  // ========================================
  // DATOS DEL VIAJE
  // ========================================
  
  monto: {
    type: Number,
    required: true,
    min: 0
  },
  
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Hora del viaje (opcional)
  hora: String, // Ej: "08:30 AM"
  
  // Tipo de servicio
  tipoServicio: {
    type: String,
    enum: ["REGULAR", "ESCOLAR", "ESPECIAL", "EMERGENCIA", "OTRO"],
    default: "REGULAR"
  },
  
  // Duración estimada en minutos
  duracion: Number,
  
  // Distancia en km (opcional)
  distancia: Number,
  
  // Estado del viaje
  estado: {
    type: String,
    enum: ["PENDIENTE", "COMPLETADO", "CANCELADO","EXTRA"],
    default: "COMPLETADO"
  },
  
  // Método de pago
  metodoPago: {
    type: String,
    enum: ["EFECTIVO", "TRANSFERENCIA", "TARJETA", "CREDITO"],
    default: "EFECTIVO"
  },
  
  // Si fue pagado o no
  pagado: {
    type: Boolean,
    default: false
  },
  
  fechaPago: Date,
  
  // ========================================
  // INFORMACIÓN ADICIONAL
  // ========================================
  
  // Número de pasajeros
  pasajeros: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Observaciones
  notas: String,
  
  // Referencias del viaje
  referencias: String,
  
  // Datos del conductor (opcional)
  conductor: {
    nombre: String,
    vehiculo: String // Placa o identificación
  }
  
}, { 
  timestamps: true 
});

// ========================================
// MIDDLEWARES
// ========================================

// Generar rutaCompleta automáticamente antes de guardar
viajesSchema.pre('save', function(next) {
  if (this.origen.texto && this.destino.texto) {
    this.rutaCompleta = `${this.origen.texto}/${this.destino.texto}`;
  }
  next();
});

// Después de guardar, actualizar estadísticas de ubicaciones
viajesSchema.post('save', async function(doc) {
  try {
    const Ubicaciones = model('Ubicaciones');
    
    // Actualizar estadísticas del origen si es recurrente
    if (doc.origen.esRecurrente && doc.origen.ubicacionId) {
      const ubicacionOrigen = await Ubicaciones.findById(doc.origen.ubicacionId);
      if (ubicacionOrigen) {
        await ubicacionOrigen.actualizarEstadisticas();
      }
    }
    
    // Actualizar estadísticas del destino si es recurrente
    if (doc.destino.esRecurrente && doc.destino.ubicacionId) {
      const ubicacionDestino = await Ubicaciones.findById(doc.destino.ubicacionId);
      if (ubicacionDestino) {
        await ubicacionDestino.actualizarEstadisticas();
      }
    }
  } catch (error) {
    console.error('Error actualizando estadísticas:', error);
  }
});

// ========================================
// ÍNDICES
// ========================================

viajesSchema.index({ viajeId: 1 });
viajesSchema.index({ clienteId: 1 });
viajesSchema.index({ fecha: -1 });
viajesSchema.index({ estado: 1 });
viajesSchema.index({ 'origen.ubicacionId': 1 });
viajesSchema.index({ 'destino.ubicacionId': 1 });
viajesSchema.index({ rutaCompleta: 1 });

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Generar viajeId automático
viajesSchema.statics.generarViajeId = async function() {
  const ultimoViaje = await this.findOne()
    .sort({ viajeId: -1 })
    .select('viajeId');
  
  if (!ultimoViaje) {
    return "VIA00001";
  }
  
  const numero = parseInt(ultimoViaje.viajeId.replace('VIA', '')) + 1;
  return `VIA${String(numero).padStart(5, '0')}`;
};

// Obtener viajes por fecha
viajesSchema.statics.obtenerPorFecha = async function(fechaInicio, fechaFin) {
  return await this.find({
    fecha: {
      $gte: fechaInicio,
      $lte: fechaFin
    }
  })
  .populate('clienteId')
  .populate('origen.ubicacionId')
  .populate('destino.ubicacionId')
  .sort({ fecha: -1 });
};

// Obtener viajes por cliente
viajesSchema.statics.obtenerPorCliente = async function(clienteId, fechaInicio, fechaFin) {
  const query = { clienteId };
  
  if (fechaInicio && fechaFin) {
    query.fecha = { $gte: fechaInicio, $lte: fechaFin };
  }
  
  return await this.find(query)
    .populate('origen.ubicacionId')
    .populate('destino.ubicacionId')
    .sort({ fecha: -1 });
};

// Obtener reporte de viajes por periodo
viajesSchema.statics.obtenerReportePeriodo = async function(fechaInicio, fechaFin) {
  const viajes = await this.aggregate([
    {
      $match: {
        fecha: { $gte: fechaInicio, $lte: fechaFin },
        estado: "COMPLETADO"
      }
    },
    {
      $group: {
        _id: {
          clienteNombre: "$clienteNombre",
          rutaCompleta: "$rutaCompleta"
        },
        cantidadViajes: { $sum: 1 },
        montoTotal: { $sum: "$monto" },
        viajes: { $push: "$$ROOT" }
      }
    },
    {
      $sort: { "_id.clienteNombre": 1 }
    }
  ]);
  
  const totales = viajes.reduce((acc, grupo) => ({
    totalViajes: acc.totalViajes + grupo.cantidadViajes,
    montoTotal: acc.montoTotal + grupo.montoTotal
  }), { totalViajes: 0, montoTotal: 0 });
  
  return {
    periodo: { inicio: fechaInicio, fin: fechaFin },
    viajes,
    totales
  };
};

// Obtener viajes pendientes de pago
viajesSchema.statics.obtenerPendientesPago = async function() {
  return await this.find({
    pagado: false,
    estado: "COMPLETADO"
  })
  .populate('clienteId')
  .sort({ fecha: -1 });
};

// ========================================
// MÉTODOS DE INSTANCIA
// ========================================

// Marcar viaje como pagado
viajesSchema.methods.marcarComoPagado = async function() {
  this.pagado = true;
  this.fechaPago = new Date();
  return await this.save();
};

// Cancelar viaje
viajesSchema.methods.cancelar = async function(motivo) {
  this.estado = "CANCELADO";
  if (motivo) {
    this.notas = this.notas ? `${this.notas} | CANCELADO: ${motivo}` : `CANCELADO: ${motivo}`;
  }
  return await this.save();
};

export default model("ViajesInternos", viajesSchema);

