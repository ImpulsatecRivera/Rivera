import ViajesModel from "../Models/Viajes.js";
import ClientesModel from "../Models/Clientes.js";
import CamionesModel from "../Models/Camiones.js";
import MotoristaModel from "../Models/Motorista.js";
import mongoose from 'mongoose';

const ViajesOperativosController = {};

// =====================================================
// POST: Crear viaje operativo (como la pizarra)
// =====================================================
ViajesOperativosController.crearViajeOperativo = async (req, res) => {
  try {
    console.log("🚛 === CREAR VIAJE OPERATIVO ===");
    console.log("📝 Body:", req.body);

    const {
      // Cliente corporativo
      clienteId,
      clienteNombre,
      
      // Recursos
      truckId,
      conductorId,
      
      // Código de programación
      codigoProgramacion,
      
      // Descripción
      tripDescription,
      
      // Fechas y horarios
      departureTime,
      arrivalTime,
      
      // Ruta (como en pizarra: "Julio/Ronald", "Enoc/Yamay")
      rutaOrigen,
      rutaDestino,
      rutaCompleta,
      distanciaTotal,
      tiempoEstimado,
      
      // Carga
      cargaDescripcion,
      cargaPeso,
      cargaTipo,
      
      // Monto
      montoAcordado,
      
      // Otros
      condiciones,
      observaciones
    } = req.body;

    // ✅ VALIDACIONES
    if (!clienteId || !truckId || !conductorId || !departureTime || !arrivalTime) {
      return res.status(400).json({
        success: false,
        message: "Campos obligatorios faltantes",
        required: ["clienteId", "truckId", "conductorId", "departureTime", "arrivalTime"]
      });
    }

    // Validar ObjectIds
    if (!mongoose.Types.ObjectId.isValid(clienteId) ||
        !mongoose.Types.ObjectId.isValid(truckId) ||
        !mongoose.Types.ObjectId.isValid(conductorId)) {
      return res.status(400).json({
        success: false,
        message: "IDs inválidos"
      });
    }

    // Verificar que existan
    const [cliente, camion, conductor] = await Promise.all([
      ClientesModel.findById(clienteId),
      CamionesModel.findById(truckId),
      MotoristaModel.findById(conductorId)
    ]);

    if (!cliente || !camion || !conductor) {
      return res.status(404).json({
        success: false,
        message: "Cliente, camión o conductor no encontrado"
      });
    }

    // Validar fechas
    const salidaDate = new Date(departureTime);
    const llegadaDate = new Date(arrivalTime);

    if (salidaDate >= llegadaDate) {
      return res.status(400).json({
        success: false,
        message: "Fecha de salida debe ser anterior a llegada"
      });
    }

    // 📝 CREAR VIAJE OPERATIVO
    const ahora = new Date();
    const estadoInicial = salidaDate <= ahora ? 'en_curso' : 'pendiente';

    const datosViaje = {
      // ✅ TIPO DE VIAJE
      tipoViaje: 'operativo',
      
      // ✅ CLIENTE OPERATIVO
      clienteOperativo: clienteId,
      clienteNombre: clienteNombre || cliente.nombre || cliente.name,
      
      // ✅ CÓDIGO DE PROGRAMACIÓN (como en pizarra)
      codigoProgramacion: codigoProgramacion || `VOP-${Date.now().toString().slice(-6)}`,
      
      // Recursos
      truckId: new mongoose.Types.ObjectId(truckId),
      conductorId: new mongoose.Types.ObjectId(conductorId),
      
      // Descripción
      tripDescription: tripDescription || 
        `${rutaCompleta || `${rutaOrigen}/${rutaDestino}`} - ${clienteNombre || cliente.nombre}`,
      
      // Fechas
      departureTime: salidaDate,
      arrivalTime: llegadaDate,
      
      // ✅ RUTA DIRECTA (sin cotización)
      rutaDirecta: {
        origen: {
          nombre: rutaOrigen || 'ORIGEN',
          coordenadas: {
            lat: null,
            lng: null
          }
        },
        destino: {
          nombre: rutaDestino || 'DESTINO',
          coordenadas: {
            lat: null,
            lng: null
          }
        },
        rutaCompleta: rutaCompleta || `${rutaOrigen}/${rutaDestino}`,
        distanciaTotal: distanciaTotal || 0,
        tiempoEstimado: tiempoEstimado || 0
      },
      
      // ✅ CARGA DIRECTA
      cargaDirecta: {
        descripcion: cargaDescripcion || 'Carga general',
        peso: {
          valor: cargaPeso || 0,
          unidad: 'kg'
        },
        tipo: cargaTipo || 'general'
      },
      
      // ✅ MONTO
      montoAcordado: montoAcordado || 0,
      
      // Estado
      estado: {
        actual: estadoInicial,
        fechaCambio: ahora,
        autoActualizar: true,
        historial: [{
          estadoAnterior: null,
          estadoNuevo: estadoInicial,
          fecha: ahora,
          motivo: 'creacion_operativa',
          observacion: 'Viaje operativo creado desde programación'
        }]
      },
      
      // Tracking
      tracking: {
        ubicacionActual: {
          lat: null,
          lng: null,
          timestamp: ahora
        },
        progreso: {
          porcentaje: 0,
          ultimaActualizacion: ahora,
          calculoAutomatico: true
        },
        checkpoints: []
      },
      
      // Tiempos reales
      tiemposReales: {
        ultimaActualizacion: ahora,
        salidaReal: estadoInicial === 'en_curso' ? ahora : null,
        llegadaReal: null
      },
      
      // Costos
      costosReales: {
        combustible: 0,
        peajes: 0,
        conductor: 0,
        otros: 0,
        total: 0
      },
      
      // Condiciones
      condiciones: {
        clima: condiciones?.clima || 'normal',
        trafico: condiciones?.trafico || 'normal',
        carretera: condiciones?.carretera || 'buena',
        observaciones: observaciones || ''
      },
      
      alertas: []
    };

    console.log("💾 Creando viaje operativo...");
    
    const nuevoViaje = new ViajesModel(datosViaje);
    await nuevoViaje.save();
    
    console.log("✅ Viaje operativo creado:", nuevoViaje._id);

    // Poblar para respuesta
    const viajeCompleto = await ViajesModel.findById(nuevoViaje._id)
      .populate('truckId', 'brand model licensePlate name marca modelo placa nombre')
      .populate('conductorId', 'name phone nombre telefono')
      .populate('clienteOperativo', 'nombre name email');

    res.status(201).json({
      success: true,
      data: {
        viaje: viajeCompleto,
        mensaje: "Viaje operativo creado exitosamente",
        detalles: {
          viajeId: nuevoViaje._id,
          tipo: 'operativo',
          codigo: datosViaje.codigoProgramacion,
          cliente: datosViaje.clienteNombre,
          ruta: datosViaje.rutaDirecta.rutaCompleta,
          estado: estadoInicial
        }
      },
      message: "Viaje operativo programado exitosamente"
    });

  } catch (error) {
    console.error("❌ Error creando viaje operativo:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear viaje operativo",
      error: error.message
    });
  }
};

