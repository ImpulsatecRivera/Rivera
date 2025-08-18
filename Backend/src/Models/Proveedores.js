/**
 * Esquema de Mongoose para la colección de Proveedores
 * Define la estructura y validaciones de los documentos de proveedores/suppliers en MongoDB
 */

import { Schema, model } from "mongoose";

/**
 * Definición del esquema para la colección de Proveedores
 * Contiene la información esencial de las empresas proveedoras que suministran
 * partes, servicios o mantenimiento para la flota de camiones
 */
const proveedoreSchema = new Schema({
    // Información básica de la empresa proveedora
    companyName: {
        type: String,      // Nombre oficial de la empresa proveedora
        required: true     // Campo obligatorio para identificar la empresa
    },
    
    // Información de contacto empresarial
    email: {
        type: String,      // Correo electrónico corporativo del proveedor
        required: true     // Campo obligatorio para comunicación formal y cotizaciones
    },
    phone: {
        type: String,      // Número de teléfono principal de la empresa
        required: true     // Campo obligatorio para comunicación directa y emergencias
    },
    
    // Información de servicios y productos
    partDescription: {
        type: String,      // Descripción detallada de las partes, servicios o productos que ofrece
        required: true     // Campo obligatorio para identificar qué suministra cada proveedor
    }
}, {
    // Opciones del esquema
    timestamps: true,         // Agrega automáticamente campos createdAt y updatedAt
    strict: false,           // Permite campos adicionales no definidos en el esquema
    collection: "Proveedores" // Fuerza el nombre exacto de la colección en MongoDB
});

/**
 * Exportar el modelo basado en el esquema
 * Este modelo se usará para realizar operaciones CRUD en la colección Proveedores
 * Los proveedores pueden ser referenciados desde otros modelos como Camiones
 * para establecer relaciones de mantenimiento y suministro
 */
export default model("Proveedores", proveedoreSchema);