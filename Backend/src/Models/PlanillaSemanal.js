/**
 * Esquema de Mongoose para Planilla Semanal
 * Registra los pagos diarios (base + viáticos) para empleados y motoristas
 */

import { Schema, model } from "mongoose";

/**
 * Sub-esquema para registro diario de cada empleado
 */
const registroDiarioSchema = new Schema({
    fecha: {
        type: Date,
        required: true
    },
    base: {
        type: Number,
        default: 0
    },
    viaticos: {
        type: Number,
        default: 0
    }
}, { _id: false });

/**
 * Sub-esquema para cada empleado/motorista en la planilla
 */
const empleadoPlanillaSchema = new Schema({
    // Referencia al empleado o motorista
    empleadoId: {
        type: Schema.Types.ObjectId,
        refPath: 'empleados.tipoEmpleado', // Puede ser 'Empleado' o 'Motorista'
        required: true
    },
    tipoEmpleado: {
        type: String,
        enum: ['Empleado', 'Motorista'],
        required: true
    },
    // Nombre completo (desnormalizado para reportes)
    nombreCompleto: {
        type: String,
        required: true
    },
    // Registros diarios de la semana
    registrosDiarios: [registroDiarioSchema],
    // Totales calculados
    totalBase: {
        type: Number,
        default: 0
    },
    totalViaticos: {
        type: Number,
        default: 0
    },
    anticipos: {
        type: Number,
        default: 0
    },
    descuentos: {
        type: Number,
        default: 0
    },
    totalAPagar: {
        type: Number,
        default: 0
    }
}, { _id: false });

/**
 * Esquema principal de Planilla Semanal
 */
const planillaSemanalSchema = new Schema({
    // Identificación de la semana
    numeroSemana: {
        type: Number,
        required: true
    },
    año: {
        type: Number,
        required: true
    },
    mes: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    // Rango de fechas de la semana
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    // Descripción (ej: "Del 17 al 22 de noviembre 2025")
    descripcion: {
        type: String
    },
    // Lista de empleados en esta planilla
    empleados: [empleadoPlanillaSchema],
    // Totales generales
    totales: {
        totalBase: {
            type: Number,
            default: 0
        },
        totalViaticos: {
            type: Number,
            default: 0
        },
        totalAnticipos: {
            type: Number,
            default: 0
        },
        totalDescuentos: {
            type: Number,
            default: 0
        },
        totalGeneral: {
            type: Number,
            default: 0
        }
    },
    // Estado de la planilla
    estado: {
        type: String,
        enum: ['borrador', 'pendiente', 'pagada', 'cerrada'],
        default: 'borrador'
    },
    fechaAprobacion: {
        type: Date
    }
}, {
    timestamps: true,
    collection: "PlanillaSemanal"
});

// Índices para búsquedas eficientes
planillaSemanalSchema.index({ año: 1, mes: 1, numeroSemana: 1 });
planillaSemanalSchema.index({ fechaInicio: 1, fechaFin: 1 });
planillaSemanalSchema.index({ 'empleados.empleadoId': 1 });

export default model("PlanillaSemanal", planillaSemanalSchema);