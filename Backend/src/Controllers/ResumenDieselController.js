import DieselModel from "../Models/ResumenDiesel.js"
import CamionesModel from "../Models/Camiones.js"


const ResumenCon = {};


//Metodo para obtener el resumen de la disel
ResumenCon.getResumen = async (req, res) => {
    try {
        const resumen = await DieselModel.find()
            .populate({
                path: "CicurlationCard",
                select: "licensePlate name gasolineLevel"
            })

        if (!resumen || resumen.length == 0) {
            return res.status(200).json({
                message: "No se encontró ningún resumen de diesel",
                data: []
            })
        }
        const resumenesFormateados = resumen.map(m => ({
            _id: m._id,
            fecha: m.fecha,
            Galones: m.Galones,
            Total: m.Total,
            CicurlationCard: m.CicurlationCard,
            mes: m.mes,
            ano: m.ano
        }))
        return res.status(200).json({
            message: "Lista de resumen de diesel de camiones",
            count: resumenesFormateados.length,
            data: resumenesFormateados
        });
    } catch (error) {
        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
}

ResumenCon.AgregarDiesel = async (req, res) => {
    try {
        const {
            fecha,
            Galones,
            Total,
            CicurlationCard
        } = req.body;

        const CamionExisting = await CamionesModel.findById(CicurlationCard);
        if (!CamionExisting) {
            return res.status(404).json({
                success: false,
                message: 'Camión no encontrado'
            });
        }

        const Fecha_Diesel = fecha ? new Date(fecha) : new Date();
        const mes = Fecha_Diesel.getMonth() + 1;
        const ano = Fecha_Diesel.getFullYear();

        const nuevoResumen = new DieselModel({
            CicurlationCard,
            Galones,
            fecha: Fecha_Diesel,
            mes,
            ano,
            Total
        });

        await nuevoResumen.save();

await nuevoResumen.populate('CicurlationCard', 'name gasolineLevel licensePlate');

        res.status(201).json({
            success: true,
            message: 'Resumen registrado exitosamente',
            data: nuevoResumen
        });

    } catch (error) {
        console.error('Error al registrar el resumen del diesel:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al registrar el resumen de diesel',
            error: error.message
        });
    }
}

import { isValidObjectId } from "mongoose";

ResumenCon.PutDiesel = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar ID
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID no identificado",
                error: "El ID proporcionado no tiene un formato válido"
            });
        }

        // Buscar el resumen existente
        const DieselExisting = await DieselModel.findById(id);
        if (!DieselExisting) {
            return res.status(404).json({
                success: false,
                message: "Resumen de diesel no encontrado",
                error: `No existe un resumen registrado con el ID: ${id}`
            });
        }

        const { fecha, Galones, Total } = req.body;

        // Actualizar fecha (si viene en el body)
        if (fecha) {
            const nuevaFecha = new Date(fecha);
            if (isNaN(nuevaFecha)) {
                return res.status(400).json({
                    success: false,
                    message: "Fecha inválida",
                    error: "El formato de fecha no es válido"
                });
            }
            DieselExisting.fecha = nuevaFecha;
            DieselExisting.mes = nuevaFecha.getMonth() + 1;
            DieselExisting.ano = nuevaFecha.getFullYear();
        }

        // Actualizar Galones
        if (Galones !== undefined) {
            DieselExisting.Galones = Galones;
        }

        // Actualizar Total
        if (Total !== undefined) {
            DieselExisting.Total = Total;
        }

        // Guardar cambios
        await DieselExisting.save();
        await DieselExisting.populate("CicurlationCard", "name gasolineLevel licensePlate");

        return res.status(200).json({
            success: true,
            message: "Resumen de diesel actualizado exitosamente",
            data: DieselExisting
        });

    } catch (error) {
        console.error("Error al actualizar el resumen de diesel:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error al actualizar el resumen de diesel",
            error: error.message
        });
    }
};


ResumenCon.DeleteResumen = async(req,res) =>{
    try {
        const { id } = req.params;

    if(!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Id  no identificado",
                    error: "El id proporcionado no tiene un formato válido"
                });
            }
         const ResumenEliminado = await DieselModel.findByIdAndDelete(id);
            
          if(!ResumenEliminado) {
            return res.status(404).json({
                success: false,
                message: "Resumen de diesel no encontrado",
                error: `No existe un resrumen registrado con el ID: ${id}`
            });
        }

         res.status(200).json({
            success: true,
            message: 'Resumen de diesel eliminado exitosamente',
            data: {
                id: ResumenEliminado._id,
                Galones_Ingresados: ResumenEliminado.Galones,
                fecha_diesel: ResumenEliminado.fecha,
                costoTotal: ResumenEliminado.Total
            }
        });
    } catch (error) {
        console.error('Error al eliminar resumen de diesel:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el resumen',
            error: error.message
        });
    }
    
}

export default ResumenCon;