// =====================================================
// GET: Listar viajes operativos
// =====================================================
ViajesOperativosController.listarViajesOperativos = async (req, res) => {
  try {
    const { fecha, clienteId, estado, limite = 50 } = req.query;
    
    const filtros = { tipoViaje: 'operativo' };
    
    if (fecha) {
      const fechaDate = new Date(fecha);
      const siguienteDia = new Date(fechaDate);
      siguienteDia.setDate(fechaDate.getDate() + 1);
      
      filtros.departureTime = {
        $gte: fechaDate,
        $lt: siguienteDia
      };
    }
    
    if (clienteId) {
      filtros.clienteOperativo = clienteId;
    }
    
    if (estado) {
      filtros['estado.actual'] = estado;
    }
    
    const viajes = await ViajesModel.find(filtros)
      .populate('truckId', 'brand model licensePlate name marca modelo placa nombre')
      .populate('conductorId', 'name phone nombre telefono')
      .populate('clienteOperativo', 'nombre name')
      .sort({ departureTime: 1 })
      .limit(parseInt(limite))
      .lean();
    
    res.status(200).json({
      success: true,
      data: viajes,
      total: viajes.length,
      filtros
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al listar viajes operativos",
      error: error.message
    });
  }
};

// =====================================================
// GET: Vista de programación (como la pizarra)
// =====================================================
ViajesOperativosController.obtenerProgramacionDia = async (req, res) => {
  try {
    const { fecha } = req.params;
    
    const fechaDate = new Date(fecha);
    const siguienteDia = new Date(fechaDate);
    siguienteDia.setDate(fechaDate.getDate() + 1);
    
    const viajes = await ViajesModel.find({
      tipoViaje: 'operativo',
      departureTime: {
        $gte: fechaDate,
        $lt: siguienteDia
      }
    })
    .populate('truckId', 'brand model licensePlate placa marca modelo name nombre')
    .populate('conductorId', 'name nombre')
    .populate('clienteOperativo', 'nombre name')
    .sort({ departureTime: 1 })
    .lean();
    
    // Agrupar por cliente (como en la pizarra)
    const programacionPorCliente = viajes.reduce((acc, viaje) => {
      const clienteNombre = viaje.clienteNombre;
      
      if (!acc[clienteNombre]) {
        acc[clienteNombre] = {
          cliente: clienteNombre,
          viajes: []
        };
      }
      
      const camionCodigo = viaje.codigoProgramacion || 
                          viaje.truckId?.licensePlate || 
                          viaje.truckId?.placa ||
                          'N/A';
      
      const hora = new Date(viaje.departureTime).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      acc[clienteNombre].viajes.push({
        id: viaje._id,
        codigo: camionCodigo,
        hora: hora,
        ruta: viaje.rutaDirecta?.rutaCompleta || 'N/A',
        conductor: viaje.conductorId?.name || viaje.conductorId?.nombre || 'N/A',
        destino: viaje.rutaDirecta?.destino?.nombre || 'N/A',
        estado: viaje.estado?.actual || 'pendiente',
        camion: `${viaje.truckId?.brand || viaje.truckId?.marca || ''} ${viaje.truckId?.model || viaje.truckId?.modelo || ''}`.trim()
      });
      
      return acc;
    }, {});
    
    const programacionArray = Object.values(programacionPorCliente);
    
    res.status(200).json({
      success: true,
      data: {
        fecha: fechaDate.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        programacion: programacionArray,
        totalClientes: programacionArray.length,
        totalViajes: viajes.length
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener programación del día",
      error: error.message
    });
  }
};

// =====================================================
// PUT: Completar todos los viajes operativos
// =====================================================
ViajesOperativosController.completarTodosLosViajes = async (req, res) => {
  try {
    console.log("🔧 === COMPLETAR TODOS LOS VIAJES OPERATIVOS ===");

    const ahora = new Date();

    // Buscar viajes operativos que no estén completados
    const viajesACompletar = await ViajesModel.find({
      tipoViaje: 'operativo',
      'estado.actual': { $in: ['pendiente', 'en_curso', 'retrasado'] }
    });

    console.log(`📊 Encontrados ${viajesACompletar.length} viajes para completar`);

    if (viajesACompletar.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No hay viajes pendientes para completar",
        detalles: {
          encontrados: 0,
          completados: 0
        }
      });
    }

    let completados = 0;

    // Completar cada viaje
    for (const viaje of viajesACompletar) {
      const estadoAnterior = viaje.estado.actual;

      // Actualizar estado
      viaje.estado.actual = 'completado';
      viaje.estado.fechaCambio = ahora;

      // Actualizar tiempos reales
      if (!viaje.tiemposReales.salidaReal) {
        viaje.tiemposReales.salidaReal = viaje.departureTime;
      }
      viaje.tiemposReales.llegadaReal = viaje.arrivalTime || ahora;
      viaje.tiemposReales.ultimaActualizacion = ahora;

      // Calcular tiempo real del viaje en minutos
      if (viaje.tiemposReales.salidaReal && viaje.tiemposReales.llegadaReal) {
        viaje.tiemposReales.tiempoRealViaje = Math.floor(
          (viaje.tiemposReales.llegadaReal - viaje.tiemposReales.salidaReal) / (1000 * 60)
        );
      }

      // Actualizar progreso
      viaje.tracking.progreso.porcentaje = 100;
      viaje.tracking.progreso.ultimaActualizacion = ahora;

      // Agregar al historial
      viaje.estado.historial.push({
        estadoAnterior: estadoAnterior,
        estadoNuevo: 'completado',
        fecha: ahora,
        motivo: 'completado_manual',
        observacion: 'Viaje marcado como completado manualmente',
        override: true
      });

      await viaje.save();
      completados++;
    }

    console.log(`✅ ${completados} viajes completados exitosamente`);

    res.status(200).json({
      success: true,
      message: `${completados} viajes marcados como completados`,
      detalles: {
        encontrados: viajesACompletar.length,
        completados: completados,
        fecha: ahora.toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Error al completar viajes:", error);
    res.status(500).json({
      success: false,
      message: "Error al completar viajes operativos",
      error: error.message
    });
  }
};

// =====================================================
// PUT: Completar un viaje operativo específico
// =====================================================
ViajesOperativosController.completarViajeOperativo = async (req, res) => {
  try {
    const { viajeId } = req.params;

    console.log(`🔧 Completando viaje: ${viajeId}`);

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(viajeId)) {
      return res.status(400).json({
        success: false,
        message: "ID de viaje inválido"
      });
    }

    // Buscar el viaje
    const viaje = await ViajesModel.findOne({
      _id: viajeId,
      tipoViaje: 'operativo'
    });

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje operativo no encontrado"
      });
    }

    // Verificar si ya está completado
    if (viaje.estado.actual === 'completado') {
      return res.status(400).json({
        success: false,
        message: "El viaje ya está completado",
        viaje: {
          id: viaje._id,
          cliente: viaje.clienteNombre,
          estado: viaje.estado.actual
        }
      });
    }

    const ahora = new Date();
    const estadoAnterior = viaje.estado.actual;

    // Actualizar estado
    viaje.estado.actual = 'completado';
    viaje.estado.fechaCambio = ahora;

    // Actualizar tiempos reales
    if (!viaje.tiemposReales.salidaReal) {
      viaje.tiemposReales.salidaReal = viaje.departureTime;
    }
    viaje.tiemposReales.llegadaReal = req.body.llegadaReal 
      ? new Date(req.body.llegadaReal)
      : viaje.arrivalTime || ahora;
    viaje.tiemposReales.ultimaActualizacion = ahora;

    // Calcular tiempo real del viaje
    if (viaje.tiemposReales.salidaReal && viaje.tiemposReales.llegadaReal) {
      viaje.tiemposReales.tiempoRealViaje = Math.floor(
        (viaje.tiemposReales.llegadaReal - viaje.tiemposReales.salidaReal) / (1000 * 60)
      );
    }

    // Actualizar progreso
    viaje.tracking.progreso.porcentaje = 100;
    viaje.tracking.progreso.ultimaActualizacion = ahora;

    // Actualizar costos reales si se proporcionan
    if (req.body.costosReales) {
      viaje.costosReales = {
        combustible: req.body.costosReales.combustible || 0,
        peajes: req.body.costosReales.peajes || 0,
        conductor: req.body.costosReales.conductor || 0,
        otros: req.body.costosReales.otros || 0,
        total: 0
      };
      viaje.costosReales.total = 
        viaje.costosReales.combustible +
        viaje.costosReales.peajes +
        viaje.costosReales.conductor +
        viaje.costosReales.otros;
    }

    // Agregar observaciones si se proporcionan
    if (req.body.observaciones) {
      viaje.condiciones.observaciones = req.body.observaciones;
    }

    // Agregar al historial
    viaje.estado.historial.push({
      estadoAnterior: estadoAnterior,
      estadoNuevo: 'completado',
      fecha: ahora,
      motivo: req.body.motivo || 'completado_manual',
      observacion: req.body.observacion || 'Viaje completado',
      override: true
    });

    await viaje.save();

    console.log(`✅ Viaje ${viajeId} completado exitosamente`);

    // Poblar datos para respuesta
    const viajeCompleto = await ViajesModel.findById(viaje._id)
      .populate('truckId', 'brand model licensePlate name')
      .populate('conductorId', 'name phone')
      .populate('clienteOperativo', 'nombreComercial nombreEmpresa');

    res.status(200).json({
      success: true,
      message: "Viaje completado exitosamente",
      data: {
        viaje: viajeCompleto,
        detalles: {
          id: viaje._id,
          cliente: viaje.clienteNombre,
          ruta: viaje.rutaDirecta.rutaCompleta,
          estadoAnterior: estadoAnterior,
          estadoNuevo: 'completado',
          tiempoReal: viaje.tiemposReales.tiempoRealViaje 
            ? `${viaje.tiemposReales.tiempoRealViaje} minutos` 
            : 'N/A'
        }
      }
    });

  } catch (error) {
    console.error("❌ Error al completar viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al completar viaje operativo",
      error: error.message
    });
  }
};

