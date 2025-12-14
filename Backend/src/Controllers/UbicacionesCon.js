import Ubicaciones from "../Models/RutasModels.js";

const UbicacionesController = {};

// ============================================
// GET - Obtener ubicaciones
// ============================================

// GET ALL: Obtener todas las ubicaciones activas
UbicacionesController.getUbicaciones = async (req, res) => {
  try {
    const { activa, tipo, municipio, limite } = req.query;

    // Construir filtros
    const filtros = {};
    if (activa !== undefined) filtros.activa = activa === 'true';
    if (tipo) filtros.tipo = tipo.toUpperCase();
    if (municipio) filtros.municipio = municipio.toUpperCase();

    // Si se pide las más frecuentes
    if (limite) {
      const ubicaciones = await Ubicaciones.obtenerMasFrecuentes(parseInt(limite));
      return res.status(200).json({
        success: true,
        count: ubicaciones.length,
        data: ubicaciones
      });
    }

    // Obtener todas con filtros
    const ubicaciones = await Ubicaciones.find(filtros)
      .sort({ nombre: 1 });

    res.status(200).json({
      success: true,
      count: ubicaciones.length,
      data: ubicaciones
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener ubicaciones",
      error: error.message
    });
  }
};

// GET ONE: Obtener una ubicación específica
UbicacionesController.getUbicacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.query;

    let ubicacion;

    // Búsqueda por nombre
    if (nombre) {
      ubicacion = await Ubicaciones.buscarPorNombre(nombre);
    } 
    // Búsqueda por ObjectId
    else {
      ubicacion = await Ubicaciones.findById(id);
    }

    if (!ubicacion) {
      return res.status(404).json({
        success: false,
        message: "Ubicación no encontrada"
      });
    }

    res.status(200).json({
      success: true,
      data: ubicacion
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener la ubicación",
      error: error.message
    });
  }
};

// ============================================
// POST - Crear nueva ubicación
// ============================================

UbicacionesController.createUbicacion = async (req, res) => {
  try {
    const {
      nombre,
      direccion,
      tipo,
      municipio,
      departamento,
      coordenadas,
      referencias,
      contacto,
      notas
    } = req.body;

    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre es requerido"
      });
    }

    // Verificar si ya existe una ubicación con ese nombre
    const ubicacionExistente = await Ubicaciones.findOne({
      nombre: nombre.toUpperCase()
    });

    if (ubicacionExistente) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una ubicación con ese nombre"
      });
    }

    // Generar ubicacionId automático
    const ubicacionId = await Ubicaciones.generarUbicacionId();

    // Crear la ubicación
    const nuevaUbicacion = await Ubicaciones.create({
      ubicacionId,
      nombre: nombre.toUpperCase(),
      direccion: direccion ? direccion.toUpperCase() : undefined,
      tipo,
      municipio: municipio ? municipio.toUpperCase() : undefined,
      departamento: departamento ? departamento.toUpperCase() : undefined,
      coordenadas,
      referencias,
      contacto,
      notas
    });

    res.status(201).json({
      success: true,
      message: "Ubicación creada exitosamente",
      data: nuevaUbicacion
    });

  } catch (error) {
    // Error de duplicado
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una ubicación con ese nombre o ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al crear la ubicación",
      error: error.message
    });
  }
};

// ============================================
// PUT - Actualizar ubicación
// ============================================

UbicacionesController.updateUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      direccion,
      tipo,
      municipio,
      departamento,
      coordenadas,
      referencias,
      contacto,
      activa,
      notas
    } = req.body;

    // Buscar la ubicación
    const ubicacion = await Ubicaciones.findById(id);

    if (!ubicacion) {
      return res.status(404).json({
        success: false,
        message: "Ubicación no encontrada"
      });
    }

    // Construir objeto de actualización
    const updateData = {};
    if (nombre) updateData.nombre = nombre.toUpperCase();
    if (direccion !== undefined) updateData.direccion = direccion.toUpperCase();
    if (tipo) updateData.tipo = tipo;
    if (municipio !== undefined) updateData.municipio = municipio.toUpperCase();
    if (departamento !== undefined) updateData.departamento = departamento.toUpperCase();
    if (coordenadas) updateData.coordenadas = coordenadas;
    if (referencias !== undefined) updateData.referencias = referencias;
    if (contacto) updateData.contacto = contacto;
    if (activa !== undefined) updateData.activa = activa;
    if (notas !== undefined) updateData.notas = notas;

    // Actualizar
    Object.assign(ubicacion, updateData);
    await ubicacion.save();

    res.status(200).json({
      success: true,
      message: "Ubicación actualizada exitosamente",
      data: ubicacion
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar la ubicación",
      error: error.message
    });
  }
};

// ============================================
// DELETE - Eliminar (desactivar) ubicación
// ============================================

UbicacionesController.deleteUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { eliminarPermanente } = req.query;

    const ubicacion = await Ubicaciones.findById(id);

    if (!ubicacion) {
      return res.status(404).json({
        success: false,
        message: "Ubicación no encontrada"
      });
    }

    // Eliminar permanentemente si se especifica
    if (eliminarPermanente === "true") {
      await Ubicaciones.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: "Ubicación eliminada permanentemente"
      });
    }

    // Desactivar (soft delete)
    ubicacion.activa = false;
    await ubicacion.save();

    res.status(200).json({
      success: true,
      message: "Ubicación desactivada exitosamente",
      data: ubicacion
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar la ubicación",
      error: error.message
    });
  }
};

export default UbicacionesController;