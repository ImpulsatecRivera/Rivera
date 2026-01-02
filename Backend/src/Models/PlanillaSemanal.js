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
        enum: ['pendiente', 'aprobada', 'pagada'],
        default: 'pendiente'
    },

    pagada: {
        type: Boolean,
        default: false
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

        //  Guardar el planillaTipo para saber cómo calcular anticipos
        planillaTipo: {
            type: String,
            enum: ['Semanal', 'Quincenal'],
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
                required: true
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
            },
            descuentoFalta: {
                type: Number,
                default: 0
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
        
        totalDescuentos: {
            type: Number,
            default: 0
        },

        totalAPagar: {
            type: Number,
            default: 0
        }
    }],

    // Totales generales de la planilla
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
        totalAPagar: {
            type: Number,
            default: 0
        }
    },

    
    fechaAprobacion: {
        type: Date
    },
    fechaPago: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'PlanillaSemanal'
});

// Índices para búsquedas eficientes
planillaSemanalSchema.index({ fechaInicio: 1, fechaFin: 1 });
planillaSemanalSchema.index({ 'empleados.empleadoId': 1 });
planillaSemanalSchema.index({ estado: 1 });

export default model("PlanillaSemanal", planillaSemanalSchema);