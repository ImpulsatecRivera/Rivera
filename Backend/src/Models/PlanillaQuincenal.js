/**
 * Esquema de Mongoose para Planilla Quincenal
 * Registra salarios quincenales con descuentos de ley y otros descuentos
 */

import { Schema, model } from "mongoose";

/**
 * Sub-esquema para descuentos de ley
 */
const descuentosLeySchema = new Schema({
    isss: {
        porcentaje: {
            type: Number,
            default: 3 // 3%
        },
        monto: {
            type: Number,
            default: 0
        }
    },
    afp: {
        porcentaje: {
            type: Number,
            default: 7.25 // 7.25%
        },
        monto: {
            type: Number,
            default: 0
        }
    },
    renta: {
        monto: {
            type: Number,
            default: 0
        },
        tramo: {
            type: Number,
            default: 1, // Tramo I, II, III o IV
            min: 1,
            max: 4
        },
        porcentaje: {
            type: Number,
            default: 0 // 0%, 10%, 20% o 30% según el tramo
        }
    }
}, { _id: false });

/**
 * Sub-esquema para otros descuentos
 */
const otrosDescuentosSchema = new Schema({
    anticipos: {
        type: Number,
        default: 0
    },
    prestamos: {
        type: Number,
        default: 0
    },
    otros: {
        type: Number,
        default: 0
    }
}, { _id: false });

/**
 * Sub-esquema para cada empleado/motorista en la planilla quincenal
 */
const empleadoPlanillaQuincenalSchema = new Schema({
    // Referencia al empleado o motorista
    empleadoId: {
        type: Schema.Types.ObjectId,
        refPath: 'empleados.tipoEmpleado',
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
    // Salarios y viáticos
    salarioQuincenal: {
        type: Number,
        required: true,
        default: 0
    },
    viaticos: {
        type: Number,
        default: 0
    },
    trabajoSabadoDomingo: {
        type: Number,
        default: 0
    },
    totalSalarioMasViaticos: {
        type: Number,
        default: 0
    },
    // Descuentos
    descuentosLey: descuentosLeySchema,
    otrosDescuentos: otrosDescuentosSchema,
    totalDescuentos: {
        type: Number,
        default: 0
    },
    // Total a pagar
    totalAPagar: {
        type: Number,
        default: 0
    }
}, { _id: false });

/**
 * Esquema principal de Planilla Quincenal
 */
const planillaQuincenalSchema = new Schema({
    // Identificación de la quincena
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
    quincena: {
        type: Number,
        required: true,
        enum: [1, 2], // Primera o segunda quincena
        validate: {
            validator: function (v) {
                return v === 1 || v === 2;
            },
            message: 'La quincena debe ser 1 (primera) o 2 (segunda)'
        }
    },
    // Rango de fechas
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    // Descripción (ej: "Primera quincena de diciembre 2025")
    descripcion: {
        type: String
    },
    // Lista de empleados en esta planilla
    empleados: [empleadoPlanillaQuincenalSchema],
    // Totales generales de la planilla
    totales: {
        totalSalariosQuincenales: {
            type: Number,
            default: 0
        },
        totalViaticos: {
            type: Number,
            default: 0
        },
        totalTrabajoExtra: {
            type: Number,
            default: 0
        },
        totalSalarioMasViaticos: {
            type: Number,
            default: 0
        },
        // Totales de descuentos de ley
        totalISSS: {
            type: Number,
            default: 0
        },
        totalAFP: {
            type: Number,
            default: 0
        },
        totalRenta: {
            type: Number,
            default: 0
        },
        // Totales de otros descuentos
        totalAnticipos: {
            type: Number,
            default: 0
        },
        totalPrestamos: {
            type: Number,
            default: 0
        },
        totalOtrosDescuentos: {
            type: Number,
            default: 0
        },
        // Total general
        totalDescuentos: {
            type: Number,
            default: 0
        },
        totalAPagar: {
            type: Number,
            default: 0
        }
    },
    // Estado de la planilla
    estado: {
        type: String, 
        enum: ['pendiente', 'aprobada', 'pagada', 'cerrada'],
        default: 'pendiente'
    },
    // Metadatos
    creadoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Empleado'
    },
    aprobadoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Empleado'
    },
    fechaAprobacion: {
        type: Date
    },
    fechaPago: {
        type: Date
    },
    fechaCierre: {
        type: Date
    },

    notas: {
        type: String
    }
}, {
    timestamps: true,
    collection: "PlanillaQuincenal"
});

// Índices para búsquedas eficientes
planillaQuincenalSchema.index({ año: 1, mes: 1, quincena: 1 });
planillaQuincenalSchema.index({ fechaInicio: 1, fechaFin: 1 });
planillaQuincenalSchema.index({ 'empleados.empleadoId': 1 });

export default model("PlanillaQuincenal", planillaQuincenalSchema);