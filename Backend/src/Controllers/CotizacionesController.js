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

cotizacionesController.getCotizacionById = async(req, res) => {
    try {
        const { id } = req.params;
        const cotizacion = await CotizacionesModel.findById(id);
        
        if (!cotizacion) {
            return res.status(404).json({ message: "Cotización no encontrada" });
        }
        
        res.status(200).json(cotizacion);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la cotización", error: error.message });
    }
}


cotizacionesController.deleteCotizacion = async(req, res) => {
    try {
        const { id } = req.params;
        const cotizacion = await CotizacionesModel.findByIdAndDelete(id);
        
        if (!cotizacion) {
            return res.status(404).json({ message: "Cotización no encontrada" });
        }
        
        res.status(200).json({ message: "Cotización eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la cotización", error: error.message });
    }
}

export default cotizacionesController;