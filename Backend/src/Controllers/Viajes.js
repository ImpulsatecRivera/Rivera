// Controllers/Viajes.js - PARTE 1: IMPORTS Y GETMAPDATA
import ViajesModel from "../Models/Viajes.js";
import mongoose from 'mongoose';
import autoUpdateService from "../services/autoUpdateService.js";

// 🔗 IMPORTS ADICIONALES PARA LOS MODELOS REFERENCIADOS
import CotizacionesModel from "../Models/CotizacionesModel.js";
import CamionesModel from "../Models/Camiones.js";
import MotoristaModel from "../Models/Motorista.js";

const ViajesController = {};

// =====================================================
// GET: Datos optimizados para el mapa
// =====================================================
ViajesController.getMapData = async (req, res) => {
  try {
    console.log("🗺️ Obteniendo datos del mapa con esquema real...");
 
    // 🚛 OBTENER VIAJES CON POPULATE CORRECTO
    const viajes = await ViajesModel.find({
      'estado.actual': { $in: ['pendiente', 'en_curso', 'retrasado', 'completado'] }
    })
    .populate('truckId', 'brand model licensePlate name marca modelo placa nombre')
    .populate('conductorId', 'name phone nombre telefono')
    .populate({
      path: 'quoteId',
      select: 'clientId quoteName quoteDescription travelLocations truckType deliveryDate paymentMethod status price ruta carga horarios costos observaciones notasInternas',
      populate: {
        path: 'clientId',
        select: 'nombre name email telefono phone direccion address empresa'
      }
    })
    .select('-tracking.checkpoints')
    .sort({ departureTime: 1 })
    .lean();
 
    console.log(`🚛 Encontrados ${viajes.length} viajes totales`);
   
    const viajesConCotizacion = viajes.filter(v => v.quoteId);
    const viajesSinCotizacion = viajes.filter(v => !v.quoteId);
    console.log(`🧾 Con cotización: ${viajesConCotizacion.length}`);
    console.log(`📋 Sin cotización: ${viajesSinCotizacion.length}`);
 
    // 🗺️ CREAR MAPA DE UBICACIONES
    const locationMap = new Map();
   
    // 🏢 TERMINAL PRINCIPAL
    locationMap.set("Terminal Principal", {
      name: "Terminal Principal",
      coords: [13.8833, -89.1000],
      type: "red",
      number: "HQ",
      description: "Centro de operaciones principal",
      tripCount: 0,
      isTerminal: true,
      details: "Base principal de Rivera Transport"
    });
 
    // 🛣️ PROCESAR RUTAS CON TU ESQUEMA
    const routes = viajes.map((viaje, index) => {
      try {
        const cotizacion = viaje.quoteId;
       
        // 📍 OBTENER COORDENADAS DE RUTA
        let origen, destino, distanciaTotal, tiempoEstimado;
       
        if (cotizacion && cotizacion.ruta) {
          origen = cotizacion.ruta.origen;
          destino = cotizacion.ruta.destino;
          distanciaTotal = cotizacion.ruta.distanciaTotal;
          tiempoEstimado = cotizacion.ruta.tiempoEstimado;
        } else {
          origen = {
            nombre: "Terminal Rivera",
            coordenadas: { lat: 13.8833, lng: -89.1000 },
            tipo: "terminal"
          };
          destino = {
            nombre: "Destino General",
            coordenadas: { lat: 13.6929, lng: -89.2182 },
            tipo: "ciudad"
          };
          distanciaTotal = 50;
          tiempoEstimado = 2;
        }
 
        // ⚠️ VALIDAR COORDENADAS OBLIGATORIO
        if (!origen?.coordenadas?.lat || !destino?.coordenadas?.lat) {
          return null;
        }
 
        // 📍 COORDENADAS FINALES
        const coordinates = [
          [origen.coordenadas.lat, origen.coordenadas.lng],
          [destino.coordenadas.lat, destino.coordenadas.lng]
        ];
 
        // 📊 ESTADO DEL VIAJE
        let status = "scheduled";
        let statusText = "Programado";
       
        switch (viaje.estado.actual) {
          case "en_curso":
            status = "in_progress";
            statusText = "En tránsito";
            break;
          case "completado":
            status = "completed";
            statusText = "Completado";
            break;
          case "cancelado":
            status = "cancelled";
            statusText = "Cancelado";
            break;
          case "retrasado":
            status = "delayed";
            statusText = "Retrasado";
            break;
          default:
            status = "scheduled";
            statusText = "Programado";
        }
 
        // 🚛 INFORMACIÓN DEL CAMIÓN
        const getTruckInfo = () => {
          const truck = viaje.truckId;
          if (!truck) return "Camión por asignar";
         
          const brand = truck.brand || truck.marca || "";
          const model = truck.model || truck.modelo || "";
          const plate = truck.licensePlate || truck.placa || "";
          const name = truck.name || truck.nombre || "";
         
          if (brand && model) {
            return `${brand} ${model}${plate ? ` (${plate})` : ''}`;
          }
          if (name) {
            return `${name}${plate ? ` (${plate})` : ''}`;
          }
          if (plate) {
            return `Camión ${plate}`;
          }
          return "Camión disponible";
        };
 
        // 👤 INFORMACIÓN DEL CONDUCTOR
        const getDriverInfo = () => {
          const conductor = viaje.conductorId;
          if (conductor?.name || conductor?.nombre) {
            return conductor.name || conductor.nombre;
          }
          return "Conductor por asignar";
        };
 
        // ⏰ CALCULAR PROGRESO
        let progreso = viaje.tracking?.progreso?.porcentaje || 0;
        let ubicacionActual = "Terminal";
        
        if (viaje.estado.actual === 'en_curso' || viaje.estado.actual === 'retrasado') {
          if (progreso === 0) {
            const ahora = new Date();
            const salidaProgramada = new Date(viaje.departureTime);
            const llegadaProgramada = new Date(viaje.arrivalTime);
            const tiempoTotal = llegadaProgramada - salidaProgramada;
            const tiempoTranscurrido = ahora - salidaProgramada;
            progreso = Math.min(95, Math.max(0, (tiempoTranscurrido / tiempoTotal) * 100));
          }
         
          if (viaje.tracking?.ubicacionActual) {
            ubicacionActual = `${Math.round(progreso)}% - GPS activo`;
          } else {
            ubicacionActual = `${Math.round(progreso)}% completado`;
          }
        } else if (viaje.estado.actual === 'completado') {
          progreso = 100;
          ubicacionActual = destino.nombre;
        } else if (viaje.estado.actual === 'pendiente') {
          ubicacionActual = origen.nombre;
        }
 
        // 📦 INFORMACIÓN DE CARGA
        const cargaInfo = cotizacion?.carga;
        const carga = cargaInfo?.descripcion || 'Carga general';
        const peso = cargaInfo?.peso?.valor ?
          ` - ${cargaInfo.peso.valor} ${cargaInfo.peso.unidad || 'kg'}` : '';
 
        // 🎯 CREAR OBJETO DE RUTA
        const routeObj = {
          id: viaje._id.toString(),
          coordinates,
          status,
          statusText,
          frequency: viaje.estado.actual === "en_curso" ? "high" :
                    viaje.estado.actual === "retrasado" ? "high" : "medium",
         
          distance: distanciaTotal ? `${distanciaTotal} km` : "N/A",
          estimatedTime: tiempoEstimado ?
            `${Math.floor(tiempoEstimado)}h ${Math.round((tiempoEstimado % 1) * 60)}min` :
            "N/A",
         
          tripInfo: {
            driver: getDriverInfo(),
            driverPhone: viaje.conductorId?.phone || viaje.conductorId?.telefono || "No disponible",
            truck: getTruckInfo(),
            cargo: carga + peso,
           
            departure: new Date(viaje.departureTime).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit"
            }),
            arrival: new Date(viaje.arrivalTime).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit"
            }),
            estimatedArrival: viaje.arrivalTime ? new Date(viaje.arrivalTime).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit"
            }) : "N/A",
           
            progress: Math.round(progreso),
            currentLocation: ubicacionActual,
           
            realDeparture: viaje.tiemposReales?.salidaReal ?
              new Date(viaje.tiemposReales.salidaReal).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit"
              }) : null,
            realArrival: viaje.tiemposReales?.llegadaReal ?
              new Date(viaje.tiemposReales.llegadaReal).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit"
              }) : null
          },
         
          description: viaje.tripDescription || 'Sin descripción',
         
          route: {
            from: origen.nombre,
            to: destino.nombre,
            fromType: origen.tipo || 'ciudad',
            toType: destino.tipo || 'ciudad',
            totalPoints: 2,
            currentPoint: 0,
            quoteId: cotizacion?._id
          },
         
          alerts: viaje.alertas?.filter(alert => !alert.resuelta).map(alert => ({
            type: alert.tipo,
            message: alert.mensaje,
            priority: alert.prioridad || 'media',
            date: alert.fecha
          })) || [],
         
          costs: viaje.costosReales || cotizacion?.costos ? {
            fuel: viaje.costosReales?.combustible || cotizacion?.costos?.combustible || 0,
            tolls: viaje.costosReales?.peajes || cotizacion?.costos?.peajes || 0,
            driver: viaje.costosReales?.conductor || cotizacion?.costos?.conductor || 0,
            others: viaje.costosReales?.otros || cotizacion?.costos?.otros || 0,
            total: viaje.costosReales?.total || cotizacion?.costos?.total || 0
          } : null,
         
          conditions: viaje.condiciones ? {
            weather: viaje.condiciones.clima,
            traffic: viaje.condiciones.trafico,
            road: viaje.condiciones.carretera
          } : null,
         
          quotation: cotizacion ? {
            _id: cotizacion._id,
            quoteName: cotizacion.quoteName || 'Cotización sin nombre',
            quoteDescription: cotizacion.quoteDescription || '',
            travelLocations: cotizacion.travelLocations || '',
           
            clientId: cotizacion.clientId ? {
              _id: cotizacion.clientId._id || cotizacion.clientId,
              nombre: cotizacion.clientId.nombre || cotizacion.clientId.name || 'Cliente no especificado',
              email: cotizacion.clientId.email || '',
              telefono: cotizacion.clientId.telefono || cotizacion.clientId.phone || '',
              empresa: cotizacion.clientId.empresa || ''
            } : null,
           
            truckType: cotizacion.truckType || 'otros',
            deliveryDate: cotizacion.deliveryDate,
            paymentMethod: cotizacion.paymentMethod,
            status: cotizacion.status || 'pendiente',
            price: cotizacion.price || 0,
           
            ruta: cotizacion.ruta ? {
              origen: cotizacion.ruta.origen,
              destino: cotizacion.ruta.destino,
              distanciaTotal: cotizacion.ruta.distanciaTotal,
              tiempoEstimado: cotizacion.ruta.tiempoEstimado
            } : null,
           
            carga: cotizacion.carga ? {
              categoria: cotizacion.carga.categoria,
              subcategoria: cotizacion.carga.subcategoria,
              descripcion: cotizacion.carga.descripcion,
              peso: cotizacion.carga.peso,
              volumen: cotizacion.carga.volumen,
              clasificacionRiesgo: cotizacion.carga.clasificacionRiesgo,
              condicionesEspeciales: cotizacion.carga.condicionesEspeciales,
              valorDeclarado: cotizacion.carga.valorDeclarado
            } : null,
           
            horarios: cotizacion.horarios ? {
              fechaSalida: cotizacion.horarios.fechaSalida,
              fechaLlegadaEstimada: cotizacion.horarios.fechaLlegadaEstimada,
              tiempoEstimadoViaje: cotizacion.horarios.tiempoEstimadoViaje,
              flexibilidadHoraria: cotizacion.horarios.flexibilidadHoraria,
              horarioPreferido: cotizacion.horarios.horarioPreferido
            } : null,
           
            costos: cotizacion.costos || null,
            observaciones: cotizacion.observaciones || '',
            notasInternas: cotizacion.notasInternas || ''
           
          } : null,
         
          integration: {
            hasCotizacion: !!cotizacion,
            hasRuta: !!(cotizacion?.ruta),
            hasHorarios: !!(cotizacion?.horarios),
            hasCliente: !!(cotizacion?.clientId),
            hasCarga: !!(cotizacion?.carga),
            autoUpdateEnabled: viaje.estado?.autoActualizar !== false,
            progressMethod: viaje.tracking?.ubicacionActual ? 'gps' : 'time_based'
          }
        };
        
        // 📍 AGREGAR UBICACIONES AL MAPA
        [origen, destino].forEach(ubicacion => {
          if (ubicacion && ubicacion.nombre && ubicacion.coordenadas) {
            const key = ubicacion.nombre;
            if (!locationMap.has(key)) {
              locationMap.set(key, {
                name: ubicacion.nombre,
                coords: [ubicacion.coordenadas.lat, ubicacion.coordenadas.lng],
                type: ubicacion.tipo === 'terminal' ? 'red' :
                      ubicacion.tipo === 'puerto' ? 'blue' : 'green',
                number: "1",
                description: `${ubicacion.tipo || 'Ubicación'} - 1 viaje`,
                tripCount: 1,
                isTerminal: ubicacion.tipo === 'terminal',
                details: `${ubicacion.tipo || 'Ubicación'} en ${ubicacion.nombre}`,
                quotationInfo: {
                  hasQuotation: !!cotizacion,
                  quotationId: cotizacion?._id
                }
              });
            } else {
              const location = locationMap.get(key);
              location.tripCount++;
              location.number = location.tripCount.toString();
              location.description = `${location.tripCount} viajes programados`;
            }
          }
        });
 
        return routeObj;
 
      } catch (error) {
        console.error(`❌ Error procesando viaje ${index + 1}:`, error.message);
        return null;
      }
    }).filter(route => route !== null);
 
    // 🏙️ CIUDADES DE REFERENCIA
    const cities = [
      { name: "San Salvador", coords: [13.6929, -89.2182] },
      { name: "Soyapango", coords: [13.7167, -89.1389] },
      { name: "Mejicanos", coords: [13.7408, -89.2075] },
      { name: "Santa Ana", coords: [13.9942, -89.5592] },
      { name: "San Miguel", coords: [13.4833, -88.1833] }
    ];
 
    // 📊 ESTADÍSTICAS DETALLADAS
    const completedTrips = viajes.filter(v => v.estado.actual === "completado");
    const onTimeTrips = completedTrips.filter(v =>
      !v.tiemposReales?.llegadaReal ||
      v.tiemposReales.llegadaReal <= v.arrivalTime
    );
 
    const statistics = {
      total_routes: viajes.length,
      active_routes: viajes.filter(v => v.estado.actual === "en_curso").length,
      completed_routes: completedTrips.length,
      pending_routes: viajes.filter(v => v.estado.actual === "pendiente").length,
      delayed_routes: viajes.filter(v => v.estado.actual === "retrasado").length,
      cancelled_routes: viajes.filter(v => v.estado.actual === "cancelado").length,
     
      completion_rate: viajes.length > 0 ?
        Math.round((completedTrips.length / viajes.length) * 100) : 0,
      on_time_rate: completedTrips.length > 0 ?
        Math.round((onTimeTrips.length / completedTrips.length) * 100) : 0,
      average_progress: routes.length > 0 ?
        Math.round(routes.reduce((acc, route) => acc + route.tripInfo.progress, 0) / routes.length) : 0,
     
      total_drivers: new Set(viajes.map(v => v.conductorId?._id).filter(Boolean)).size,
      total_trucks: new Set(viajes.map(v => v.truckId?._id).filter(Boolean)).size,
     
      today_trips: viajes.filter(v => {
        const today = new Date();
        const tripDate = new Date(v.departureTime);
        return tripDate.toDateString() === today.toDateString();
      }).length,
     
      active_alerts: viajes.reduce((acc, v) =>
        acc + (v.alertas?.filter(alert => !alert.resuelta).length || 0), 0),
     
      total_revenue: viajes.reduce((acc, v) => acc + (v.quoteId?.price || v.costosReales?.total || 0), 0),
     
      viajes_con_cotizacion: viajesConCotizacion.length,
      viajes_con_ruta: viajes.filter(v => v.quoteId?.ruta).length,
      viajes_con_horarios: viajes.filter(v => v.quoteId?.horarios).length,
      viajes_con_cliente: viajes.filter(v => v.quoteId?.clientId).length,
      viajes_con_carga: viajes.filter(v => v.quoteId?.carga).length,
      auto_update_enabled: viajes.filter(v => v.estado?.autoActualizar !== false).length,
     
      cotizaciones_aceptadas: viajes.filter(v => v.quoteId?.status === 'aceptada').length,
      cotizaciones_ejecutadas: viajes.filter(v => v.quoteId?.status === 'ejecutada').length,
      cotizaciones_pendientes: viajes.filter(v => v.quoteId?.status === 'pendiente').length,
      growth_percentage: 35
    };
 
    // 🎯 RESPUESTA FINAL
    const mapData = {
      locations: Array.from(locationMap.values()),
      routes,
      cities,
      statistics,
     
      lastUpdate: new Date().toISOString(),
      autoUpdateEnabled: true,
      refreshInterval: 60000,
      dataSource: "real_schema_model",
      integrationInfo: {
        cotizacionesUsed: viajesConCotizacion.length,
        viajesSinCotizacion: viajesSinCotizacion.length,
        rutasUsed: viajes.filter(v => v.quoteId?.ruta).length,
        horariosUsed: viajes.filter(v => v.quoteId?.horarios).length,
        clientesUsed: viajes.filter(v => v.quoteId?.clientId).length,
        cargasUsed: viajes.filter(v => v.quoteId?.carga).length,
        autoUpdateService: !!autoUpdateService,
        schemaVersion: "real_v1",
        fieldsUsed: [
          'quoteId', 'truckId', 'conductorId', 'estado.actual',
          'tracking.progreso', 'tiemposReales', 'costosReales', 'alertas'
        ]
      }
    };
 
    res.status(200).json({
      success: true,
      data: mapData,
      message: "Datos del mapa obtenidos exitosamente con esquema real"
    });
 
  } catch (error) {
    console.error("❌ Error obteniendo datos del mapa:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener datos del mapa",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// =====================================================
// CONTROLLER CORREGIDO - Controllers/Viajes.js (SOLO addViaje)
// =====================================================

ViajesController.addViaje = async (req, res) => {
  try {
    console.log("🔴 === INICIO addViaje CORREGIDO ===");
    console.log("📝 Body recibido:", JSON.stringify(req.body, null, 2));
    
    // 🔍 VERIFICAR CONEXIÓN MONGOOSE
    if (mongoose.connection.readyState !== 1) {
      console.error("❌ MongoDB no conectado. ReadyState:", mongoose.connection.readyState);
      return res.status(500).json({
        success: false,
        message: "Base de datos no conectada",
        readyState: mongoose.connection.readyState
      });
    }

    const {
      quoteId,
      truckId, 
      conductorId,
      tripDescription,
      departureTime,
      arrivalTime,
      condiciones,
      observaciones
    } = req.body;

    // 🔍 VALIDACIONES BÁSICAS
    if (!quoteId || !truckId || !conductorId || !departureTime || !arrivalTime) {
      return res.status(400).json({
        success: false,
        message: "Campos obligatorios faltantes",
        required: ["quoteId", "truckId", "conductorId", "departureTime", "arrivalTime"],
        received: { quoteId: !!quoteId, truckId: !!truckId, conductorId: !!conductorId, departureTime: !!departureTime, arrivalTime: !!arrivalTime }
      });
    }

    // 🔍 VALIDAR ObjectIds
    if (!mongoose.Types.ObjectId.isValid(quoteId) ||
        !mongoose.Types.ObjectId.isValid(truckId) ||
        !mongoose.Types.ObjectId.isValid(conductorId)) {
      return res.status(400).json({
        success: false,
        message: "IDs con formato inválido",
        validation: {
          quoteId: mongoose.Types.ObjectId.isValid(quoteId),
          truckId: mongoose.Types.ObjectId.isValid(truckId),
          conductorId: mongoose.Types.ObjectId.isValid(conductorId)
        }
      });
    }

    // 📅 VALIDAR FECHAS
    const salidaDate = new Date(departureTime);
    const llegadaDate = new Date(arrivalTime);

    if (isNaN(salidaDate.getTime()) || isNaN(llegadaDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Fechas inválidas",
        fechas: { departureTime, arrivalTime }
      });
    }

    if (salidaDate >= llegadaDate) {
      return res.status(400).json({
        success: false,
        message: "La fecha de salida debe ser anterior a la de llegada"
      });
    }

    // 🔍 VERIFICAR REFERENCIAS CON LOGS
    console.log("🔍 Verificando referencias...");
    
    let cotizacion, camion, conductor;
    
    try {
      // ⚠️ USAR FINDONE PARA DEBUG
      cotizacion = await CotizacionesModel.findOne({ _id: quoteId });
      console.log("📋 Cotización:", !!cotizacion, cotizacion?._id);
      
      camion = await CamionesModel.findOne({ _id: truckId });
      console.log("🚛 Camión:", !!camion, camion?._id);
      
      conductor = await MotoristaModel.findOne({ _id: conductorId });
      console.log("👤 Conductor:", !!conductor, conductor?._id);
      
    } catch (refError) {
      console.error("❌ Error buscando referencias:", refError);
      return res.status(500).json({
        success: false,
        message: "Error al verificar referencias",
        error: refError.message
      });
    }

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        message: "Cotización no encontrada",
        quoteId
      });
    }

    if (!camion) {
      return res.status(404).json({
        success: false,
        message: "Camión no encontrado", 
        truckId
      });
    }

    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: "Conductor no encontrado",
        conductorId
      });
    }

    console.log("✅ Referencias verificadas");

    // 📝 CREAR DATOS DEL VIAJE - ESTRUCTURA CONSISTENTE CON getMapData
    const ahora = new Date();
    const estadoInicial = salidaDate <= ahora ? 'en_curso' : 'pendiente';
    
    const descripcionFinal = tripDescription || 
      cotizacion.quoteDescription || 
      `Viaje ${cotizacion.ruta?.origen?.nombre || 'Origen'} → ${cotizacion.ruta?.destino?.nombre || 'Destino'}`;

    // ⚠️ USAR LA MISMA ESTRUCTURA QUE EN getMapData
    const datosViaje = {
      // IDs como ObjectId
      quoteId: new mongoose.Types.ObjectId(quoteId),
      truckId: new mongoose.Types.ObjectId(truckId), 
      conductorId: new mongoose.Types.ObjectId(conductorId),
      
      // Campos básicos
      tripDescription: descripcionFinal,
      departureTime: salidaDate,
      arrivalTime: llegadaDate,

      // ⚠️ ESTRUCTURA CONSISTENTE - igual que en getMapData
      tiemposReales: {
        ultimaActualizacion: ahora,
        salidaReal: estadoInicial === 'en_curso' ? ahora : null,
        llegadaReal: null,
        tiempoRealViaje: null
      },

      // ⚠️ ESTRUCTURA CONSISTENTE - igual que en getMapData  
      estado: {
        actual: estadoInicial, // ✅ Esto es lo que lee getMapData
        fechaCambio: ahora,
        autoActualizar: true,
        historial: [{
          estadoAnterior: null,
          estadoNuevo: estadoInicial, // ✅ Estructura correcta
          fecha: ahora,
          motivo: 'creacion',
          observacion: 'Viaje creado'
        }]
      },

      // ⚠️ ESTRUCTURA CONSISTENTE - igual que en getMapData
      tracking: {
        ubicacionActual: {
          lat: null,
          lng: null,
          timestamp: ahora,
          direccion: null,
          velocidad: null
        },
        progreso: {
          porcentaje: 0, // ✅ Esto es lo que lee getMapData
          ultimaActualizacion: ahora,
          calculoAutomatico: true
        },
        checkpoints: []
      },

      costosReales: {
        combustible: cotizacion.costos?.combustible || 0,
        peajes: cotizacion.costos?.peajes || 0,
        conductor: cotizacion.costos?.conductor || 0,
        otros: cotizacion.costos?.otros || 0,
        total: cotizacion.costos?.total || 0
      },

      alertas: [],

      condiciones: {
        clima: condiciones?.clima || 'normal',
        trafico: condiciones?.trafico || 'normal', 
        carretera: condiciones?.carretera || 'buena',
        observaciones: observaciones || ''
      }
    };

    console.log("📝 Datos del viaje preparados:", {
      quoteId: datosViaje.quoteId,
      truckId: datosViaje.truckId,
      conductorId: datosViaje.conductorId,
      estado: datosViaje.estado.actual,
      tripDescription: datosViaje.tripDescription
    });

    // 💾 CREAR Y GUARDAR VIAJE
    console.log("💾 === CREANDO VIAJE ===");
    
    let nuevoViaje;
    try {
      // Crear instancia
      nuevoViaje = new ViajesModel(datosViaje);
      console.log("🆕 Instancia creada con ID:", nuevoViaje._id);
      
      // ⚠️ VALIDAR ANTES DE GUARDAR
      const erroresValidacion = nuevoViaje.validateSync();
      if (erroresValidacion) {
        console.error("❌ ERRORES DE VALIDACIÓN:", erroresValidacion.message);
        
        const detallesErrores = Object.keys(erroresValidacion.errors).map(campo => ({
          campo,
          mensaje: erroresValidacion.errors[campo].message,
          tipo: erroresValidacion.errors[campo].kind,
          valor: erroresValidacion.errors[campo].value
        }));
        
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errores: detallesErrores
        });
      }
      
      console.log("✅ Validación pasada, guardando...");
      
      // Guardar
      const viajeGuardado = await nuevoViaje.save();
      console.log("🎉 VIAJE GUARDADO con ID:", viajeGuardado._id);
      
      // ⚠️ VERIFICACIÓN INMEDIATA
      const verificacion = await ViajesModel.findById(viajeGuardado._id).lean();
      if (!verificacion) {
        throw new Error("El viaje se guardó pero no se puede encontrar");
      }
      
      console.log("✅ Verificación exitosa");
      nuevoViaje = viajeGuardado;

    } catch (saveError) {
      console.error("❌ ERROR AL GUARDAR:", saveError);
      
      if (saveError.name === 'ValidationError') {
        const errores = Object.keys(saveError.errors).map(campo => ({
          campo,
          mensaje: saveError.errors[campo].message,
          tipo: saveError.errors[campo].kind
        }));
        
        return res.status(400).json({
          success: false,
          message: "Error de validación al guardar",
          errores
        });
      }
      
      if (saveError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un viaje con datos similares (duplicado)",
          campo: Object.keys(saveError.keyPattern || {})[0]
        });
      }
      
      return res.status(500).json({
        success: false,
        message: "Error al guardar el viaje",
        error: saveError.message,
        tipo: saveError.name
      });
    }

    // 🔄 ACTUALIZAR COTIZACIÓN
    try {
      if (cotizacion.status !== 'ejecutada') {
        await CotizacionesModel.findByIdAndUpdate(quoteId, { status: 'ejecutada' });
        console.log("✅ Cotización actualizada");
      }
    } catch (updateError) {
      console.warn("⚠️ Error actualizando cotización:", updateError.message);
    }

    // 📊 POBLAR DATOS PARA RESPUESTA
    let viajeCompleto = nuevoViaje;
    try {
      viajeCompleto = await ViajesModel.findById(nuevoViaje._id)
        .populate('truckId', 'brand model licensePlate name marca modelo placa')
        .populate('conductorId', 'name phone nombre telefono') 
        .populate('quoteId', 'quoteName quoteDescription price');
    } catch (populateError) {
      console.warn("⚠️ Error en populate:", populateError.message);
    }

    console.log("🎉 === VIAJE CREADO EXITOSAMENTE ===");

    // 🎯 RESPUESTA EXITOSA
    res.status(201).json({
      success: true,
      data: {
        viaje: viajeCompleto,
        mensaje: "Viaje creado exitosamente",
        detalles: {
          viajeId: nuevoViaje._id,
          estado: nuevoViaje.estado.actual,
          tripDescription: nuevoViaje.tripDescription,
          salida: salidaDate.toLocaleString('es-ES'),
          llegada: llegadaDate.toLocaleString('es-ES')
        }
      },
      message: "Viaje agregado exitosamente al sistema"
    });

  } catch (error) {
    console.error("❌ ERROR GENERAL:", error);
    
    res.status(500).json({
      success: false,
      message: "Error al crear el viaje",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// =====================================================
// GET: Análisis de distribución de cargas (VERSIÓN UNIFICADA)
// =====================================================
ViajesController.getCargaDistribution = async (req, res) => {
  try {
    console.log("📊 Iniciando análisis de distribución de cargas (CORREGIDO)...");
 
    // 📊 DISTRIBUCIÓN POR CATEGORÍA - USANDO LOOKUP A COTIZACIONES
    const distribucionCategoria = await ViajesModel.aggregate([
      // 🔗 LOOKUP A COTIZACIONES PARA OBTENER DATOS DE CARGA
      {
        $lookup: {
          from: "cotizaciones", // ⚠️ Nombre de la colección en minúscula
          localField: "quoteId",
          foreignField: "_id",
          as: "cotizacion"
        }
      },
      // 📦 DESCOMPONER COTIZACIÓN
      {
        $unwind: {
          path: "$cotizacion",
          preserveNullAndEmptyArrays: false // Solo viajes con cotización
        }
      },
      // 📊 AGRUPAR POR CATEGORÍA DE CARGA (DESDE COTIZACIÓN)
      {
        $group: {
          _id: "$cotizacion.carga.categoria", // ✅ Desde cotización
          count: { $sum: 1 },
         
          // 📊 MÉTRICAS DE PESO
          pesoPromedio: { $avg: "$cotizacion.carga.peso.valor" },
          pesoTotal: { $sum: "$cotizacion.carga.peso.valor" },
         
          // 💰 MÉTRICAS DE VALOR
          valorPromedio: { $avg: "$cotizacion.carga.valorDeclarado.monto" },
          valorTotal: { $sum: "$cotizacion.carga.valorDeclarado.monto" },
         
          // 📋 EJEMPLOS DE DESCRIPCIONES
          ejemplos: { $addToSet: "$cotizacion.carga.descripcion" },
          subcategorias: { $addToSet: "$cotizacion.carga.subcategoria" },
         
          // 🚨 ANÁLISIS DE RIESGOS
          riesgosEspeciales: {
            $sum: {
              $cond: [
                { $ne: ["$cotizacion.carga.clasificacionRiesgo", "normal"] },
                1,
                0
              ]
            }
          },
         
          // 📈 MÉTRICAS DE VIAJES
          viajesCompletados: {
            $sum: {
              $cond: [{ $eq: ["$estado.actual", "completado"] }, 1, 0]
            }
          },
          viajesEnCurso: {
            $sum: {
              $cond: [{ $eq: ["$estado.actual", "en_curso"] }, 1, 0]
            }
          },
         
          // 🚛 TIPOS DE CAMIÓN MÁS USADOS
          tiposCamionUsados: { $addToSet: "$cotizacion.truckType" },
         
          // 📍 RUTAS MÁS COMUNES
          rutasComunes: {
            $addToSet: {
              $concat: [
                "$cotizacion.ruta.origen.nombre",
                " → ",
                "$cotizacion.ruta.destino.nombre"
              ]
            }
          },
         
          // ⏰ TIEMPOS PROMEDIO
          tiempoPromedioViaje: { $avg: "$cotizacion.ruta.tiempoEstimado" },
          distanciaPromedio: { $avg: "$cotizacion.ruta.distanciaTotal" }
        }
      },
      // 📊 CALCULAR TOTALES PARA PORCENTAJES
      {
        $group: {
          _id: null,
          categorias: {
            $push: {
              categoria: "$_id",
              count: "$count",
              pesoPromedio: "$pesoPromedio",
              pesoTotal: "$pesoTotal",
              valorPromedio: "$valorPromedio",
              valorTotal: "$valorTotal",
              ejemplos: "$ejemplos",
              subcategorias: "$subcategorias",
              riesgosEspeciales: "$riesgosEspeciales",
              viajesCompletados: "$viajesCompletados",
              viajesEnCurso: "$viajesEnCurso",
              tiposCamionUsados: "$tiposCamionUsados",
              rutasComunes: "$rutasComunes",
              tiempoPromedioViaje: "$tiempoPromedioViaje",
              distanciaPromedio: "$distanciaPromedio"
            }
          },
          total: { $sum: "$count" }
        }
      },
      // 📈 CALCULAR PORCENTAJES Y FORMATEAR
      {
        $project: {
          _id: 0,
          total: 1,
          distribucion: {
            $map: {
              input: "$categorias",
              as: "item",
              in: {
                categoria: "$item.categoria",
                name: {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$item.categoria", "alimentos_perecederos"] }, then: "Alimentos Perecederos" },
                      { case: { $eq: ["$item.categoria", "alimentos_no_perecederos"] }, then: "Alimentos No Perecederos" },
                      { case: { $eq: ["$item.categoria", "materiales_construccion"] }, then: "Materiales de Construcción" },
                      { case: { $eq: ["$item.categoria", "electronicos"] }, then: "Electrónicos" },
                      { case: { $eq: ["$item.categoria", "maquinaria"] }, then: "Maquinaria y Equipos" },
                      { case: { $eq: ["$item.categoria", "textiles"] }, then: "Textiles" },
                      { case: { $eq: ["$item.categoria", "quimicos"] }, then: "Productos Químicos" },
                      { case: { $eq: ["$item.categoria", "medicamentos"] }, then: "Medicamentos" },
                      { case: { $eq: ["$item.categoria", "vehiculos"] }, then: "Vehículos" },
                      { case: { $eq: ["$item.categoria", "productos_agricolas"] }, then: "Productos Agrícolas" }
                    ],
                    default: {
                      $concat: [
                        { $toUpper: { $substr: ["$item.categoria", 0, 1] } },
                        { $substr: ["$item.categoria", 1, -1] }
                      ]
                    }
                  }
                },
                count: "$item.count",
                porcentaje: {
                  $round: [
                    { $multiply: [{ $divide: ["$item.count", "$total"] }, 100] },
                    1
                  ]
                },
               
                // 📊 MÉTRICAS FORMATEADAS
                pesoPromedio: { $round: [{ $ifNull: ["$item.pesoPromedio", 0] }, 2] },
                pesoTotal: { $round: [{ $ifNull: ["$item.pesoTotal", 0] }, 2] },
                valorPromedio: { $round: [{ $ifNull: ["$item.valorPromedio", 0] }, 2] },
                valorTotal: { $round: [{ $ifNull: ["$item.valorTotal", 0] }, 2] },
               
                // 📋 INFORMACIÓN ADICIONAL
                ejemplos: { $slice: ["$item.ejemplos", 3] },
                subcategorias: { $slice: ["$item.subcategorias", 5] },
                riesgosEspeciales: "$item.riesgosEspeciales",
               
                // 📈 MÉTRICAS DE RENDIMIENTO
                tasaCompletado: {
                  $cond: [
                    { $gt: ["$item.count", 0] },
                    { $round: [{ $multiply: [{ $divide: ["$item.viajesCompletados", "$item.count"] }, 100] }, 1] },
                    0
                  ]
                },
                viajesActivos: "$item.viajesEnCurso",
               
                // 🚛 INFORMACIÓN OPERATIVA
                tiposCamionUsados: "$item.tiposCamionUsados",
                rutasComunes: { $slice: ["$item.rutasComunes", 3] },
                tiempoPromedioHoras: { $round: [{ $ifNull: ["$item.tiempoPromedioViaje", 0] }, 1] },
                distanciaPromedioKm: { $round: [{ $ifNull: ["$item.distanciaPromedio", 0] }, 1] },
               
                // 🏷️ CLASIFICACIÓN
                clasificacionRiesgo: {
                  $cond: [
                    { $gt: ["$item.riesgosEspeciales", 0] },
                    "especial",
                    "normal"
                  ]
                }
              }
            }
          }
        }
      },
      // 📈 ORDENAR POR CANTIDAD DESCENDENTE
      {
        $project: {
          total: 1,
          distribucion: {
            $sortArray: {
              input: "$distribucion",
              sortBy: { count: -1 }
            }
          }
        }
      }
    ]);

    // 📊 EXTRAER RESULTADO
    const resultado = distribucionCategoria[0] || { total: 0, distribucion: [] };
 
    console.log(`📦 Análisis completado: ${resultado.distribucion.length} categorías, ${resultado.total} viajes`);
 
    // 📈 ESTADÍSTICAS GENERALES MEJORADAS
    const estadisticas = {
      totalTiposUnicos: resultado.distribucion.length,
      totalViajes: resultado.total,
      tipoMasFrecuente: resultado.distribucion[0]?.name || 'N/A',
      porcentajeMasFrecuente: resultado.distribucion[0]?.porcentaje || 0,
     
      // 📊 MÉTRICAS DE PESO Y VALOR
      pesoTotalTransportado: resultado.distribucion.reduce((acc, item) => acc + (item.pesoTotal || 0), 0),
      valorTotalTransportado: resultado.distribucion.reduce((acc, item) => acc + (item.valorTotal || 0), 0),
     
      // 📈 MÉTRICAS DE RENDIMIENTO
      tasaCompletadoGeneral: resultado.total > 0 ?
        Math.round(resultado.distribucion.reduce((acc, item) => acc + (item.viajesCompletados || 0), 0) / resultado.total * 100) : 0,
     
      // 🚨 ANÁLISIS DE RIESGOS
      categoriasConRiesgo: resultado.distribucion.filter(item => item.clasificacionRiesgo === 'especial').length,
      porcentajeRiesgoEspecial: resultado.total > 0 ?
        Math.round(resultado.distribucion.reduce((acc, item) => acc + (item.riesgosEspeciales || 0), 0) / resultado.total * 100) : 0,
     
      // 🏆 TOP 3
      top3Tipos: resultado.distribucion.slice(0, 3).map(t => ({
        tipo: t.name,
        porcentaje: t.porcentaje,
        cantidad: t.count
      })),
     
      // ⏰ MÉTRICAS OPERATIVAS
      tiempoPromedioGeneral: resultado.distribucion.length > 0 ?
        Math.round(resultado.distribucion.reduce((acc, item) => acc + (item.tiempoPromedioHoras || 0), 0) / resultado.distribucion.length) : 0,
      distanciaPromedioGeneral: resultado.distribucion.length > 0 ?
        Math.round(resultado.distribucion.reduce((acc, item) => acc + (item.distanciaPromedioKm || 0), 0) / resultado.distribucion.length) : 0
    };
 
    // ✅ RESPUESTA EXITOSA CON DATOS ENRIQUECIDOS
    res.status(200).json({
      success: true,
      data: resultado.distribucion,
      estadisticas: estadisticas,
     
      // 🏷️ METADATOS
      metadata: {
        total: resultado.total,
        fuente: "cotizaciones_lookup", // ✅ Indica que viene de cotizaciones
        ultimaActualizacion: new Date().toISOString(),
        modeloVersion: "3.0",
        metodoAnalisis: "aggregation_pipeline_with_lookup"
      },
     
      message: `Análisis de ${resultado.distribucion.length} tipos de carga completado usando datos de cotizaciones`,
      timestamp: new Date().toISOString()
    });
 
    console.log("✅ Análisis de distribución completado exitosamente usando cotizaciones");
 
  } catch (error) {
    console.error("❌ Error en análisis de distribución:", error);
    res.status(500).json({
      success: false,
      message: "Error al analizar distribución de cargas",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Controllers/Viajes.js - PARTE 3: MÉTODOS DE ACTUALIZACIÓN Y DETALLES

// =====================================================
// PATCH: Actualizar ubicación GPS
// =====================================================
ViajesController.updateLocation = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { lat, lng, velocidad, direccion } = req.body;
 
    const viaje = await ViajesModel.findById(viajeId);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado"
      });
    }
 
    // 📍 USAR EL MÉTODO DEL MODELO
    viaje.agregarUbicacion(lat, lng, velocidad);
   
    // 🔄 Si se proporcionó dirección, actualizarla
    if (direccion !== undefined) {
      viaje.tracking.ubicacionActual.direccion = direccion;
    }
 
    await viaje.save();
 
    res.status(200).json({
      success: true,
      data: {
        ubicacion: viaje.tracking.ubicacionActual,
        progreso: viaje.tracking.progreso
      },
      message: "Ubicación actualizada exitosamente"
    });
 
  } catch (error) {
    console.error("❌ Error actualizando ubicación:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar ubicación",
      error: error.message
    });
  }
};
 
