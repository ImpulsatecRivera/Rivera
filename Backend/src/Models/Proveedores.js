import { Schema,model } from "mongoose";

const proveedoreSchema = new Schema({
    companyName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    partDescription:{
        type:String,
        required:true
    }
},{
    timestamps:true,
    strict:false,
    collection: "Proveedores"
});

export default model ("Proveedores",proveedoreSchema);