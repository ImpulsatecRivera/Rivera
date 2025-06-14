import proveedorModel from "../Models/Proveedores.js";

const proveedorsCon= {};

proveedorsCon.get = async (req, res) => {
    const newProveedor = await proveedorModel.find();
    res.status(200).json(newProveedor);
}

proveedorsCon.post= async (req,res) => {
    const {companyName,email,phone,partDescription}=req.body;
    const newProveedor= new proveedorModel({companyName,email,phone,partDescription})
    await newProveedor.save();
    res.status(200).json({Message: "Proveedor registrados correctamente"})
};

proveedorsCon.put = async(req,res)=>{
    const {companyName,email,phone,partDescription}=req.body;
    await proveedorModel.findByIdAndUpdate(req.params.id,{
        companyName,email,phone,partDescription
    },{new:true})
    res.status(200).json({Message:"Proveedor actualizado correctamente"})
};

proveedorsCon.delete = async(req,res) => {
    const deleteProveedor= await proveedorModel.findByIdAndDelete(req.params.id);
    if(!deleteProveedor){
         return res.status(400).json({Message: "Proveedor no encontrado"})
    }
    res.status(200).json({Message:"Proveedor eliminado correctamente"})
}

export default proveedorsCon;