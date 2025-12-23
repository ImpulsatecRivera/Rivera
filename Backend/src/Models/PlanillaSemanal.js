import { Schema, model } from "mongoose";

const planillaSemanalSchema = new Schema({
    // Información del período
    fechaInicio: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                return v.getDay() === 1; // Debe ser lunes
            },
            message: 'La fecha de inicio debe ser un lunes'
        }
    },
    fechaFin: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                return v.getDay() === 6; // Debe ser sábado
            },
            message: 'La fecha de fin debe ser un sábado'
        }
    },
    diasHabiles: {
        type: Number,
        required: true,
        min: 20,
        max: 31
    },

    // Estado de la planilla
    estado: {
        type: String,
        enum: ['pendiente', 'aprobada', 'pagada', 'cerrada'],
        default: 'borrador'
    },

    // Empleados en esta planilla
    empleados: [{
        // Referencia al empleado (puede ser Empleado o Motorista)
        empleadoId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        tipo: {
            type: String,
            enum: ['empleado', 'motorista'],
            required: true
        },

        // Datos del empleado
        nombreCompleto: {
            type: String,
            required: true
        },
        salarioSemanal: {
            type: Number,
            required: true
        },

        // Registro diario (lunes a sábado)
        dias: [{
            dia: {
                type: String,
                enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
                required: true
            },
            fecha: {
                type: Date,
                required: true  // AGREGAR ESTO
            },
            base: {
                type: Number,
                default: 0
            },
            viaticos: {
                type: Number,
                default: 0
            },
            // CAMPO PARA MARCAR FALTA INJUSTIFICADA
            faltaInjustificada: {
                type: Boolean,
                default: false
            }
        }],

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
        // DESCUENTOS (incluye penalización por faltas)
        descuentos: {
            type: Number,
            default: 0
        },

        totalPagar: {
            type: Number,
            default: 0
        }
    }]
}, {
    timestamps: true,
    collection: 'PlanillaSemanal'
});

export default model("PlanillaSemanal", planillaSemanalSchema);