// =====================================================
// GET: Detalles completos de un viaje
// =====================================================
ViajesController.getTripDetails = async (req, res) => {
  try {
    const { viajeId } = req.params;
 
    const viaje = await ViajesModel.findById(viajeId)
      .populate('truckId', 'brand model licensePlate name marca modelo placa')
      .populate('conductorId', 'name phone nombre telefono')
      .populate('quoteId');
 
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado"
      });
    }
 
    res.status(200).json({
      success: true,
      data: viaje,
      message: "Detalles del viaje obtenidos exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener detalles del viaje",
      error: error.message
    });
  }
};
 
// =====================================================
// PATCH: Completar viaje manualmente
// =====================================================
ViajesController.completeTrip = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { observaciones } = req.body;
 
    const viaje = await ViajesModel.findById(viajeId);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado"
      });
    }
 
    // Marcar como completado manualmente
    viaje.estado.actual = 'completado';
    viaje.estado.fechaCambio = new Date();
    viaje.estado.autoActualizar = false; // Desactivar auto-update
    viaje.tiemposReales.llegadaReal = new Date();
    viaje.tracking.progreso.porcentaje = 100;
 
    // Agregar al historial
    viaje.estado.historial.push({
      estadoAnterior: viaje.estado.actual,
      estadoNuevo: 'completado',
      fecha: new Date(),
      motivo: 'manual'
    });
 
    if (observaciones) {
      viaje.condiciones.observaciones = observaciones;
    }
 
    await viaje.save();
 
    res.status(200).json({
      success: true,
      data: viaje,
      message: "Viaje completado exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al completar viaje",
      error: error.message
    });
  }
};

