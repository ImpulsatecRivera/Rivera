import ViajesModel from "../Models/Viajes.js";
import ClientesModel from "../Models/Clientes.js";
import CamionesModel from "../Models/Camiones.js";
import MotoristaModel from "../Models/Motorista.js";
import mongoose from 'mongoose';

const ViajesOperativosController = {};

// =====================================================
// 💰 FUNCIÓN AUXILIAR: Cargar salarios históricos
// =====================================================
const cargarSalariosHistoricos = async (viaje) => {
  try {
    const conductor = await MotoristaModel.findById(viaje.conductorId).select('salario');
    
    if (!viaje.salariosCargados) {
      viaje.salariosCargados = {};
    }
    
    // Guardar salario del conductor
    if (conductor) {
      viaje.salariosCargados.salarioConductor = conductor.salario || null;
    }
    
    // Guardar salarios de auxiliares
    if (viaje.auxiliares && viaje.auxiliares.length > 0) {
      viaje.salariosCargados.salariosAuxiliares = [];
      
      for (const aux of viaje.auxiliares) {
        const auxiliar = await MotoristaModel.findById(aux.auxiliarId).select('salario');
        if (auxiliar) {
          viaje.salariosCargados.salariosAuxiliares.push({
            auxiliarId: aux.auxiliarId,
            salario: auxiliar.salario || null
          });
        }
      }
    }
    
    viaje.salariosCargados.fechaCarga = new Date();
    
    console.log("💰 Salarios históricos cargados para viaje operativo:", viaje._id);
    return viaje;
  } catch (error) {
    console.error("❌ Error cargando salarios históricos:", error);
    return viaje; // Devolver el viaje sin los salarios si hay error
  }
};

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
      auxiliares,
      
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
      metodoPago,

      // Planilla semanal (viaje extra)
      esViajeExtra,
      cantidadViajesExtra,
      montosExtraPersonal,
      
      // Otros
      condiciones,
      observaciones
    } = req.body;

    // ✅ VALIDACIONES
    if (!clienteId || !truckId || !conductorId || !departureTime) {
      return res.status(400).json({
        success: false,
        message: "Campos obligatorios faltantes",
        required: ["clienteId", "truckId", "conductorId", "departureTime"]
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

    // Validar auxiliares si se envían
    if (auxiliares && Array.isArray(auxiliares)) {
      for (const aux of auxiliares) {
        if (!aux.auxiliarId || !mongoose.Types.ObjectId.isValid(aux.auxiliarId)) {
          return res.status(400).json({
            success: false,
            message: "ID de auxiliar inválido"
          });
        }
      }
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

    // Verificar auxiliares si se envían
    if (auxiliares && Array.isArray(auxiliares)) {
      const auxiliaresIds = auxiliares.map(aux => aux.auxiliarId);
      const auxiliaresEncontrados = await MotoristaModel.find({ _id: { $in: auxiliaresIds } });
      if (auxiliaresEncontrados.length !== auxiliaresIds.length) {
        return res.status(404).json({
          success: false,
          message: "Uno o más auxiliares no encontrados"
        });
      }
    }

    // Validar fechas - Soportar date-only (YYYY-MM-DD), datetime-local (YYYY-MM-DDTHH:mm) y UTC timestamp
    const parseLocalDateToUTC = (dateString) => {
      if (!dateString) return null;

      // Si viene en formato date-only (sin tiempo), nos vamos a mediodía local para evitar desfase UTC
      const dateOnlyMatch = dateString.match(/^\d{4}-\d{2}-\d{2}$/);
      if (dateOnlyMatch) {
        const [year, month, day] = dateString.split("-").map((v) => Number(v));
        return new Date(year, month - 1, day, 12, 0, 0, 0);
      }

      // Si ya contiene zona horaria explícita (Z o ±HH:mm), interpretar directo
      if (/[Zz]|[\+\-]\d{2}:?\d{2}$/.test(dateString)) {
        return new Date(dateString);
      }

      // Caso datetime-local sin zona: se interpreta como local y se usa tal cual
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(dateString)) {
        return new Date(dateString);
      }

      // Fallback: dejar que JS parsee el valor
      return new Date(dateString);
    };

    const salidaDate = parseLocalDateToUTC(departureTime);
    const llegadaDate = arrivalTime ? parseLocalDateToUTC(arrivalTime) : null;

    console.log('departureTime recibido del frontend:', departureTime);
    console.log('salidaDate interpretado:', salidaDate.toISOString());
    console.log('salidaDate local:', salidaDate.toString());

    const finalArrivalDate = llegadaDate
      ? new Date(llegadaDate)
      : new Date(salidaDate);

    if (!llegadaDate) {
      finalArrivalDate.setDate(finalArrivalDate.getDate() + 1);
    }

    console.log('arrivalTime recibido del frontend:', arrivalTime);
    console.log('arrivalDate interpretado:', finalArrivalDate.toISOString());

    if (salidaDate >= finalArrivalDate) {
      return res.status(400).json({
        success: false,
        message: "Fecha de salida debe ser anterior a llegada"
      });
    }

    // Validar campos de viaje extra para planilla semanal
    const esViajeExtraNormalizado =
      esViajeExtra === true ||
      esViajeExtra === "true" ||
      esViajeExtra === 1 ||
      esViajeExtra === "1";

    const cantidadViajesExtraNum = Number(cantidadViajesExtra || 0);
    const participantesViaje = [
      String(conductorId),
      ...(Array.isArray(auxiliares) ? auxiliares.map((aux) => String(aux?.auxiliarId || "")).filter(Boolean) : [])
    ];
    const participantesUnicos = [...new Set(participantesViaje)];

    let montosExtraPersonalNormalizado = [];

    if (esViajeExtraNormalizado) {
      if (Array.isArray(montosExtraPersonal) && montosExtraPersonal.length > 0) {
        const mapaMontos = new Map();

        for (const item of montosExtraPersonal) {
          const empleadoId = String(item?.empleadoId || "");
          const monto = Number(item?.monto || 0);

          if (!empleadoId || !participantesUnicos.includes(empleadoId)) {
            return res.status(400).json({
              success: false,
              message: "Todos los montos extra deben corresponder al conductor o auxiliares del viaje"
            });
          }

          mapaMontos.set(empleadoId, Number.isFinite(monto) && monto > 0 ? monto : 0);
        }

        for (const participanteId of participantesUnicos) {
          if (!mapaMontos.has(participanteId)) {
            mapaMontos.set(participanteId, 0);
          }
        }

        montosExtraPersonalNormalizado = participantesUnicos.map((empleadoId) => ({
          empleadoId,
          monto: mapaMontos.get(empleadoId) || 0
        }));
      } else {
        if (!Number.isFinite(cantidadViajesExtraNum) || cantidadViajesExtraNum <= 0) {
          return res.status(400).json({
            success: false,
            message: "La cantidad extra por viaje debe ser mayor a 0 cuando el viaje es extra"
          });
        }

        montosExtraPersonalNormalizado = participantesUnicos.map((empleadoId) => ({
          empleadoId,
          monto: cantidadViajesExtraNum
        }));
      }
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
      auxiliares: auxiliares || [],
      
      // Descripción
      tripDescription: tripDescription || 
        `${rutaCompleta || `${rutaOrigen}/${rutaDestino}`} - ${clienteNombre || cliente.nombre}`,
      
      // Fechas
      departureTime: salidaDate,
      arrivalTime: finalArrivalDate,
      
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
      metodoPago: metodoPago || 'credito',

      // ✅ PLANILLA SEMANAL (VIAJE EXTRA)
      esViajeExtra: esViajeExtraNormalizado,
      cantidadViajesExtra: esViajeExtraNormalizado ? cantidadViajesExtraNum : 0,
      montosExtraPersonal: esViajeExtraNormalizado ? montosExtraPersonalNormalizado : [],
      
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
    console.log("departureTime guardado:", nuevoViaje.departureTime);
    console.log("departureTime ISO:", nuevoViaje.departureTime.toISOString());
    
    // 💰 CARGAR SALARIOS HISTÓRICOS DESPUÉS DE CREAR
    await cargarSalariosHistoricos(nuevoViaje);
    await nuevoViaje.save();
    console.log("💰 Salarios históricos guardados para viaje operativo");

    // =====================================================
    // 🔥 AUTO-APRENDIZAJE: Actualizar rutas frecuentes
    // =====================================================
    try {
      if (rutaOrigen && rutaDestino && cliente.tipoCliente === 'corporativo') {
        console.log("🎓 Actualizando rutas frecuentes del cliente...");
        
        // Normalizar origen y destino
        const origenNormalizado = rutaOrigen.trim().toUpperCase();
        const destinoNormalizado = rutaDestino.trim().toUpperCase();

        // Buscar si la ruta ya existe
        const rutaExistenteIndex = cliente.rutasFrecuentes?.findIndex(
          r => r.origen === origenNormalizado && r.destino === destinoNormalizado
        ) ?? -1;

        if (rutaExistenteIndex !== -1) {
          // 📊 La ruta YA existe: actualizar estadísticas
          console.log(`📈 Ruta existente encontrada: ${origenNormalizado} → ${destinoNormalizado}`);
          
          const rutaActual = cliente.rutasFrecuentes[rutaExistenteIndex];
          
          // Incrementar contador de usos
          rutaActual.vecesUsada += 1;
          rutaActual.ultimoUso = ahora;
          
          console.log(`   • Usos anteriores: ${rutaActual.vecesUsada - 1}`);
          console.log(`   • Usos nuevos: ${rutaActual.vecesUsada}`);
          
          // Actualizar distancia promedio (si viene nueva distancia)
          if (distanciaTotal && distanciaTotal > 0) {
            const totalUsos = rutaActual.vecesUsada;
            const distanciaAnterior = rutaActual.distancia || 0;
            
            const nuevaDistanciaPromedio = Math.round(
              (distanciaAnterior * (totalUsos - 1) + Number(distanciaTotal)) / totalUsos
            );
            
            console.log(`   • Distancia anterior: ${distanciaAnterior} km`);
            console.log(`   • Distancia nueva: ${distanciaTotal} km`);
            console.log(`   • Distancia promedio actualizada: ${nuevaDistanciaPromedio} km`);
            
            rutaActual.distancia = nuevaDistanciaPromedio;
          }

          // Actualizar tiempo estimado (tomar el más reciente si existe)
          if (tiempoEstimado) {
            // Convertir minutos a HH:MM si viene como número
            let tiempoFormateado = tiempoEstimado;
            if (typeof tiempoEstimado === 'number') {
              const horas = Math.floor(tiempoEstimado / 60);
              const minutos = tiempoEstimado % 60;
              tiempoFormateado = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
            }
            
            console.log(`   • Tiempo estimado actualizado: ${tiempoFormateado}`);
            rutaActual.tiempoEstimado = tiempoFormateado;
          }

          // Actualizar monto promedio
          if (montoAcordado && montoAcordado > 0) {
            const totalUsos = rutaActual.vecesUsada;
            const montoAnterior = rutaActual.montoPromedio || 0;
            
            const nuevoMontoPromedio = Math.round(
              ((montoAnterior * (totalUsos - 1) + Number(montoAcordado)) / totalUsos) * 100
            ) / 100;
            
            console.log(`   • Monto anterior: $${montoAnterior}`);
            console.log(`   • Monto nuevo: $${montoAcordado}`);
            console.log(`   • Monto promedio actualizado: $${nuevoMontoPromedio}`);
            
            rutaActual.montoPromedio = nuevoMontoPromedio;
          }

          cliente.rutasFrecuentes[rutaExistenteIndex] = rutaActual;
          
        } else {
          // 🆕 Ruta NUEVA: agregarla
          console.log(`🆕 Nueva ruta agregada: ${origenNormalizado} → ${destinoNormalizado}`);
          
          if (!cliente.rutasFrecuentes) {
            cliente.rutasFrecuentes = [];
          }
          
          // Convertir tiempo estimado si es número
          let tiempoFormateado = tiempoEstimado;
          if (typeof tiempoEstimado === 'number') {
            const horas = Math.floor(tiempoEstimado / 60);
            const minutos = tiempoEstimado % 60;
            tiempoFormateado = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
          }
          
          cliente.rutasFrecuentes.push({
            origen: origenNormalizado,
            destino: destinoNormalizado,
            distancia: Number(distanciaTotal) || 0,
            tiempoEstimado: tiempoFormateado || null,
            vecesUsada: 1,
            ultimoUso: ahora,
            montoPromedio: Number(montoAcordado) || 0,
            frecuencia: 'esporadico'
          });
          
          console.log(`   • Distancia inicial: ${distanciaTotal || 0} km`);
          console.log(`   • Tiempo inicial: ${tiempoFormateado || 'N/A'}`);
          console.log(`   • Monto inicial: $${montoAcordado || 0}`);
        }

        // Guardar cliente con rutas actualizadas
        await cliente.save();
        
        console.log(`✅ Rutas frecuentes actualizadas para ${cliente.nombreComercial || cliente.nombreEmpresa}`);
        console.log(`   • Total de rutas registradas: ${cliente.rutasFrecuentes.length}`);
        
      } else {
        console.log("ℹ️ No se actualizan rutas frecuentes (cliente natural o datos incompletos)");
      }
    } catch (updateError) {
      // Si falla la actualización de rutas, solo logueamos el error
      // pero NO fallamos la creación del viaje
      console.error("⚠️ Error actualizando rutas frecuentes:", updateError);
      console.error("   El viaje se creó correctamente pero las rutas no se actualizaron");
    }

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
    const { fecha, clienteId, estado, limite } = req.query;
    
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
    
    let query = ViajesModel.find(filtros)
      .populate('truckId', 'brand model licensePlate name marca modelo placa nombre')
      .populate('conductorId', 'name phone nombre telefono')
      .populate('clienteOperativo', 'nombre name')
      .sort({ departureTime: 1 });

    const limiteNum = Number.parseInt(limite, 10);
    if (Number.isFinite(limiteNum) && limiteNum > 0) {
      query = query.limit(limiteNum);
    }

    const viajes = await query.lean();
    
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
   console.log('🚀🚀🚀 ENDPOINT LLAMADO: /viajes-operativos/programacion/:fecha 🚀🚀🚀');
  console.log('Fecha recibida:', req.params.fecha);
  try {
    const { fecha } = req.params;
    
    // Parsear la fecha seleccionada (YYYY-MM-DD) en el rango local del día completo
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaInicioLocal = new Date(year, month - 1, day, 0, 0, 0, 0); // 00:00 local
    const fechaFinLocal = new Date(year, month - 1, day + 1, 0, 0, 0, 0); // 00:00 del día siguiente local

    console.log('Fecha inicio local:', fechaInicioLocal.toISOString());
    console.log('Fecha fin local:', fechaFinLocal.toISOString());

    const query = {
      tipoViaje: 'operativo',
      departureTime: {
        $gte: fechaInicioLocal,
        $lt: fechaFinLocal
      }
    };
    console.log('Query de búsqueda:', JSON.stringify(query, null, 2));
    
    const viajes = await ViajesModel.find(query)
  .populate('truckId', 'brand model licensePlate placa marca modelo name nombre')
  .populate('conductorId', 'name nombre')
  .populate('clienteOperativo', 'nombre name')
  .populate('auxiliares.auxiliarId', 'nombre name') // 🔥 NUEVO
  .sort({ departureTime: 1 })
  .lean();
    
    // DEBUG: Mostrar todos los viajes operativos
    const todosOperativos = await ViajesModel.find({ tipoViaje: 'operativo' }).select('departureTime tipoViaje _id').sort({ departureTime: -1 }).limit(20).lean();
    console.log('🔍 === TODOS LOS VIAJES OPERATIVOS (últimos 20) ===');
    todosOperativos.forEach(v => console.log(`${v._id}: ${v.departureTime} (${v.tipoViaje}) - ${v.departureTime.toISOString()}`));
    console.log('===============================================');
    
    console.log('🚛 === VIAJES ENCONTRADOS ===');
    console.log('Total viajes:', viajes.length);
    if (viajes.length > 0) {
      console.log('Primer viaje completo:', JSON.stringify(viajes[0], null, 2));
      console.log('truckId del primer viaje:', viajes[0].truckId);
    }
    console.log('============================');
    
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
      
      // ✅ OBTENER LA PLACA DEL CAMIÓN
      const placaCamion = viaje.truckId?.licensePlate || 
                         viaje.truckId?.placa || 
                         'Sin placa';
      
      const nombreCamion = `${viaje.truckId?.brand || viaje.truckId?.marca || ''} ${viaje.truckId?.model || viaje.truckId?.modelo || ''}`.trim();
      
      console.log('🔍 === DEBUG BACKEND (REDUCE) ===');
      console.log('Cliente:', clienteNombre);
      console.log('viaje.truckId completo:', viaje.truckId);
      console.log('viaje.truckId?.licensePlate:', viaje.truckId?.licensePlate);
      console.log('viaje.truckId?.placa:', viaje.truckId?.placa);
      console.log('Placa del camión (resultado):', placaCamion);
      console.log('Nombre del camión:', nombreCamion);
      console.log('Hora:', hora);
      console.log('================================');
      
      const viajeData = {
        id: viaje._id,
        codigo: camionCodigo,
        hora: hora,
        ruta: viaje.rutaDirecta?.rutaCompleta || 'N/A',
        conductor: viaje.conductorId?.name || viaje.conductorId?.nombre || 'N/A',
        destino: viaje.rutaDirecta?.destino?.nombre || 'N/A',
        estado: viaje.estado?.actual || 'pendiente',
        camion: nombreCamion,
        placa: placaCamion,
        horaSalida: hora,
        auxiliares: (viaje.auxiliares || []).map(aux => ({
          id: aux.auxiliarId?._id || aux.auxiliarId,
          nombre: aux.auxiliarId?.nombre || aux.auxiliarId?.name || 'Auxiliar'
        }))
      };
      
      console.log('📦 Objeto viaje a enviar:', JSON.stringify(viajeData, null, 2));
      console.log('================================');
      
      acc[clienteNombre].viajes.push(viajeData);
      
      return acc;
    }, {});
    
    const programacionArray = Object.values(programacionPorCliente);
    
    console.log('📤 === RESPUESTA FINAL ===');
    console.log('Total clientes:', programacionArray.length);
    console.log('Programación completa:', JSON.stringify(programacionArray, null, 2));
    console.log('==========================');
    
    res.status(200).json({
      success: true,
      data: {
        fecha: fechaInicioLocal.toLocaleDateString('es-ES', {
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
    console.error('❌ Error en obtenerProgramacionDia:', error);
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
    
    if (req.body.llegadaReal) {
      // Parsear llegadaReal con el mismo offset que departureTime
      const llegadaRealUTC = new Date(req.body.llegadaReal);
      const offsetElSalvador = 6 * 60 * 60 * 1000;
      viaje.tiemposReales.llegadaReal = new Date(llegadaRealUTC.getTime() - offsetElSalvador);
    } else {
      viaje.tiemposReales.llegadaReal = viaje.arrivalTime || ahora;
    }
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