// Esquema de nuestra colección en la base de datos

import { Schema, model } from "mongoose";

const camioneSchema = new Schema({
  name: {
    type: String,
    required: true 
  },
  brand: {
    type: String,
    required: true 
  },
  model: {
    type: String,
    required: true 
  },
  State: {
    type: String,
    required: true 
  },
  gasolineLevel: {
    type: Number,
    required: true 
  },
  age: {
    type: Number,
    required: true 
  },
  ciculatioCard: {
    type: String,
    required: true 
  },
  licensePlate: {
    type: String,
    required: true 
  },
  description: {
    type: String,
    required: true 
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    required: true 
  },
  driverId: {
    type: Schema.Types.ObjectId,
    required: true 
  },
  img: {
    type: String, 
    required: true 
  }
}, {
  strict: false,
  timestamps: true,
  collection: "Camiones" // fuerza el uso exacto del nombre sino se jode
});

export default model("Camiones", camioneSchema);
