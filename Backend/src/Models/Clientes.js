import {Schema,model} from "mongoose";

const clienteSchema = new Schema({
firtsName:{
    type:String,
    required:true
},
lastName:{
    type:String,
    required:true
},
email:{
type:String,
required:true
},
idNumber:{
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
    type:Number,
    required:true
},
address:{
    type:String,
    required:true
}
},{timestamps:true,
    strict:false,
    collection: "Cliente"})

export default model ("Cliente",clienteSchema);