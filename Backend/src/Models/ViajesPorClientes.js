import { Schema, model } from "mongoose";

const viajesSchema = new Schema({
  // ID único del cliente (se genera automáticamente)
  clienteId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true
    // Ej: "CLI001", "CLI002"
  },
  
  // Nombre del cliente
  clienteNombre: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
    // Ej: "DIANA", "DR. GOMEZ", "SRA. ROXANA"
  },
  
  // Array de rutas del cliente
  rutas: [{
    // Origen y destino de la ruta
    origen: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
      // Ej: "DIANA", "TAPASCO", "DR. GOMEZ"
    },
    destino: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
      // Ej: "SARAM", "TAPASCO", "EL TRANSITO"
    },
    // Nombre completo de la ruta (generado automáticamente)
    rutaCompleta: {
      type: String,
      uppercase: true
      // Ej: "DIANA/SARAM", "TAPASCO/SARAM"
    },
    // Datos de viajes en esta ruta
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
    activa: {
      type: Boolean,
      default: true
    }
  }],
  
  // Totales del cliente (calculados automáticamente)
  totalViajes: {
    type: Number,
    default: 0
  },
  
  montoTotalGeneral: {
    type: Number,
    default: 0
  },
  
  // Periodo del reporte
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
  
  // Info de contacto (opcional)
  telefono: String,
  email: String,
  
  // Estado general
  estado: {
    type: String,
    enum: ["ACTIVO", "INACTIVO"],
    default: "ACTIVO"
  },
  
  notas: String
  
}, { 
  timestamps: true
});

// Middleware para calcular montoTotal de cada ruta y totales generales
viajesSchema.pre('save', function(next) {
  let totalViajes = 0;
  let montoTotalGeneral = 0;
  
  // Recorrer cada ruta y calcular sus totales
  this.rutas.forEach(ruta => {
    // Generar nombre completo de la ruta
    if (ruta.origen && ruta.destino) {
      ruta.rutaCompleta = `${ruta.origen}/${ruta.destino}`;
    }
    
    // Calcular monto total de la ruta
    if (ruta.cantidadViajes && ruta.montoPorViaje) {
      ruta.montoTotal = ruta.cantidadViajes * ruta.montoPorViaje;
    }
    
    // Sumar a los totales generales
    if (ruta.activa) {
      totalViajes += ruta.cantidadViajes || 0;
      montoTotalGeneral += ruta.montoTotal || 0;
    }
  });
  
  this.totalViajes = totalViajes;
  this.montoTotalGeneral = montoTotalGeneral;
  
  next();
});

// Índice compuesto único para evitar duplicados por mes/año
viajesSchema.index({ clienteId: 1, mes: 1, año: 1 }, { unique: true });
viajesSchema.index({ clienteNombre: 1 });

// Método para agregar una nueva ruta
viajesSchema.methods.agregarRuta = function(origen, destino, cantidadViajes, montoPorViaje, tipoServicio = "OTRO") {
  this.rutas.push({
    origen,
    destino,
    cantidadViajes,
    montoPorViaje,
    tipoServicio
  });
  return this.save();
};

// Método para actualizar una ruta específica
viajesSchema.methods.actualizarRuta = function(rutaCompleta, datosNuevos) {
  const ruta = this.rutas.find(r => r.rutaCompleta === rutaCompleta);
  if (ruta) {
    Object.assign(ruta, datosNuevos);
    return this.save();
  }
  throw new Error('Ruta no encontrada');
};

// Método para eliminar una ruta (desactivarla)
viajesSchema.methods.eliminarRuta = function(rutaCompleta) {
  const ruta = this.rutas.find(r => r.rutaCompleta === rutaCompleta);
  if (ruta) {
    ruta.activa = false;
    return this.save();
  }
  throw new Error('Ruta no encontrada');
};

// Método estático: Generar clienteId automático
viajesSchema.statics.generarClienteId = async function() {
  const ultimoCliente = await this.findOne()
    .sort({ clienteId: -1 })
    .select('clienteId');
  
  if (!ultimoCliente) {
    return "CLI001";
  }
  
  const numero = parseInt(ultimoCliente.clienteId.replace('CLI', '')) + 1;
  return `CLI${String(numero).padStart(3, '0')}`;
};

// Método estático: Obtener reporte completo del mes
viajesSchema.statics.obtenerReporteMensual = async function(mes, año) {
  const clientes = await this.find({
    mes: mes,
    año: año,
    estado: "ACTIVO"
  }).sort({ clienteNombre: 1 });
  
  const granTotal = clientes.reduce((acc, cliente) => ({
    totalViajes: acc.totalViajes + cliente.totalViajes,
    totalMonto: acc.totalMonto + cliente.montoTotalGeneral
  }), { totalViajes: 0, totalMonto: 0 });
  
  return {
    mes,
    año,
    clientes: clientes.map(c => ({
      clienteId: c.clienteId,
      clienteNombre: c.clienteNombre,
      rutas: c.rutas.filter(r => r.activa),
      totalViajes: c.totalViajes,
      montoTotal: c.montoTotalGeneral
    })),
    granTotal
  };
};

// Método estático: Buscar cliente por nombre o ID
viajesSchema.statics.buscarCliente = async function(criterio, mes, año) {
  return await this.findOne({
    $or: [
      { clienteId: criterio.toUpperCase() },
      { clienteNombre: criterio.toUpperCase() }
    ],
    mes: mes,
    año: año
  });
};

export default model("ViajesxCliente", viajesSchema);

/* 
EJEMPLO DE USO:

// 1. Crear cliente DIANA con múltiples rutas
const clienteId = await ViajesxCliente.generarClienteId();

const diana = await ViajesxCliente.create({
  clienteId: clienteId,
  clienteNombre: "DIANA",
  mes: 1,
  año: 2025,
  rutas: [
    {
      origen: "DIANA",
      destino: "SARAM",
      cantidadViajes: 92,
      montoPorViaje: 105.00
    },
    {
      origen: "DIANA",
      destino: "TAPASCO",
      cantidadViajes: 64,
      montoPorViaje: 97.00
    },
    {
      origen: "TAPASCO",
      destino: "SARAM",
      cantidadViajes: 27,
      montoPorViaje: 97.00
    }
  ]
});

// 2. Agregar una nueva ruta a DIANA
await diana.agregarRuta("DIANA", "COMALAPA", 15, 90.00);

// 3. Actualizar una ruta existente
await diana.actualizarRuta("DIANA/SARAM", { cantidadViajes: 95 });

// 4. Obtener reporte del mes
const reporte = await ViajesxCliente.obtenerReporteMensual(1, 2025);

// Resultado de diana:
{
  clienteId: "CLI001",
  clienteNombre: "DIANA",
  rutas: [
    { rutaCompleta: "DIANA/SARAM", cantidadViajes: 92, montoPorViaje: 105, montoTotal: 9660 },
    { rutaCompleta: "DIANA/TAPASCO", cantidadViajes: 64, montoPorViaje: 97, montoTotal: 6208 },
    { rutaCompleta: "TAPASCO/SARAM", cantidadViajes: 27, montoPorViaje: 97, montoTotal: 2619 }
  ],
  totalViajes: 183,
  montoTotalGeneral: 18487
}
*/