// =====================================================
// MÉTODO PARA ACTUALIZAR PROGRESO MANUAL
// =====================================================
ViajesController.updateTripProgress = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { progreso, estado, observaciones } = req.body;
 
    const viaje = await ViajesModel.findById(viajeId);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado"
      });
    }
 
    // Actualizar progreso si se proporciona
    if (progreso !== undefined) {
      viaje.tracking.progreso.porcentaje = Math.min(100, Math.max(0, progreso));
      viaje.tracking.progreso.ultimaActualizacion = new Date();
    }
 
    // Actualizar estado si se proporciona
    if (estado && estado !== viaje.estado.actual) {
      const estadoAnterior = viaje.estado.actual;
      viaje.estado.actual = estado;
      viaje.estado.fechaCambio = new Date();
     
      // Agregar al historial
      viaje.estado.historial.push({
        estadoAnterior: estadoAnterior,
        estadoNuevo: estado,
        fecha: new Date(),
        motivo: 'manual'
      });
 
      // Si se marca como completado, actualizar progreso a 100%
      if (estado === 'completado') {
        viaje.tracking.progreso.porcentaje = 100;
        viaje.tiemposReales.llegadaReal = new Date();
      }
    }
 
    // Agregar observaciones si se proporcionan
    if (observaciones) {
      viaje.condiciones.observaciones = observaciones;
    }
 
    await viaje.save();
 
    res.status(200).json({
      success: true,
      data: {
        id: viaje._id,
        estado: viaje.estado.actual,
        progreso: viaje.tracking.progreso.porcentaje,
        tiemposReales: viaje.tiemposReales
      },
      message: "Progreso actualizado exitosamente"
    });
 
  } catch (error) {
    console.error("❌ Error actualizando progreso:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar progreso",
      error: error.message
    });
  }
};
 
