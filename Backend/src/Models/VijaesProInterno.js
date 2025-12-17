import { Schema, model } from "mongoose";

const viajesSchema = new Schema(
  {
    // ID único del viaje
    viajeId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },

    // ======================
    // DATOS DEL CLIENTE
    // ======================
    clienteId: {
      type: Schema.Types.ObjectId,
      ref: "Clientes",
      default: null,
    },

    clienteNombre: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    clienteTelefono: { type: String, default: "" },

    // ======================
    // ORIGEN / DESTINO
    // ======================
    origen: {
      ubicacionId: { type: Schema.Types.ObjectId, ref: "Ubicaciones", default: null },
      texto: { type: String, required: true, trim: true, uppercase: true },
      esRecurrente: { type: Boolean, default: false },
    },

    destino: {
      ubicacionId: { type: Schema.Types.ObjectId, ref: "Ubicaciones", default: null },
      texto: { type: String, required: true, trim: true, uppercase: true },
      esRecurrente: { type: Boolean, default: false },
    },

    rutaCompleta: { type: String, uppercase: true, default: "" },

    // ======================
    // DATOS DEL VIAJE
    // ======================
    monto: { type: Number, required: true, min: 0 },

    fecha: { type: Date, required: true, default: Date.now },

    hora: { type: String, default: "" },

    tipoServicio: {
      type: String,
      enum: ["REGULAR", "ESCOLAR", "ESPECIAL", "EMERGENCIA", "OTRO"],
      default: "REGULAR",
    },

    duracion: { type: Number, default: null },
    distancia: { type: Number, default: null },

    // ✅ Permitimos ambas variantes por compatibilidad ("EN_RUTA" vs "EN RUTA")
    estado: {
      type: String,
      enum: ["PENDIENTE", "EN_RUTA", "EN RUTA", "COMPLETADO", "CANCELADO", "EXTRA"],
      default: "PENDIENTE",
    },

    metodoPago: {
      type: String,
      enum: ["EFECTIVO", "TRANSFERENCIA", "TARJETA", "CREDITO"],
      default: "EFECTIVO",
    },

    pagado: { type: Boolean, default: false },
    fechaPago: { type: Date, default: null },

    // ======================
    // ADICIONAL
    // ======================
    pasajeros: { type: Number, default: 1, min: 1 },

    notas: { type: String, default: "" },
    referencias: { type: String, default: "" },

    conductor: {
      nombre: { type: String, default: "" },
      vehiculo: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// ==============================
// Statics / Methods (para controllers)
// ==============================
viajesSchema.statics.generarViajeId = async function () {
  // VIA00001, VIA00002...
  const last = await this.findOne({ viajeId: { $regex: /^VIA\d+$/ } })
    .sort({ viajeId: -1 })
    .select("viajeId")
    .lean();

  const lastNum = last?.viajeId ? parseInt(String(last.viajeId).replace("VIA", ""), 10) : 0;
  const nextNum = Number.isFinite(lastNum) ? lastNum + 1 : 1;

  return `VIA${String(nextNum).padStart(5, "0")}`;
};

viajesSchema.statics.obtenerPorCliente = function (clienteId, inicio = null, fin = null) {
  const q = { clienteId };
  if (inicio || fin) {
    q.fecha = {};
    if (inicio) q.fecha.$gte = inicio;
    if (fin) q.fecha.$lte = fin;
  }
  return this.find(q).sort({ fecha: -1 });
};

viajesSchema.statics.obtenerPorFecha = function (inicio, fin) {
  return this.find({ fecha: { $gte: inicio, $lte: fin } }).sort({ fecha: -1 });
};

viajesSchema.statics.obtenerPendientesPago = function () {
  return this.find({ pagado: false, estado: { $ne: "CANCELADO" } }).sort({ fecha: -1 });
};

viajesSchema.statics.obtenerReportePeriodo = function (inicio, fin) {
  return this.aggregate([
    { $match: { fecha: { $gte: inicio, $lte: fin } } },
    {
      $group: {
        _id: "$clienteNombre",
        cantidadViajes: { $sum: 1 },
        totalMonto: { $sum: "$monto" },
      },
    },
    { $sort: { totalMonto: -1 } },
  ]);
};

viajesSchema.methods.marcarComoPagado = async function () {
  this.pagado = true;
  this.fechaPago = new Date();
  return this.save();
};

viajesSchema.methods.cancelar = async function (motivo = "") {
  this.estado = "CANCELADO";
  if (motivo) this.notas = `${this.notas ? this.notas + " | " : ""}${motivo}`;
  return this.save();
};

export default model("ViajesProInterno", viajesSchema);
