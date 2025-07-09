import proveedorModel from "../Models/Proveedores.js";

const proveedorsCon = {};

// Obtener todos los proveedores
proveedorsCon.get = async (req, res) => {
  try {
    const proveedores = await proveedorModel.find();
    res.status(200).json(proveedores);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener proveedores", error: error.message });
  }
};

// Crear nuevo proveedor
proveedorsCon.post = async (req, res) => {
  try {
    const { companyName, email, phone, partDescription } = req.body;
    const newProveedor = new proveedorModel({ companyName, email, phone, partDescription });
    await newProveedor.save();
    res.status(200).json({ message: "Proveedor registrado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar proveedor", error: error.message });
  }
};

// Actualizar proveedor
proveedorsCon.put = async (req, res) => {
  try {
    const { companyName, email, phone, partDescription } = req.body;
    const updatedProveedor = await proveedorModel.findByIdAndUpdate(
      req.params.id,
      { companyName, email, phone, partDescription },
      { new: true }
    );
    if (!updatedProveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    res.status(200).json({ message: "Proveedor actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar proveedor", error: error.message });
  }
};

// Eliminar proveedor
proveedorsCon.delete = async (req, res) => {
  try {
    const deletedProveedor = await proveedorModel.findByIdAndDelete(req.params.id);
    if (!deletedProveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    res.status(200).json({ message: "Proveedor eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar proveedor", error: error.message });
  }
};

export default proveedorsCon;