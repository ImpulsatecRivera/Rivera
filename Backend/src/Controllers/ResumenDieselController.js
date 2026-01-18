import { isValidObjectId } from "mongoose";
import DieselModel from "../Models/ResumenDiesel.js";
import CamionesModel from "../Models/Camiones.js";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import fs from 'fs/promises';

const ResumenCon = {};

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

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
      estado: m.estado || ESTADOS.PENDIENTE,
      comprobante: m.comprobante || null,
      numeroMarchamo: m.numeroMarchamo || null, // ✅ NUEVO
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
    const { fecha, Galones, Total, CicurlationCard, estado, numeroMarchamo } = req.body; // ✅ AGREGADO numeroMarchamo

    console.log('📥 AGREGAR DIESEL - Datos recibidos:');
    console.log('   - CicurlationCard:', CicurlationCard);
    console.log('   - Galones:', Galones);
    console.log('   - Total:', Total);
    console.log('   - NumeroMarchamo:', numeroMarchamo); // ✅ NUEVO LOG
    console.log('   - hasFile:', !!req.file);

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

    // ✅ SUBIR COMPROBANTE A CLOUDINARY (OPCIONAL)
    let comprobanteUrl = null;
    if (req.file) {
      try {
        console.log('📤 Subiendo comprobante a Cloudinary...');
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "comprobantes_gasolina",
          resource_type: "auto"
        });
        comprobanteUrl = result.secure_url;
        console.log('✅ Comprobante subido:', comprobanteUrl);

        // Eliminar archivo temporal
        await fs.unlink(req.file.path);
      } catch (err) {
        console.warn("⚠️ Error subiendo comprobante:", err.message);
        
        // Intentar eliminar archivo temporal
        if (req.file?.path) {
          try {
            await fs.unlink(req.file.path);
          } catch {}
        }
      }
    }

    const nuevoResumen = new DieselModel({
      CicurlationCard,
      Galones,
      fecha: Fecha_Diesel,
      mes,
      ano,
      Total,
      estado: canonEstado(estado || ESTADOS.PENDIENTE),
      comprobante: comprobanteUrl,
      numeroMarchamo: numeroMarchamo || null, // ✅ NUEVO CAMPO
    });

    await nuevoResumen.save();
    await nuevoResumen.populate("CicurlationCard", "name gasolineLevel licensePlate brand model");

    console.log('✅ Resumen de diesel creado exitosamente');

    // 🚀 ACTUALIZAR NIVEL DE GASOLINA DEL CAMIÓN
    try {
      const galonesNum = parseFloat(Galones) || 0;
      const nivelActual = camion.gasolineLevel || 0;
      
      // 📊 AJUSTA ESTA LÓGICA SEGÚN TU NECESIDAD
      // Opción 1: Incremento fijo por galón (1 galón = 1%)
      const incrementoPorGalon = 1; // Ajusta este valor
      let nuevoNivel = nivelActual + (galonesNum * incrementoPorGalon);
      
      // Opción 2: Basado en capacidad del tanque
      // const capacidadTanque = 100; // galones totales del tanque
      // const porcentajePorGalon = 100 / capacidadTanque;
      // let nuevoNivel = nivelActual + (galonesNum * porcentajePorGalon);
      
      // Limitar entre 0 y 100
      if (nuevoNivel > 100) nuevoNivel = 100;
      if (nuevoNivel < 0) nuevoNivel = 0;

      // Actualizar el nivel en la base de datos
      await CamionesModel.findByIdAndUpdate(CicurlationCard, {
        gasolineLevel: Math.round(nuevoNivel) // Redondear al entero más cercano
      });

      console.log(`⛽ Nivel de gasolina actualizado: ${nivelActual}% → ${Math.round(nuevoNivel)}%`);
      console.log(`   Incremento: +${galonesNum} galones`);

    } catch (updateError) {
      // No fallar si la actualización del nivel falla
      console.warn("⚠️ Error actualizando nivel de gasolina:", updateError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Resumen registrado exitosamente",
      data: nuevoResumen,
    });
  } catch (error) {
    console.error("❌ Error al registrar el resumen del diesel:", error);

    // Limpiar archivo temporal en caso de error
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch {}
    }

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

    const { fecha, Galones, Total, CicurlationCard, estado, numeroMarchamo } = req.body; // ✅ AGREGADO numeroMarchamo

    console.log('📝 ACTUALIZAR DIESEL - Datos recibidos:');
    console.log('   - NumeroMarchamo:', numeroMarchamo); // ✅ NUEVO LOG

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

    // ✅ Número de Marchamo (opcional)
    if (numeroMarchamo !== undefined) {
      DieselExisting.numeroMarchamo = numeroMarchamo && numeroMarchamo.trim() !== '' 
        ? numeroMarchamo.trim() 
        : null;
      console.log('✅ Número de marchamo actualizado:', DieselExisting.numeroMarchamo);
    }

    // ✅ Estado (opcional)
    if (estado !== undefined) {
      const nuevoEstado = canonEstado(estado);
      if (nuevoEstado === ESTADOS.COMPLETADO) {
        DieselExisting.estado = ESTADOS.COMPLETADO;
      } else {
        DieselExisting.estado = ESTADOS.PENDIENTE;
      }
    }

    // ✅ ACTUALIZAR COMPROBANTE (OPCIONAL)
    if (req.file) {
      try {
        console.log('📤 Subiendo nuevo comprobante...');
        
        // Eliminar comprobante anterior de Cloudinary (si existe)
        if (DieselExisting.comprobante) {
          try {
            const urlParts = DieselExisting.comprobante.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const publicId = `comprobantes_gasolina/${fileName.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
            console.log('🗑️ Comprobante anterior eliminado');
          } catch (err) {
            console.warn('⚠️ Error eliminando comprobante anterior:', err.message);
          }
        }

        // Subir nuevo comprobante
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "comprobantes_gasolina",
          resource_type: "auto"
        });
        DieselExisting.comprobante = result.secure_url;
        console.log('✅ Nuevo comprobante subido');

        // Eliminar archivo temporal
        await fs.unlink(req.file.path);
      } catch (err) {
        console.warn("⚠️ Error subiendo comprobante:", err.message);
        
        if (req.file?.path) {
          try {
            await fs.unlink(req.file.path);
          } catch {}
        }
      }
    }

    await DieselExisting.save();
    await DieselExisting.populate("CicurlationCard", "name gasolineLevel licensePlate brand model");

    console.log('✅ Resumen de diesel actualizado exitosamente');

    return res.status(200).json({
      success: true,
      message: "Resumen de diesel actualizado exitosamente",
      data: DieselExisting,
    });
  } catch (error) {
    console.error("❌ Error al actualizar el resumen de diesel:", error);

    // Limpiar archivo temporal
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch {}
    }

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

    // ✅ Eliminar comprobante de Cloudinary (si existe)
    if (ResumenEliminado.comprobante) {
      try {
        const urlParts = ResumenEliminado.comprobante.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `comprobantes_gasolina/${fileName.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
        console.log('🗑️ Comprobante eliminado de Cloudinary');
      } catch (err) {
        console.warn('⚠️ Error eliminando comprobante:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Resumen de diesel eliminado exitosamente",
      data: {
        id: ResumenEliminado._id,
        Galones_Ingresados: ResumenEliminado.Galones,
        fecha_diesel: ResumenEliminado.fecha,
        costoTotal: ResumenEliminado.Total,
        numeroMarchamo: ResumenEliminado.numeroMarchamo || null, // ✅ NUEVO
      },
    });
  } catch (error) {
    console.error("❌ Error al eliminar resumen de diesel:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el resumen",
      error: error.message,
    });
  }
};

export default ResumenCon;