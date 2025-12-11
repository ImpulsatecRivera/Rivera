import { Schema, model } from "mongoose";

const manteniminetoSChema = new Schema({
    ciculatioCard:{
        type: Schema.Types.ObjectId,
        ref: 'Camiones',
        required: true
    },
    estado:{
        type: String,
        required: true,
        default: 'pendiente'  // ← NUEVA LÍNEA
    },
    fecha_mantenimiento:{
        type: Date,
        required: true,
        default: Date.now
    },
    mes:{
        type: Number,
        required: true
    },
    ano:{
        type: Number,
        required: true
    },
    tipo_de_mantenimiento:{
        type: String,
        enum:[
             'preventivo', 
             'correctivo', 
             'llantas',
             'rines',
             'furgo',
             'madera_furgo',
             'torno',
             'bomba',
             'reparacion_turbo',
             'otros'
        ],
        required: true
    },
    descripcion:{
        type: String,
        required: true
    },
    detalles:[{
        concepto:{
            type: String,
            required: true
        },
        cantidad:{
            type: Number,
            required: true,
            default: 1
        },
        precioUnitario:{
            type: Number,
            required: true,
            min: 0
        },
        subTotal:{
            type: Number,
            required: true,
            min: 0
        }
    }]
});

export default model("MantenimientoCamiones", manteniminetoSChema);