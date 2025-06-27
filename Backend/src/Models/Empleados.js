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
        unique: true
    },
    dui: {
        type: String,
        required: true,
        unique: true
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

// IMPORTANTE: Eliminar datos anteriores si hay conflictos
empleadoSchema.pre('save', function() {
    // Eliminar el campo 'id' si existe para evitar conflictos
    if (this.id && this.id !== this._id) {
        delete this.id;
    }
});

export default model("Empleados", empleadoSchema);