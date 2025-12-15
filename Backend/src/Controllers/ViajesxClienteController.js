import ViajesPorClientes from "../Models/ViajesPorClientes.js";
import Viajes from "../Models/VijaesProInterno.js"


const ViajesxClienteCon = {};

// ============================================
// GET - Obtener reportes
// ============================================

// GET ALL: Obtener reportes mensuales
ViajesxClienteCon.getReportes = async (req, res) => {
  try {
    const { mes, año, estadoPago, estado } = req.query;

    // Si se proporciona mes y año, devolver reporte mensual completo
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

    // Construir filtros para búsqueda general
    const filtros = {};
    if (estadoPago) filtros.estadoPago = estadoPago.toUpperCase();
    if (estado) filtros.estado = estado.toUpperCase();

    // Obtener todos los reportes con filtros
    const reportes = await ViajesPorClientes.find(filtros)
      .populate('clienteId')
      .sort({ año: -1, mes: -1, clienteNombre: 1 });

    res.status(200).json({
      success: true,
      count: reportes.length,
      data: reportes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener reportes",
      error: error.message
    });
  }
};

// GET ONE: Obtener un reporte específico
ViajesxClienteCon.getReporteById = async (req, res) => {
  try {
    const { id } = req.params;

    const reporte = await ViajesPorClientes.findById(id)
      .populate('clienteId')
      .populate('rutas.origen.ubicacionId')
      .populate('rutas.destino.ubicacionId')
      .populate('rutas.viajesIds');

    if (!reporte) {
      return res.status(404).json({
        success: false,
        message: "Reporte no encontrado"
      });
    }

    res.status(200).json({
      success: true,
      data: reporte
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el reporte",
      error: error.message
    });
  }
};

// GET: Obtener reportes con saldo pendiente
ViajesxClienteCon.getReportesPendientes = async (req, res) => {
  try {
    const reportes = await ViajesPorClientes.obtenerConSaldoPendiente();

    const totalPendiente = reportes.reduce(
      (sum, reporte) => sum + (reporte.saldoPendiente || 0), 
      0
    );

    res.status(200).json({
      success: true,
      count: reportes.length,
      totalPendiente: totalPendiente,
      data: reportes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener reportes pendientes",
      error: error.message
    });
  }
};

// ============================================
// POST - Generar reporte desde viajes
// ============================================

ViajesxClienteCon.generarReporte = async (req, res) => {
  try {
     console.log("========== DEBUG ==========");
    console.log("req.method:", req.method);
    console.log("req.url:", req.url);
    console.log("req.headers:", req.headers);
    console.log("req.body:", req.body);
    console.log("typeof req.body:", typeof req.body);
    console.log("===========================");
    // ✅ CAMBIAR: Ahora acepta clienteNombre en lugar de clienteId
    const { clienteNombre, mes, año } = req.body;

    // Validaciones básicas
    if (!clienteNombre || !mes || !año) {
      return res.status(400).json({
        success: false,
        message: "clienteNombre, mes y año son requeridos"
      });
    }

    // Buscar viajes por nombre de cliente
    const primerDia = new Date(año, mes - 1, 1);
    const ultimoDia = new Date(año, mes, 0, 23, 59, 59);

    const viajes = await Viajes.find({
      clienteNombre: clienteNombre.toUpperCase(),
      fecha: { $gte: primerDia, $lte: ultimoDia },
      estado: "COMPLETADO"
    }).sort({ fecha: 1 });

    if (viajes.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No hay viajes para ${clienteNombre} en el periodo especificado`
      });
    }

    // Agrupar viajes por ruta
    const rutasMap = new Map();
    
    viajes.forEach(viaje => {
      const rutaKey = viaje.rutaCompleta;
      
      if (!rutasMap.has(rutaKey)) {
        rutasMap.set(rutaKey, {
          origen: viaje.origen,
          destino: viaje.destino,
          rutaCompleta: viaje.rutaCompleta,
          cantidadViajes: 0,
          montoPorViaje: viaje.monto,
          viajesIds: [],
          primerViaje: viaje.fecha,
          ultimoViaje: viaje.fecha
        });
      }
      
      const ruta = rutasMap.get(rutaKey);
      ruta.cantidadViajes++;
      ruta.viajesIds.push(viaje._id);
      ruta.ultimoViaje = viaje.fecha;
    });
    
    const rutas = Array.from(rutasMap.values());
    
    // Buscar si ya existe el reporte
    let reporte = await ViajesPorClientes.findOne({ 
      clienteNombre: clienteNombre.toUpperCase(), 
      mes, 
      año 
    });
    
    if (reporte) {
      // Actualizar reporte existente
      reporte.rutas = rutas;
      reporte.fechaGeneracion = new Date();
      await reporte.save();
    } else {
      // Crear nuevo reporte
      const reporteId = await ViajesPorClientes.generarReporteId();
      
      reporte = await ViajesPorClientes.create({
        reporteId,
        clienteId: null, // No hay clienteId
        clienteNombre: clienteNombre.toUpperCase(),
        mes: parseInt(mes),
        año: parseInt(año),
        rutas
      });
    }

    res.status(201).json({
      success: true,
      message: "Reporte generado exitosamente",
      data: reporte
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al generar el reporte",
      error: error.message
    });
  }
};

// POST: Generar reportes para todos los clientes de un mes
ViajesxClienteCon.generarReportesMasivo = async (req, res) => {
  try {
    const { mes, año } = req.body;

    if (!mes || !año) {
      return res.status(400).json({
        success: false,
        message: "mes y año son requeridos"
      });
    }


    // Obtener todos los clientes con viajes en ese periodo
    const primerDia = new Date(año, mes - 1, 1);
    const ultimoDia = new Date(año, mes, 0, 23, 59, 59);

    const clientesConViajes = await Viajes.distinct('clienteId', {
      fecha: { $gte: primerDia, $lte: ultimoDia },
      estado: "COMPLETADO",
      clienteId: { $ne: null }
    });

    const reportesGenerados = [];
    const errores = [];

    // Generar reporte para cada cliente
    for (const clienteId of clientesConViajes) {
      try {
        const reporte = await ViajesPorClientes.generarDesdeViajes(
          clienteId,
          parseInt(mes),
          parseInt(año)
        );
        reportesGenerados.push(reporte);
      } catch (error) {
        errores.push({
          clienteId,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Reportes generados: ${reportesGenerados.length}`,
      data: {
        reportesGenerados: reportesGenerados.length,
        errores: errores.length,
        reportes: reportesGenerados,
        erroresDetalle: errores
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al generar reportes masivos",
      error: error.message
    });
  }
};

