/**
 * Esquema de Mongoose para la colección de Empleados
 * Define la estructura y validaciones de los documentos de empleados en MongoDB
 */

import { Schema, model } from "mongoose";

/**
 * Definición del esquema para la colección de Empleados
 * Contiene toda la información personal, laboral y de contacto de los empleados del sistema
 */
const empleadoSchema = new Schema(
  {
    // Información personal básica
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    // Información de contacto y acceso
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // ✅ recomendado para evitar duplicados por mayúsculas
    },

    // Información de identificación legal
    dui: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },

    // Información de seguridad
    password: {
      type: String,
      required: true,
    },

    // Información de contacto
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Información multimedia
    img: {
      type: String,
      required: false,
      trim: true,
    },

    salario: {
      type: Number,
      required: true,
      min: 0,
    },

    planillaTipo: {
      type: String,
      enum: {
        values: ["Semanal", "Quincenal"],
        message: "PlanillaTipo inválido",
      },
      required: true,
      trim: true,
    },

    rol: {
      type: String,
      enum: {
        values: ["Operativo", "Supervisor", "Coordinador"], // ✅ CORREGIDO
        message: "Rol inválido",
      },
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: false,
    collection: "Empleados",
  }
);

/**
 * Normalizar valores para evitar errores por mayúsculas/minúsculas
 * (Opcional recomendado)
 */
empleadoSchema.pre("validate", function (next) {
  if (this.rol) {
    const r = String(this.rol).trim().toLowerCase();
    if (r === "supervisor") this.rol = "Supervisor";
    if (r === "operativo") this.rol = "Operativo";
    if (r === "coordinador") this.rol = "Coordinador";
  }

  if (this.planillaTipo) {
    const p = String(this.planillaTipo).trim().toLowerCase();
    if (p === "semanal") this.planillaTipo = "Semanal";
    if (p === "quincenal") this.planillaTipo = "Quincenal";
  }

  next();
});

/**
 * Middleware pre-save: evitar conflicto id vs _id
 */
empleadoSchema.pre("save", function (next) {
  if (this.id && String(this.id) !== String(this._id)) {
    delete this.id;
  }
  next();
});

export default model("Empleados", empleadoSchema);
