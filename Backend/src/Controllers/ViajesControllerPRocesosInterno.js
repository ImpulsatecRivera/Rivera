import Viajes from "../Models/VijaesProInterno.js";
import Ubicaciones from "../Models/RutasModels.js";

const ViajesController = {};

// ==============================
// Helpers
// ==============================
const normalizeEstado = (value, fallback = "PENDIENTE") => {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;

  let v = String(value).trim().toUpperCase();
  v = v.replace(/_/g, " ").replace(/\s+/g, " ").trim(); // EN_RUTA -> EN RUTA

  // Sinónimos
  if (["PENDIENTE", "PENDING"].includes(v)) return "PENDIENTE";
  if (["EN RUTA", "IN ROUTE", "IN_ROUTE", "ENRUTA"].includes(v)) return "EN RUTA";
  if (["COMPLETADO", "COMPLETED", "DONE"].includes(v)) return "COMPLETADO";
  if (["CANCELADO", "CANCELED", "CANCELLED"].includes(v)) return "CANCELADO";

  // Si quieres ser estricto cuando fallback sea null, devolvemos null
  return fallback === null ? null : fallback;
};

// ============================================
// GET - Obtener viajes
// ============================================

// GET ALL: Obtener todos los viajes con filtros
ViajesController.getViajes = async (req, res) => {
  try {
    const {
      fechaInicio,
      fechaFin,
      clienteId,
      estado,
      pagado,
      limite = 100,
      pagina = 1,
    } = req.query;

    const filtros = {};

    if (clienteId) filtros.clienteId = clienteId;

    if (estado) {
      const est = normalizeEstado(estado, null);
      if (!est) {
        return res.status(400).json({
          success: false,
          message: "estado inválido. Usa: PENDIENTE, EN RUTA, COMPLETADO, CANCELADO",
        });
      }
      filtros.estado = est;
    }

    if (pagado !== undefined) filtros.pagado = pagado === "true" || pagado === true;

    // Filtro de fechas
    if (fechaInicio || fechaFin) {
      filtros.fecha = {};
      if (fechaInicio) filtros.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) filtros.fecha.$lte = new Date(fechaFin);
    }

    // Paginación
    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    const viajes = await Viajes.find(filtros)
      .populate("clienteId")
      .populate("origen.ubicacionId")
      .populate("destino.ubicacionId")
      .sort({ fecha: -1 })
      .limit(parseInt(limite))
      .skip(skip);

    const total = await Viajes.countDocuments(filtros);

    res.status(200).json({
      success: true,
      count: viajes.length,
      total: total,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite)),
      data: viajes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener viajes",
      error: error.message,
    });
  }
};

// GET ONE: Obtener un viaje específico
ViajesController.getViajeById = async (req, res) => {
  try {
    const { id } = req.params;

    const viaje = await Viajes.findById(id)
      .populate("clienteId")
      .populate("origen.ubicacionId")
      .populate("destino.ubicacionId");

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: viaje,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el viaje",
      error: error.message,
    });
  }
};

// GET: Obtener viajes por cliente
ViajesController.getViajesPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    const inicio = fechaInicio ? new Date(fechaInicio) : null;
    const fin = fechaFin ? new Date(fechaFin) : null;

    const viajes = await Viajes.obtenerPorCliente(clienteId, inicio, fin);

    res.status(200).json({
      success: true,
      count: viajes.length,
      data: viajes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener viajes del cliente",
      error: error.message,
    });
  }
};

// GET: Obtener viajes por fecha
ViajesController.getViajesPorFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: "fechaInicio y fechaFin son requeridos",
      });
    }

    const viajes = await Viajes.obtenerPorFecha(new Date(fechaInicio), new Date(fechaFin));

    res.status(200).json({
      success: true,
      count: viajes.length,
      data: viajes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener viajes por fecha",
      error: error.message,
    });
  }
};

// GET: Obtener reporte de periodo
ViajesController.getReportePeriodo = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: "fechaInicio y fechaFin son requeridos",
      });
    }

    const reporte = await Viajes.obtenerReportePeriodo(new Date(fechaInicio), new Date(fechaFin));

    res.status(200).json({
      success: true,
      data: reporte,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al generar reporte",
      error: error.message,
    });
  }
};

// GET: Obtener viajes pendientes de pago
ViajesController.getPendientesPago = async (req, res) => {
  try {
    const viajes = await Viajes.obtenerPendientesPago();
    const totalPendiente = viajes.reduce((sum, viaje) => sum + (Number(viaje.monto) || 0), 0);

    res.status(200).json({
      success: true,
      count: viajes.length,
      totalPendiente: totalPendiente,
      data: viajes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener viajes pendientes de pago",
      error: error.message,
    });
  }
};

// ============================================
// POST - Crear nuevo viaje
// ============================================