// ============================================
// PUT - Actualizar reporte
// ============================================

ViajesxClienteCon.updateReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      telefono,
      email,
      notas,
      estado
    } = req.body;

    // Buscar el reporte
    const reporte = await ViajesPorClientes.findById(id);

    if (!reporte) {
      return res.status(404).json({
        success: false,
        message: "Reporte no encontrado"
      });
    }

    // Actualizar campos permitidos
    if (telefono !== undefined) reporte.telefono = telefono;
    if (email !== undefined) reporte.email = email;
    if (notas !== undefined) reporte.notas = notas;
    if (estado) reporte.estado = estado;

    await reporte.save();

    res.status(200).json({
      success: true,
      message: "Reporte actualizado exitosamente",
      data: reporte
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar el reporte",
      error: error.message
    });
  }
};

// PUT: Registrar pago en un reporte
ViajesxClienteCon.registrarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, metodoPago, referencia, notas } = req.body;

    if (!monto) {
      return res.status(400).json({
        success: false,
        message: "El monto es requerido"
      });
    }

    // Buscar el reporte
    const reporte = await ViajesPorClientes.findById(id);

    if (!reporte) {
      return res.status(404).json({
        success: false,
        message: "Reporte no encontrado"
      });
    }

    // Registrar el pago
    await reporte.registrarPago(
      parseFloat(monto),
      metodoPago || "EFECTIVO",
      referencia,
      notas
    );

    res.status(200).json({
      success: true,
      message: "Pago registrado exitosamente",
      data: reporte
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al registrar el pago",
      error: error.message
    });
  }
};

// PUT: Cerrar reporte
ViajesxClienteCon.cerrarReporte = async (req, res) => {
  try {
    const { id } = req.params;

    const reporte = await ViajesPorClientes.findById(id);

    if (!reporte) {
      return res.status(404).json({
        success: false,
        message: "Reporte no encontrado"
      });
    }

    await reporte.cerrarReporte();

    res.status(200).json({
      success: true,
      message: "Reporte cerrado exitosamente",
      data: reporte
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al cerrar el reporte",
      error: error.message
    });
  }
};

// PUT: Regenerar reporte desde viajes
ViajesxClienteCon.regenerarReporte = async (req, res) => {
  try {
    const { id } = req.params;

    const reporteExistente = await ViajesPorClientes.findById(id);

    if (!reporteExistente) {
      return res.status(404).json({
        success: false,
        message: "Reporte no encontrado"
      });
    }

    // Regenerar desde viajes
    const reporteActualizado = await ViajesPorClientes.generarDesdeViajes(
      reporteExistente.clienteId,
      reporteExistente.mes,
      reporteExistente.año
    );

    res.status(200).json({
      success: true,
      message: "Reporte regenerado exitosamente",
      data: reporteActualizado
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al regenerar el reporte",
      error: error.message
    });
  }
};

// ============================================
// DELETE - Eliminar reporte
// ============================================

ViajesxClienteCon.deleteReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { eliminarPermanente } = req.query;

    const reporte = await ViajesPorClientes.findById(id);

    if (!reporte) {
      return res.status(404).json({
        success: false,
        message: "Reporte no encontrado"
      });
    }

    // Eliminar permanentemente
    if (eliminarPermanente === "true") {
      await ViajesPorClientes.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: "Reporte eliminado permanentemente"
      });
    }

    // Desactivar (soft delete)
    reporte.estado = "INACTIVO";
    await reporte.save();

    res.status(200).json({
      success: true,
      message: "Reporte desactivado exitosamente",
      data: reporte
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar el reporte",
      error: error.message
    });
  }
};

export default ViajesxClienteCon;