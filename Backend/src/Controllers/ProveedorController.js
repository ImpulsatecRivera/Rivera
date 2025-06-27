import proveedorModel from "../Models/Proveedores.js";

const proveedorsCon= {};

proveedorsCon.get = async (req, res) => {
    try {
         const newProveedor = await proveedorModel.find();
    res.status(200).json(newProveedor);
    } catch (error) {
         res.status(500).json({ message: "Error al obtener proveedor", error: error.message });
    }
}

proveedorsCon.post= async (req,res) => {
    try {
        const {companyName,email,phone,partDescription}=req.body;
    const newProveedor= new proveedorModel({companyName,email,phone,partDescription})
    await newProveedor.save();
    res.status(200).json({Message: "Proveedor registrados correctamente"})
    } catch (error) {
        res.status(500).json({ message: "Error al agregar proveedor", error: error.message });
    }
};

proveedorsCon.put = async(req,res)=>{
    try {
           const {companyName,email,phone,partDescription}=req.body;
    await proveedorModel.findByIdAndUpdate(req.params.id,{
        companyName,email,phone,partDescription
    },{new:true})
    res.status(200).json({Message:"Proveedor actualizado correctamente"})
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar proveedor", error: error.message });
    }
};

proveedorsCon.delete = async(req,res) => {
    try {
        const deleteProveedor= await proveedorModel.findByIdAndDelete(req.params.id);
    if(!deleteProveedor){
         return res.status(400).json({Message: "Proveedor no encontrado"})
    }
    res.status(200).json({Message:"Proveedor eliminado correctamente"})
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar proveedor", error: error.message });
    }
}

export default proveedorsCon;