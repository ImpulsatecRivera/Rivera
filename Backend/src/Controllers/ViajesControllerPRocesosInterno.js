import mongoose from "mongoose";
import Viajes from "../Models/VijaesProInterno.js";
import Ubicaciones from "../Models/RutasModels.js";

const ViajesController = {};

// ==============================
// Helpers
// ==============================
const ESTADOS_VALIDOS = ["PENDIENTE", "EN RUTA", "COMPLETADO", "CANCELADO"];

const normalizeEstado = (value, fallback = "PENDIENTE") => {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;

  let v = String(value).trim().toUpperCase();
  v = v.replace(/_/g, " ").replace(/\s+/g, " ").trim();

  if (["PENDIENTE", "PENDING"].includes(v)) return "PENDIENTE";
  if (["EN RUTA", "IN ROUTE", "IN_ROUTE", "ENRUTA"].includes(v)) return "EN RUTA";
  if (["COMPLETADO", "COMPLETED", "DONE", "FINALIZADO", "TERMINADO"].includes(v)) return "COMPLETADO";
  if (["CANCELADO", "CANCELED", "CANCELLED", "ANULADO"].includes(v)) return "CANCELADO";

  return fallback;
};

const toBool = (v) => {
  if (v === true || v === false) return v;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return false;
};

const toInt = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};

const toDateOrThrow400 = (v, fieldName) => {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) {
    const err = new Error(`${fieldName} inválida`);
    err.status = 400;
    throw err;
  }
  return d;
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

const safePopulateQuery = (query) =>
  query
    .populate({ path: "clienteId", strictPopulate: false })
    .populate({ path: "origen.ubicacionId", strictPopulate: false })
    .populate({ path: "destino.ubicacionId", strictPopulate: false });

// ==============================
// GET - Obtener viajes (con filtros + paginación)
// ==============================
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

    // clienteId (validación ObjectId)
    if (clienteId) {
      if (!isValidObjectId(clienteId)) {
        return res.status(400).json({ success: false, message: "clienteId inválido" });
      }
      filtros.clienteId = clienteId;
    }

    // estado (validación)
    if (estado) {
      const est = normalizeEstado(estado, null);
      if (!est || !ESTADOS_VALIDOS.includes(est)) {
        return res.status(400).json({
          success: false,
          message: "estado inválido. Usa: PENDIENTE, EN RUTA, COMPLETADO, CANCELADO",
        });
      }
      filtros.estado = est;
    }

    // pagado
    if (pagado !== undefined) {
      filtros.pagado = toBool(pagado);
    }

    // fechas
    if (fechaInicio || fechaFin) {
      filtros.fecha = {};
      if (fechaInicio) filtros.fecha.$gte = toDateOrThrow400(fechaInicio, "fechaInicio");
      if (fechaFin) filtros.fecha.$lte = toDateOrThrow400(fechaFin, "fechaFin");
    }

    // paginación segura
    const lim = Math.min(Math.max(toInt(limite, 100), 1), 500);
    const pag = Math.max(toInt(pagina, 1), 1);
    const skip = (pag - 1) * lim;

    let query = Viajes.find(filtros).sort({ fecha: -1 }).limit(lim).skip(skip);
    query = safePopulateQuery(query);

    const [viajes, total] = await Promise.all([
      query,
      Viajes.countDocuments(filtros),
    ]);

    return res.status(200).json({
      success: true,
      count: viajes.length,
      total,
      pagina: pag,
      totalPaginas: Math.ceil(total / lim) || 1,
      data: viajes,
    });
  } catch (error) {
    console.error("🔥 getViajes ERROR:", error);

    // errores comunes de mongoose
    if (error?.name === "CastError") {
      return res.status(400).json({ success: false, message: "Parámetro inválido", error: error.message });
    }

    return res.status(error.status || 500).json({
      success: false,
      message: "Error al obtener viajes",
      error: error.message,
    });
  }
};

// ==============================
// GET ONE - Obtener viaje por ID
// ==============================
ViajesController.getViajeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    let query = Viajes.findById(id);
    query = safePopulateQuery(query);

    const viaje = await query;

    if (!viaje) {
      return res.status(404).json({ success: false, message: "Viaje no encontrado" });
    }

    return res.status(200).json({ success: true, data: viaje });
  } catch (error) {
    console.error("🔥 getViajeById ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener el viaje",
      error: error.message,
    });
  }
};

