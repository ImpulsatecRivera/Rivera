import { Schema, model } from "mongoose";

const detalleMantenimientoSchema = new Schema({
    concepto: {
        type: String,
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        default: 1
    },
    precioUnitario: {
        type: Number,
        required: true,
        min: 0
    },
    subTotal: {
        type: Number,
        required: true,
        min: 0
    },
    proveedor: {
        type: Schema.Types.ObjectId,
        ref: 'Proveedores', // ← Ajusta según el nombre de tu modelo
        required: false
    }
});

const manteniminetoSChema = new Schema({
    ciculatioCard: {
        type: Schema.Types.ObjectId,
        ref: 'Camiones',
        required: true
    },
    estado: {
        type: String,
        required: true,
        enum: ['pendiente', 'en_proceso', 'completado', 'cancelado'],
        default: 'pendiente'
    },
    fecha_mantenimiento: {
        type: Date,
        required: true,
        default: Date.now
    },
    // Fecha y hora en la que se completó el mantenimiento
    fecha_finalizacion: {
        type: Date,
        required: false,
        default: null
    },
    mes: {
        type: Number,
        required: true
    },
    ano: {
        type: Number,
        required: true
    },
    tipo_de_mantenimiento: {
        type: String,
        enum: [
            'preventivo',
            'correctivo',
            'llantas',
            'rines',
            'furgo',
            'madera_furgo',
            'torno',
            'bomba',
            'reparacion_turbo',
            'otros'
        ],
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    // ← NUEVO: Array de proveedores
    proveedores: [{
        type: Schema.Types.ObjectId,
        ref: 'Proveedores',
        required: false
    }],
    detalles: [detalleMantenimientoSchema], // ← Ahora usa el sub-schema
    // ← NUEVO: Costo total calculado
    costoTotal: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    }
}, {
    timestamps: true // ← Agrega createdAt y updatedAt automáticamente
});

export default model("MantenimientoCamiones", manteniminetoSChema);