import mongoose from "mongoose";

const { Schema } = mongoose;

const OrigenDestinoSchema = new Schema(
  {
    texto: { type: String, required: true, trim: true, uppercase: true },
    esRecurrente: { type: Boolean, default: false },
    ubicacionId: { type: Schema.Types.ObjectId, ref: "Ubicaciones", default: null },
  },
  { _id: false }
);

const ConductorSchema = new Schema(
  {
    nombre: { type: String, default: "", trim: true },
    vehiculo: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const ViajeInternoSchema = new Schema(
  {
    viajeId: { type: String, unique: true, index: true, trim: true },

    clienteId: { type: Schema.Types.ObjectId, ref: "Clientes", default: null },
    clienteNombre: { type: String, required: true, trim: true, uppercase: true },
    clienteTelefono: { type: String, default: "", trim: true },

    origen: { type: OrigenDestinoSchema, required: true },
    destino: { type: OrigenDestinoSchema, required: true },

    rutaCompleta: { type: String, uppercase: true, default: "" },

    monto: { type: Number, required: true, min: 0 },
    fecha: { type: Date, default: Date.now },
    hora: { type: String, default: "", trim: true },

    tipoServicio: {
      type: String,
      enum: ["REGULAR", "ESCOLAR", "ESPECIAL", "EMERGENCIA", "OTRO", ""],
      default: "REGULAR",
    },

    duracion: { type: Number, default: null },
    distancia: { type: Number, default: null },

    // ✅ compatibilidad: EN_RUTA y EN RUTA + EXTRA
    estado: {
      type: String,
      enum: ["PENDIENTE", "EN_RUTA", "EN RUTA", "COMPLETADO", "CANCELADO", "EXTRA"],
      default: "PENDIENTE",
      index: true,
    },

    metodoPago: {
      type: String,
      enum: ["EFECTIVO", "TRANSFERENCIA", "TARJETA", "CREDITO", ""],
      default: "EFECTIVO",
    },

    pagado: { type: Boolean, default: false, index: true },
    fechaPago: { type: Date, default: null },

    pasajeros: { type: Number, default: 1, min: 1 },

    notas: { type: String, default: "" },
    referencias: { type: String, default: "" },

    conductor: { type: ConductorSchema, default: () => ({}) },

    motivoCancelacion: { type: String, default: "" },
  },
  {
    timestamps: true,
    // ✅ CLAVE: usar la colección real donde están los datos
    collection: "viajesinternos",
  }
);

// ==============================
// Static methods (los usa el controller)
// ==============================
ViajeInternoSchema.statics.generarViajeId = async function () {
  const last = await this.findOne({}, { viajeId: 1 }).sort({ createdAt: -1 }).lean();

  const lastNum = last?.viajeId?.match(/\d+$/)?.[0];
  const next = (parseInt(lastNum || "0", 10) + 1).toString().padStart(6, "0");
  return `VI-${next}`;
};

ViajeInternoSchema.statics.obtenerPorCliente = function (clienteId, inicio = null, fin = null) {
  const filtros = { clienteId };
  if (inicio || fin) {
    filtros.fecha = {};
    if (inicio) filtros.fecha.$gte = inicio;
    if (fin) filtros.fecha.$lte = fin;
  }
  return this.find(filtros).sort({ fecha: -1 });
};

ViajeInternoSchema.statics.obtenerPorFecha = function (inicio, fin) {
  return this.find({ fecha: { $gte: inicio, $lte: fin } }).sort({ fecha: -1 });
};

ViajeInternoSchema.statics.obtenerReportePeriodo = async function (inicio, fin) {
  const data = await this.aggregate([
    { $match: { fecha: { $gte: inicio, $lte: fin } } },
    {
      $group: {
        _id: null,
        totalViajes: { $sum: 1 },
        totalMonto: { $sum: "$monto" },
      },
    },
  ]);
  return data[0] || { totalViajes: 0, totalMonto: 0 };
};

ViajeInternoSchema.statics.obtenerPendientesPago = function () {
  return this.find({ pagado: false, estado: { $ne: "CANCELADO" } }).sort({ fecha: -1 });
};

// ==============================
// Instance methods
// ==============================
ViajeInternoSchema.methods.marcarComoPagado = async function () {
  this.pagado = true;
  this.fechaPago = new Date();
  return this.save();
};

ViajeInternoSchema.methods.cancelar = async function (motivo = "") {
  this.estado = "CANCELADO";
  this.motivoCancelacion = motivo;
  return this.save();
};

// ✅ Export con colección forzada también aquí
const ModelName = "ViajeInterno";
const Viajes =
  mongoose.models[ModelName] ||
  mongoose.model(ModelName, ViajeInternoSchema, "viajesinternos");

export default Viajes;