ViajesController.createViaje = async (req, res) => {
  try {
    const {
      clienteId,
      clienteNombre,
      clienteTelefono,
      origen,
      destino,
      monto,
      fecha,
      hora,
      tipoServicio,
      duracion,
      distancia,
      metodoPago,
      pagado,
      pasajeros,
      notas,
      referencias,
      conductor,
      estado, // ✅ AHORA SÍ lo recibimos
    } = req.body;

    // Validaciones básicas
    if (!clienteNombre) {
      return res.status(400).json({ success: false, message: "clienteNombre es requerido" });
    }

    if (!origen || !origen.texto) {
      return res.status(400).json({ success: false, message: "origen.texto es requerido" });
    }

    if (!destino || !destino.texto) {
      return res.status(400).json({ success: false, message: "destino.texto es requerido" });
    }

    const montoNum = Number(monto);
    if (Number.isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({ success: false, message: "monto debe ser mayor a 0" });
    }

    // ✅ Estado FINAL (por defecto PENDIENTE)
    const estadoFinal = normalizeEstado(estado, "PENDIENTE");

    // Generar viajeId automático
    const viajeId = await Viajes.generarViajeId();

    // Procesar origen
    const origenData = {
      texto: String(origen.texto).toUpperCase(),
      esRecurrente: !!origen.esRecurrente,
    };

    if (origen.esRecurrente) {
      if (origen.ubicacionId) {
        origenData.ubicacionId = origen.ubicacionId;
      } else if (origen.nombreUbicacion) {
        const ubicacion = await Ubicaciones.buscarPorNombre(origen.nombreUbicacion);
        if (ubicacion) {
          origenData.ubicacionId = ubicacion._id;
          origenData.texto = ubicacion.nombre;
        }
      }
    }

    // Procesar destino
    const destinoData = {
      texto: String(destino.texto).toUpperCase(),
      esRecurrente: !!destino.esRecurrente,
    };

    if (destino.esRecurrente) {
      if (destino.ubicacionId) {
        destinoData.ubicacionId = destino.ubicacionId;
      } else if (destino.nombreUbicacion) {
        const ubicacion = await Ubicaciones.buscarPorNombre(destino.nombreUbicacion);
        if (ubicacion) {
          destinoData.ubicacionId = ubicacion._id;
          destinoData.texto = ubicacion.nombre;
        }
      }
    }

    // ✅ Pagado bien casteado
    const pagadoFinal = pagado === true || pagado === "true";

    // Crear el viaje
    const nuevoViaje = await Viajes.create({
      viajeId,
      clienteId: clienteId || null,
      clienteNombre: String(clienteNombre).toUpperCase(),
      clienteTelefono,

      // ✅ CLAVE: guardar estado pendiente al crear
      estado: estadoFinal,

      origen: origenData,
      destino: destinoData,
      monto: montoNum,
      fecha: fecha ? new Date(fecha) : new Date(),
      hora,
      tipoServicio,
      duracion,
      distancia,
      metodoPago,
      pagado: pagadoFinal,
      pasajeros: Number(pasajeros) || 1,
      notas,
      referencias,
      conductor,
    });

    await nuevoViaje.populate("origen.ubicacionId destino.ubicacionId");

    res.status(201).json({
      success: true,
      message: "Viaje creado exitosamente",
      data: nuevoViaje,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear el viaje",
      error: error.message,
    });
  }
};

// ============================================
// PUT - Actualizar viaje
// ============================================

ViajesController.updateViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const viaje = await Viajes.findById(id);

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado",
      });
    }

    const camposPermitidos = [
      "clienteNombre",
      "clienteTelefono",
      "monto",
      "fecha",
      "hora",
      "tipoServicio",
      "duracion",
      "distancia",
      "estado",
      "metodoPago",
      "pagado",
      "pasajeros",
      "notas",
      "referencias",
      "conductor",
    ];

    camposPermitidos.forEach((campo) => {
      if (updateData[campo] !== undefined) {
        if (campo === "estado") {
          viaje.estado = normalizeEstado(updateData.estado, viaje.estado || "PENDIENTE");
        } else if (campo === "clienteNombre") {
          viaje.clienteNombre = String(updateData.clienteNombre).toUpperCase();
        } else {
          viaje[campo] = updateData[campo];
        }
      }
    });

    await viaje.save();

    res.status(200).json({
      success: true,
      message: "Viaje actualizado exitosamente",
      data: viaje,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar el viaje",
      error: error.message,
    });
  }
};

// PUT: Marcar viaje como pagado
ViajesController.marcarComoPagado = async (req, res) => {
  try {
    const { id } = req.params;

    const viaje = await Viajes.findById(id);

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado",
      });
    }

    await viaje.marcarComoPagado();

    res.status(200).json({
      success: true,
      message: "Viaje marcado como pagado",
      data: viaje,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al marcar viaje como pagado",
      error: error.message,
    });
  }
};

// PUT: Cancelar viaje
ViajesController.cancelarViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const viaje = await Viajes.findById(id);

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado",
      });
    }

    await viaje.cancelar(motivo);

    res.status(200).json({
      success: true,
      message: "Viaje cancelado exitosamente",
      data: viaje,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al cancelar el viaje",
      error: error.message,
    });
  }
};

// ============================================
// DELETE - Eliminar viaje
// ============================================

ViajesController.deleteViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { eliminarPermanente } = req.query;

    const viaje = await Viajes.findById(id);

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado",
      });
    }

    if (eliminarPermanente === "true") {
      await Viajes.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: "Viaje eliminado permanentemente",
      });
    }

    await viaje.cancelar("Eliminado por el usuario");

    res.status(200).json({
      success: true,
      message: "Viaje cancelado exitosamente",
      data: viaje,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar el viaje",
      error: error.message,
    });
  }
};

export default ViajesController;
