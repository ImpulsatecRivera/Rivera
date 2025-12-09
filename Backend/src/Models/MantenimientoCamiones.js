


import { Schema,model } from "mongoose";

const manteniminetoSChema = new Schema({
    ciculatioCard:{
        type: Schema.Types.ObjectId,
        ref: 'Camiones',
        required: true
    },
    fecha_mantenimiento:{
        type:Date,
        required:true,
        default: Date.now
    },
    mes:{
        type:Number,
        required:true
    },
    ano:{
        type:Number,
        required:true
    },
    tipo_de_mantenimiento:{
        type:String,
        enum:[
             'preventivo', 
             'correctivo', 
             'llantas',           // Para "2 LLANTAS"
             'rines',             // Para "2 RINES"
             'furgo',             // Para "FURGON"
             'madera_furgo',      // Para "MADERA DE FURGON"
             'torno',             // Para "TORNO"
             'bomba',             // Para "BOMBA"
             'reparacion_turbo',  // Para "REPARACION DEL TURBO"
             'otros'
        ],
        required:true
    },
    descripcion:{
        type:String,
        required:true
    },
    detalles:[{
        concepto:{
            type:String,
            required:true

        },
        cantidad:{
            type:Number,
            required:true,
            default:1
        },
        precioUnitario:{
            type:Number,
            required:true,
            min:0
        },
        subTotal:{
            type:Number,
            required:true,
            min:0
        }
    }]
})

export default model ("MantenimientoCamiones" , manteniminetoSChema);