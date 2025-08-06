// Controllers/Viajes.js - VERSIÓN OPTIMIZADA Y LIMPIA
import ViajesModel from "../Models/Viajes.js";

const ViajesController = {};

// =====================================================
// GET: Datos optimizados para el mapa
// =====================================================
ViajesController.getMapData = async (req, res) => {
  try {
    console.log("🗺️ Obteniendo datos del mapa...");

    // 🚛 OBTENER VIAJES ACTIVOS CON POPULATE
    const viajes = await ViajesModel.find({
      'estado.actual': { $in: ['pendiente', 'en_curso', 'retrasado', 'completado'] }
    })
    .populate('truckId', 'brand model licensePlate name marca modelo placa nombre')
    .populate('conductorId', 'name phone')
    .select('-tracking.historialUbicaciones -ruta.rutaOptimizada') // Excluir datos pesados
    .sort({ departureTime: 1 })
    .lean();

    console.log(`🚛 Encontrados ${viajes.length} viajes`);

    // 🗺️ CREAR MAPA DE UBICACIONES ÚNICAS
    const locationMap = new Map();
    
    // 🏢 TERMINAL PRINCIPAL FIJO
    locationMap.set("Terminal Principal", {
      name: "Terminal Principal",
      coords: [13.8833, -89.1000], // Coordenadas de El Salvador
      type: "red",
      number: "HQ",
      description: "Centro de operaciones principal",
      tripCount: 0,
      isTerminal: true,
      details: "Base principal de Rivera Transport"
    });

    // 📍 PROCESAR UBICACIONES DE ORIGEN Y DESTINO
    viajes.forEach((viaje, index) => {
      try {
        // Procesar ORIGEN
        if (viaje.ruta?.origen?.nombre) {
          const origenKey = viaje.ruta.origen.nombre;
          if (!locationMap.has(origenKey)) {
            locationMap.set(origenKey, {
              name: viaje.ruta.origen.nombre,
              coords: [
                viaje.ruta.origen.coordenadas.lat,
                viaje.ruta.origen.coordenadas.lng
              ],
              type: viaje.ruta.origen.tipo === 'terminal' ? 'red' : 
                    viaje.ruta.origen.tipo === 'puerto' ? 'blue' : 'green',
              number: "0",
              description: `Origen - ${viaje.ruta.origen.tipo || 'ciudad'}`,
              tripCount: 0,
              nextTrip: null,
              isTerminal: viaje.ruta.origen.tipo === 'terminal',
              details: `${viaje.ruta.origen.tipo || 'Ciudad'} de origen`
            });
          }
        }

        // Procesar DESTINO
        if (viaje.ruta?.destino?.nombre) {
          const destinoKey = viaje.ruta.destino.nombre;
          if (!locationMap.has(destinoKey)) {
            locationMap.set(destinoKey, {
              name: viaje.ruta.destino.nombre,
              coords: [
                viaje.ruta.destino.coordenadas.lat,
                viaje.ruta.destino.coordenadas.lng
              ],
              type: viaje.ruta.destino.tipo === 'terminal' ? 'red' : 
                    viaje.ruta.destino.tipo === 'puerto' ? 'blue' : 'green',
              number: "0",
              description: `Destino - ${viaje.ruta.destino.tipo || 'ciudad'}`,
              tripCount: 0,
              nextTrip: null,
              isTerminal: viaje.ruta.destino.tipo === 'terminal',
              details: `${viaje.ruta.destino.tipo || 'Ciudad'} de destino`
            });
          }

          // Actualizar estadísticas del destino
          const location = locationMap.get(destinoKey);
          location.tripCount++;
          location.number = location.tripCount.toString();

          // Próximo viaje programado
          if (viaje.estado.actual === 'pendiente' && !location.nextTrip) {
            location.nextTrip = new Date(viaje.departureTime).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit"
            });
          }

          location.description = `${location.tripCount} viaje${location.tripCount > 1 ? 's' : ''} programado${location.tripCount > 1 ? 's' : ''}`;
        }

      } catch (error) {
        console.log(`❌ Error procesando ubicaciones del viaje ${index + 1}:`, error.message);
      }
    });

    // 🛣️ PROCESAR RUTAS CON INFORMACIÓN COMPLETA
    const routes = viajes.map((viaje, index) => {
      try {
        const origen = viaje.ruta?.origen;
        const destino = viaje.ruta?.destino;
        
        if (!origen || !destino) return null;

        // 📍 COORDENADAS DE LA RUTA
        const coordinates = [
          [origen.coordenadas.lat, origen.coordenadas.lng],
          [destino.coordenadas.lat, destino.coordenadas.lng]
        ];

        // 📊 ESTADO Y COLOR
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

        // 🚛 INFORMACIÓN DEL TRUCK MEJORADA
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
          if (viaje.conductor?.id?.nombre) return viaje.conductor.id.nombre;
          if (viaje.conductor?.nombre) return viaje.conductor.nombre;
          return "Conductor por asignar";
        };

        // ⏰ CALCULAR TIEMPOS Y PROGRESO
        const ahora = new Date();
        const salidaProgramada = new Date(viaje.departureTime);
        const llegadaProgramada = new Date(viaje.arrivalTime);
        const llegadaEstimada = viaje.horarios?.llegadaEstimada ? 
          new Date(viaje.horarios.llegadaEstimada) : llegadaProgramada;

        // 📈 PROGRESO INTELIGENTE
        let progreso = viaje.tracking?.progreso?.porcentaje || 0;
        let ubicacionActual = "Terminal";
        
        if (viaje.estado.actual === 'en_curso' || viaje.estado.actual === 'retrasado') {
          // Si no hay progreso manual, calcular automáticamente
          if (progreso === 0) {
            const tiempoTotal = llegadaProgramada - salidaProgramada;
            const tiempoTranscurrido = ahora - salidaProgramada;
            progreso = Math.min(95, Math.max(0, (tiempoTranscurrido / tiempoTotal) * 100));
          }
          
          if (viaje.tracking?.ubicacionActual?.lat) {
            ubicacionActual = `${Math.round(progreso)}% completado - GPS activo`;
          } else {
            ubicacionActual = `${Math.round(progreso)}% completado`;
          }
        } else if (viaje.estado.actual === 'completado') {
          progreso = 100;
          ubicacionActual = destino.nombre;
        } else if (viaje.estado.actual === 'pendiente') {
          ubicacionActual = origen.nombre;
        }

        // 🚨 ALERTAS ACTIVAS
        const alertasActivas = viaje.alertas?.filter(alert => !alert.resuelta) || [];

        return {
          id: viaje._id.toString(),
          coordinates,
          status,
          statusText,
          frequency: viaje.estado.actual === "en_curso" ? "high" : 
                    viaje.estado.actual === "retrasado" ? "high" : "medium",
          
          // 📏 DISTANCIA Y TIEMPO
          distance: viaje.ruta?.distanciaTotal ? 
            `${viaje.ruta.distanciaTotal} km` : "Calculando...",
          estimatedTime: viaje.ruta?.tiempoEstimado ? 
            `${Math.floor(viaje.ruta.tiempoEstimado / 60)}h ${viaje.ruta.tiempoEstimado % 60}min` : 
            "Calculando...",
          
          // 📊 INFORMACIÓN DEL VIAJE
          tripInfo: {
            driver: getDriverInfo(),
            driverPhone: viaje.conductor?.id?.telefono || 
                        viaje.conductor?.telefono || 
                        "No disponible",
            truck: getTruckInfo(),
            cargo: viaje.carga?.descripcion ? 
              `${viaje.carga.descripcion}${viaje.carga.peso?.valor ? ` (${viaje.carga.peso.valor} ${viaje.carga.peso.unidad})` : ''}` : 
              "Carga general",
            
            // ⏰ HORARIOS DETALLADOS
            departure: salidaProgramada.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit"
            }),
            arrival: llegadaProgramada.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit"
            }),
            estimatedArrival: llegadaEstimada.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit"
            }),
            
            // 📈 PROGRESO Y UBICACIÓN
            progress: Math.round(progreso),
            currentLocation: ubicacionActual,
            
            // ⏰ HORARIOS REALES
            realDeparture: viaje.horarios?.salidaReal ? 
              new Date(viaje.horarios.salidaReal).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit"
              }) : null,
            realArrival: viaje.horarios?.llegadaReal ? 
              new Date(viaje.horarios.llegadaReal).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit"
              }) : null
          },
          
          // 📝 DESCRIPCIÓN Y DETALLES
          description: viaje.tripDescription,
          
          // 🗺️ INFORMACIÓN DE RUTA
          route: {
            from: origen.nombre,
            to: destino.nombre,
            fromType: origen.tipo || 'ciudad',
            toType: destino.tipo || 'ciudad'
          },
          
          // 🚨 ALERTAS Y NOTIFICACIONES
          alerts: alertasActivas.map(alert => ({
            type: alert.tipo,
            message: alert.mensaje,
            priority: alert.prioridad || 'media',
            date: alert.fecha
          })),
          
          // 💰 COSTOS (si disponibles)
          costs: viaje.costos?.total ? {
            fuel: viaje.costos.combustible || 0,
            tolls: viaje.costos.peajes || 0,
            others: viaje.costos.otros || 0,
            total: viaje.costos.total
          } : null,
          
          // 🌡️ CONDICIONES
          conditions: viaje.condiciones ? {
            weather: viaje.condiciones.clima,
            traffic: viaje.condiciones.trafico,
            road: viaje.condiciones.carretera
          } : null,
          
          // ⏱️ MÉTRICAS DE TIEMPO
          metrics: {
            duration: viaje.duracionProgramada, // virtual getter
            realDuration: viaje.duracionReal,   // virtual getter
            delay: viaje.retrasoEnMinutos       // virtual getter
          }
        };

      } catch (error) {
        console.log(`❌ Error procesando ruta ${index + 1}:`, error.message);
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
      !v.horarios?.llegadaReal || 
      v.horarios.llegadaReal <= v.arrivalTime
    );

    const statistics = {
      // 📈 CONTADORES BÁSICOS
      total_routes: viajes.length,
      active_routes: viajes.filter(v => v.estado.actual === "en_curso").length,
      completed_routes: completedTrips.length,
      pending_routes: viajes.filter(v => v.estado.actual === "pendiente").length,
      delayed_routes: viajes.filter(v => v.estado.actual === "retrasado").length,
      cancelled_routes: viajes.filter(v => v.estado.actual === "cancelado").length,
      
      // 📊 TASAS DE RENDIMIENTO
      completion_rate: viajes.length > 0 ? 
        Math.round((completedTrips.length / viajes.length) * 100) : 0,
      on_time_rate: completedTrips.length > 0 ? 
        Math.round((onTimeTrips.length / completedTrips.length) * 100) : 0,
      average_progress: routes.length > 0 ?
        Math.round(routes.reduce((acc, route) => acc + route.tripInfo.progress, 0) / routes.length) : 0,
      
      // 👥 RECURSOS
      total_drivers: new Set(viajes.map(v => v.conductor?.id?._id || v.conductor?.id).filter(Boolean)).size,
      total_trucks: new Set(viajes.map(v => v.truckId?._id).filter(Boolean)).size,
      
      // 📅 MÉTRICAS TEMPORALES  
      today_trips: viajes.filter(v => {
        const today = new Date();
        const tripDate = new Date(v.departureTime);
        return tripDate.toDateString() === today.toDateString();
      }).length,
      
      // 🚨 ALERTAS Y PROBLEMAS
      active_alerts: viajes.reduce((acc, v) => 
        acc + (v.alertas?.filter(alert => !alert.resuelta).length || 0), 0),
      
      // 💰 INFORMACIÓN FINANCIERA
      total_revenue: viajes.reduce((acc, v) => acc + (v.costos?.total || 0), 0),
      
      // 🎯 MÉTRICAS DE CALIDAD
      growth_percentage: 35 // Puedes calcular esto comparando con meses anteriores
    };

    // 🎯 RESPUESTA OPTIMIZADA
    const mapData = {
      locations: Array.from(locationMap.values()),
      routes,
      cities,
      statistics,
      
      // ⏰ METADATOS
      lastUpdate: new Date().toISOString(),
      autoUpdateEnabled: true,
      refreshInterval: 60000, // 1 minuto
      dataSource: "single_model"
    };

    console.log("✅ Datos procesados exitosamente:");
    console.log(`📍 Ubicaciones: ${mapData.locations.length}`);
    console.log(`🛣️ Rutas: ${mapData.routes.length}`);
    console.log(`📊 Tasa de finalización: ${statistics.completion_rate}%`);
    console.log(`⏰ Puntualidad: ${statistics.on_time_rate}%`);

    res.status(200).json({
      success: true,
      data: mapData,
      message: "Datos del mapa obtenidos exitosamente"
    });

  } catch (error) {
    console.error("❌ Error obteniendo datos del mapa:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener datos del mapa",
      error: error.message
    });
  }
};

