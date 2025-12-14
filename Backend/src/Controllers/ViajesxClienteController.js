import ViajesPorClientes from "../Models/ViajesPorClientes.js";

const ViajesxClienteCon = {};

// ============================================
// GET - Obtener viajes por cliente
// ============================================

// GET ALL: Obtener todos los clientes o reporte mensual
ViajesxClienteCon.getViajesXCliente = async (req, res) => {
  try {
    const { mes, año } = req.query;

    // Si se proporciona mes y año, devolver reporte mensual
    if (mes && año) {
      const reporte = await ViajesPorClientes.obtenerReporteMensual(
        parseInt(mes),
        parseInt(año)
      );
      
      return res.status(200).json({
        success: true,
        data: reporte
      });
    }

    // Si no, devolver todos los clientes activos
    const clientes = await ViajesPorClientes.find({ estado: "ACTIVO" })
      .sort({ clienteNombre: 1 });

    res.status(200).json({
      success: true,
      count: clientes.length,
      data: clientes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener viajes por cliente",
      error: error.message
    });
  }
};

// GET ONE: Obtener un cliente específico por ID o búsqueda
ViajesxClienteCon.getViajeXClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const { mes, año, criterio } = req.query;

    let cliente;

    // Búsqueda por criterio (nombre o ID) con mes y año
    if (criterio && mes && año) {
      cliente = await ViajesPorClientes.buscarCliente(
        criterio,
        parseInt(mes),
        parseInt(año)
      );
    } 
    // Búsqueda por ObjectId de MongoDB
    else {
      cliente = await ViajesPorClientes.findById(id);
    }

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    res.status(200).json({
      success: true,
      data: cliente
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el cliente",
      error: error.message
    });
  }
};

// ============================================
// POST - Crear nuevo cliente con rutas
// ============================================

ViajesxClienteCon.createViajeXCliente = async (req, res) => {
  try {
    const {
      clienteNombre,
      rutas,
      mes,
      año,
      telefono,
      email,
      notas
    } = req.body;

    // Validaciones básicas
    if (!clienteNombre || !mes || !año) {
      return res.status(400).json({
        success: false,
        message: "clienteNombre, mes y año son requeridos"
      });
    }

    if (!rutas || rutas.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar al menos una ruta"
      });
    }

    // Generar clienteId automático
    const clienteId = await ViajesPorClientes.generarClienteId();

    // Crear el cliente
    const nuevoCliente = await ViajesPorClientes.create({
      clienteId,
      clienteNombre: clienteNombre.toUpperCase(),
      rutas,
      mes: parseInt(mes),
      año: parseInt(año),
      telefono,
      email,
      notas
    });

    res.status(201).json({
      success: true,
      message: "Cliente creado exitosamente",
      data: nuevoCliente
    });

  } catch (error) {
    // Error de duplicado (clienteId + mes + año)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un registro para este cliente en el mes y año especificados"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al crear el cliente",
      error: error.message
    });
  }
};

// ============================================
// PUT - Actualizar cliente y sus rutas
// ============================================

ViajesxClienteCon.updateViajeXCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clienteNombre,
      rutas,
      telefono,
      email,
      notas,
      estado,
      accion, // "agregar", "actualizar", "eliminar"
      datosRuta // Datos específicos para la acción en rutas
    } = req.body;

    // Buscar el cliente
    const cliente = await ViajesPorClientes.findById(id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    // ACCIONES ESPECÍFICAS EN RUTAS
    if (accion && datosRuta) {
      switch (accion) {
        case "agregar":
          // Agregar nueva ruta
          await cliente.agregarRuta(
            datosRuta.origen,
            datosRuta.destino,
            datosRuta.cantidadViajes,
            datosRuta.montoPorViaje
          );
          break;

        case "actualizar":
          // Actualizar ruta existente
          await cliente.actualizarRuta(
            datosRuta.rutaCompleta,
            {
              cantidadViajes: datosRuta.cantidadViajes,
              montoPorViaje: datosRuta.montoPorViaje
            }
          );
          break;

        case "eliminar":
          // Desactivar ruta
          await cliente.eliminarRuta(datosRuta.rutaCompleta);
          break;

        default:
          return res.status(400).json({
            success: false,
            message: "Acción no válida. Use: agregar, actualizar o eliminar"
          });
      }

      return res.status(200).json({
        success: true,
        message: `Ruta ${accion}da exitosamente`,
        data: cliente
      });
    }

    // ACTUALIZACIÓN GENERAL DEL CLIENTE
    const updateData = {};
    if (clienteNombre) updateData.clienteNombre = clienteNombre.toUpperCase();
    if (rutas) updateData.rutas = rutas;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (email !== undefined) updateData.email = email;
    if (notas !== undefined) updateData.notas = notas;
    if (estado) updateData.estado = estado;

    Object.assign(cliente, updateData);
    await cliente.save();

    res.status(200).json({
      success: true,
      message: "Cliente actualizado exitosamente",
      data: cliente
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar el cliente",
      error: error.message
    });
  }
};

// ============================================
// DELETE - Eliminar (desactivar) cliente
// ============================================

ViajesxClienteCon.deleteViajeXCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { eliminarPermanente } = req.query; // ?eliminarPermanente=true

    const cliente = await ViajesPorClientes.findById(id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    // Eliminar permanentemente si se especifica
    if (eliminarPermanente === "true") {
      await ViajesPorClientes.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: "Cliente eliminado permanentemente"
      });
    }

    // Desactivar (soft delete)
    cliente.estado = "INACTIVO";
    await cliente.save();

    res.status(200).json({
      success: true,
      message: "Cliente desactivado exitosamente",
      data: cliente
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar el cliente",
      error: error.message
    });
  }
};

export default ViajesxClienteCon;