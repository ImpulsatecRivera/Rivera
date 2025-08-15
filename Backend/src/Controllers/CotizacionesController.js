import CotizacionesModel from "../Models/CotizacionesModel.js";

const cotizacionesController = {}

cotizacionesController.getAllCotizaciones = async(req,res) => {
    try {
        const cotizaciones = await CotizacionesModel.find();
        res.status(200).json(cotizaciones);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener empleados", error: error.message });
    }
}


export default cotizacionesController;