import { Schema, model } from "mongoose";

const DieselSchema = new Schema({
    fecha: {
        type: Date,            
        required: true,
        default: Date.now
    },
    Galones: {
        type: Number,         
        required: true
    },
    Total: {
        type: Number,
        required: true
    },
    CicurlationCard: {
    type: Schema.Types.ObjectId,
    ref: "Camiones",
    required: true
},
    mes: {
        type: Number,          
        required: true
    },
    ano: {
        type: Number,          
        required: true
    }
});

export default model("ResumenDiesel", DieselSchema);
