import { Schema, model } from "mongoose";

const empleadoSchema = new Schema({
    name: {
        type: String,
        required: true 
    },
    lastName: {
        type: String,
        required: true 
    },
    email: {
        type: String,
        required: true,
        unique: true // Asegurar que el email sea único
    },
    dui: { // Cambiar de 'id' a 'dui' para evitar conflictos
        type: String,
        required: true,
        unique: true // Asegurar que el DUI sea único
    },
    birthDate: {
        type: Date,
        required: true 
    },
    password: {
        type: String,
        required: true 
    },
    phone: {
        type: String,
        required: true 
    },
    address: {
        type: String,
        required: true 
    }
}, {
    timestamps: true,
    strict: false,
    collection: "Empleados"
});

export default model("Empleados", empleadoSchema);