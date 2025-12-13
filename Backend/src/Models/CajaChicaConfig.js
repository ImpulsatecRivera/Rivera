import { Schema, model } from "mongoose";

/**
 * =====================================================
 * MODELO: CONFIGURACIÓN DE CAJA CHICA
 * =====================================================
 * Define el máximo permitido para caja chica y controla reintegros
 * Solo debe existir UN documento en esta colección
 * 
 * Concepto de Reintegro:
 * - El reintegro es REPONER lo que se gastó
 * - Si inicio con $250 y quedan $14.69, gasté $235.31
 * - El reintegro sería $235.31 para volver a tener $250
 * 
 * Fórmula: Reintegro = Máximo - Balance Actual
 * 
 * Ejemplo:
 * Máximo: $250.00
 * Balance actual: $14.69
 * Reintegro necesario: $250 - $14.69 = $235.31
 * Balance después del reintegro: $14.69 + $235.31 = $250.00
 * =====================================================
 */

const cajaChicaConfigSchema = new Schema({
    // Monto máximo permitido en caja chica
    maximoPermitido: {
        type: Number,
        required: true,
        min: 0,
        description: 'Monto máximo que debe tener la caja chica'
    },
    
    // Monto mínimo antes de solicitar reintegro (opcional)
    minimoReintegro: {
        type: Number,
        required: false,
        min: 0,
        default: 0,
        description: 'Cuando el balance baje de este monto, se sugiere reintegro'
    },
    
    // Última fecha de actualización
    ultimaActualizacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: "CajaChicaConfig"
});

// Método estático para obtener la configuración (SIN crear automáticamente)
cajaChicaConfigSchema.statics.obtenerConfiguracion = async function() {
    const config = await this.findOne();
    return config; // Puede retornar null si no existe
};

// Método para calcular el reintegro necesario (lo que se gastó desde el último reintegro)
cajaChicaConfigSchema.methods.calcularReintegro = function(balanceActual) {
    // El reintegro es: Máximo - Balance Actual = Lo que se gastó
    const montoGastado = this.maximoPermitido - balanceActual;
    const reintegroNecesario = montoGastado > 0 ? montoGastado : 0;
    
    return {
        maximoPermitido: this.maximoPermitido,
        balanceActual: balanceActual,
        montoGastado: reintegroNecesario,
        reintegroNecesario: reintegroNecesario, // Mismo que montoGastado
        necesitaReintegro: balanceActual < this.minimoReintegro,
        porcentajeDisponible: ((balanceActual / this.maximoPermitido) * 100).toFixed(2),
        balanceDespuesReintegro: balanceActual + reintegroNecesario // Debería volver al máximo
    };
};

export default model("CajaChicaConfig", cajaChicaConfigSchema);