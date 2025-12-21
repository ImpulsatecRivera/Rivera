import { Schema, model } from "mongoose";

const cajaChicaSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    employeeId: {
        type: Schema.Types.Mixed,
        ref: "Empleados",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true,
        maxlength: 200,
        trim: true

    },
    type: {
        type: String,
        enum: ["income", "expense"]
    },
    voucher: {
        type: String,
        required: false,
        
    },
     ticket: {
        type:String
     },
        vale: {
            type:String
        }
    ,
    previousBalance: {
        type: Number,
        required: true
    },
    currentBalance: {
        type: Number,
        required: true,

    }
}, {
    timestamps: true,
    strict: false
});

export default model("CajaChica", cajaChicaSchema);