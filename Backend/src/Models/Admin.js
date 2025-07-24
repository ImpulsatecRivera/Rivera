import { Schema,model } from "mongoose";

const adminSchema = new Schema({
    name:{
        type:String,
        require:true
    },
    lastName:{
        type:String,
        required:true
    },
    birthDate:{
        type:Date,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    dui:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
},
{timestamps:true,
    strict:false
})

export default model ("Administrador",adminSchema);