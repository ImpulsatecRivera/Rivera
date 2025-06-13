import { Schema,model } from "mongoose";

const motoristaSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    id:{
        type:String,
        required:true
    },
    birthDate:{
        type:Date,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    circulationCard:{
        type:String,
        required:true
    }
}, {
    timestamps:true,
    strict:false
});

export default model ("Motorista",motoristaSchema);