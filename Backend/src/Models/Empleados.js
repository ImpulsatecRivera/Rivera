import { Schema,model } from "mongoose";

const empleadoSchema = new Schema({
    name:{
        type:String,
        required: true 
    },
    lastName:{
        type:String,
        required: true 
    },
    email:{
        type:String,
        required: true 
    },
    id:{
        type:String,
        required: true 
    },
    birthDate:{
        type:Date,
       required: true 
    },
    password:{
        type:String,
       required: true 
    },
    phone:{
        type:String,
        required: true 
    },
    address:{
        type:String,
        required: true 
    }
},{
    timestamps:true,
    strict:false,
    collection: "Empleados"
});

export default model ("Empleados",empleadoSchema);