// Controllers/Viajes.js
import ViajesModel from "../Models/Viajes.js"; // Modelo de viajes

const ViajesController = {};

// =====================================================
// GET: Obtener todos los viajes (endpoint general)
// =====================================================
ViajesController.getAllViajes = async (req, res) => {
  try {
    const viajes = await ViajesModel.find();
    res.status(200).json(viajes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// GET: Obtener datos procesados para el mapa
// =====================================================
ViajesController.getMapData = async (req, res) => {
  try {
    console.log("🗺️ Solicitando datos del mapa...");

    // 1. Buscar todos los viajes y poblar conductor y camión
    const viajes = await ViajesModel.find()
      .populate({
        path: "conductor.id",
        select: "nombre telefono",
      })
      .populate({
        path: "truckId",
        select: "brand model licensePlate name", // Campos correctos del modelo
      })
      .lean();

    console.log(`📊 Encontrados ${viajes.length} viajes en la base de datos`);
    
    // 🐛 Debug: Ver estructura de los primeros datos
    if (viajes.length > 0) {
      console.log('🔍 Primer viaje encontrado:', JSON.stringify(viajes[0], null, 2));
    }

    // ============================================
    // TERMINAL PRINCIPAL FIJA - SAN JACINTO
    // ============================================
    const terminalPrincipal = {
      name: "Terminal San Jacinto",
      coords: [13.8833, -89.1000], // Coordenadas de San Jacinto, El Salvador
      type: "red",
      number: "",
      description: "Terminal principal - Base de operaciones San Jacinto",
      tripCount: 0,
      isTerminal: true,
    };

    // Mapa para almacenar ubicaciones únicas (orígenes y destinos)
    const locationMap = new Map();
    locationMap.set("Terminal San Jacinto", terminalPrincipal);

    // ============================================
    // RECORRER CADA VIAJE Y CREAR PUNTOS
    // ============================================
    viajes.forEach((viaje) => {
      const estadoActual = viaje.estado?.actual || "pendiente"; // Protección

      // --------- ORIGEN ---------
      if (viaje.ruta?.origen) {
        const origenKey = viaje.ruta.origen.nombre;
        if (!locationMap.has(origenKey)) {
          locationMap.set(origenKey, {
            name: viaje.ruta.origen.nombre,
            coords: [
              viaje.ruta.origen.coordenadas.lat,
              viaje.ruta.origen.coordenadas.lng,
            ],
            type: "green",
            number: "0",
            description: "Punto de origen",
            tripCount: 0,
            nextTrip: null,
            isTerminal: false,
          });
        }
      }

      // --------- DESTINO ---------
      if (viaje.ruta?.destino) {
        const destinoKey = viaje.ruta.destino.nombre;
        if (!locationMap.has(destinoKey)) {
          locationMap.set(destinoKey, {
            name: viaje.ruta.destino.nombre,
            coords: [
              viaje.ruta.destino.coordenadas.lat,
              viaje.ruta.destino.coordenadas.lng,
            ],
            type: estadoActual === "pendiente" ? "blue" : "green",
            number: "0",
            description: "Destino de viaje",
            tripCount: 0,
            nextTrip: null,
            isTerminal: false,
          });
        }

        // Actualizar estadísticas de ese destino
        const location = locationMap.get(destinoKey);
        location.tripCount++;
        location.number = location.tripCount.toString();

        // Si está pendiente y no hay "nextTrip" guardamos la hora de salida
        if (estadoActual === "pendiente" && !location.nextTrip) {
          location.nextTrip = new Date(
            viaje.departureTime
          ).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        // Actualizar descripción del destino
        location.description = `${location.tripCount} viaje${
          location.tripCount > 1 ? "s" : ""
        } programado${location.tripCount > 1 ? "s" : ""}`;
      }
    });

    // Convertir el mapa de ubicaciones a array
    const locations = Array.from(locationMap.values());

    // ============================================
    // PROCESAR RUTAS PARA EL MAPA
    // ============================================
    const routes = viajes
      .map((viaje) => {
        const estadoActual = viaje.estado?.actual || "pendiente";

        // Coordenadas inicio y fin
        let coordinates = [];
        if (viaje.ruta?.origen && viaje.ruta?.destino) {
          coordinates = [
            [
              viaje.ruta.origen.coordenadas.lat,
              viaje.ruta.origen.coordenadas.lng,
            ],
            [
              viaje.ruta.destino.coordenadas.lat,
              viaje.ruta.destino.coordenadas.lng,
            ],
          ];
        }

        // Estado para el frontend
        let status = "scheduled";
        switch (estadoActual) {
          case "en_curso":
            status = "in_progress";
            break;
          case "completado":
            status = "completed";
            break;
          case "cancelado":
            status = "cancelled";
            break;
          case "pendiente":
          default:
            status = "scheduled";
            break;
        }

        // Devolver objeto ruta
        return {
          id: viaje._id.toString(),
          coordinates: coordinates,
          status: status,
          frequency: estadoActual === "en_curso" ? "high" : "medium",
          tripInfo: {
            driver: viaje.conductor?.nombre || viaje.conductor?.id?.nombre || "No asignado",
            truck: (() => {
              // Debug: ver qué datos tiene el truckId
              console.log('🚛 Datos del truck para viaje:', viaje._id, viaje.truckId);
              
              if (viaje.truckId && typeof viaje.truckId === 'object') {
                const { brand, model, licensePlate, name } = viaje.truckId;
                
                // Opción 1: Mostrar brand + model + placa
                if (brand && model) {
                  return `${brand} ${model}${licensePlate ? ` (${licensePlate})` : ''}`;
                }
                // Opción 2: Si solo tiene name
                else if (name) {
                  return `${name}${licensePlate ? ` (${licensePlate})` : ''}`;
                }
                // Opción 3: Solo placa
                else if (licensePlate) {
                  return `Camión ${licensePlate}`;
                }
              }
              return "Camión no especificado";
            })(),
            cargo: viaje.carga?.descripcion || "Carga general",
            departure: new Date(viaje.departureTime).toLocaleTimeString(
              "es-ES",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
            arrival: new Date(viaje.arrivalTime).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          viaje: {
            id: viaje._id,
            descripcion: viaje.tripDescription,
            distancia: viaje.ruta?.distanciaTotal || 0,
            tiempoEstimado: viaje.ruta?.tiempoEstimado || 0,
          },
        };
      })
      .filter((route) => route.coordinates.length > 0);

    // ============================================
    // CIUDADES DE REFERENCIA
    // ============================================
    const cities = [
      { name: "San Salvador", coords: [13.6929, -89.2182] },
      { name: "Soyapango", coords: [13.7167, -89.1389] },
      { name: "Mejicanos", coords: [13.7408, -89.2075] },
      { name: "Santa Ana", coords: [13.9942, -89.5592] },
      { name: "San Miguel", coords: [13.4833, -88.1833] },
      { name: "San Jacinto", coords: [13.8833, -89.1000] }, // Agregada ciudad de referencia
    ];

    // ============================================
    // ESTADÍSTICAS
    // ============================================
    const statistics = {
      total_routes: viajes.length,
      active_routes: viajes.filter((v) => v.estado?.actual === "en_curso")
        .length,
      completed_routes: viajes.filter((v) => v.estado?.actual === "completado")
        .length,
      pending_routes: viajes.filter((v) => v.estado?.actual === "pendiente")
        .length,
      growth_percentage: 35, // Ejemplo fijo
      monthly_trips: viajes.filter((v) => {
        const viajeDate = new Date(v.createdAt);
        const currentDate = new Date();
        return (
          viajeDate.getMonth() === currentDate.getMonth() &&
          viajeDate.getFullYear() === currentDate.getFullYear()
        );
      }).length,
      drivers_active: new Set(
        viajes.map((v) => v.conductor?.id).filter(Boolean)
      ).size,
    };

    // ============================================
    // RESPUESTA FINAL
    // ============================================
    const mapData = {
      locations,
      routes,
      cities,
      statistics,
    };

    console.log("✅ Datos del mapa procesados exitosamente");
    console.log(`📍 Ubicaciones: ${locations.length}`);
    console.log(`🛣️ Rutas: ${routes.length}`);
    console.log(
      `📊 Viajes activos: ${statistics.active_routes}/${statistics.total_routes}`
    );

    res.status(200).json({
      success: true,
      data: mapData,
      message: "Datos del mapa obtenidos exitosamente",
    });
  } catch (error) {
    // Captura cualquier error inesperado
    console.error("❌ Error al obtener datos del mapa:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener datos del mapa",
      error: error.message,
    });
  }
};

// =====================================================
// PATCH: Actualizar ubicación en tiempo real
// =====================================================
ViajesController.updateLocation = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { lat, lng, velocidad, direccion } = req.body;

    console.log(`📍 Actualizando ubicación del viaje ${viajeId}`);

    // Actualiza campos de tracking.ubicacionActual
    const viaje = await ViajesModel.findByIdAndUpdate(
      viajeId,
      {
        $set: {
          "tracking.ubicacionActual.lat": lat,
          "tracking.ubicacionActual.lng": lng,
          "tracking.ubicacionActual.velocidad": velocidad,
          "tracking.ubicacionActual.direccion": direccion,
          "tracking.ubicacionActual.timestamp": new Date(),
        },
      },
      { new: true }
    );

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado",
      });
    }

    console.log("✅ Ubicación actualizada exitosamente");

    res.status(200).json({
      success: true,
      data: viaje.tracking.ubicacionActual,
      message: "Ubicación actualizada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al actualizar ubicación:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar ubicación",
      error: error.message,
    });
  }
};

export default ViajesController;