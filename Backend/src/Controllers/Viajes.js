// Controllers/Viajes.js - VERSIÓN HÍBRIDA LIMPIA CON VIAJES Y COTIZACIONES
import ViajesModel from "../Models/Viajes.js";
import CotizacionesModel from "../Models/CotizacionesModel.js";
import mongoose from "mongoose";

const ViajesController = {};

// =====================================================
// UTILIDADES DE VALIDACIÓN
// =====================================================
const validationUtils = {
  isValidObjectId: (id) => mongoose.Types.ObjectId.isValid(id),
  
  isValidCoordinates: (lat, lng) => {
    return typeof lat === 'number' && typeof lng === 'number' &&
           lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },
  
  isValidDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start instanceof Date && !isNaN(start) && 
           end instanceof Date && !isNaN(end) && 
           start <= end;
  },
  
  sanitizeQueryParam: (param, defaultValue, validator = null) => {
    if (param === undefined || param === null) return defaultValue;
    if (validator && !validator(param)) return defaultValue;
    return param;
  },
  
  validateTripState: (estado) => {
    const validStates = ['pendiente', 'en_curso', 'retrasado', 'completado', 'cancelado'];
    return validStates.includes(estado);
  },

  validateQuoteState: (estado) => {
    const validStates = ['pendiente', 'enviada', 'aceptada', 'rechazada', 'ejecutada', 'cancelada'];
    return validStates.includes(estado);
  }
};

// =====================================================
// UTILIDADES PARA NORMALIZAR DATOS
// =====================================================
const dataUtils = {
  /**
   * Normaliza datos de viaje para uso uniforme
   * @param {Object} viaje - Documento de viaje de la BD
   * @returns {Object} - Objeto normalizado
   */
  normalizeViajeData: (viaje) => {
    if (!viaje) return null;

    return {
      _id: viaje._id,
      tipo: 'viaje',
      
      // Información básica
      descripcion: viaje.tripDescription || viaje.quoteDescription || 'Viaje sin descripción',
      nombre: viaje.quoteName || viaje.tripName || `Viaje ${viaje._id.toString().slice(-6)}`,
      
      // Estado del viaje
      estado: {
        actual: viaje.estado?.actual || 'pendiente',
        fechaCambio: viaje.estado?.fechaCambio || viaje.updatedAt,
        historial: viaje.estado?.historial || []
      },
      
      // Información de ruta
      ruta: viaje.ruta || {
        origen: { nombre: 'Origen', coordenadas: { lat: 0, lng: 0 }, tipo: 'ciudad' },
        destino: { nombre: 'Destino', coordenadas: { lat: 0, lng: 0 }, tipo: 'ciudad' },
        distanciaTotal: 0,
        tiempoEstimado: 0
      },
      
      // Información de carga
      carga: viaje.carga || {
        descripcion: 'Carga general',
        categoria: 'otros',
        peso: { valor: 0, unidad: 'kg' }
      },
      
      // Horarios programados y reales
      horarios: {
        fechaSalida: viaje.departureTime || viaje.horarios?.fechaSalida,
        fechaLlegadaEstimada: viaje.arrivalTime || viaje.horarios?.fechaLlegadaEstimada,
        salidaReal: viaje.horarios?.salidaReal,
        llegadaReal: viaje.horarios?.llegadaReal
      },
      
      // Información de seguimiento GPS
      tracking: viaje.tracking || {
        progreso: { porcentaje: 0 },
        ubicacionActual: null
      },
      
      // Costos asociados
      costos: viaje.costos || { total: 0 },
      
      // Referencias a otros documentos
      truckId: viaje.truckId,
      conductorId: viaje.conductorId || viaje.conductor?.id,
      clientId: viaje.clientId,
      quoteId: viaje.quoteId,
      
      // Metadatos del documento
      createdAt: viaje.createdAt,
      updatedAt: viaje.updatedAt
    };
  },

  /**
   * Normaliza datos de cotización para uso uniforme
   * @param {Object} cotizacion - Documento de cotización de la BD
   * @returns {Object} - Objeto normalizado
   */
  normalizeCotizacionData: (cotizacion) => {
    if (!cotizacion) return null;

    // Mapear estado de cotización a estado de viaje para compatibilidad
    const mapearEstado = (statusCotizacion) => {
      const mapeo = {
        'pendiente': 'pendiente',
        'enviada': 'pendiente',
        'aceptada': 'pendiente',
        'ejecutada': 'en_curso',
        'rechazada': 'cancelado',
        'cancelada': 'cancelado'
      };
      return mapeo[statusCotizacion] || 'pendiente';
    };

    return {
      _id: cotizacion._id,
      tipo: 'cotizacion',
      
      // Información básica
      descripcion: cotizacion.quoteDescription || 'Cotización sin descripción',
      nombre: cotizacion.quoteName || `Cotización ${cotizacion._id.toString().slice(-6)}`,
      
      // Estado mapeado desde cotización
      estado: {
        actual: mapearEstado(cotizacion.status),
        fechaCambio: cotizacion.fechaAceptacion || cotizacion.updatedAt,
        original: cotizacion.status,
        historial: []
      },
      
      // Información de ruta
      ruta: cotizacion.ruta || {
        origen: { nombre: 'Origen', coordenadas: { lat: 0, lng: 0 }, tipo: 'ciudad' },
        destino: { nombre: 'Destino', coordenadas: { lat: 0, lng: 0 }, tipo: 'ciudad' },
        distanciaTotal: 0,
        tiempoEstimado: 0
      },
      
      // Información de carga
      carga: cotizacion.carga || {
        descripcion: cotizacion.quoteDescription || 'Carga general',
        categoria: cotizacion.truckType || 'otros',
        peso: { valor: 0, unidad: 'kg' }
      },
      
      // Horarios programados
      horarios: {
        fechaSalida: cotizacion.horarios?.fechaSalida || cotizacion.deliveryDate,
        fechaLlegadaEstimada: cotizacion.horarios?.fechaLlegadaEstimada,
        salidaReal: null,
        llegadaReal: null
      },
      
      // Tracking simulado para cotizaciones
      tracking: {
        progreso: { 
          porcentaje: cotizacion.status === 'ejecutada' ? 50 : 0 
        },
        ubicacionActual: null
      },
      
      // Costos asociados
      costos: cotizacion.costos || { total: cotizacion.price || 0 },
      
      // Referencias (las cotizaciones no tienen truck/conductor asignado)
      truckId: null,
      conductorId: null,
      clientId: cotizacion.clientId,
      quoteId: cotizacion._id,
      
      // Metadatos del documento
      createdAt: cotizacion.createdAt,
      updatedAt: cotizacion.updatedAt
    };
  },

  /**
   * Combina y ordena datos de ambas fuentes
   * @param {Array} viajes - Array de documentos de viajes
   * @param {Array} cotizaciones - Array de documentos de cotizaciones
   * @returns {Array} - Array combinado y ordenado
   */
  combineAndSortData: (viajes, cotizaciones) => {
    const viajesNormalizados = viajes.map(dataUtils.normalizeViajeData);
    const cotizacionesNormalizadas = cotizaciones.map(dataUtils.normalizeCotizacionData);
    
    const todosCombinados = [...viajesNormalizados, ...cotizacionesNormalizadas]
      .filter(item => item !== null)
      .sort((a, b) => {
        const fechaA = a.horarios.fechaSalida || a.createdAt;
        const fechaB = b.horarios.fechaSalida || b.createdAt;
        return new Date(fechaA) - new Date(fechaB);
      });
    
    return todosCombinados;
  }
};

