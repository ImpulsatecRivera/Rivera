import { isValidObjectId } from "mongoose";
import DieselModel from "../Models/ResumenDiesel.js";
import CamionesModel from "../Models/Camiones.js";

const ResumenCon = {};

const ESTADOS = {
  PENDIENTE: "Pendiente",
  COMPLETADO: "Completado",
};

const canonEstado = (v) => {
  const s = String(v || "").trim().toLowerCase();
  return s === "completado" ? ESTADOS.COMPLETADO : ESTADOS.PENDIENTE;
};

// ============================
// GET /resumen
// ============================
ResumenCon.getResumen = async (req, res) => {
  try {
    const resumen = await DieselModel.find()
      .populate({
        path: "CicurlationCard",
        select: "licensePlate name gasolineLevel brand model",
      });

    if (!resumen || resumen.length === 0) {
      return res.status(200).json({
        message: "No se encontró ningún resumen de diesel",
        count: 0,
        data: [],
      });
    }

    const resumenesFormateados = resumen.map((m) => ({
      _id: m._id,
      fecha: m.fecha,
      Galones: m.Galones,
      Total: m.Total,
      CicurlationCard: m.CicurlationCard,
      mes: m.mes,
      ano: m.ano,
      // ✅ IMPORTANTE: enviar estado
      estado: m.estado || ESTADOS.PENDIENTE,
    }));

    return res.status(200).json({
      message: "Lista de resumen de diesel de camiones",
      count: resumenesFormateados.length,
      data: resumenesFormateados,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// ============================
// POST /resumen
// ============================
ResumenCon.AgregarDiesel = async (req, res) => {
  try {
    const { fecha, Galones, Total, CicurlationCard, estado } = req.body;

    if (!CicurlationCard) {
      return res.status(400).json({ success: false, message: "CicurlationCard es requerido" });
    }

    const camion = await CamionesModel.findById(CicurlationCard);
    if (!camion) {
      return res.status(404).json({ success: false, message: "Camión no encontrado" });
    }

    const Fecha_Diesel = fecha ? new Date(fecha) : new Date();
    if (Number.isNaN(Fecha_Diesel.getTime())) {
      return res.status(400).json({ success: false, message: "Fecha inválida" });
    }

    const mes = Fecha_Diesel.getMonth() + 1;
    const ano = Fecha_Diesel.getFullYear();

    const nuevoResumen = new DieselModel({
      CicurlationCard,
      Galones,
      fecha: Fecha_Diesel,
      mes,
      ano,
      Total,
      // ✅ por defecto Pendiente (si no mandas nada)
      estado: canonEstado(estado || ESTADOS.PENDIENTE),
    });

    await nuevoResumen.save();
    await nuevoResumen.populate("CicurlationCard", "name gasolineLevel licensePlate brand model");

    return res.status(201).json({
      success: true,
      message: "Resumen registrado exitosamente",
      data: nuevoResumen,
    });
  } catch (error) {
    console.error("Error al registrar el resumen del diesel:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al registrar el resumen de diesel",
      error: error.message,
    });
  }
};

// ============================
// PUT /resumen/:id
// - Actualiza estado también
// - Si ya está completado: NO deja editar nada
// ============================
ResumenCon.PutDiesel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID no identificado",
        error: "El ID proporcionado no tiene un formato válido",
      });
    }

    const DieselExisting = await DieselModel.findById(id);
    if (!DieselExisting) {
      return res.status(404).json({
        success: false,
        message: "Resumen de diesel no encontrado",
        error: `No existe un resumen registrado con el ID: ${id}`,
      });
    }

    // ✅ BLOQUEO: si ya está completado, no se puede editar
    if (canonEstado(DieselExisting.estado) === ESTADOS.COMPLETADO) {
      return res.status(403).json({
        success: false,
        message: "Este registro está Completado y ya no se puede editar.",
      });
    }

    const { fecha, Galones, Total, CicurlationCard, estado } = req.body;

    // Cambiar camión (opcional)
    if (CicurlationCard !== undefined) {
      if (!isValidObjectId(CicurlationCard)) {
        return res.status(400).json({ success: false, message: "CicurlationCard inválido" });
      }
      const camion = await CamionesModel.findById(CicurlationCard);
      if (!camion) {
        return res.status(404).json({ success: false, message: "Camión no encontrado" });
      }
      DieselExisting.CicurlationCard = CicurlationCard;
    }

    // Fecha (opcional)
    if (fecha !== undefined) {
      const nuevaFecha = new Date(fecha);
      if (Number.isNaN(nuevaFecha.getTime())) {
        return res.status(400).json({ success: false, message: "Fecha inválida" });
      }
      DieselExisting.fecha = nuevaFecha;
      DieselExisting.mes = nuevaFecha.getMonth() + 1;
      DieselExisting.ano = nuevaFecha.getFullYear();
    }

    // Galones (opcional)
    if (Galones !== undefined) DieselExisting.Galones = Galones;

    // Total (opcional)
    if (Total !== undefined) DieselExisting.Total = Total;

    // ✅ Estado (opcional)
    if (estado !== undefined) {
      const nuevoEstado = canonEstado(estado);

      // si lo marcas completado, queda bloqueado para siempre
      if (nuevoEstado === ESTADOS.COMPLETADO) {
        DieselExisting.estado = ESTADOS.COMPLETADO;
      } else {
        DieselExisting.estado = ESTADOS.PENDIENTE;
      }
    }

    await DieselExisting.save();
    await DieselExisting.populate("CicurlationCard", "name gasolineLevel licensePlate brand model");

    return res.status(200).json({
      success: true,
      message: "Resumen de diesel actualizado exitosamente",
      data: DieselExisting,
    });
  } catch (error) {
    console.error("Error al actualizar el resumen de diesel:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar el resumen de diesel",
      error: error.message,
    });
  }
};

// ============================
// DELETE /resumen/:id
// ============================
ResumenCon.DeleteResumen = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Id no identificado",
        error: "El id proporcionado no tiene un formato válido",
      });
    }

    const ResumenEliminado = await DieselModel.findByIdAndDelete(id);

    if (!ResumenEliminado) {
      return res.status(404).json({
        success: false,
        message: "Resumen de diesel no encontrado",
        error: `No existe un resumen registrado con el ID: ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resumen de diesel eliminado exitosamente",
      data: {
        id: ResumenEliminado._id,
        Galones_Ingresados: ResumenEliminado.Galones,
        fecha_diesel: ResumenEliminado.fecha,
        costoTotal: ResumenEliminado.Total,
      },
    });
  } catch (error) {
    console.error("Error al eliminar resumen de diesel:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el resumen",
      error: error.message,
    });
  }
};

export default ResumenCon;