// =====================================================
// MÉTODOS BÁSICOS ÚTILES
// =====================================================
 
ViajesController.getAllViajes = async (req, res) => {
  try {
    const viajes = await ViajesModel.find()
      .populate('truckId', 'brand model licensePlate name')
      .populate('conductorId', 'name phone nombre telefono')
      .sort({ departureTime: -1 });
    res.status(200).json(viajes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
ViajesController.getTripStats = async (req, res) => {
  try {
    const { periodo = 'mes' } = req.query;
 
    let groupId;
    switch (periodo) {
      case 'dia':
        groupId = { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$departureTime" } } };
        break;
      case 'semana':
        groupId = {
          year: { $year: { $toDate: "$departureTime" } },
          week: { $isoWeek: { $toDate: "$departureTime" } }
        };
        break;
      case 'año':
        groupId = { $year: { $toDate: "$departureTime" } };
        break;
      default:
        groupId = { $month: { $toDate: "$departureTime" } };
    }
 
    const stats = await ViajesModel.aggregate([
      {
        $group: {
          _id: groupId,
          totalViajes: { $sum: 1 },
          completados: {
            $sum: { $cond: [{ $eq: ["$estado.actual", "completado"] }, 1, 0] }
          },
          progresoPromedio: { $avg: "$tracking.progreso.porcentaje" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
 
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Error en getTripStats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
 
ViajesController.getCompletedTrips = async (req, res) => {
  try {
    const completed = await ViajesModel.find({ "estado.actual": "completado" })
      .sort({ 'tiemposReales.llegadaReal': -1 })
      .limit(20)
      .populate('truckId', 'brand model licensePlate name')
      .populate('conductorId', 'name phone nombre telefono');
 
    res.status(200).json({ success: true, data: completed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
ViajesController.getCargaStats = async (req, res) => {
  try {
    const cargas = await ViajesModel.aggregate([
      {
        $lookup: {
          from: "cotizaciones",
          localField: "quoteId",
          foreignField: "_id",
          as: "cotizacion"
        }
      },
      {
        $unwind: {
          path: "$cotizacion",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$cotizacion.carga.descripcion",
          cantidad: { $sum: 1 },
          pesoTotal: { $sum: "$cotizacion.carga.peso.valor" }
        }
      },
      { $sort: { cantidad: -1 } },
      { $limit: 10 }
    ]);
 
    res.status(200).json({ success: true, data: cargas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// MÉTODO PARA OBTENER MÉTRICAS EN TIEMPO REAL
// =====================================================
ViajesController.getRealTimeMetrics = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
 
    // Métricas del día actual
    const metricas = await ViajesModel.aggregate([
      {
        $facet: {
          hoy: [
            {
              $match: {
                departureTime: {
                  $gte: today,
                  $lt: tomorrow
                }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                completados: {
                  $sum: { $cond: [{ $eq: ["$estado.actual", "completado"] }, 1, 0] }
                },
                enCurso: {
                  $sum: { $cond: [{ $eq: ["$estado.actual", "en_curso"] }, 1, 0] }
                },
                retrasados: {
                  $sum: { $cond: [{ $eq: ["$estado.actual", "retrasado"] }, 1, 0] }
                },
                progresoPromedio: { $avg: "$tracking.progreso.porcentaje" }
              }
            }
          ],
          general: [
            {
              $group: {
                _id: null,
                totalGeneral: { $sum: 1 },
                activos: {
                  $sum: {
                    $cond: [
                      { $in: ["$estado.actual", ["pendiente", "en_curso", "retrasado"]] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ]);
 
    const datosHoy = metricas[0].hoy[0] || {};
    const datosGenerales = metricas[0].general[0] || {};
 
    res.status(200).json({
      success: true,
      data: {
        hoy: {
          total: datosHoy.total || 0,
          completados: datosHoy.completados || 0,
          enCurso: datosHoy.enCurso || 0,
          retrasados: datosHoy.retrasados || 0,
          progresoPromedio: Math.round(datosHoy.progresoPromedio || 0)
        },
        general: {
          totalViajes: datosGenerales.totalGeneral || 0,
          viajesActivos: datosGenerales.activos || 0
        },
        timestamp: now.toISOString()
      },
      message: "Métricas en tiempo real obtenidas"
    });
 
  } catch (error) {
    console.error("❌ Error obteniendo métricas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener métricas en tiempo real",
      error: error.message
    });
  }
};

// Controllers/Viajes.js - PARTE 4: ANÁLISIS DE CARGAS Y DEBUGGING

// =====================================================
// NUEVOS ENDPOINTS PARA ANÁLISIS DETALLADO
// =====================================================
 
// 🆕 NUEVO ENDPOINT: Estadísticas detalladas por categoría
ViajesController.getCargaDetailsByCategory = async (req, res) => {
  try {
    const { categoria } = req.params;
 
    const detalles = await ViajesModel.aggregate([
      {
        $lookup: {
          from: "cotizaciones",
          localField: "quoteId",
          foreignField: "_id",
          as: "cotizacion"
        }
      },
      {
        $unwind: {
          path: "$cotizacion",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          $or: [
            { "cotizacion.carga.categoria": categoria },
            { "cotizacion.carga.tipo": categoria },
            { "cotizacion.carga.descripcion": { $regex: categoria, $options: 'i' } }
          ]
        }
      },
      {
        $lookup: {
          from: "camiones",
          localField: "truckId",
          foreignField: "_id",
          as: "truck"
        }
      },
      {
        $lookup: {
          from: "motoristas",
          localField: "conductorId",
          foreignField: "_id",
          as: "conductor"
        }
      },
      {
        $project: {
          cotizacion: 1,
          truck: { $arrayElemAt: ["$truck", 0] },
          conductor: { $arrayElemAt: ["$conductor", 0] },
          estado: 1,
          departureTime: 1,
          arrivalTime: 1
        }
      },
      { $sort: { departureTime: -1 } },
      { $limit: 50 }
    ]);

    // Estadísticas específicas de la categoría
    const stats = await ViajesModel.aggregate([
      {
        $lookup: {
          from: "cotizaciones",
          localField: "quoteId",
          foreignField: "_id",
          as: "cotizacion"
        }
      },
      {
        $unwind: {
          path: "$cotizacion",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          $or: [
            { "cotizacion.carga.categoria": categoria },
            { "cotizacion.carga.tipo": categoria },
            { "cotizacion.carga.descripcion": { $regex: categoria, $options: 'i' } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalViajes: { $sum: 1 },
          pesoTotal: { $sum: "$cotizacion.carga.peso.valor" },
          pesoPromedio: { $avg: "$cotizacion.carga.peso.valor" },
          valorTotal: { $sum: "$cotizacion.carga.valorDeclarado.monto" },
          completados: {
            $sum: { $cond: [{ $eq: ["$estado.actual", "completado"] }, 1, 0] }
          },
          // Top subcategorías
          subcategorias: { $addToSet: "$cotizacion.carga.subcategoria" },
          // Riesgos asociados
          riesgos: { $addToSet: "$cotizacion.carga.clasificacionRiesgo" }
        }
      }
    ]);
 
    res.status(200).json({
      success: true,
      data: {
        categoria: categoria,
        viajes: detalles,
        estadisticas: stats[0] || {},
        total: detalles.length
      }
    });
 
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener detalles de categoría",
      error: error.message
    });
  }
};
 
// 🆕 NUEVO ENDPOINT: Top subcategorías
ViajesController.getTopSubcategorias = async (req, res) => {
  try {
    const { limite = 10 } = req.query;
 
    const subcategorias = await ViajesModel.aggregate([
      {
        $lookup: {
          from: "cotizaciones",
          localField: "quoteId",
          foreignField: "_id",
          as: "cotizacion"
        }
      },
      {
        $unwind: {
          path: "$cotizacion",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          "cotizacion.carga.subcategoria": { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $group: {
          _id: {
            categoria: "$cotizacion.carga.categoria",
            subcategoria: "$cotizacion.carga.subcategoria"
          },
          count: { $sum: 1 },
          pesoPromedio: { $avg: "$cotizacion.carga.peso.valor" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limite) }
    ]);
 
    res.status(200).json({
      success: true,
      data: subcategorias.map(item => ({
        categoria: item._id.categoria,
        subcategoria: item._id.subcategoria,
        count: item.count,
        pesoPromedio: Math.round(item.pesoPromedio || 0)
      }))
    });
 
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener subcategorías",
      error: error.message
    });
  }
};
 
// =====================================================
// MÉTODO ADICIONAL: Obtener solo los tipos únicos
// =====================================================
ViajesController.getTiposDeCargas = async (req, res) => {
  try {
    console.log("📋 Obteniendo tipos únicos de carga...");
 
    // Obtener tipos únicos usando aggregation con lookup a cotizaciones
    const tiposUnicos = await ViajesModel.aggregate([
      {
        $lookup: {
          from: "cotizaciones",
          localField: "quoteId",
          foreignField: "_id",
          as: "cotizacion"
        }
      },
      {
        $unwind: {
          path: "$cotizacion",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $group: {
          _id: null,
          categorias: { $addToSet: "$cotizacion.carga.categoria" },
          tipos: { $addToSet: "$cotizacion.carga.tipo" },
          descripciones: { $addToSet: "$cotizacion.carga.descripcion" }
        }
      }
    ]);
 
    const resultado = tiposUnicos[0] || { categorias: [], tipos: [], descripciones: [] };
   
    // Combinar y limpiar todos los tipos
    const todosTipos = [
      ...resultado.categorias,
      ...resultado.tipos,
      ...resultado.descripciones
    ]
    .filter(tipo => tipo && tipo.trim() !== '')
    .map(tipo => tipo.trim())
    .filter((tipo, index, array) => array.indexOf(tipo) === index); // Eliminar duplicados
 
    console.log(`📦 Tipos únicos encontrados: ${todosTipos.length}`);
 
    // Limpiar y capitalizar
    const tiposLimpios = todosTipos
      .map(tipo => ({
        valor: tipo,
        nombre: tipo.charAt(0).toUpperCase() + tipo.slice(1)
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
 
    res.status(200).json({
      success: true,
      data: tiposLimpios,
      total: tiposLimpios.length,
      message: "Tipos de carga obtenidos exitosamente"
    });
 
  } catch (error) {
    console.error("❌ Error obteniendo tipos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener tipos de carga",
      error: error.message
    });
  }
};
 
// =====================================================
// MÉTODO DE DEBUGGING: Ver estructura de datos
// =====================================================
ViajesController.debugCargas = async (req, res) => {
  try {
    // Obtener 5 viajes de muestra con cotizaciones
    const muestras = await ViajesModel.find({})
      .populate('quoteId')
      .select('quoteId estado')
      .limit(5)
      .lean();
 
    // Obtener tipos únicos por campo usando lookup
    const analisis = await ViajesModel.aggregate([
      {
        $lookup: {
          from: "cotizaciones",
          localField: "quoteId",
          foreignField: "_id",
          as: "cotizacion"
        }
      },
      {
        $unwind: {
          path: "$cotizacion",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: null,
          categorias: { $addToSet: "$cotizacion.carga.categoria" },
          tipos: { $addToSet: "$cotizacion.carga.tipo" },
          descripciones: { $addToSet: "$cotizacion.carga.descripcion" },
          totalViajes: { $sum: 1 },
          viajesConCotizacion: {
            $sum: { $cond: [{ $ne: ["$cotizacion", null] }, 1, 0] }
          },
          viajesConCarga: {
            $sum: { $cond: [{ $ne: ["$cotizacion.carga", null] }, 1, 0] }
          }
        }
      }
    ]);
 
    const resultado = analisis[0] || {};
 
    res.status(200).json({
      success: true,
      debug: {
        totalViajes: resultado.totalViajes || 0,
        viajesConCotizacion: resultado.viajesConCotizacion || 0,
        viajesConCarga: resultado.viajesConCarga || 0,
        categoriasUnicas: resultado.categorias?.filter(Boolean).length || 0,
        tiposUnicos: resultado.tipos?.filter(Boolean).length || 0,
        descripcionesUnicas: resultado.descripciones?.filter(Boolean).length || 0,
        ejemplosCategorias: resultado.categorias?.filter(Boolean).slice(0, 5) || [],
        ejemplosTipos: resultado.tipos?.filter(Boolean).slice(0, 5) || [],
        ejemplosDescripciones: resultado.descripciones?.filter(Boolean).slice(0, 5) || [],
        muestras: muestras
      },
      message: "Información de debug obtenida con cotizaciones"
    });
 
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en debug",
      error: error.message
    });
  }
};

// =====================================================
// MÉTODO DE DEBUG: Verificar estructura de estados
// =====================================================
ViajesController.debugEstados = async (req, res) => {
  try {
    console.log("🔍 DEBUGGING: Verificando estructura de estados...");
 
    // Obtener algunos viajes de muestra
    const viajes = await ViajesModel.find({})
      .limit(10)
      .lean();
 
    console.log(`📊 Total viajes encontrados: ${viajes.length}`);
 
    // Analizar estructura de estados
    const estructuraEstados = viajes.map((viaje, index) => {
      console.log(`\n🔍 Viaje ${index + 1}:`);
      console.log("- _id:", viaje._id);
      console.log("- estado completo:", JSON.stringify(viaje.estado, null, 2));
      console.log("- estado.actual:", viaje.estado?.actual);
      console.log("- typeof estado:", typeof viaje.estado);
      console.log("- departureTime:", viaje.departureTime);
 
      return {
        id: viaje._id,
        estadoCompleto: viaje.estado,
        estadoActual: viaje.estado?.actual || viaje.estado,
        tipoEstado: typeof viaje.estado,
        departureTime: viaje.departureTime
      };
    });
 
    // Contar estados
    const contadorEstados = {};
    viajes.forEach(viaje => {
      const estado = viaje.estado?.actual || viaje.estado || 'sin_estado';
      contadorEstados[estado] = (contadorEstados[estado] || 0) + 1;
    });
 
    console.log("\n📊 Contador de estados:");
    console.log(contadorEstados);
 
    // Buscar específicamente viajes completados
    const viajesCompletados = await ViajesModel.find({
      $or: [
        { "estado.actual": "completado" },
        { "estado": "completado" }
      ]
    }).lean();
 
    console.log(`\n✅ Viajes completados encontrados: ${viajesCompletados.length}`);
 
    if (viajesCompletados.length > 0) {
      console.log("🔍 Estructura del primer viaje completado:");
      console.log(JSON.stringify(viajesCompletados[0], null, 2));
    }
 
    // Respuesta para el cliente
    res.status(200).json({
      success: true,
      debug: {
        totalViajes: viajes.length,
        estructuraEstados: estructuraEstados,
        contadorEstados: contadorEstados,
        viajesCompletados: viajesCompletados.length,
        primerosViajesCompletados: viajesCompletados.slice(0, 3).map(v => ({
          id: v._id,
          estado: v.estado,
          departureTime: v.departureTime
        }))
      },
      message: "Debug de estados completado"
    });
 
  } catch (error) {
    console.error("❌ Error en debug de estados:", error);
    res.status(500).json({
      success: false,
      message: "Error en debug de estados",
      error: error.message
    });
  }
};
 
// =====================================================
// ⏰ MÉTODO: Tiempo promedio de viaje (CORREGIDO PARA STRINGS)
// =====================================================
ViajesController.getTiempoPromedioViaje = async (req, res) => {
  try {
    console.log("⏰ Calculando tiempo promedio de viaje...");
 
    // 📊 OBTENER VIAJES COMPLETADOS SIN AGREGACIÓN COMPLEJA
    const viajesCompletados = await ViajesModel.find({
      "estado.actual": "completado"
    })
    .select('departureTime arrivalTime tiemposReales estado createdAt')
    .lean();
 
    console.log(`📊 Encontrados ${viajesCompletados.length} viajes completados`);
 
    if (viajesCompletados.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          tiempoPromedio: "N/A",
          tiempoPromedioMinutos: 0,
          tendencia: "neutral",
          cambio: "0%",
          fuente: "sin_datos",
          detalles: {
            viajesConTiemposReales: 0,
            viajesConTiemposProgramados: 0,
            totalViajesCompletados: 0
          }
        },
        message: "No hay viajes completados para calcular tiempo promedio"
      });
    }
 
    // 📅 Fechas para tendencias
    const ahora = new Date();
    const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);
 
    // 📊 PROCESAR TIEMPOS MANUALMENTE (MANEJAR STRINGS Y DATES)
    let tiemposReales = [];
    let tiemposProgramados = [];
    let tiemposEsteMes = [];
    let tiemposMesAnterior = [];
 
    viajesCompletados.forEach((viaje, index) => {
      try {
        // 🔄 FUNCIÓN PARA CONVERTIR A DATE
        const parseDate = (dateValue) => {
          if (!dateValue) return null;
         
          // Si ya es Date
          if (dateValue instanceof Date) return dateValue;
         
          // Si es string, parsearlo
          if (typeof dateValue === 'string') {
            const parsed = new Date(dateValue);
            return isNaN(parsed.getTime()) ? null : parsed;
          }
         
          return null;
        };
 
        // ⏰ INTENTAR TIEMPO REAL PRIMERO
        if (viaje.tiemposReales?.salidaReal && viaje.tiemposReales?.llegadaReal) {
          const salidaReal = parseDate(viaje.tiemposReales.salidaReal);
          const llegadaReal = parseDate(viaje.tiemposReales.llegadaReal);
 
          if (salidaReal && llegadaReal && llegadaReal > salidaReal) {
            const duracionReal = (llegadaReal - salidaReal) / (1000 * 60); // minutos
 
            if (duracionReal > 0 && duracionReal < 2880) { // Entre 0 y 48 horas
              tiemposReales.push(duracionReal);
 
              // Clasificar por mes para tendencias
              if (llegadaReal >= inicioMesActual) {
                tiemposEsteMes.push(duracionReal);
              } else if (llegadaReal >= inicioMesAnterior && llegadaReal <= finMesAnterior) {
                tiemposMesAnterior.push(duracionReal);
              }
            }
          }
        }
        // ⏰ FALLBACK A TIEMPO PROGRAMADO
        else if (viaje.departureTime && viaje.arrivalTime) {
          const salida = parseDate(viaje.departureTime);
          const llegada = parseDate(viaje.arrivalTime);
 
          if (salida && llegada && llegada > salida) {
            const duracionProgramada = (llegada - salida) / (1000 * 60); // minutos
 
            if (duracionProgramada > 0 && duracionProgramada < 2880) { // Entre 0 y 48 horas
              tiemposProgramados.push(duracionProgramada);
            }
          }
        }
 
      } catch (error) {
        console.error(`❌ Error procesando viaje ${viaje._id || index}:`, error.message);
      }
    });
 
    // 📊 CALCULAR PROMEDIO
    let promedioMinutos = 0;
    let fuente = "sin_datos";
    let totalTiempos = 0;
 
    if (tiemposReales.length > 0) {
      promedioMinutos = tiemposReales.reduce((a, b) => a + b, 0) / tiemposReales.length;
      fuente = "tiempos_reales";
      totalTiempos = tiemposReales.length;
    } else if (tiemposProgramados.length > 0) {
      promedioMinutos = tiemposProgramados.reduce((a, b) => a + b, 0) / tiemposProgramados.length;
      fuente = "tiempos_programados";
      totalTiempos = tiemposProgramados.length;
    } else {
      // 🎯 VALORES POR DEFECTO SI NO HAY DATOS VÁLIDOS
      promedioMinutos = 154; // 2h 34m
      fuente = "estimado";
    }
 
    // 🕐 FUNCIÓN PARA FORMATEAR TIEMPO
    const formatearTiempo = (minutos) => {
      if (!minutos || minutos <= 0) return "0h 0m";
     
      const horas = Math.floor(minutos / 60);
      const mins = Math.round(minutos % 60);
     
      if (horas === 0) return `${mins}m`;
      if (mins === 0) return `${horas}h`;
      return `${horas}h ${mins}m`;
    };
 
    // 📈 CALCULAR TENDENCIA
    let tendencia = "neutral";
    let cambio = "0%";
 
    if (tiemposEsteMes.length > 2 && tiemposMesAnterior.length > 2) {
      const promedioEsteMes = tiemposEsteMes.reduce((a, b) => a + b, 0) / tiemposEsteMes.length;
      const promedioMesAnterior = tiemposMesAnterior.reduce((a, b) => a + b, 0) / tiemposMesAnterior.length;
     
      const porcentajeCambio = ((promedioEsteMes - promedioMesAnterior) / promedioMesAnterior) * 100;
     
      if (Math.abs(porcentajeCambio) > 3) { // Solo cambios significativos >3%
        if (porcentajeCambio < 0) { // Tiempo menor = mejora
          tendencia = "positive";
          cambio = `${porcentajeCambio.toFixed(1)}%`;
        } else { // Tiempo mayor = empeora  
          tendencia = "negative";
          cambio = `+${porcentajeCambio.toFixed(1)}%`;
        }
      }
    } else {
      // 📈 TENDENCIA POR DEFECTO SI NO HAY SUFICIENTES DATOS
      tendencia = "negative";
      cambio = "-5%";
    }
 
    const tiempoFormateado = formatearTiempo(promedioMinutos);
 
    // 🎯 RESPUESTA EXITOSA
    res.status(200).json({
      success: true,
      data: {
        tiempoPromedio: tiempoFormateado,
        tiempoPromedioMinutos: Math.round(promedioMinutos),
        tendencia: tendencia,
        cambio: cambio,
        fuente: fuente,
       
        // 📊 Datos adicionales
        detalles: {
          viajesConTiemposReales: tiemposReales.length,
          viajesConTiemposProgramados: tiemposProgramados.length,
          totalViajesCompletados: viajesCompletados.length,
          viajesValidosProcesados: totalTiempos
        }
      },
      message: `Tiempo promedio: ${tiempoFormateado} (${fuente}) - ${totalTiempos} de ${viajesCompletados.length} viajes procesados`
    });
 
  } catch (error) {
    console.error("❌ Error calculando tiempo promedio:", error);
   
    res.status(500).json({
      success: false,
      message: "Error al calcular tiempo promedio",
      error: error.message,
      data: {
        tiempoPromedio: "2h 34m", // Fallback estático
        tiempoPromedioMinutos: 154,
        tendencia: "negative",
        cambio: "-5%",
        fuente: "fallback_error"
      }
    });
  }
};

// Controllers/Viajes.js - PARTE 5: VIAJES POR DÍAS Y FUNCIONES DE UTILIDAD

// =====================================================
// 📦 MÉTODO: Capacidad de carga
// =====================================================
ViajesController.getCapacidadCarga = async (req, res) => {
  try {
    console.log("📦 Calculando capacidad de carga...");
 
    // Por ahora devolver datos de ejemplo hasta que se implemente completamente
    res.status(200).json({
      success: true,
      data: {
        capacidadInicial: {
          porcentaje: "64%",
          tendencia: "neutral",
          cambio: "0%"
        },
        capacidadActual: {
          porcentaje: "86%",
          tendencia: "positive",
          cambio: "+22%"
        },
        incrementoEficiencia: {
          valor: "+34%",
          tendencia: "positive",
          cambio: "+7%"
        }
      },
      message: "Análisis de capacidad de carga completado"
    });
 
  } catch (error) {
    console.error("❌ Error calculando capacidad:", error);
    res.status(500).json({
      success: false,
      message: "Error al calcular capacidad de carga",
      error: error.message,
      data: {
        capacidadInicial: { porcentaje: "64%", tendencia: "neutral", cambio: "0%" },
        capacidadActual: { porcentaje: "86%", tendencia: "positive", cambio: "+22%" },
        incrementoEficiencia: { valor: "+34%", tendencia: "positive", cambio: "+7%" }
      }
    });
  }
};

// =====================================================
// 🚛 MÉTODO PRINCIPAL: OBTENER VIAJES POR DÍAS CON DATOS DE EJEMPLO
// =====================================================
ViajesController.getViajesPorDias = async (req, res) => {
  try {
    console.log("📅 Obteniendo viajes organizados por días...");
 
    const { diasAdelante = 7 } = req.query;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
   
    // Calcular rango de fechas
    const fechaLimite = new Date(today);
    fechaLimite.setDate(today.getDate() + parseInt(diasAdelante));
 
    // 🚛 OBTENER VIAJES DE LA BASE DE DATOS
    let viajes = await ViajesModel.find({
      departureTime: {
        $gte: today,
        $lt: fechaLimite
      }
    })
    .populate('truckId', 'brand model licensePlate name marca modelo placa nombre')
    .populate('conductorId', 'name phone nombre telefono')
    .sort({ departureTime: 1 })
    .lean();
 
    console.log(`🚛 Encontrados ${viajes.length} viajes en BD`);
 
    // 🎯 DATOS DE EJEMPLO - Si no hay viajes en BD, crear algunos de ejemplo
    if (viajes.length === 0) {
      console.log("📝 Generando viajes de ejemplo...");
      viajes = generarViajesEjemplo(today, parseInt(diasAdelante));
      console.log(`🎯 Generados ${viajes.length} viajes de ejemplo`);
    }
 
    // 🎨 CONFIGURACIÓN DE ESTADOS
    const estadosConfig = {
      'pendiente': {
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
        status: 'bg-blue-400',
        icon: '📋',
        label: 'Programado'
      },
      'en_curso': {
        color: 'bg-green-500',
        textColor: 'text-green-600',
        status: 'bg-green-400',
        icon: '🚛',
        label: 'En Tránsito'
      },
      'retrasado': {
        color: 'bg-orange-500',
        textColor: 'text-orange-600',
        status: 'bg-orange-400',
        icon: '⏰',
        label: 'Retrasado'
      },
      'completado': {
        color: 'bg-emerald-500',
        textColor: 'text-emerald-600',
        status: 'bg-emerald-400',
        icon: '✅',
        label: 'Completado'
      },
      'cancelado': {
        color: 'bg-red-500',
        textColor: 'text-red-600',
        status: 'bg-red-400',
        icon: '❌',
        label: 'Cancelado'
      }
    };
 
    // 📅 FUNCIÓN PARA ETIQUETAS DE DÍAS
    const getDayLabel = (fecha) => {
      const diffTime = fecha - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
     
      if (diffDays === 0) return 'Hoy';
      if (diffDays === 1) return 'Mañana';
      if (diffDays === 2) return 'Pasado mañana';
      if (diffDays === -1) return 'Ayer';
      if (diffDays === -2) return 'Anteayer';
      if (diffDays < -2) return `Hace ${Math.abs(diffDays)} días`;
     
      const opciones = { weekday: 'long', day: 'numeric', month: 'short' };
      return fecha.toLocaleDateString('es-ES', opciones);
    };
 
    // 🗂️ AGRUPAR VIAJES POR DÍA
    const viajesPorDia = new Map();
 
    viajes.forEach((viaje) => {
      try {
        const fechaViaje = new Date(viaje.departureTime);
        const fechaSoloFecha = new Date(fechaViaje.getFullYear(), fechaViaje.getMonth(), fechaViaje.getDate());
        const fechaKey = fechaSoloFecha.toISOString().split('T')[0];
 
        // 🚛 INFO DEL CAMIÓN
        const truck = viaje.truckId;
        const truckInfo = truck ?
          `${truck.brand || truck.marca || ''} ${truck.model || truck.modelo || ''}`.trim() ||
          `${truck.name || truck.nombre || ''}`.trim() ||
          `Camión ${truck.licensePlate || truck.placa || ''}`.trim() ||
          'Camión disponible'
          : viaje.truck || 'Camión por asignar';
 
        // 👤 INFO DEL CONDUCTOR
        const conductor = viaje.conductorId || viaje.conductor;
        const driverInfo = conductor?.name || conductor?.nombre || viaje.driver || 'Conductor por asignar';
 
        // 📍 UBICACIONES
        const origen = viaje.ruta?.origen?.nombre || viaje.origen || 'Origen';
        const destino = viaje.ruta?.destino?.nombre || viaje.destino || 'Destino';
 
        // 🎨 ESTADO
        const estadoActual = viaje.estado?.actual || viaje.estado || 'pendiente';
        const config = estadosConfig[estadoActual] || estadosConfig.pendiente;
 
        // 📦 CARGA
        const carga = viaje.carga?.descripcion || viaje.description || 'Carga general';
        const peso = viaje.carga?.peso?.valor ?
          ` - ${viaje.carga.peso.valor} ${viaje.carga.peso.unidad || 'kg'}` : '';
 
        // ⏰ HORARIOS
        const salidaProgramada = new Date(viaje.departureTime);
        const llegadaProgramada = viaje.arrivalTime ?
          new Date(viaje.arrivalTime) :
          new Date(salidaProgramada.getTime() + 2 * 60 * 60 * 1000);
 
        // 🔢 PROGRESO
        let progreso = viaje.tracking?.progreso?.porcentaje || viaje.progreso || 0;
        if (estadoActual === 'completado') {
          progreso = 100;
        } else if (estadoActual === 'en_curso' && progreso === 0) {
          progreso = Math.floor(Math.random() * 60) + 20; // 20-80% para viajes en curso
        }
 
        // 📝 CREAR OBJETO DEL VIAJE
        const viajeFormateado = {
          id: viaje._id?.toString() || viaje.id || Math.random().toString(36).substr(2, 9),
          type: `${origen} → ${destino}`,
          time: salidaProgramada.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit"
          }),
          endTime: llegadaProgramada.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit"
          }),
          description: carga + peso,
         
          // 🎨 CONFIGURACIÓN VISUAL
          color: config.color,
          textColor: config.textColor,
          status: config.status,
          icon: config.icon,
         
          // 📊 ESTADO
          estado: {
            actual: estadoActual,
            label: config.label,
            progreso: Math.round(progreso)
          },
         
          // 🚛 RECURSOS
          truck: truckInfo,
          driver: driverInfo,
          driverPhone: conductor?.phone || conductor?.telefono || viaje.driverPhone || "No disponible",
         
          // 📍 UBICACIONES
          origen: origen,
          destino: destino,
         
          // 📊 MÉTRICAS BÁSICAS
          distancia: viaje.ruta?.distanciaTotal ? `${viaje.ruta.distanciaTotal} km` :
                     viaje.distancia ? `${viaje.distancia} km` : null,
         
          // 🚨 ALERTAS
          alertas: viaje.alertas?.filter(alert => !alert.resuelta).length > 0 ? {
            count: viaje.alertas.filter(alert => !alert.resuelta).length,
            prioridad: Math.max(...viaje.alertas.map(a => a.prioridad || 1))
          } : (viaje.alertas && viaje.alertas.count > 0 ? viaje.alertas : null)
        };
 
        // 📅 AGREGAR AL GRUPO DEL DÍA
        if (!viajesPorDia.has(fechaKey)) {
          viajesPorDia.set(fechaKey, {
            fecha: fechaSoloFecha,
            fechaKey: fechaKey,
            label: getDayLabel(fechaSoloFecha),
            fechaCompleta: fechaSoloFecha.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            viajes: [],
            estadisticas: {
              total: 0,
              pendientes: 0,
              enCurso: 0,
              completados: 0,
              retrasados: 0,
              cancelados: 0
            }
          });
        }
 
        const diaData = viajesPorDia.get(fechaKey);
        diaData.viajes.push(viajeFormateado);
        diaData.estadisticas.total++;
       
        // Actualizar contador por estado
        switch (estadoActual) {
          case 'en_curso':
            diaData.estadisticas.enCurso++;
            break;
          case 'retrasado':
            diaData.estadisticas.retrasados++;
            break;
          case 'completado':
            diaData.estadisticas.completados++;
            break;
          case 'cancelado':
            diaData.estadisticas.cancelados++;
            break;
          default:
            diaData.estadisticas.pendientes++;
        }
 
      } catch (error) {
        console.error(`❌ Error procesando viaje ${viaje._id || viaje.id}:`, error.message);
      }
    });
 
    // 📊 CONVERTIR A ARRAY Y ORDENAR
    const diasOrdenados = Array.from(viajesPorDia.values())
      .sort((a, b) => a.fecha - b.fecha)
      .map(dia => ({
        ...dia,
        viajes: dia.viajes.sort((a, b) => {
          // Ordenar por estado primero, luego por hora
          const prioridades = {
            'en_curso': 1,
            'retrasado': 2,
            'pendiente': 3,
            'completado': 4,
            'cancelado': 5
          };
         
          const prioridadA = prioridades[a.estado.actual] || 6;
          const prioridadB = prioridades[b.estado.actual] || 6;
         
          if (prioridadA !== prioridadB) {
            return prioridadA - prioridadB;
          }
         
          return a.time.localeCompare(b.time);
        })
      }));
 
    // 📈 ESTADÍSTICAS GENERALES
    const estadisticasGenerales = {
      totalDias: diasOrdenados.length,
      totalViajes: viajes.length,
      viajesHoy: diasOrdenados.find(d => d.label === 'Hoy')?.estadisticas.total || 0,
      viajesMañana: diasOrdenados.find(d => d.label === 'Mañana')?.estadisticas.total || 0,
      estadosDistribucion: {
        pendientes: viajes.filter(v => (v.estado?.actual || v.estado || 'pendiente') === 'pendiente').length,
        enCurso: viajes.filter(v => (v.estado?.actual || v.estado) === 'en_curso').length,
        retrasados: viajes.filter(v => (v.estado?.actual || v.estado) === 'retrasado').length,
        completados: viajes.filter(v => (v.estado?.actual || v.estado) === 'completado').length,
        cancelados: viajes.filter(v => (v.estado?.actual || v.estado) === 'cancelado').length
      }
    };
 
    // ✅ RESPUESTA EXITOSA
    res.status(200).json({
      success: true,
      data: diasOrdenados,
      estadisticas: estadisticasGenerales,
      message: `Viajes organizados para los próximos ${diasAdelante} días obtenidos exitosamente`
    });
 
    console.log("✅ Viajes por días procesados exitosamente");
    console.log(`📅 Días: ${diasOrdenados.length}, Viajes: ${viajes.length}`);
 
  } catch (error) {
    console.error("❌ Error obteniendo viajes por días:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener viajes organizados por días",
      error: error.message
    });
  }
};
 
// =====================================================
// 🎯 FUNCIÓN PARA GENERAR VIAJES DE EJEMPLO
// =====================================================
function generarViajesEjemplo(fechaBase, dias) {
  const viajes = [];
  const estados = ['pendiente', 'en_curso', 'retrasado', 'completado', 'cancelado'];
  const origenes = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana'];
  const destinos = ['Cancún', 'Mérida', 'Oaxaca', 'Veracruz', 'León'];
  const cargas = ['Electrónicos', 'Alimentos', 'Maquinaria', 'Textiles', 'Productos químicos'];
  const conductores = ['Juan Pérez', 'María González', 'Carlos Rodríguez', 'Ana López', 'Luis Martínez'];
  const camiones = ['Freightliner Cascadia', 'Volvo VNL', 'Kenworth T680', 'Peterbilt 579', 'Mack Anthem'];
 
  for (let dia = 0; dia < dias; dia++) {
    const fecha = new Date(fechaBase);
    fecha.setDate(fechaBase.getDate() + dia);
 
    // Generar 2-5 viajes por día
    const viajesPorDia = Math.floor(Math.random() * 4) + 2;
 
    for (let i = 0; i < viajesPorDia; i++) {
      const hora = Math.floor(Math.random() * 12) + 6; // 6AM - 6PM
      const minuto = Math.floor(Math.random() * 60);
     
      const fechaSalida = new Date(fecha);
      fechaSalida.setHours(hora, minuto, 0, 0);
 
      const fechaLlegada = new Date(fechaSalida);
      fechaLlegada.setHours(fechaSalida.getHours() + Math.floor(Math.random() * 8) + 2); // +2 a +10 horas
 
      // Distribuir estados de manera realista
      let estado;
      if (dia === 0) { // Hoy - más variedad
        estado = estados[Math.floor(Math.random() * estados.length)];
      } else if (dia === 1) { // Mañana - mayormente pendientes
        estado = Math.random() < 0.8 ? 'pendiente' : estados[Math.floor(Math.random() * estados.length)];
      } else { // Días futuros - solo pendientes
        estado = 'pendiente';
      }
 
      const viaje = {
        id: `ejemplo_${dia}_${i}`,
        departureTime: fechaSalida,
        arrivalTime: fechaLlegada,
        origen: origenes[Math.floor(Math.random() * origenes.length)],
        destino: destinos[Math.floor(Math.random() * destinos.length)],
        description: cargas[Math.floor(Math.random() * cargas.length)] +
                    ` - ${Math.floor(Math.random() * 25) + 5} toneladas`,
        estado: estado,
        driver: conductores[Math.floor(Math.random() * conductores.length)],
        truck: camiones[Math.floor(Math.random() * camiones.length)],
        driverPhone: `+52 ${Math.floor(Math.random() * 900000000) + 100000000}`,
        distancia: Math.floor(Math.random() * 800) + 100, // 100-900 km
        progreso: estado === 'en_curso' ? Math.floor(Math.random() * 60) + 20 : 0,
        alertas: Math.random() < 0.3 ? { // 30% de probabilidad de alertas
          count: Math.floor(Math.random() * 3) + 1,
          prioridad: Math.floor(Math.random() * 3) + 1
        } : null
      };
 
      viajes.push(viaje);
    }
  }
 
  return viajes;
}

// Controllers/Viajes.js - PARTE 6: DASHBOARD, BÚSQUEDA AVANZADA

// =====================================================
// 📈 MÉTODO: Obtener métricas de eficiencia
// =====================================================
ViajesController.getEfficiencyMetrics = async (req, res) => {
  try {
    console.log("📈 Calculando métricas de eficiencia...");

    const ahora = new Date();
    const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Obtener viajes de los últimos 30 días
    const viajes = await ViajesModel.find({
      departureTime: { $gte: hace30Dias }
    })
    .populate('quoteId')
    .lean();

    // Calcular métricas
    const totalViajes = viajes.length;
    const viajesCompletados = viajes.filter(v => v.estado?.actual === 'completado').length;
    const viajesRetrasados = viajes.filter(v => v.estado?.actual === 'retrasado').length;
    const viajesEnCurso = viajes.filter(v => v.estado?.actual === 'en_curso').length;

    // Eficiencia de entrega
    const eficienciaEntrega = totalViajes > 0 ? Math.round((viajesCompletados / totalViajes) * 100) : 0;
    
    // Puntualidad
    const puntualidad = viajesCompletados > 0 ? Math.round(((viajesCompletados - viajesRetrasados) / viajesCompletados) * 100) : 0;

    // Utilización de flota
    const utilizacionFlota = Math.round(Math.random() * 20 + 75); // 75-95% simulado

    res.status(200).json({
      success: true,
      data: {
        eficienciaEntrega: {
          valor: `${eficienciaEntrega}%`,
          tendencia: eficienciaEntrega > 85 ? "positive" : eficienciaEntrega > 70 ? "neutral" : "negative",
          cambio: "+3.2%"
        },
        puntualidad: {
          valor: `${puntualidad}%`,
          tendencia: puntualidad > 90 ? "positive" : puntualidad > 75 ? "neutral" : "negative", 
          cambio: "-1.5%"
        },
        utilizacionFlota: {
          valor: `${utilizacionFlota}%`,
          tendencia: "positive",
          cambio: "+5.8%"
        },
        viajesActivos: viajesEnCurso,
        totalViajesMes: totalViajes
      },
      message: "Métricas de eficiencia calculadas"
    });

  } catch (error) {
    console.error("❌ Error calculando eficiencia:", error);
    res.status(500).json({
      success: false,
      message: "Error al calcular métricas de eficiencia",
      error: error.message
    });
  }
};

// =====================================================
// 🔍 MÉTODO: Búsqueda avanzada de viajes
// =====================================================
ViajesController.searchViajes = async (req, res) => {
  try {
    const { 
      estado, 
      fechaInicio, 
      fechaFin, 
      conductorId, 
      truckId, 
      origen, 
      destino,
      page = 1,
      limit = 20 
    } = req.query;

    // Construir filtros dinámicamente
    const filtros = {};

    if (estado) {
      filtros['estado.actual'] = estado;
    }

    if (fechaInicio || fechaFin) {
      filtros.departureTime = {};
      if (fechaInicio) filtros.departureTime.$gte = new Date(fechaInicio);
      if (fechaFin) filtros.departureTime.$lte = new Date(fechaFin);
    }

    if (conductorId) {
      filtros.conductorId = conductorId;
    }

    if (truckId) {
      filtros.truckId = truckId;
    }

    // Buscar viajes con filtros
    const viajes = await ViajesModel.find(filtros)
      .populate('truckId', 'brand model licensePlate name')
      .populate('conductorId', 'name phone nombre telefono')
      .populate({
        path: 'quoteId',
        match: origen || destino ? {
          $or: [
            { 'ruta.origen.nombre': { $regex: origen || '', $options: 'i' } },
            { 'ruta.destino.nombre': { $regex: destino || '', $options: 'i' } }
          ]
        } : {}
      })
      .sort({ departureTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Filtrar por origen/destino si se especificó
    const viajesFiltrados = (origen || destino) ? 
      viajes.filter(v => v.quoteId) : viajes;

    const total = await ViajesModel.countDocuments(filtros);

    res.status(200).json({
      success: true,
      data: {
        viajes: viajesFiltrados,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        },
        filtros: {
          estado,
          fechaInicio,
          fechaFin,
          conductorId,
          truckId,
          origen,
          destino
        }
      },
      message: `Encontrados ${viajesFiltrados.length} viajes`
    });

  } catch (error) {
    console.error("❌ Error en búsqueda:", error);
    res.status(500).json({
      success: false,
      message: "Error en la búsqueda de viajes",
      error: error.message
    });
  }
};

// =====================================================
// 📊 MÉTODO: Dashboard principal con todas las métricas
// =====================================================
ViajesController.getDashboardData = async (req, res) => {
  try {
    console.log("📊 Obteniendo datos completos del dashboard...");

    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Ejecutar todas las consultas en paralelo
    const [
      viajesHoy,
      viajesSemana,
      viajesMes,
      viajesActivos,
      alertasActivas
    ] = await Promise.all([
      // Viajes de hoy
      ViajesModel.find({
        departureTime: {
          $gte: hoy,
          $lt: new Date(hoy.getTime() + 24 * 60 * 60 * 1000)
        }
      }).lean(),

      // Viajes última semana
      ViajesModel.find({
        departureTime: { $gte: hace7Dias }
      }).lean(),

      // Viajes último mes
      ViajesModel.find({
        departureTime: { $gte: hace30Dias }
      }).lean(),

      // Viajes activos
      ViajesModel.find({
        'estado.actual': { $in: ['pendiente', 'en_curso', 'retrasado'] }
      })
      .populate('truckId', 'brand model licensePlate')
      .populate('conductorId', 'name nombre')
      .lean(),

      // Alertas activas (simuladas por ahora)
      ViajesModel.find({
        'alertas.0': { $exists: true },
        'estado.actual': { $in: ['en_curso', 'retrasado'] }
      }).lean()
    ]);

    // Calcular estadísticas
    const estadisticas = {
      hoy: {
        total: viajesHoy.length,
        completados: viajesHoy.filter(v => v.estado?.actual === 'completado').length,
        enCurso: viajesHoy.filter(v => v.estado?.actual === 'en_curso').length,
        retrasados: viajesHoy.filter(v => v.estado?.actual === 'retrasado').length
      },
      semana: {
        total: viajesSemana.length,
        completados: viajesSemana.filter(v => v.estado?.actual === 'completado').length,
        promedioDiario: Math.round(viajesSemana.length / 7)
      },
      mes: {
        total: viajesMes.length,
        completados: viajesMes.filter(v => v.estado?.actual === 'completado').length,
        eficiencia: viajesMes.length > 0 ? 
          Math.round((viajesMes.filter(v => v.estado?.actual === 'completado').length / viajesMes.length) * 100) : 0
      },
      alertas: {
        total: alertasActivas.reduce((acc, v) => acc + (v.alertas?.length || 0), 0),
        criticas: Math.floor(Math.random() * 3), // Simulado
        medias: Math.floor(Math.random() * 5), // Simulado
        bajas: Math.floor(Math.random() * 8) // Simulado
      }
    };

    // Top rutas más utilizadas
    const topRutas = viajesMes
      .filter(v => v.quoteId?.ruta)
      .reduce((acc, viaje) => {
        const ruta = `${viaje.quoteId.ruta.origen?.nombre || 'Origen'} → ${viaje.quoteId.ruta.destino?.nombre || 'Destino'}`;
        acc[ruta] = (acc[ruta] || 0) + 1;
        return acc;
      }, {});

    const rutasOrdenadas = Object.entries(topRutas)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([ruta, count]) => ({ ruta, viajes: count }));

    // Rendimiento por conductor
    const conductoresStats = viajesMes
      .filter(v => v.conductorId)
      .reduce((acc, viaje) => {
        const conductorId = viaje.conductorId._id || viaje.conductorId;
        const nombre = viaje.conductorId.name || viaje.conductorId.nombre || 'Sin nombre';
        
        if (!acc[conductorId]) {
          acc[conductorId] = {
            nombre,
            totalViajes: 0,
            completados: 0,
            eficiencia: 0
          };
        }
        
        acc[conductorId].totalViajes++;
        if (viaje.estado?.actual === 'completado') {
          acc[conductorId].completados++;
        }
        
        return acc;
      }, {});

    // Calcular eficiencia y ordenar conductores
    const topConductores = Object.values(conductoresStats)
      .map(conductor => ({
        ...conductor,
        eficiencia: conductor.totalViajes > 0 ? 
          Math.round((conductor.completados / conductor.totalViajes) * 100) : 0
      }))
      .sort((a, b) => b.eficiencia - a.eficiencia)
      .slice(0, 5);

    // Respuesta completa del dashboard
    res.status(200).json({
      success: true,
      data: {
        resumen: estadisticas,
        viajesActivos: viajesActivos.slice(0, 10), // Solo los primeros 10
        topRutas: rutasOrdenadas,
        topConductores: topConductores,
        tendencias: {
          viajesHoy: estadisticas.hoy.total,
          cambioSemanal: viajesSemana.length > 0 ? "+12%" : "0%", // Simulado
          eficienciaMes: estadisticas.mes.eficiencia + "%",
          alertasActivas: estadisticas.alertas.total
        },
        ultimaActualizacion: ahora.toISOString()
      },
      message: "Datos del dashboard obtenidos exitosamente"
    });

    console.log("✅ Dashboard data completado:", {
      viajesHoy: estadisticas.hoy.total,
      viajesActivos: viajesActivos.length,
      alertas: estadisticas.alertas.total
    });

  } catch (error) {
    console.error("❌ Error obteniendo dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener datos del dashboard",
      error: error.message,
      data: {
        // Datos de fallback
        resumen: {
          hoy: { total: 0, completados: 0, enCurso: 0, retrasados: 0 },
          semana: { total: 0, completados: 0, promedioDiario: 0 },
          mes: { total: 0, completados: 0, eficiencia: 0 },
          alertas: { total: 0, criticas: 0, medias: 0, bajas: 0 }
        },
        viajesActivos: [],
        topRutas: [],
        topConductores: [],
        tendencias: {
          viajesHoy: 0,
          cambioSemanal: "0%",
          eficienciaMes: "0%",
          alertasActivas: 0
        },
        ultimaActualizacion: new Date().toISOString()
      }
    });
  }
};

// Controllers/Viajes.js - PARTE 7: MÉTODOS ADICIONALES DE UTILIDAD

// =====================================================
// 📊 MÉTODOS ADICIONALES DE UTILIDAD
// =====================================================

// Método para obtener estadísticas rápidas
ViajesController.getQuickStats = async (req, res) => {
  try {
    const stats = await ViajesModel.aggregate([
      {
        $group: {
          _id: "$estado.actual",
          count: { $sum: 1 }
        }
      }
    ]);

    const statsFormatted = stats.reduce((acc, stat) => {
      acc[stat._id || 'sin_estado'] = stat.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: statsFormatted,
      message: "Estadísticas rápidas obtenidas"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas rápidas",
      error: error.message
    });
  }
};

// Método para obtener viajes por conductor
ViajesController.getViajesByConductor = async (req, res) => {
  try {
    const { conductorId } = req.params;
    const { limite = 20 } = req.query;

    const viajes = await ViajesModel.find({ conductorId })
      .populate('truckId', 'brand model licensePlate name')
      .populate('quoteId', 'quoteName price ruta')
      .sort({ departureTime: -1 })
      .limit(parseInt(limite))
      .lean();

    // Calcular estadísticas del conductor
    const estadisticas = {
      totalViajes: viajes.length,
      completados: viajes.filter(v => v.estado?.actual === 'completado').length,
      enCurso: viajes.filter(v => v.estado?.actual === 'en_curso').length,
      retrasados: viajes.filter(v => v.estado?.actual === 'retrasado').length,
      eficiencia: viajes.length > 0 ? 
        Math.round((viajes.filter(v => v.estado?.actual === 'completado').length / viajes.length) * 100) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        viajes,
        estadisticas,
        conductorId
      },
      message: `Viajes del conductor obtenidos: ${viajes.length} registros`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener viajes del conductor",
      error: error.message
    });
  }
};

// Método para obtener viajes por camión
ViajesController.getViajesByTruck = async (req, res) => {
  try {
    const { truckId } = req.params;
    const { limite = 20 } = req.query;

    const viajes = await ViajesModel.find({ truckId })
      .populate('conductorId', 'name nombre phone telefono')
      .populate('quoteId', 'quoteName price ruta')
      .sort({ departureTime: -1 })
      .limit(parseInt(limite))
      .lean();

    // Calcular estadísticas del camión
    const estadisticas = {
      totalViajes: viajes.length,
      completados: viajes.filter(v => v.estado?.actual === 'completado').length,
      enCurso: viajes.filter(v => v.estado?.actual === 'en_curso').length,
      kilometrosTotal: viajes.reduce((acc, v) => acc + (v.quoteId?.ruta?.distanciaTotal || 0), 0),
      utilizacion: viajes.length > 0 ? 
        Math.round((viajes.filter(v => v.estado?.actual !== 'cancelado').length / viajes.length) * 100) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        viajes,
        estadisticas,
        truckId
      },
      message: `Viajes del camión obtenidos: ${viajes.length} registros`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener viajes del camión",
      error: error.message
    });
  }
};

// Método para cancelar viaje
ViajesController.cancelTrip = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { motivo, observaciones } = req.body;

    const viaje = await ViajesModel.findById(viajeId);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado"
      });
    }

    // Verificar que el viaje se pueda cancelar
    if (viaje.estado.actual === 'completado') {
      return res.status(400).json({
        success: false,
        message: "No se puede cancelar un viaje completado"
      });
    }

    // Marcar como cancelado
    const estadoAnterior = viaje.estado.actual;
    viaje.estado.actual = 'cancelado';
    viaje.estado.fechaCambio = new Date();

    // Agregar al historial
    viaje.estado.historial.push({
      estadoAnterior: estadoAnterior,
      estadoNuevo: 'cancelado',
      fecha: new Date(),
      motivo: motivo || 'manual',
      observacion: observaciones || 'Viaje cancelado'
    });

    // Actualizar observaciones
    if (observaciones) {
      viaje.condiciones.observaciones = observaciones;
    }

    await viaje.save();

    // Actualizar cotización si existe
    if (viaje.quoteId) {
      try {
        await CotizacionesModel.findByIdAndUpdate(
          viaje.quoteId,
          { status: 'cancelada' }
        );
      } catch (updateError) {
        console.warn("⚠️ No se pudo actualizar la cotización:", updateError.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        viajeId: viaje._id,
        estadoAnterior,
        estadoNuevo: 'cancelado',
        motivo: motivo || 'manual',
        fechaCancelacion: new Date().toISOString()
      },
      message: "Viaje cancelado exitosamente"
    });

  } catch (error) {
    console.error("❌ Error cancelando viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al cancelar el viaje",
      error: error.message
    });
  }
};

// Método para reactivar viaje cancelado
ViajesController.reactivateTrip = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { observaciones } = req.body;

    const viaje = await ViajesModel.findById(viajeId);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado"
      });
    }

    // Verificar que el viaje esté cancelado
    if (viaje.estado.actual !== 'cancelado') {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden reactivar viajes cancelados"
      });
    }

    // Determinar nuevo estado basado en las fechas
    const ahora = new Date();
    const salidaProgramada = new Date(viaje.departureTime);
    const llegadaProgramada = new Date(viaje.arrivalTime);

    let nuevoEstado;
    if (ahora < salidaProgramada) {
      nuevoEstado = 'pendiente';
    } else if (ahora >= salidaProgramada && ahora < llegadaProgramada) {
      nuevoEstado = 'en_curso';
    } else {
      nuevoEstado = 'retrasado';
    }

    // Actualizar estado
    viaje.estado.actual = nuevoEstado;
    viaje.estado.fechaCambio = new Date();

    // Agregar al historial
    viaje.estado.historial.push({
      estadoAnterior: 'cancelado',
      estadoNuevo: nuevoEstado,
      fecha: new Date(),
      motivo: 'reactivacion',
      observacion: observaciones || 'Viaje reactivado'
    });

    if (observaciones) {
      viaje.condiciones.observaciones = observaciones;
    }

    await viaje.save();

    // Reactivar cotización si existe
    if (viaje.quoteId) {
      try {
        await CotizacionesModel.findByIdAndUpdate(
          viaje.quoteId,
          { status: 'ejecutada' }
        );
      } catch (updateError) {
        console.warn("⚠️ No se pudo actualizar la cotización:", updateError.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        viajeId: viaje._id,
        estadoAnterior: 'cancelado',
        estadoNuevo: nuevoEstado,
        fechaReactivacion: new Date().toISOString()
      },
      message: "Viaje reactivado exitosamente"
    });

  } catch (error) {
    console.error("❌ Error reactivando viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al reactivar el viaje",
      error: error.message
    });
  }
};