// ==============================
// GET - Por cliente (usa método del modelo si existe)
// ==============================
ViajesController.getViajesPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    if (!isValidObjectId(clienteId)) {
      return res.status(400).json({ success: false, message: "clienteId inválido" });
    }

    const inicio = fechaInicio ? toDateOrThrow400(fechaInicio, "fechaInicio") : null;
    const fin = fechaFin ? toDateOrThrow400(fechaFin, "fechaFin") : null;

    const viajes = await Viajes.obtenerPorCliente(clienteId, inicio, fin);

    return res.status(200).json({
      success: true,
      count: viajes.length,
      data: viajes,
    });
  } catch (error) {
    console.error("🔥 getViajesPorCliente ERROR:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: "Error al obtener viajes del cliente",
      error: error.message,
    });
  }
};

// ==============================
// GET - Por fecha (usa método del modelo si existe)
// ==============================
ViajesController.getViajesPorFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: "fechaInicio y fechaFin son requeridos",
      });
    }

    const inicio = toDateOrThrow400(fechaInicio, "fechaInicio");
    const fin = toDateOrThrow400(fechaFin, "fechaFin");

    const viajes = await Viajes.obtenerPorFecha(inicio, fin);

    return res.status(200).json({
      success: true,
      count: viajes.length,
      data: viajes,
    });
  } catch (error) {
    console.error("🔥 getViajesPorFecha ERROR:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: "Error al obtener viajes por fecha",
      error: error.message,
    });
  }
};

// ==============================
// GET - Reporte periodo (usa método del modelo si existe)
// ==============================
ViajesController.getReportePeriodo = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: "fechaInicio y fechaFin son requeridos",
      });
    }

    const inicio = toDateOrThrow400(fechaInicio, "fechaInicio");
    const fin = toDateOrThrow400(fechaFin, "fechaFin");

    const reporte = await Viajes.obtenerReportePeriodo(inicio, fin);

    return res.status(200).json({ success: true, data: reporte });
  } catch (error) {
    console.error("🔥 getReportePeriodo ERROR:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: "Error al generar reporte",
      error: error.message,
    });
  }
};

// ==============================
// GET - Pendientes de pago (usa método del modelo si existe)
// ==============================
ViajesController.getPendientesPago = async (req, res) => {
  try {
    const viajes = await Viajes.obtenerPendientesPago();
    const totalPendiente = viajes.reduce((sum, v) => sum + (Number(v.monto) || 0), 0);

    return res.status(200).json({
      success: true,
      count: viajes.length,
      totalPendiente,
      data: viajes,
    });
  } catch (error) {
    console.error("🔥 getPendientesPago ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener viajes pendientes de pago",
      error: error.message,
    });
  }
};

// ==============================
// POST - Crear nuevo viaje
// ==============================
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
      // estado: se ignora a propósito => SIEMPRE PENDIENTE
    } = req.body;

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

    if (clienteId && !isValidObjectId(clienteId)) {
      return res.status(400).json({ success: false, message: "clienteId inválido" });
    }

    const viajeId = await Viajes.generarViajeId();

    // Origen
    const origenData = {
      texto: String(origen.texto).toUpperCase(),
      esRecurrente: !!origen.esRecurrente,
    };

    if (origenData.esRecurrente) {
      if (origen.ubicacionId) {
        origenData.ubicacionId = origen.ubicacionId;
      } else if (origen.nombreUbicacion) {
        const ubicacion = await Ubicaciones.buscarPorNombre(origen.nombreUbicacion);
        if (ubicacion) {
          origenData.ubicacionId = ubicacion._id;
          origenData.texto = String(ubicacion.nombre).toUpperCase();
        }
      }
    }

    // Destino
    const destinoData = {
      texto: String(destino.texto).toUpperCase(),
      esRecurrente: !!destino.esRecurrente,
    };

    if (destinoData.esRecurrente) {
      if (destino.ubicacionId) {
        destinoData.ubicacionId = destino.ubicacionId;
      } else if (destino.nombreUbicacion) {
        const ubicacion = await Ubicaciones.buscarPorNombre(destino.nombreUbicacion);
        if (ubicacion) {
          destinoData.ubicacionId = ubicacion._id;
          destinoData.texto = String(ubicacion.nombre).toUpperCase();
        }
      }
    }

    // Conductor (asegurar objeto)
    let conductorObj = conductor || { nombre: "", vehiculo: "" };
    if (typeof conductorObj === "string") {
      try {
        conductorObj = JSON.parse(conductorObj);
      } catch {
        conductorObj = { nombre: String(conductorObj), vehiculo: "" };
      }
    }

    const nuevoViaje = await Viajes.create({
      viajeId,
      clienteId: clienteId || null,
      clienteNombre: String(clienteNombre).toUpperCase(),
      clienteTelefono: clienteTelefono || "",

      origen: origenData,
      destino: destinoData,

      monto: montoNum,
      fecha: fecha ? toDateOrThrow400(fecha, "fecha") : new Date(),
      hora: hora || "",

      tipoServicio,
      duracion,
      distancia,

      estado: "PENDIENTE", // ✅ FORZADO

      metodoPago,
      pagado: toBool(pagado),
      pasajeros: Number(pasajeros) || 1,

      notas: notas || "",
      referencias: referencias || "",
      conductor: conductorObj,
    });

    // Populate seguro (no revienta si el schema no tiene esas rutas)
    await nuevoViaje.populate({ path: "origen.ubicacionId", strictPopulate: false });
    await nuevoViaje.populate({ path: "destino.ubicacionId", strictPopulate: false });
    await nuevoViaje.populate({ path: "clienteId", strictPopulate: false });

    return res.status(201).json({
      success: true,
      message: "Viaje creado exitosamente",
      data: nuevoViaje,
    });
  } catch (error) {
    console.error("🔥 createViaje ERROR:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: "Error al crear el viaje",
      error: error.message,
    });
  }
};

