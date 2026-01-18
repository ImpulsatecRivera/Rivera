// Backend/src/Models/Ventas.js

import { Schema, model } from "mongoose";

/**
 * Esquema para registrar ventas con CCF y Facturas de Consumidor Final
 */
const ventaSchema = new Schema({
    // Tipo de documento tributario
    tipoDocumento: {
        type: String,
        enum: ['CCF', 'CONSUMIDOR_FINAL'],
        required: true
    },

    // Número de documento (correlativo)
    numeroDocumento: {
        type: String,
        required: true
    },

    // Referencia al cliente
    clienteId: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true
    },

    // Fecha de emisión de la factura
    fechaEmision: {
        type: Date,
        required: true,
        default: Date.now
    },

    // Montos
    monto: {
        type: Number,
        required: true
    },

    // Método de pago
    metodoPago: {
        type: String,
        enum: ['efectivo', 'transferencia', 'cheque', 'credito', 'otros'],
        default: 'efectivo',
        required: true
    },

    iva: {
        type: Number,
        required: true
    },

    total: {
        type: Number,
        required: true
    },

    // Descripción de la venta
    descripcion: {
        type: String,
        required: false
    },

    // Estado de la venta
    estado: {
        type: String,
        enum: ['pendiente', 'pagada', 'anulada'],
        default: 'pendiente',
        required: true
    },

    // Voucher/comprobante
    voucher: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    strict: false,
    collection: "Ventas"
});

export default model("Ventas", ventaSchema);