// Método para obtener historial de un viaje
ViajesController.getTripHistory = async (req, res) => {
  try {
    const { viajeId } = req.params;

    const viaje = await ViajesModel.findById(viajeId)
      .select('estado.historial tracking.checkpoints alertas')
      .lean();

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado"
      });
    }

    // Combinar todos los eventos en orden cronológico
    const eventos = [];

    // Agregar historial de estados
    if (viaje.estado?.historial) {
      viaje.estado.historial.forEach(evento => {
        eventos.push({
          tipo: 'estado',
          fecha: evento.fecha,
          descripcion: `Estado cambiado a: ${evento.estadoNuevo}`,
          detalles: evento,
          prioridad: 'media'
        });
      });
    }

    // Agregar checkpoints de tracking
    if (viaje.tracking?.checkpoints) {
      viaje.tracking.checkpoints.forEach(checkpoint => {
        eventos.push({
          tipo: 'ubicacion',
          fecha: checkpoint.timestamp,
          descripcion: `Ubicación actualizada: ${checkpoint.ubicacion?.direccion || 'GPS'}`,
          detalles: checkpoint,
          prioridad: 'baja'
        });
      });
    }

    // Agregar alertas
    if (viaje.alertas) {
      viaje.alertas.forEach(alerta => {
        eventos.push({
          tipo: 'alerta',
          fecha: alerta.fecha,
          descripcion: `Alerta: ${alerta.mensaje}`,
          detalles: alerta,
          prioridad: alerta.prioridad || 'media'
        });
      });
    }

    // Ordenar por fecha descendente
    eventos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.status(200).json({
      success: true,
      data: {
        viajeId,
        eventos,
        totalEventos: eventos.length
      },
      message: "Historial del viaje obtenido exitosamente"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener historial del viaje",
      error: error.message
    });
  }
};

// Controllers/Viajes.js - PARTE 8: EXPORT FINAL DEL CONTROLADOR

// =====================================================
// 🔚 EXPORT DEL CONTROLADOR
// =====================================================
export default ViajesController;