// =====================================================
// UTILIDADES PARA PROCESAR UBICACIONES
// =====================================================
const locationUtils = {
  /**
   * Crea entrada de ubicación estándar
   * @param {Object} locationData - Datos de ubicación
   * @returns {Object} - Objeto de ubicación normalizado
   */
  createLocationEntry: (locationData) => {
    const { nombre, coordenadas, tipo } = locationData;
    
    return {
      name: nombre,
      coords: [coordenadas.lat, coordenadas.lng],
      type: locationUtils.getLocationTypeColor(tipo),
      number: "0",
      description: `${tipo || 'ciudad'}`,
      tripCount: 0,
      nextTrip: null,
      isTerminal: tipo === 'terminal',
      details: `${tipo || 'Ciudad'} de ${locationData.role || 'ubicación'}`
    };
  },

  /**
   * Determina el color de la ubicación según su tipo
   * @param {string} tipo - Tipo de ubicación
   * @returns {string} - Color asignado
   */
  getLocationTypeColor: (tipo) => {
    const colorMap = {
      'terminal': 'red',
      'puerto': 'blue',
      'bodega': 'orange',
      'cliente': 'purple',
      'ciudad': 'green'
    };
    return colorMap[tipo] || 'green';
  },

  /**
   * Procesa ubicaciones de origen y destino
   * @param {Map} locationMap - Mapa de ubicaciones existentes
   * @param {Object} item - Elemento de datos normalizado
   */
  processLocations: (locationMap, item) => {
    const { origen, destino } = item.ruta || {};
    
    // Procesar origen
    if (origen?.nombre && validationUtils.isValidCoordinates(origen.coordenadas?.lat, origen.coordenadas?.lng)) {
      const origenKey = origen.nombre.trim();
      if (!locationMap.has(origenKey)) {
        locationMap.set(origenKey, locationUtils.createLocationEntry({
          ...origen,
          role: 'origen'
        }));
      }
    }

    // Procesar destino
    if (destino?.nombre && validationUtils.isValidCoordinates(destino.coordenadas?.lat, destino.coordenadas?.lng)) {
      const destinoKey = destino.nombre.trim();
      if (!locationMap.has(destinoKey)) {
        locationMap.set(destinoKey, locationUtils.createLocationEntry({
          ...destino,
          role: 'destino'
        }));
      }

      // Actualizar contadores del destino
      const location = locationMap.get(destinoKey);
      location.tripCount++;
      location.number = location.tripCount.toString();

      // Establecer próximo viaje si está pendiente
      if (item.estado?.actual === 'pendiente' && !location.nextTrip) {
        const departureTime = new Date(item.horarios.fechaSalida);
        if (!isNaN(departureTime)) {
          location.nextTrip = departureTime.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit"
          });
        }
      }

      location.description = `${location.tripCount} ${item.tipo}${location.tripCount > 1 ? 's' : ''} programado${location.tripCount > 1 ? 's' : ''}`;
    }
  }
};

// =====================================================
// UTILIDADES PARA GENERAR RUTAS
// =====================================================
const routeUtils = {
  /**
   * Obtiene información del vehículo
   * @param {Object} item - Elemento de datos normalizado
   * @returns {string} - Información del vehículo formateada
   */
  getTruckInfo: (item) => {
    if (item.tipo === 'cotizacion') return "Por asignar";
    
    const truck = item.truckId;
    if (!truck || typeof truck !== 'object') return "Camión por asignar";
    
    const brand = (truck.brand || truck.marca || "").trim();
    const model = (truck.model || truck.modelo || "").trim();
    const plate = (truck.licensePlate || truck.placa || "").trim();
    const name = (truck.name || truck.nombre || "").trim();
    
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
  },

  /**
   * Obtiene información del conductor
   * @param {Object} item - Elemento de datos normalizado
   * @returns {string} - Información del conductor formateada
   */
  getDriverInfo: (item) => {
    if (item.tipo === 'cotizacion') return "Por asignar";
    
    const conductor = item.conductorId;
    if (!conductor || typeof conductor !== 'object') return "Conductor por asignar";
    
    if (conductor.name) return conductor.name.trim();
    if (conductor.nombre) return conductor.nombre.trim();
    return "Conductor disponible";
  },

  /**
   * Mapea estado interno a configuración de estado
   * @param {string} estadoActual - Estado actual del elemento
   * @param {string} tipo - Tipo de elemento (viaje/cotizacion)
   * @returns {Object} - Configuración de estado
   */
  getStatusConfig: (estadoActual, tipo) => {
    const configs = {
      'pendiente': { status: 'scheduled', statusText: tipo === 'cotizacion' ? 'Cotización' : 'Programado' },
      'en_curso': { status: 'in_progress', statusText: 'En tránsito' },
      'completado': { status: 'completed', statusText: 'Completado' },
      'cancelado': { status: 'cancelled', statusText: 'Cancelado' },
      'retrasado': { status: 'delayed', statusText: 'Retrasado' }
    };
    
    return configs[estadoActual] || configs.pendiente;
  },

  /**
   * Calcula ubicación actual basada en estado y progreso
   * @param {Object} item - Elemento de datos normalizado
   * @returns {string} - Descripción de ubicación actual
   */
  getCurrentLocation: (item) => {
    const { estado, tracking, ruta } = item;
    const progreso = tracking?.progreso?.porcentaje || 0;
    
    switch (estado.actual) {
      case 'completado':
        return ruta?.destino?.nombre || 'Destino';
      case 'en_curso':
      case 'retrasado':
        if (tracking?.ubicacionActual?.lat) {
          return `${Math.round(progreso)}% completado - GPS activo`;
        }
        return `${Math.round(progreso)}% completado`;
      case 'pendiente':
      default:
        return ruta?.origen?.nombre || 'Origen';
    }
  },

  /**
   * Genera objeto de ruta para el mapa
   * @param {Object} item - Elemento de datos normalizado
   * @returns {Object|null} - Objeto de ruta o null si es inválido
   */
  generateRoute: (item) => {
    try {
      const { ruta, estado, tracking, carga, horarios, costos } = item;
      const { origen, destino } = ruta || {};
      
      // Validar coordenadas
      if (!origen?.coordenadas?.lat || !origen?.coordenadas?.lng ||
          !destino?.coordenadas?.lat || !destino?.coordenadas?.lng) {
        return null;
      }

      if (!validationUtils.isValidCoordinates(origen.coordenadas.lat, origen.coordenadas.lng) ||
          !validationUtils.isValidCoordinates(destino.coordenadas.lat, destino.coordenadas.lng)) {
        return null;
      }

      const coordinates = [
        [origen.coordenadas.lat, origen.coordenadas.lng],
        [destino.coordenadas.lat, destino.coordenadas.lng]
      ];

      const estadoActual = estado?.actual || 'pendiente';
      const statusConfig = routeUtils.getStatusConfig(estadoActual, item.tipo);
      const progreso = tracking?.progreso?.porcentaje || 0;

      return {
        id: item._id.toString(),
        coordinates,
        status: statusConfig.status,
        statusText: statusConfig.statusText,
        frequency: ['en_curso', 'retrasado'].includes(estadoActual) ? "high" : "medium",
        
        // Información de distancia y tiempo
        distance: ruta?.distanciaTotal && typeof ruta.distanciaTotal === 'number' ? 
          `${ruta.distanciaTotal} km` : "Calculando...",
        estimatedTime: ruta?.tiempoEstimado && typeof ruta.tiempoEstimado === 'number' ? 
          `${Math.floor(ruta.tiempoEstimado / 60)}h ${ruta.tiempoEstimado % 60}min` : 
          "Calculando...",
        
        // Información del viaje
        tripInfo: {
          type: item.tipo,
          driver: routeUtils.getDriverInfo(item),
          truck: routeUtils.getTruckInfo(item),
          cargo: carga?.descripcion || "Carga general",
          
          // Horarios formateados
          departure: horarios.fechaSalida ? 
            new Date(horarios.fechaSalida).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit"
            }) : "No disponible",
          arrival: horarios.fechaLlegadaEstimada ? 
            new Date(horarios.fechaLlegadaEstimada).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit"
            }) : "No disponible",
          
          // Estado y progreso
          progress: Math.round(progreso),
          currentLocation: routeUtils.getCurrentLocation(item)
        },
        
        // Descripción y ruta
        description: item.descripcion || "",
        route: {
          from: origen.nombre,
          to: destino.nombre,
          fromType: origen.tipo || 'ciudad',
          toType: destino.tipo || 'ciudad'
        },
        
        // Costos si están disponibles
        costs: costos?.total && typeof costos.total === 'number' ? {
          total: costos.total
        } : null
      };

    } catch (error) {
      return null;
    }
  }
};

