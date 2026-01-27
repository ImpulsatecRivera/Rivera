import mongoose from "mongoose";

const ResumenDieselSchema = new mongoose.Schema({
  CicurlationCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Camiones",
    required: [true, "El camión es obligatorio"],
  },
  Galones: {
    type: Number,
    required: [true, "Los galones son obligatorios"],
    min: [0, "Los galones no pueden ser negativos"],
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
  fechaHora: {
    type: Date,
    default: Date.now,
  },
  mes: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  ano: {
    type: Number,
    required: true,
  },
  Total: {
    type: Number,
    required: [true, "El total es obligatorio"],
    min: [0, "El total no puede ser negativo"],
  },
  estado: {
    type: String,
    enum: ["Pendiente", "Completado"],
    default: "Pendiente",
  },
  comprobante: {
    type: String,
    default: null,
  },
  // ✅ NUEVO CAMPO: Número de marchamo
  numeroMarchamo: {
    type: String,
    trim: true,
    default: null,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Índices para mejorar búsquedas
ResumenDieselSchema.index({ CicurlationCard: 1, fecha: -1 });
ResumenDieselSchema.index({ mes: 1, ano: 1 });
ResumenDieselSchema.index({ estado: 1 });
ResumenDieselSchema.index({ numeroMarchamo: 1 }); // ✅ Nuevo índice

const ResumenDiesel = mongoose.model("ResumenDiesel", ResumenDieselSchema);

export default ResumenDiesel;