import proveedorModel from "../Models/Proveedores.js";

/**
 * Controlador para manejar operaciones CRUD de proveedores
 */
const proveedorsCon = {};

// Construye el objeto de contacto principal solo con campos presentes
const buildContactoPrincipalPayload = (body = {}) => {
  const source = body.contactoPrincipal || {};
  const contacto = {
    nombre: source.nombre || body.contactoNombre || "",
    cargo: source.cargo || body.contactoCargo || "",
    telefono: source.telefono || body.contactoTelefono || "",
    email: source.email || body.contactoEmail || ""
  };

  const hasValues = Object.values(contacto).some((value) => value && value.toString().trim() !== "");
  return hasValues ? contacto : undefined;
};

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
    const { companyName, email, phone, partDescription, direccion, rubro } = req.body;

    const contactoPrincipal = buildContactoPrincipalPayload(req.body);
    
    // Crear nueva instancia del modelo Proveedor con los datos recibidos
    const newProveedor = new proveedorModel({ 
      companyName,        // Nombre de la empresa proveedora
      email,              // Email de contacto del proveedor
      phone,              // Teléfono de contacto
      partDescription,    // Descripción de las partes/servicios que provee
      direccion,
      rubro,
      contactoPrincipal
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
    const contactoPrincipal = buildContactoPrincipalPayload(req.body);

    // Solo construir campos que se envíen para evitar sobreescribir con undefined
    const updateData = {};
    if (req.body.companyName) updateData.companyName = req.body.companyName;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.phone) updateData.phone = req.body.phone;
    if (req.body.partDescription) updateData.partDescription = req.body.partDescription;
    if (req.body.direccion) updateData.direccion = req.body.direccion;
    if (req.body.rubro) updateData.rubro = req.body.rubro;
    if (contactoPrincipal) updateData.contactoPrincipal = contactoPrincipal;

    await proveedorModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
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