// =====================================================
// GET: Datos optimizados para el mapa (HÍBRIDO)
// =====================================================
ViajesController.getMapData = async (req, res) => {
  try {
    // Construir queries para ambos modelos
    const baseQuery = {};
    const cotizacionQuery = {};

    // Aplicar filtros de estado
    if (req.query.estado && validationUtils.validateTripState(req.query.estado)) {
      baseQuery['estado.actual'] = req.query.estado;
      
      // Mapear estado de viaje a estado de cotización
      const estadoMapping = {
        'pendiente': ['pendiente', 'enviada', 'aceptada'],
        'en_curso': ['ejecutada'],
        'cancelado': ['rechazada', 'cancelada']
      };
      
      if (estadoMapping[req.query.estado]) {
        cotizacionQuery.status = { $in: estadoMapping[req.query.estado] };
      }
    } else {
      // Estados válidos por defecto
      baseQuery['estado.actual'] = { $in: ['pendiente', 'en_curso', 'retrasado', 'completado'] };
      cotizacionQuery.status = { $in: ['pendiente', 'enviada', 'aceptada', 'ejecutada'] };
    }

    // Aplicar filtros de fecha
    if (req.query.fecha) {
      const fecha = new Date(req.query.fecha);
      if (!isNaN(fecha)) {
        const nextDay = new Date(fecha);
        nextDay.setDate(fecha.getDate() + 1);
        
        baseQuery.departureTime = { $gte: fecha, $lt: nextDay };
        cotizacionQuery.$or = [
          { 'horarios.fechaSalida': { $gte: fecha, $lt: nextDay } },
          { deliveryDate: { $gte: fecha, $lt: nextDay } }
        ];
      }
    }

    // Ejecutar consultas en paralelo
    const [viajes, cotizaciones] = await Promise.all([
      ViajesModel.find(baseQuery)
        .populate({
          path: 'truckId',
          select: 'brand model licensePlate name marca modelo placa nombre',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'conductorId',
          select: 'name phone nombre telefono',
          options: { strictPopulate: false }
        })
        .select('-tracking.historialUbicaciones -ruta.rutaOptimizada')
        .sort({ departureTime: 1 })
        .lean(),

      CotizacionesModel.find(cotizacionQuery)
        .populate({
          path: 'clientId',
          select: 'name company nombre empresa',
          options: { strictPopulate: false }
        })
        .sort({ 'horarios.fechaSalida': 1, deliveryDate: 1 })
        .lean()
    ]);

    // Combinar y normalizar datos
    const datosCombinados = dataUtils.combineAndSortData(viajes, cotizaciones);

    // Si no hay datos, devolver estructura vacía
    if (datosCombinados.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          locations: [],
          routes: [],
          cities: [],
          statistics: {
            total_routes: 0,
            active_routes: 0,
            completed_routes: 0,
            pending_routes: 0,
            delayed_routes: 0,
            cancelled_routes: 0,
            quotes_total: 0,
            quotes_pending: 0,
            quotes_accepted: 0
          },
          lastUpdate: new Date().toISOString(),
          dataSource: "hybrid_model"
        },
        message: "No hay datos disponibles para mostrar en el mapa"
      });
    }

    // Procesar ubicaciones
    const locationMap = new Map();
    datosCombinados.forEach(item => {
      locationUtils.processLocations(locationMap, item);
    });

    // Generar rutas
    const routes = datosCombinados
      .map(item => routeUtils.generateRoute(item))
      .filter(route => route !== null);

    // Calcular estadísticas combinadas
    const estadisticasViajes = {
      total: viajes.length,
      completados: viajes.filter(v => v.estado?.actual === "completado").length,
      enCurso: viajes.filter(v => v.estado?.actual === "en_curso").length,
      pendientes: viajes.filter(v => v.estado?.actual === "pendiente").length,
      retrasados: viajes.filter(v => v.estado?.actual === "retrasado").length,
      cancelados: viajes.filter(v => v.estado?.actual === "cancelado").length
    };

    const estadisticasCotizaciones = {
      total: cotizaciones.length,
      pendientes: cotizaciones.filter(c => ['pendiente', 'enviada'].includes(c.status)).length,
      aceptadas: cotizaciones.filter(c => c.status === 'aceptada').length,
      ejecutadas: cotizaciones.filter(c => c.status === 'ejecutada').length,
      rechazadas: cotizaciones.filter(c => c.status === 'rechazada').length
    };

    const statistics = {
      // Estadísticas de viajes
      total_routes: estadisticasViajes.total,
      active_routes: estadisticasViajes.enCurso,
      completed_routes: estadisticasViajes.completados,
      pending_routes: estadisticasViajes.pendientes,
      delayed_routes: estadisticasViajes.retrasados,
      cancelled_routes: estadisticasViajes.cancelados,
      
      // Estadísticas de cotizaciones
      quotes_total: estadisticasCotizaciones.total,
      quotes_pending: estadisticasCotizaciones.pendientes,
      quotes_accepted: estadisticasCotizaciones.aceptadas,
      quotes_executed: estadisticasCotizaciones.ejecutadas,
      quotes_rejected: estadisticasCotizaciones.rechazadas,
      
      // Métricas calculadas
      completion_rate: estadisticasViajes.total > 0 ? 
        Math.round((estadisticasViajes.completados / estadisticasViajes.total) * 100) : 0,
      average_progress: routes.length > 0 ?
        Math.round(routes.reduce((acc, route) => acc + route.tripInfo.progress, 0) / routes.length) : 0,
      
      total_combined: estadisticasViajes.total + estadisticasCotizaciones.total
    };

    // Respuesta final
    const mapData = {
      locations: Array.from(locationMap.values()),
      routes,
      cities: [], // Se puede poblar dinámicamente desde la BD si es necesario
      statistics,
      lastUpdate: new Date().toISOString(),
      autoUpdateEnabled: true,
      refreshInterval: 60000,
      dataSource: "hybrid_model"
    };

    res.status(200).json({
      success: true,
      data: mapData,
      message: "Datos del mapa híbrido obtenidos exitosamente"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener datos del mapa híbrido",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// =====================================================
// GET: Análisis de distribución de cargas (HÍBRIDO)
// =====================================================
ViajesController.getCargaDistribution = async (req, res) => {
  try {
    const limite = validationUtils.sanitizeQueryParam(
      parseInt(req.query.limite), 
      50, 
      (val) => val > 0 && val <= 100
    );

    const categoria = req.query.categoria ? 
      req.query.categoria.trim().toLowerCase() : null;

    // Construir condiciones de filtro para ambos modelos
    const matchConditionViajes = categoria ? {
      $or: [
        { "carga.categoria": { $regex: categoria, $options: 'i' } },
        { "carga.tipo": { $regex: categoria, $options: 'i' } },
        { "carga.descripcion": { $regex: categoria, $options: 'i' } }
      ]
    } : {};

    const matchConditionCotizaciones = categoria ? {
      $or: [
        { "carga.categoria": { $regex: categoria, $options: 'i' } },
        { "truckType": { $regex: categoria, $options: 'i' } },
        { "quoteDescription": { $regex: categoria, $options: 'i' } }
      ]
    } : {};

    // Pipelines de agregación
    const pipelineViajes = [
      ...(Object.keys(matchConditionViajes).length > 0 ? [{ $match: matchConditionViajes }] : []),
      {
        $group: {
          _id: {
            $ifNull: [
              "$carga.categoria", 
              { $ifNull: ["$carga.tipo", "$carga.descripcion"] }
            ]
          },
          count: { $sum: 1 },
          pesoPromedio: { $avg: "$carga.peso.valor" },
          pesoTotal: { $sum: "$carga.peso.valor" },
          valorPromedio: { $avg: "$carga.valor.montoDeclarado" },
          ejemplos: { $addToSet: "$carga.descripcion" },
          tipo: { $first: "viaje" }
        }
      }
    ];

    const pipelineCotizaciones = [
      ...(Object.keys(matchConditionCotizaciones).length > 0 ? [{ $match: matchConditionCotizaciones }] : []),
      {
        $group: {
          _id: {
            $ifNull: [
              "$carga.categoria", 
              { $ifNull: ["$truckType", "$quoteDescription"] }
            ]
          },
          count: { $sum: 1 },
          pesoPromedio: { $avg: "$carga.peso.valor" },
          pesoTotal: { $sum: "$carga.peso.valor" },
          valorPromedio: { $avg: "$costos.total" },
          ejemplos: { $addToSet: "$quoteDescription" },
          tipo: { $first: "cotizacion" }
        }
      }
    ];

    // Ejecutar agregaciones en paralelo
    const [resultadosViajes, resultadosCotizaciones] = await Promise.all([
      ViajesModel.aggregate(pipelineViajes),
      CotizacionesModel.aggregate(pipelineCotizaciones)
    ]);

    // Combinar y procesar resultados
    const resultadosCombinados = [...resultadosViajes, ...resultadosCotizaciones];
    
    if (resultadosCombinados.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        estadisticas: {
          totalTiposUnicos: 0,
          totalRegistros: 0,
          tipoMasFrecuente: 'N/A',
          porcentajeMasFrecuente: 0,
          pesoTotalTransportado: 0,
          promedioRegistrosPorCategoria: 0,
          top3Tipos: []
        },
        metadata: {
          total: 0,
          ultimaActualizacion: new Date().toISOString(),
          modeloVersion: "2.0_hybrid",
          compatibilidad: "hybrid_compatible",
          campoUtilizado: "categoria/tipo/descripcion",
          fuentesDatos: ["viajes", "cotizaciones"]
        },
        message: "No se encontraron datos de carga para analizar"
      });
    }

    // Agrupar por categoría combinando ambas fuentes
    const categoriasMap = new Map();

    resultadosCombinados.forEach(item => {
      const categoria = item._id;
      if (!categoria || categoria.trim() === '') return;

      const categoriaKey = categoria.toLowerCase().trim();
      
      if (categoriasMap.has(categoriaKey)) {
        const existing = categoriasMap.get(categoriaKey);
        existing.count += item.count;
        existing.pesoTotal += item.pesoTotal || 0;
        existing.valorTotal += item.valorPromedio ? (item.valorPromedio * item.count) : 0;
        existing.ejemplos = [...existing.ejemplos, ...(item.ejemplos || [])];
        existing.fuentes.add(item.tipo);
      } else {
        categoriasMap.set(categoriaKey, {
          categoria: categoria,
          count: item.count,
          pesoTotal: item.pesoTotal || 0,
          valorTotal: item.valorPromedio ? (item.valorPromedio * item.count) : 0,
          ejemplos: item.ejemplos || [],
          fuentes: new Set([item.tipo])
        });
      }
    });

    const totalRegistros = Array.from(categoriasMap.values())
      .reduce((acc, item) => acc + item.count, 0);

    // Formatear datos para respuesta
    const datosFormateados = Array.from(categoriasMap.values())
      .map((item, index) => {
        const categoria = item.categoria.trim();
        const nombreMostrar = categoria.charAt(0).toUpperCase() + categoria.slice(1);
        const pesoPromedio = item.count > 0 ? item.pesoTotal / item.count : 0;
        const valorPromedio = item.count > 0 ? item.valorTotal / item.count : 0;
        const porcentaje = totalRegistros > 0 ? (item.count / totalRegistros) * 100 : 0;
        
        return {
          id: `carga-hybrid-${index}`,
          tipo: categoria.toLowerCase(),
          name: nombreMostrar,
          categoria: categoria,
          count: Math.max(0, item.count || 0),
          porcentaje: Math.max(0, Math.min(100, porcentaje)),
          percentage: Math.max(0, Math.min(100, porcentaje)),
          pesoPromedio: Math.max(0, pesoPromedio),
          pesoTotal: Math.max(0, item.pesoTotal),
          valorPromedio: Math.max(0, valorPromedio),
          ejemplos: Array.isArray(item.ejemplos) ? 
            [...new Set(item.ejemplos.filter(Boolean))].slice(0, 3) : [],
          descripcion: Array.isArray(item.ejemplos) && item.ejemplos[0] ? 
            item.ejemplos[0] : nombreMostrar,
          fuentes: Array.from(item.fuentes),
          esHibrido: item.fuentes.size > 1,
          unidadPeso: 'kg'
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limite);

    // Calcular estadísticas generales
    const estadisticas = {
      totalTiposUnicos: datosFormateados.length,
      totalRegistros: totalRegistros,
      tipoMasFrecuente: datosFormateados[0]?.name || 'N/A',
      porcentajeMasFrecuente: datosFormateados[0]?.porcentaje || 0,
      pesoTotalTransportado: datosFormateados.reduce((acc, item) => acc + item.pesoTotal, 0),
      promedioRegistrosPorCategoria: datosFormateados.length > 0 ? 
        Math.round(totalRegistros / datosFormateados.length) : 0,
      top3Tipos: datosFormateados.slice(0, 3).map(t => ({
        tipo: t.name,
        porcentaje: t.porcentaje,
        cantidad: t.count,
        fuentes: t.fuentes
      })),
      distribucionPorFuente: {
        viajes: resultadosViajes.reduce((acc, item) => acc + item.count, 0),
        cotizaciones: resultadosCotizaciones.reduce((acc, item) => acc + item.count, 0)
      }
    };

    res.status(200).json({
      success: true,
      data: datosFormateados,
      estadisticas: estadisticas,
      metadata: {
        total: totalRegistros,
        ultimaActualizacion: new Date().toISOString(),
        modeloVersion: "2.0_hybrid",
        compatibilidad: "hybrid_compatible",
        campoUtilizado: "categoria/tipo/descripcion",
        fuentesDatos: ["viajes", "cotizaciones"],
        filtroAplicado: categoria || 'ninguno'
      },
      message: `Análisis híbrido de ${datosFormateados.length} tipos de carga completado`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al analizar distribución de cargas híbrida",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// =====================================================
// GET: VIAJES POR DÍAS - MÉTODO HÍBRIDO
// =====================================================
ViajesController.getViajesPorDias = async (req, res) => {
  try {
    const diasAdelante = validationUtils.sanitizeQueryParam(
      parseInt(req.query.diasAdelante), 
      7, 
      (val) => val > 0 && val <= 30
    );

    // Opción para incluir o excluir cotizaciones
    const incluirCotizaciones = req.query.incluirCotizaciones !== 'false';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const fechaLimite = new Date(today);
    fechaLimite.setDate(today.getDate() + diasAdelante);

    // Configurar queries para ambos modelos
    const queryViajes = {
      departureTime: {
        $gte: today,
        $lt: fechaLimite
      }
    };

    const queryCotizaciones = {
      $or: [
        {
          'horarios.fechaSalida': {
            $gte: today,
            $lt: fechaLimite
          }
        },
        {
          deliveryDate: {
            $gte: today,
            $lt: fechaLimite
          }
        }
      ],
      status: { $in: ['aceptada', 'ejecutada'] }
    };

    // Aplicar filtro de estado si se especifica
    if (req.query.estado && validationUtils.validateTripState(req.query.estado)) {
      queryViajes['estado.actual'] = req.query.estado;
    }

    // Ejecutar consultas
    const consultas = [
      ViajesModel.find(queryViajes)
        .populate({
          path: 'truckId',
          select: 'brand model licensePlate name marca modelo placa nombre',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'conductorId',
          select: 'name phone nombre telefono',
          options: { strictPopulate: false }
        })
        .sort({ departureTime: 1 })
        .lean()
    ];

    if (incluirCotizaciones) {
      consultas.push(
        CotizacionesModel.find(queryCotizaciones)
          .populate({
            path: 'clientId',
            select: 'name company nombre empresa',
            options: { strictPopulate: false }
          })
          .sort({ 'horarios.fechaSalida': 1, deliveryDate: 1 })
          .lean()
      );
    }

    const resultados = await Promise.all(consultas);
    const viajes = resultados[0];
    const cotizaciones = incluirCotizaciones ? resultados[1] : [];

    // Combinar y normalizar datos
    const datosCombinados = dataUtils.combineAndSortData(viajes, cotizaciones);

    // Configuración de estados para visualización
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

    /**
     * Obtiene etiqueta del día relativa a hoy
     * @param {Date} fecha - Fecha a evaluar
     * @returns {string} - Etiqueta del día
     */
    const getDayLabel = (fecha) => {
      if (!(fecha instanceof Date) || isNaN(fecha)) return 'Fecha inválida';
      
      const diffTime = fecha - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Hoy';
      if (diffDays === 1) return 'Mañana';
      if (diffDays === 2) return 'Pasado mañana';
      if (diffDays === -1) return 'Ayer';
      if (diffDays === -2) return 'Anteayer';
      if (diffDays < -2) return `Hace ${Math.abs(diffDays)} días`;
      
      try {
        const opciones = { weekday: 'long', day: 'numeric', month: 'short' };
        return fecha.toLocaleDateString('es-ES', opciones);
      } catch (error) {
        return 'Fecha inválida';
      }
    };

    // Organizar datos por día
    const viajesPorDia = new Map();

    datosCombinados.forEach((item) => {
      try {
        if (!item || typeof item !== 'object' || !item._id) return;

        const fechaViaje = new Date(item.horarios.fechaSalida);
        if (isNaN(fechaViaje)) return;

        const fechaSoloFecha = new Date(fechaViaje.getFullYear(), fechaViaje.getMonth(), fechaViaje.getDate());
        const fechaKey = fechaSoloFecha.toISOString().split('T')[0];

        // Obtener información del vehículo
        const truckInfo = routeUtils.getTruckInfo(item);
        
        // Obtener información del conductor
        const driverInfo = routeUtils.getDriverInfo(item);

        // Obtener ubicaciones de origen y destino
        const origen = item.ruta?.origen?.nombre || 'Origen';
        const destino = item.ruta?.destino?.nombre || 'Destino';

        // Configuración de estado
        const estadoActual = item.estado?.actual || 'pendiente';
        const config = estadosConfig[estadoActual] || estadosConfig.pendiente;

        // Información de carga
        const carga = item.carga?.descripcion || 'Carga general';
        const peso = item.carga?.peso?.valor && typeof item.carga.peso.valor === 'number' ? 
          ` - ${item.carga.peso.valor} ${item.carga.peso.unidad || 'kg'}` : '';

        // Horarios
        const salidaProgramada = new Date(item.horarios.fechaSalida);
        let llegadaProgramada;
        
        if (item.horarios.fechaLlegadaEstimada) {
          llegadaProgramada = new Date(item.horarios.fechaLlegadaEstimada);
          if (isNaN(llegadaProgramada)) {
            llegadaProgramada = new Date(salidaProgramada.getTime() + 2 * 60 * 60 * 1000);
          }
        } else {
          llegadaProgramada = new Date(salidaProgramada.getTime() + 2 * 60 * 60 * 1000);
        }

        // Calcular progreso
        let progreso = 0;
        const progresoManual = item.tracking?.progreso?.porcentaje;
        
        if (typeof progresoManual === 'number' && progresoManual >= 0 && progresoManual <= 100) {
          progreso = progresoManual;
        } else if (estadoActual === 'completado') {
          progreso = 100;
        } else if (estadoActual === 'en_curso' && progreso === 0) {
          progreso = Math.floor(Math.random() * 60) + 20; // Progreso simulado para demo
        }

        // Información de contacto del conductor
        let driverPhone = "No disponible";
        const conductor = item.conductorId;
        if (conductor?.phone && typeof conductor.phone === 'string') {
          driverPhone = conductor.phone.trim();
        } else if (conductor?.telefono && typeof conductor.telefono === 'string') {
          driverPhone = conductor.telefono.trim();
        }

        // Información de distancia
        let distancia = null;
        if (item.ruta?.distanciaTotal && typeof item.ruta.distanciaTotal === 'number') {
          distancia = `${item.ruta.distanciaTotal} km`;
        }

        // Formatear elemento para respuesta
        const viajeFormateado = {
          id: item._id.toString(),
          type: `${origen} → ${destino}`,
          time: !isNaN(salidaProgramada) ? salidaProgramada.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit"
          }) : "00:00",
          endTime: !isNaN(llegadaProgramada) ? llegadaProgramada.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit"
          }) : "00:00",
          description: carga + peso,
          
          // Estilo visual
          color: config.color,
          textColor: config.textColor,
          status: config.status,
          icon: config.icon,
          
          // Estado y progreso
          estado: {
            actual: estadoActual,
            label: config.label,
            progreso: Math.round(progreso)
          },
          
          // Información de recursos
          truck: truckInfo,
          driver: driverInfo,
          driverPhone: driverPhone,
          
          // Información de ruta
          origen: origen,
          destino: destino,
          distancia: distancia,
          
          // Tipo de registro
          tipoRegistro: item.tipo
        };

        // Crear o actualizar entrada del día
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
              cancelados: 0,
              cotizaciones: 0
            }
          });
        }

        const diaData = viajesPorDia.get(fechaKey);
        diaData.viajes.push(viajeFormateado);
        diaData.estadisticas.total++;
        
        // Actualizar contadores por estado
        if (item.tipo === 'cotizacion') {
          diaData.estadisticas.cotizaciones++;
        } else {
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
        }

      } catch (error) {
        // Silenciar errores individuales para no interrumpir el procesamiento
        console.warn('Error procesando item:', error.message);
      }
    });

    // Ordenar días y elementos dentro de cada día
    const diasOrdenados = Array.from(viajesPorDia.values())
      .filter(dia => dia && dia.fecha instanceof Date && !isNaN(dia.fecha))
      .sort((a, b) => a.fecha - b.fecha)
      .map(dia => ({
        ...dia,
        viajes: dia.viajes.sort((a, b) => {
          // Priorizar por estado (en curso > retrasado > pendiente > completado > cancelado)
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
          
          // Si tienen la misma prioridad, ordenar por hora
          return a.time.localeCompare(b.time);
        })
      }));

    // Calcular estadísticas generales
    const estadisticasGenerales = {
      totalDias: diasOrdenados.length,
      totalRegistros: datosCombinados.length,
      totalViajes: viajes.length,
      totalCotizaciones: cotizaciones.length,
      registrosHoy: diasOrdenados.find(d => d.label === 'Hoy')?.estadisticas.total || 0,
      registrosMañana: diasOrdenados.find(d => d.label === 'Mañana')?.estadisticas.total || 0,
      estadosDistribucion: {
        pendientes: datosCombinados.filter(v => v.estado?.actual === 'pendiente').length,
        enCurso: datosCombinados.filter(v => v.estado?.actual === 'en_curso').length,
        retrasados: datosCombinados.filter(v => v.estado?.actual === 'retrasado').length,
        completados: datosCombinados.filter(v => v.estado?.actual === 'completado').length,
        cancelados: datosCombinados.filter(v => v.estado?.actual === 'cancelado').length
      }
    };

    res.status(200).json({
      success: true,
      data: diasOrdenados,
      estadisticas: estadisticasGenerales,
      metadata: {
        diasSolicitados: diasAdelante,
        fechaInicio: today.toISOString().split('T')[0],
        fechaLimite: fechaLimite.toISOString().split('T')[0],
        filtroEstado: req.query.estado || 'todos',
        incluyeCotizaciones: incluirCotizaciones,
        modeloVersion: "2.0_hybrid"
      },
      message: `Datos híbridos organizados para los próximos ${diasAdelante} días obtenidos exitosamente`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener datos híbridos organizados por días",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// =====================================================
// MÉTODOS HEREDADOS DEL CONTROLADOR ORIGINAL
// =====================================================

// Actualizar ubicación GPS (solo para viajes)
ViajesController.updateLocation = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { lat, lng, velocidad, direccion } = req.body;

    if (!validationUtils.isValidObjectId(viajeId)) {
      return res.status(400).json({
        success: false,
        message: "ID de viaje inválido"
      });
    }

    if (!validationUtils.isValidCoordinates(lat, lng)) {
      return res.status(400).json({
        success: false,
        message: "Coordenadas inválidas"
      });
    }

    const viaje = await ViajesModel.findById(viajeId);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado"
      });
    }

    const estadosPermitidos = ['en_curso', 'retrasado'];
    if (!estadosPermitidos.includes(viaje.estado?.actual)) {
      return res.status(400).json({
        success: false,
        message: `No se puede actualizar la ubicación. Estado actual: ${viaje.estado?.actual || 'desconocido'}`
      });
    }

    // Actualizar ubicación
    if (!viaje.tracking) viaje.tracking = {};
    if (!viaje.tracking.ubicacionActual) viaje.tracking.ubicacionActual = {};
    
    viaje.tracking.ubicacionActual.lat = lat;
    viaje.tracking.ubicacionActual.lng = lng;
    viaje.tracking.ubicacionActual.timestamp = new Date();
    
    if (velocidad !== undefined) {
      viaje.tracking.ubicacionActual.velocidad = velocidad;
    }
    
    if (direccion !== undefined && typeof direccion === 'string') {
      viaje.tracking.ubicacionActual.direccion = direccion.trim();
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
    res.status(500).json({
      success: false,
      message: "Error al actualizar ubicación",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Obtener detalles de un registro específico (viaje o cotización)
ViajesController.getDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.query; // 'viaje' o 'cotizacion'

    if (!validationUtils.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido"
      });
    }

    let documento = null;
    let tipoEncontrado = tipo;

    if (tipo === 'viaje') {
      documento = await ViajesModel.findById(id)
        .populate('truckId')
        .populate('conductorId')
        .populate('quoteId');
    } else if (tipo === 'cotizacion') {
      documento = await CotizacionesModel.findById(id)
        .populate('clientId');
    } else {
      // Buscar en ambos modelos si no se especifica tipo
      const [viaje, cotizacion] = await Promise.all([
        ViajesModel.findById(id).populate('truckId').populate('conductorId'),
        CotizacionesModel.findById(id).populate('clientId')
      ]);
      
      if (viaje) {
        documento = viaje;
        tipoEncontrado = 'viaje';
      } else if (cotizacion) {
        documento = cotizacion;
        tipoEncontrado = 'cotizacion';
      }
    }

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: "Registro no encontrado"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...documento.toObject(),
        tipo: tipoEncontrado
      },
      message: "Detalles obtenidos exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener detalles",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Completar viaje (solo para viajes)