// =====================================================
// PATCH: Actualizar estado de un viaje operativo
// =====================================================
ViajesOperativosController.actualizarEstado = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { estado } = req.body;

    console.log(`🔄 Actualizando estado del viaje: ${viajeId} a ${estado}`);

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(viajeId)) {
      return res.status(400).json({
        success: false,
        message: "ID de viaje inválido",
      });
    }

    // Validar estado
    const estadosValidos = ["pendiente", "en_curso", "completado", "cancelado", "retrasado"];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: "Estado inválido",
        estadosValidos,
      });
    }

    // Buscar el viaje
    const viaje = await ViajesModel.findOne({
      _id: viajeId,
      tipoViaje: "operativo",
    });

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje operativo no encontrado",
      });
    }

    const ahora = new Date();
    const estadoAnterior = viaje.estado.actual;

    // Actualizar estado
    viaje.estado.actual = estado;
    viaje.estado.fechaCambio = ahora;

    // Agregar al historial
    viaje.estado.historial.push({
      estadoAnterior: estadoAnterior,
      estadoNuevo: estado,
      fecha: ahora,
      motivo: "cambio_manual",
      observacion: `Estado cambiado desde programación: ${estadoAnterior} → ${estado}`,
      override: true,
    });

    // Si cambia a "en_curso" y no tiene salidaReal, asignarla
    if (estado === "en_curso" && !viaje.tiemposReales.salidaReal) {
      viaje.tiemposReales.salidaReal = ahora;
    }

    // Si cambia a "completado", asignar llegadaReal y progreso 100%
    if (estado === "completado") {
      if (!viaje.tiemposReales.salidaReal) {
        viaje.tiemposReales.salidaReal = viaje.departureTime;
      }
      viaje.tiemposReales.llegadaReal = viaje.arrivalTime || ahora;
      viaje.tracking.progreso.porcentaje = 100;
      viaje.tracking.progreso.ultimaActualizacion = ahora;

      // Calcular tiempo real del viaje
      if (viaje.tiemposReales.salidaReal && viaje.tiemposReales.llegadaReal) {
        viaje.tiemposReales.tiempoRealViaje = Math.floor(
          (viaje.tiemposReales.llegadaReal - viaje.tiemposReales.salidaReal) / (1000 * 60)
        );
      }
    }

    viaje.tiemposReales.ultimaActualizacion = ahora;

    await viaje.save();

    console.log(`✅ Estado actualizado: ${estadoAnterior} → ${estado}`);

    // Poblar datos para respuesta
    const viajeCompleto = await ViajesModel.findById(viaje._id)
      .populate("truckId", "brand model licensePlate name")
      .populate("conductorId", "name phone")
      .populate("clienteOperativo", "nombreComercial nombreEmpresa");

    res.status(200).json({
      success: true,
      message: `Estado actualizado a ${estado}`,
      data: {
        viaje: viajeCompleto,
        detalles: {
          id: viaje._id,
          estadoAnterior,
          estadoNuevo: estado,
          cliente: viaje.clienteNombre,
          ruta: viaje.rutaDirecta?.rutaCompleta,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error al actualizar estado:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar estado",
      error: error.message,
    });
  }
};

export default ViajesOperativosController;