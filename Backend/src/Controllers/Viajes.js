// Controllers/Viajes.js
import ViajesModel from "../Models/Viajes.js"; // Tu modelo existente

const ViajesController = {}

// 🔹 TUS MÉTODOS EXISTENTES (mantén los que ya tienes)
ViajesController.getAllViajes = async (req, res) => {
  try {
    const viajes = await ViajesModel.find();
    res.status(200).json(viajes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// 🆕 NUEVO MÉTODO PARA DATOS DEL MAPA
ViajesController.getMapData = async (req, res) => {
  try {
    console.log('🗺️ Solicitando datos del mapa...');
    
    // Obtener todos los viajes con populate de referencias
    const viajes = await ViajesModel.find()
      .populate({
        path: 'conductor.id',
        select: 'nombre telefono'
      })
      .populate({
        path: 'truckId', 
        select: 'modelo marca placa'
      })
      .lean(); // Para mejor performance

    console.log(`📊 Encontrados ${viajes.length} viajes en la base de datos`);

    // Terminal principal (ajusta estas coordenadas según tu ubicación real)
    const terminalPrincipal = {
      name: "Terminal Rivera - Santa Ana",
      coords: [13.9942, -89.5592], // [lat, lng]
      type: "red",
      number: "",
      description: "Terminal principal - Base de operaciones",
      tripCount: 0,
      isTerminal: true
    };

    // Procesar ubicaciones únicas (destinos)
    const locationMap = new Map();
    
    // Agregar terminal
    locationMap.set("Terminal Rivera", terminalPrincipal);

    // Procesar cada viaje para extraer ubicaciones únicas
    viajes.forEach(viaje => {
      // Origen
      if (viaje.ruta?.origen) {
        const origenKey = viaje.ruta.origen.nombre;
        if (!locationMap.has(origenKey)) {
          locationMap.set(origenKey, {
            name: viaje.ruta.origen.nombre,
            coords: [viaje.ruta.origen.coordenadas.lat, viaje.ruta.origen.coordenadas.lng],
            type: "green",
            number: "0",
            description: "Punto de origen",
            tripCount: 0,
            nextTrip: null,
            isTerminal: false
          });
        }
      }

      // Destino
      if (viaje.ruta?.destino) {
        const destinoKey = viaje.ruta.destino.nombre;
        if (!locationMap.has(destinoKey)) {
          locationMap.set(destinoKey, {
            name: viaje.ruta.destino.nombre,
            coords: [viaje.ruta.destino.coordenadas.lat, viaje.ruta.destino.coordenadas.lng],
            type: viaje.estado.actual === 'pendiente' ? "blue" : "green",
            number: "0",
            description: "Destino de viaje",
            tripCount: 0,
            nextTrip: null,
            isTerminal: false
          });
        }
        
        // Actualizar contador de viajes por destino
        const location = locationMap.get(destinoKey);
        location.tripCount++;
        location.number = location.tripCount.toString();
        
        // Actualizar próximo viaje si está pendiente
        if (viaje.estado.actual === 'pendiente' && !location.nextTrip) {
          location.nextTrip = new Date(viaje.departureTime).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          });
        }
        
        // Actualizar descripción
        location.description = `${location.tripCount} viaje${location.tripCount > 1 ? 's' : ''} programado${location.tripCount > 1 ? 's' : ''}`;
      }
    });

    // Convertir a array
    const locations = Array.from(locationMap.values());

    // Procesar rutas
    const routes = viajes.map(viaje => {
      // Determinar coordenadas de la ruta
      let coordinates = [];
      if (viaje.ruta?.origen && viaje.ruta?.destino) {
        coordinates = [
          [viaje.ruta.origen.coordenadas.lat, viaje.ruta.origen.coordenadas.lng],
          [viaje.ruta.destino.coordenadas.lat, viaje.ruta.destino.coordenadas.lng]
        ];
      }

      // Mapear estados del modelo a estados del frontend
      let status = "scheduled";
      switch (viaje.estado.actual) {
        case 'en_curso':
          status = "in_progress";
          break;
        case 'completado':
          status = "completed";
          break;
        case 'cancelado':
          status = "cancelled";
          break;
        case 'pendiente':
        default:
          status = "scheduled";
          break;
      }

      return {
        id: viaje._id.toString(),
        coordinates: coordinates,
        status: status,
        frequency: viaje.estado.actual === 'en_curso' ? "high" : "medium",
        tripInfo: {
          driver: viaje.conductor?.nombre || "No asignado",
          truck: viaje.truckId?.marca && viaje.truckId?.modelo ? 
                 `${viaje.truckId.marca} ${viaje.truckId.modelo}` : 
                 "Camión no especificado",
          cargo: viaje.carga?.descripcion || "Carga general",
          departure: new Date(viaje.departureTime).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          arrival: new Date(viaje.arrivalTime).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })
        },
        viaje: {
          id: viaje._id,
          descripcion: viaje.tripDescription,
          distancia: viaje.ruta?.distanciaTotal || 0,
          tiempoEstimado: viaje.ruta?.tiempoEstimado || 0
        }
      };
    }).filter(route => route.coordinates.length > 0); // Solo rutas con coordenadas válidas

    // Ciudades de referencia (El Salvador)
    const cities = [
      { name: "San Salvador", coords: [13.6929, -89.2182] },
      { name: "Soyapango", coords: [13.7167, -89.1389] },
      { name: "Mejicanos", coords: [13.7408, -89.2075] },
      { name: "Santa Ana", coords: [13.9942, -89.5592] },
      { name: "San Miguel", coords: [13.4833, -88.1833] }
    ];

    // Calcular estadísticas
    const statistics = {
      total_routes: viajes.length,
      active_routes: viajes.filter(v => v.estado.actual === 'en_curso').length,
      completed_routes: viajes.filter(v => v.estado.actual === 'completado').length,
      pending_routes: viajes.filter(v => v.estado.actual === 'pendiente').length,
      growth_percentage: 35, // Puedes calcularlo basado en datos históricos
      monthly_trips: viajes.filter(v => {
        const viajeDate = new Date(v.createdAt);
        const currentDate = new Date();
        return viajeDate.getMonth() === currentDate.getMonth() && 
               viajeDate.getFullYear() === currentDate.getFullYear();
      }).length,
      drivers_active: new Set(viajes.map(v => v.conductor?.id).filter(Boolean)).size
    };

    // Respuesta estructurada para el mapa
    const mapData = {
      locations,
      routes,
      cities,
      statistics
    };

    console.log('✅ Datos del mapa procesados exitosamente');
    console.log(`📍 Ubicaciones: ${locations.length}`);
    console.log(`🛣️ Rutas: ${routes.length}`);
    console.log(`📊 Viajes activos: ${statistics.active_routes}/${statistics.total_routes}`);

    res.status(200).json({
      success: true,
      data: mapData,
      message: "Datos del mapa obtenidos exitosamente"
    });

  } catch (error) {
    console.error('❌ Error al obtener datos del mapa:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener datos del mapa",
      error: error.message 
    });
  }
}

// 🆕 MÉTODO PARA ACTUALIZAR UBICACIÓN EN TIEMPO REAL
ViajesController.updateLocation = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { lat, lng, velocidad, direccion } = req.body;

    console.log(`📍 Actualizando ubicación del viaje ${viajeId}`);

    const viaje = await ViajesModel.findByIdAndUpdate(
      viajeId,
      {
        $set: {
          'tracking.ubicacionActual.lat': lat,
          'tracking.ubicacionActual.lng': lng,
          'tracking.ubicacionActual.velocidad': velocidad,
          'tracking.ubicacionActual.direccion': direccion,
          'tracking.ubicacionActual.timestamp': new Date()
        }
      },
      { new: true }
    );

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado"
      });
    }

    console.log('✅ Ubicación actualizada exitosamente');

    res.status(200).json({
      success: true,
      data: viaje.tracking.ubicacionActual,
      message: "Ubicación actualizada exitosamente"
    });

  } catch (error) {
    console.error('❌ Error al actualizar ubicación:', error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar ubicación",
      error: error.message
    });
  }
}

export default ViajesController;