ViajesController.completeTrip = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { observaciones } = req.body;

    if (!validationUtils.isValidObjectId(viajeId)) {
      return res.status(400).json({
        success: false,
        message: "ID de viaje inválido"
      });
    }

    const viaje = await ViajesModel.findById(viajeId);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado"
      });
    }

    const estadosPermitidos = ['en_curso', 'retrasado', 'pendiente'];
    if (!estadosPermitidos.includes(viaje.estado?.actual)) {
      return res.status(400).json({
        success: false,
        message: `No se puede completar el viaje. Estado actual: ${viaje.estado?.actual}`
      });
    }

    // Actualizar estado a completado
    const estadoAnterior = viaje.estado?.actual || 'desconocido';

    if (!viaje.estado) viaje.estado = {};
    viaje.estado.actual = 'completado';
    viaje.estado.fechaCambio = new Date();
    
    if (!viaje.horarios) viaje.horarios = {};
    viaje.horarios.llegadaReal = new Date();
    
    if (!viaje.tracking) viaje.tracking = {};
    if (!viaje.tracking.progreso) viaje.tracking.progreso = {};
    viaje.tracking.progreso.porcentaje = 100;

    // Registrar en historial
    if (!viaje.estado.historial) viaje.estado.historial = [];
    viaje.estado.historial.push({
      estadoAnterior: estadoAnterior,
      estadoNuevo: 'completado',
      fecha: new Date(),
      motivo: 'manual'
    });

    if (observaciones && observaciones.trim()) {
      if (!viaje.condiciones) viaje.condiciones = {};
      viaje.condiciones.observaciones = observaciones.trim();
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
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Obtener métricas en tiempo real (híbrido)
ViajesController.getRealTimeMetrics = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let fechaInicio = today;
    let fechaFin = tomorrow;

    if (req.query.fecha) {
      const fechaCustom = new Date(req.query.fecha);
      if (!isNaN(fechaCustom)) {
        fechaInicio = new Date(fechaCustom.getFullYear(), fechaCustom.getMonth(), fechaCustom.getDate());
        fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaInicio.getDate() + 1);
      }
    }

    // Métricas de viajes y cotizaciones en paralelo
    const [metricasViajes, metricasCotizaciones] = await Promise.all([
      ViajesModel.aggregate([
        {
          $facet: {
            periodo: [
              {
                $match: {
                  departureTime: {
                    $gte: fechaInicio,
                    $lt: fechaFin
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
                  pendientes: {
                    $sum: { $cond: [{ $eq: ["$estado.actual", "pendiente"] }, 1, 0] }
                  },
                  progresoPromedio: { $avg: { $ifNull: ["$tracking.progreso.porcentaje", 0] } }
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
      ]),

      CotizacionesModel.aggregate([
        {
          $facet: {
            periodo: [
              {
                $match: {
                  $or: [
                    {
                      'horarios.fechaSalida': {
                        $gte: fechaInicio,
                        $lt: fechaFin
                      }
                    },
                    {
                      deliveryDate: {
                        $gte: fechaInicio,
                        $lt: fechaFin
                      }
                    }
                  ]
                }
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  pendientes: {
                    $sum: { $cond: [{ $in: ["$status", ["pendiente", "enviada"]] }, 1, 0] }
                  },
                  aceptadas: {
                    $sum: { $cond: [{ $eq: ["$status", "aceptada"] }, 1, 0] }
                  },
                  ejecutadas: {
                    $sum: { $cond: [{ $eq: ["$status", "ejecutada"] }, 1, 0] }
                  },
                  rechazadas: {
                    $sum: { $cond: [{ $in: ["$status", ["rechazada", "cancelada"]] }, 1, 0] }
                  },
                  valorPromedio: { $avg: { $ifNull: ["$costos.total", "$price"] } }
                }
              }
            ],
            general: [
              {
                $group: {
                  _id: null,
                  totalGeneral: { $sum: 1 },
                  activas: {
                    $sum: { 
                      $cond: [
                        { $in: ["$status", ["aceptada", "ejecutada"]] }, 
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
      ])
    ]);

    // Procesar resultados de viajes
    const datosPeriodoViajes = metricasViajes[0]?.periodo[0] || {
      total: 0,
      completados: 0,
      enCurso: 0,
      retrasados: 0,
      pendientes: 0,
      progresoPromedio: 0
    };
    
    const datosGeneralesViajes = metricasViajes[0]?.general[0] || {
      totalGeneral: 0,
      activos: 0
    };

    // Procesar resultados de cotizaciones
    const datosPeriodoCotizaciones = metricasCotizaciones[0]?.periodo[0] || {
      total: 0,
      pendientes: 0,
      aceptadas: 0,
      ejecutadas: 0,
      rechazadas: 0,
      valorPromedio: 0
    };
    
    const datosGeneralesCotizaciones = metricasCotizaciones[0]?.general[0] || {
      totalGeneral: 0,
      activas: 0
    };

    res.status(200).json({
      success: true,
      data: {
        periodo: {
          fecha: fechaInicio.toISOString().split('T')[0],
          viajes: {
            total: datosPeriodoViajes.total,
            completados: datosPeriodoViajes.completados,
            enCurso: datosPeriodoViajes.enCurso,
            retrasados: datosPeriodoViajes.retrasados,
            pendientes: datosPeriodoViajes.pendientes,
            progresoPromedio: Math.round(datosPeriodoViajes.progresoPromedio)
          },
          cotizaciones: {
            total: datosPeriodoCotizaciones.total,
            pendientes: datosPeriodoCotizaciones.pendientes,
            aceptadas: datosPeriodoCotizaciones.aceptadas,
            ejecutadas: datosPeriodoCotizaciones.ejecutadas,
            rechazadas: datosPeriodoCotizaciones.rechazadas,
            valorPromedio: Math.round(datosPeriodoCotizaciones.valorPromedio || 0)
          },
          combinado: {
            totalRegistros: datosPeriodoViajes.total + datosPeriodoCotizaciones.total,
            registrosActivos: datosPeriodoViajes.enCurso + datosPeriodoViajes.retrasados + 
                             datosPeriodoCotizaciones.aceptadas + datosPeriodoCotizaciones.ejecutadas
          }
        },
        general: {
          viajes: {
            total: datosGeneralesViajes.totalGeneral,
            activos: datosGeneralesViajes.activos
          },
          cotizaciones: {
            total: datosGeneralesCotizaciones.totalGeneral,
            activas: datosGeneralesCotizaciones.activas
          },
          combinado: {
            totalRegistros: datosGeneralesViajes.totalGeneral + datosGeneralesCotizaciones.totalGeneral,
            registrosActivos: datosGeneralesViajes.activos + datosGeneralesCotizaciones.activas
          }
        },
        timestamp: now.toISOString()
      },
      message: "Métricas híbridas en tiempo real obtenidas exitosamente"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener métricas híbridas en tiempo real",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// =====================================================
// MÉTODOS ESPECÍFICOS PARA COTIZACIONES
// =====================================================

// Crear viaje desde cotización
ViajesController.createTripFromQuote = async (req, res) => {
  try {
    const { cotizacionId } = req.params;
    const { truckId, conductorId } = req.body;

    if (!validationUtils.isValidObjectId(cotizacionId)) {
      return res.status(400).json({
        success: false,
        message: "ID de cotización inválido"
      });
    }

    if (!validationUtils.isValidObjectId(truckId) || !validationUtils.isValidObjectId(conductorId)) {
      return res.status(400).json({
        success: false,
        message: "IDs de camión y conductor requeridos y válidos"
      });
    }

    const cotizacion = await CotizacionesModel.findById(cotizacionId);
    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        message: "Cotización no encontrada"
      });
    }

    if (cotizacion.status !== 'aceptada') {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden crear viajes desde cotizaciones aceptadas"
      });
    }

    // Usar el método del modelo para crear el viaje
    const nuevoViaje = await cotizacion.crearViaje(truckId, conductorId);

    res.status(201).json({
      success: true,
      data: nuevoViaje,
      message: "Viaje creado exitosamente desde cotización"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear viaje desde cotización",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Actualizar estado de cotización
ViajesController.updateQuoteStatus = async (req, res) => {
  try {
    const { cotizacionId } = req.params;
    const { status, motivoRechazo } = req.body;

    if (!validationUtils.isValidObjectId(cotizacionId)) {
      return res.status(400).json({
        success: false,
        message: "ID de cotización inválido"
      });
    }

    if (!validationUtils.validateQuoteState(status)) {
      return res.status(400).json({
        success: false,
        message: "Estado de cotización inválido"
      });
    }

    const cotizacion = await CotizacionesModel.findById(cotizacionId);
    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        message: "Cotización no encontrada"
      });
    }

    // Actualizar estado
    cotizacion.status = status;

    // Establecer fechas según el estado
    switch (status) {
      case 'enviada':
        cotizacion.fechaEnvio = new Date();
        break;
      case 'aceptada':
        cotizacion.fechaAceptacion = new Date();
        break;
      case 'rechazada':
        cotizacion.fechaRechazo = new Date();
        if (motivoRechazo) {
          cotizacion.motivoRechazo = motivoRechazo.trim();
        }
        break;
    }

    await cotizacion.save();

    res.status(200).json({
      success: true,
      data: cotizacion,
      message: "Estado de cotización actualizado exitosamente"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar estado de cotización",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// =====================================================
// MÉTODO DE DEBUGGING (solo en desarrollo)
// =====================================================
if (process.env.NODE_ENV === 'development') {
  ViajesController.debugHybridData = async (req, res) => {
    try {
      // Obtener muestras de ambos modelos
      const [muestrasViajes, muestrasCotizaciones] = await Promise.all([
        ViajesModel.find({}).select('carga estado ruta').limit(3).lean(),
        CotizacionesModel.find({}).select('carga status ruta truckType').limit(3).lean()
      ]);

      // Contar totales
      const [totalViajes, totalCotizaciones] = await Promise.all([
        ViajesModel.countDocuments(),
        CotizacionesModel.countDocuments()
      ]);

      // Contar campos específicos
      const [viajesConRuta, cotizacionesConRuta] = await Promise.all([
        ViajesModel.countDocuments({ 'ruta.origen.nombre': { $exists: true, $ne: null } }),
        CotizacionesModel.countDocuments({ 'ruta.origen.nombre': { $exists: true, $ne: null } })
      ]);

      res.status(200).json({
        success: true,
        debug: {
          totales: {
            viajes: totalViajes,
            cotizaciones: totalCotizaciones,
            combinado: totalViajes + totalCotizaciones
          },
          conRuta: {
            viajes: viajesConRuta,
            cotizaciones: cotizacionesConRuta
          },
          muestras: {
            viajes: muestrasViajes,
            cotizaciones: muestrasCotizaciones
          },
          modeloVersion: "2.0_hybrid",
          timestamp: new Date().toISOString()
        },
        message: "Información de debug híbrida obtenida"
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error en debug híbrido",
        error: error.message
      });
    }
  };
}

export default ViajesController;