// ==============================
// PUT - Actualizar viaje
// ==============================
ViajesController.updateViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const viaje = await Viajes.findById(id);
    if (!viaje) {
      return res.status(404).json({ success: false, message: "Viaje no encontrado" });
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
          const est = normalizeEstado(updateData.estado, viaje.estado || "PENDIENTE");
          viaje.estado = ESTADOS_VALIDOS.includes(est) ? est : (viaje.estado || "PENDIENTE");
        } else if (campo === "clienteNombre") {
          viaje.clienteNombre = String(updateData.clienteNombre).toUpperCase();
        } else if (campo === "pagado") {
          viaje.pagado = toBool(updateData.pagado);
        } else if (campo === "monto") {
          const m = Number(updateData.monto);
          if (!Number.isNaN(m) && m > 0) viaje.monto = m;
        } else if (campo === "fecha") {
          viaje.fecha = updateData.fecha ? toDateOrThrow400(updateData.fecha, "fecha") : viaje.fecha;
        } else {
          viaje[campo] = updateData[campo];
        }
      }
    });

    await viaje.save();

    return res.status(200).json({
      success: true,
      message: "Viaje actualizado exitosamente",
      data: viaje,
    });
  } catch (error) {
    console.error("🔥 updateViaje ERROR:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: "Error al actualizar el viaje",
      error: error.message,
    });
  }
};

// ==============================
// PUT - Marcar como pagado
// ==============================
ViajesController.marcarComoPagado = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const viaje = await Viajes.findById(id);
    if (!viaje) {
      return res.status(404).json({ success: false, message: "Viaje no encontrado" });
    }

    await viaje.marcarComoPagado();

    return res.status(200).json({
      success: true,
      message: "Viaje marcado como pagado",
      data: viaje,
    });
  } catch (error) {
    console.error("🔥 marcarComoPagado ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error al marcar viaje como pagado",
      error: error.message,
    });
  }
};

// ==============================
// PUT - Cancelar viaje
// ==============================
ViajesController.cancelarViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const viaje = await Viajes.findById(id);
    if (!viaje) {
      return res.status(404).json({ success: false, message: "Viaje no encontrado" });
    }

    await viaje.cancelar(motivo);

    return res.status(200).json({
      success: true,
      message: "Viaje cancelado exitosamente",
      data: viaje,
    });
  } catch (error) {
    console.error("🔥 cancelarViaje ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error al cancelar el viaje",
      error: error.message,
    });
  }
};

// ==============================
// DELETE - Eliminar viaje
// ==============================
ViajesController.deleteViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { eliminarPermanente } = req.query;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const viaje = await Viajes.findById(id);
    if (!viaje) {
      return res.status(404).json({ success: false, message: "Viaje no encontrado" });
    }

    if (eliminarPermanente === "true") {
      await Viajes.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "Viaje eliminado permanentemente" });
    }

    await viaje.cancelar("Eliminado por el usuario");

    return res.status(200).json({
      success: true,
      message: "Viaje cancelado exitosamente",
      data: viaje,
    });
  } catch (error) {
    console.error("🔥 deleteViaje ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el viaje",
      error: error.message,
    });
  }
};

export default ViajesController;