// =====================================================
// GET: Análisis de distribución de cargas (VERSIÓN UNIFICADA)
// =====================================================
ViajesController.getCargaDistribution = async (req, res) => {
  try {
    console.log("📊 Iniciando análisis de distribución de cargas...");

    // 📊 DISTRIBUCIÓN POR CATEGORÍA (compatible con datos antiguos y nuevos)
    const distribucionCategoria = await ViajesModel.aggregate([
      {
        $group: {
          _id: {
            // 🔧 COMPATIBILIDAD: usa categoria si existe, sino tipo, sino descripción
            $ifNull: [
              "$carga.categoria", 
              { $ifNull: ["$carga.tipo", "$carga.descripcion"] }
            ]
          },
          count: { $sum: 1 },
          pesoPromedio: { $avg: "$carga.peso.valor" },
          pesoTotal: { $sum: "$carga.peso.valor" },
          valorPromedio: { $avg: "$carga.valor.montoDeclarado" },
          // Ejemplos de descripciones
          ejemplos: { $addToSet: "$carga.descripcion" },
          // Contar tipos de riesgo
          riesgosEspeciales: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ["$carga.clasificacionRiesgo", "normal"] },
                  { $ne: ["$carga.clasificacionRiesgo", null] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      // Obtener el total para calcular porcentajes
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
              ejemplos: "$ejemplos",
              riesgosEspeciales: "$riesgosEspeciales"
            }
          },
          total: { $sum: "$count" }
        }
      },
      // Calcular porcentajes
      {
        $project: {
          _id: 0,
          total: 1,
          distribucion: {
            $map: {
              input: "$categorias",
              as: "item",
              in: {
                categoria: "$$item.categoria",
                count: "$$item.count",
                pesoPromedio: { $round: [{ $ifNull: ["$$item.pesoPromedio", 0] }, 2] },
                pesoTotal: { $round: [{ $ifNull: ["$$item.pesoTotal", 0] }, 2] },
                valorPromedio: { $round: [{ $ifNull: ["$$item.valorPromedio", 0] }, 2] },
                ejemplos: { $slice: ["$$item.ejemplos", 3] }, // Máximo 3 ejemplos
                riesgosEspeciales: "$$item.riesgosEspeciales",
                porcentaje: {
                  $round: [
                    { $multiply: [{ $divide: ["$$item.count", "$total"] }, 100] },
                    1
                  ]
                }
              }
            }
          }
        }
      },
      // Ordenar por cantidad descendente
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

    // Extraer resultado principal
    const resultado = distribucionCategoria[0] || { total: 0, distribucion: [] };

    console.log(`📦 Encontradas ${resultado.distribucion.length} categorías diferentes`);
    console.log(`🚛 Total de viajes analizados: ${resultado.total}`);

    // 🎯 PROCESAR DATOS PARA FRONTEND
    const datosFormateados = resultado.distribucion.map((item, index) => {
      const categoria = item.categoria || 'Sin categoría';
      const nombreMostrar = categoria.charAt(0).toUpperCase() + categoria.slice(1);
      
      return {
        id: `carga-${index}`,
        // Para compatibilidad con frontend actual
        tipo: categoria.toLowerCase(),
        name: nombreMostrar,
        categoria: categoria,
        count: item.count,
        porcentaje: item.porcentaje,
        percentage: item.porcentaje, // Alias para compatibilidad
        pesoPromedio: item.pesoPromedio,
        pesoTotal: item.pesoTotal,
        valorPromedio: item.valorPromedio,
        ejemplos: item.ejemplos.filter(Boolean).slice(0, 3),
        descripcion: item.ejemplos[0] || nombreMostrar,
        riesgosEspeciales: item.riesgosEspeciales,
        clasificacionRiesgo: item.riesgosEspeciales > 0 ? 'especial' : 'normal',
        unidadPeso: 'kg'
      };
    });

    // 📊 ESTADÍSTICAS GENERALES
    const estadisticas = {
      totalTiposUnicos: datosFormateados.length,
      totalViajes: resultado.total,
      tipoMasFrecuente: datosFormateados[0]?.name || 'N/A',
      porcentajeMasFrecuente: datosFormateados[0]?.porcentaje || 0,
      pesoTotalTransportado: datosFormateados.reduce((acc, item) => acc + item.pesoTotal, 0),
      promedioViajesPorCategoria: datosFormateados.length > 0 ? 
        Math.round(resultado.total / datosFormateados.length) : 0,
      top3Tipos: datosFormateados.slice(0, 3).map(t => ({
        tipo: t.name,
        porcentaje: t.porcentaje,
        cantidad: t.count
      }))
    };

    // ✅ RESPUESTA EXITOSA
    res.status(200).json({
      success: true,
      data: datosFormateados,
      estadisticas: estadisticas,
      
      // 🏷️ Metadatos para compatibilidad
      metadata: {
        total: resultado.total,
        ultimaActualizacion: new Date().toISOString(),
        modeloVersion: "2.0",
        compatibilidad: "backward_compatible",
        campoUtilizado: "categoria/tipo/descripcion"
      },
      
      message: `Análisis de ${datosFormateados.length} tipos de carga completado`,
      timestamp: new Date().toISOString()
    });

    console.log("✅ Análisis de distribución completado exitosamente");

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
      .populate('conductor.id', 'nombre telefono')
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
    viaje.horarios.llegadaReal = new Date();
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
// MÉTODOS ADICIONALES ÚTILES
// =====================================================

ViajesController.getAllViajes = async (req, res) => {
  try {
    const viajes = await ViajesModel.find()
      .populate('truckId', 'brand model licensePlate name')
      .populate('conductor.id', 'nombre telefono')
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
      .sort({ 'horarios.llegadaReal': -1 })
      .limit(20)
      .populate('truckId', 'brand model licensePlate name')
      .populate('conductor.id', 'nombre');

    res.status(200).json({ success: true, data: completed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

ViajesController.getCargaStats = async (req, res) => {
  try {
    const cargas = await ViajesModel.aggregate([
      {
        $group: {
          _id: "$carga.descripcion",
          cantidad: { $sum: 1 },
          pesoTotal: { $sum: "$carga.peso.valor" }
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
// NUEVOS ENDPOINTS PARA ANÁLISIS DETALLADO
// =====================================================

// 🆕 NUEVO ENDPOINT: Estadísticas detalladas por categoría
ViajesController.getCargaDetailsByCategory = async (req, res) => {
  try {
    const { categoria } = req.params;

    const detalles = await ViajesModel.find({
      $or: [
        { "carga.categoria": categoria },
        { "carga.tipo": categoria },
        { "carga.descripcion": { $regex: categoria, $options: 'i' } }
      ]
    })
    .populate('truckId', 'brand model licensePlate')
    .populate('conductor.id', 'nombre')
    .select('carga ruta estado departureTime arrivalTime')
    .sort({ departureTime: -1 })
    .limit(50);

    // Estadísticas específicas de la categoría
    const stats = await ViajesModel.aggregate([
      { 
        $match: { 
          $or: [
            { "carga.categoria": categoria },
            { "carga.tipo": categoria },
            { "carga.descripcion": { $regex: categoria, $options: 'i' } }
          ]
        } 
      },
      {
        $group: {
          _id: null,
          totalViajes: { $sum: 1 },
          pesoTotal: { $sum: "$carga.peso.valor" },
          pesoPromedio: { $avg: "$carga.peso.valor" },
          valorTotal: { $sum: "$carga.valor.montoDeclarado" },
          completados: {
            $sum: { $cond: [{ $eq: ["$estado.actual", "completado"] }, 1, 0] }
          },
          // Top subcategorías
          subcategorias: { $addToSet: "$carga.subcategoria" },
          // Riesgos asociados
          riesgos: { $addToSet: "$carga.clasificacionRiesgo" }
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
        $match: {
          "carga.subcategoria": { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $group: {
          _id: {
            categoria: "$carga.categoria",
            subcategoria: "$carga.subcategoria"
          },
          count: { $sum: 1 },
          pesoPromedio: { $avg: "$carga.peso.valor" }
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

    // Obtener tipos únicos usando aggregation para mayor flexibilidad
    const tiposUnicos = await ViajesModel.aggregate([
      {
        $group: {
          _id: null,
          categorias: { $addToSet: "$carga.categoria" },
          tipos: { $addToSet: "$carga.tipo" },
          descripciones: { $addToSet: "$carga.descripcion" }
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
    // Obtener 5 viajes de muestra
    const muestras = await ViajesModel.find({})
      .select('carga estado')
      .limit(5)
      .lean();

    // Obtener tipos únicos por campo
    const categorias = await ViajesModel.distinct('carga.categoria');
    const tipos = await ViajesModel.distinct('carga.tipo');
    const descripciones = await ViajesModel.distinct('carga.descripcion');

    // Contar total de documentos
    const totalViajes = await ViajesModel.countDocuments();
    const viajesConCategoria = await ViajesModel.countDocuments({
      'carga.categoria': { $exists: true, $ne: null, $ne: "" }
    });
    const viajesConTipo = await ViajesModel.countDocuments({
      'carga.tipo': { $exists: true, $ne: null, $ne: "" }
    });
    const viajesConDescripcion = await ViajesModel.countDocuments({
      'carga.descripcion': { $exists: true, $ne: null, $ne: "" }
    });

    res.status(200).json({
      success: true,
      debug: {
        totalViajes: totalViajes,
        viajesConCategoria: viajesConCategoria,
        viajesConTipo: viajesConTipo,
        viajesConDescripcion: viajesConDescripcion,
        categoriasUnicas: categorias.length,
        tiposUnicos: tipos.length,
        descripcionesUnicas: descripciones.length,
        ejemplosCategorias: categorias.slice(0, 5),
        ejemplosTipos: tipos.slice(0, 5),
        ejemplosDescripciones: descripciones.slice(0, 5),
        muestras: muestras
      },
      message: "Información de debug obtenida"
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
      viaje.tracking.progreso.fechaActualizacion = new Date();
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
        viaje.horarios.llegadaReal = new Date();
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
        horarios: viaje.horarios
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

export default ViajesController;