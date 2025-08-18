import proveedorModel from "../Models/Proveedores.js";

/**
 * Controlador para manejar operaciones CRUD de proveedores
 */
const proveedorsCon = {};

/**
 * Obtener todos los proveedores registrados en el sistema
 * GET /proveedores
 * @param {object} req - Objeto request de Express
 * @param {object} res - Objeto response de Express
 * @returns {object} JSON con lista de proveedores o mensaje de error
 */
proveedorsCon.get = async (req, res) => {
  try {
    // Buscar todos los documentos de proveedores en la base de datos
    const newProveedor = await proveedorModel.find();
    
    // Responder con status 200 (OK) y la lista completa de proveedores
    res.status(200).json(newProveedor);
  } catch (error) {
    // En caso de error, responder con status 500 (Error interno del servidor)
    res.status(500).json({ message: "Error al obtener proveedor", error: error.message });
  }
};

/**
 * Crear y registrar un nuevo proveedor en el sistema
 * POST /proveedores
 * @param {object} req - Objeto request que contiene los datos del proveedor en req.body
 * @param {object} res - Objeto response de Express
 * @returns {object} JSON con mensaje de éxito o error
 */
proveedorsCon.post = async (req, res) => {
  try {
    // Extraer los datos del proveedor del cuerpo de la petición
    const { companyName, email, phone, partDescription } = req.body;
    
    // Crear nueva instancia del modelo Proveedor con los datos recibidos
    const newProveedor = new proveedorModel({ 
      companyName,        // Nombre de la empresa proveedora
      email,              // Email de contacto del proveedor
      phone,              // Teléfono de contacto
      partDescription     // Descripción de las partes/servicios que provee
    });
    
    // Guardar el nuevo proveedor en la base de datos
    await newProveedor.save();
    
    // Responder con mensaje de éxito
    res.status(200).json({ Message: "Proveedor registrados correctamente" });
  } catch (error) {
    // Manejar errores durante la creación del proveedor
    res.status(500).json({ message: "Error al agregar proveedor", error: error.message });
  }
};

/**
 * Actualizar datos de un proveedor existente
 * PUT /proveedores/:id
 * @param {object} req - Objeto request que contiene el ID en params y nuevos datos en body
 * @param {object} res - Objeto response de Express
 * @returns {object} JSON con mensaje de éxito o error
 */
proveedorsCon.put = async (req, res) => {
  try {
    // Extraer los nuevos datos del proveedor del cuerpo de la petición
    const { companyName, email, phone, partDescription } = req.body;
    
    // Buscar proveedor por ID y actualizar con los nuevos datos
    await proveedorModel.findByIdAndUpdate(
      req.params.id,    // ID del proveedor a actualizar (viene de la URL)
      { 
        companyName,    // Nuevo nombre de empresa
        email,          // Nuevo email
        phone,          // Nuevo teléfono
        partDescription // Nueva descripción de partes
      },
      { new: true }     // Opción para retornar el documento actualizado
    );
    
    // Responder con mensaje de éxito
    res.status(200).json({ Message: "Proveedor actualizado correctamente" });
  } catch (error) {
    // Manejar errores durante la actualización
    res.status(500).json({ message: "Error al actualizar proveedor", error: error.message });
  }
};

/**
 * Eliminar un proveedor del sistema
 * DELETE /proveedores/:id
 * @param {object} req - Objeto request que contiene el ID del proveedor en req.params.id
 * @param {object} res - Objeto response de Express
 * @returns {object} JSON con mensaje de éxito o error
 */
proveedorsCon.delete = async (req, res) => {
  try {
    // Buscar y eliminar proveedor por ID en una sola operación
    const deleteProveedor = await proveedorModel.findByIdAndDelete(req.params.id);
    
    // Verificar si el proveedor existía
    if (!deleteProveedor) {
      // Si no se encontró el proveedor, responder con error 400 (Bad Request)
      return res.status(400).json({ Message: "Proveedor no encontrado" });
    }
    
    // Responder con mensaje de éxito si la eliminación fue exitosa
    res.status(200).json({ Message: "Proveedor eliminado correctamente" });
  } catch (error) {
    // Manejar errores durante la eliminación
    res.status(500).json({ message: "Error al eliminar proveedor", error: error.message });
  }
};

// Exportar el controlador para poder importarlo en las rutas
export default proveedorsCon;