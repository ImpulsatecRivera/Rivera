import camionesMod from "../Models/Camiones.js";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

const camionesController = {};

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

// Obtener todos los camiones
camionesController.get = async (req, res) => {
  try {
    const camiones = await camionesMod.find();
    res.status(200).json(camiones);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener camiones", error: error.message });
  }
};

// Obtener camión por ID
camionesController.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const camion = await camionesMod.findById(id)
      .populate("driverId")
      .populate("supplierId");

    if (!camion) {
      return res.status(404).json({ message: "Camión no encontrado" });
    }

    res.json(camion);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener camión", error: error.message });
  }
};

// NUEVO: Obtener camión por ID con estadísticas calculadas
camionesController.getByIdWithStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener el camión específico
    const camion = await camionesMod.findById(id)
      .populate("driverId")
      .populate("supplierId");

    if (!camion) {
      return res.status(404).json({ message: "Camión no encontrado" });
    }

    // Obtener todos los camiones para calcular estadísticas comparativas
    const allCamiones = await camionesMod.find();
    
    // Calcular estadísticas dinámicas
    const stats = await calculateTruckStats(camion, allCamiones);
    
    // Agregar las estadísticas al objeto del camión
    const camionWithStats = {
      ...camion.toObject(),
      stats: stats
    };

    res.json(camionWithStats);
  } catch (error) {
    console.error('Error al obtener camión con estadísticas:', error);
    res.status(500).json({ message: "Error al obtener camión con estadísticas", error: error.message });
  }
};

// Función auxiliar para calcular estadísticas
const calculateTruckStats = async (camion, allCamiones) => {
  // Función para generar valores realistas basados en características del camión
  const generateRealisticValue = (field, baseValue, variation = 0.3) => {
    const factor = 1 + (Math.random() - 0.5) * variation;
    return Math.round(baseValue * factor);
  };

  // Función para calcular gasolina basada en viajes asignados
  const calculateGasBasedOnTrips = async (camionId, initialGasLevel = 4) => {
    try {
      console.log(`=== CALCULANDO GASOLINA PARA CAMIÓN ${camionId} ===`);
      console.log('Nivel inicial de gasolina:', initialGasLevel);
      
      // Buscar viajes activos del camión (asumiendo que tienes un modelo de Viajes)
      // Si no tienes el modelo, comentamos esta parte y simulamos
      /*
      const activeTrips = await viajesMod.find({
        truckId: camionId,
        status: { $in: ['EN_CURSO', 'PENDIENTE', 'INICIADO'] }
      });
      */
      
      // SIMULACIÓN: Generar viajes ficticios basados en el estado del camión
      let totalDistanceKm = 0;
      let activeTrips = [];
      
      if (camion.state === 'EN RUTA') {
        // Simular que tiene viajes activos - menos distancia para que llegue a 100%
        const numTrips = Math.floor(Math.random() * 2) + 1; // 1-2 viajes (reducido)
        for (let i = 0; i < numTrips; i++) {
          const trip = {
            distance: Math.floor(Math.random() * 100) + 30, // 30-130 km (reducido)
            status: 'EN_CURSO',
            origin: 'Ciudad A',
            destination: 'Ciudad B'
          };
          activeTrips.push(trip);
          totalDistanceKm += trip.distance;
        }
      } else if (camion.state === 'DISPONIBLE') {
        // Sin viajes activos, tanque puede estar lleno (0km recorridos)
        totalDistanceKm = 0;
      } else if (camion.state === 'MANTENIMIENTO') {
        // Variable, puede no haber consumido nada si está en taller
        const hasConsumed = Math.random() > 0.5;
        totalDistanceKm = hasConsumed ? Math.floor(Math.random() * 50) : 0; // 0-50 km
      }
      
      console.log('Viajes encontrados/simulados:', activeTrips.length);
      console.log('Distancia total a recorrer/recorrida:', totalDistanceKm, 'km');
      
      // Calcular consumo de gasolina
      const fuelConsumption = calculateFuelConsumption(camion, totalDistanceKm);
      
      // Calcular gasolina restante
      const tankCapacity = 200; // litros (tanque típico de camión)
      const initialLiters = (initialGasLevel / 4) * tankCapacity;
      const remainingLiters = Math.max(0, initialLiters - fuelConsumption.consumedLiters);
      
      // Convertir de vuelta a escala 1-4
      const finalGasLevel = Math.max(0.25, Math.ceil((remainingLiters / tankCapacity) * 4 * 4) / 4);
      const finalGasLevelInt = Math.max(1, Math.round(finalGasLevel));
      const finalPercentage = Math.min(100, Math.max(0, Math.round((remainingLiters / tankCapacity) * 100)));
      
      console.log('=== CÁLCULO DETALLADO DE COMBUSTIBLE ===');
      console.log('Capacidad del tanque:', tankCapacity, 'L');
      console.log('Litros iniciales:', Math.round(initialLiters), 'L');
      console.log('Litros consumidos:', Math.round(fuelConsumption.consumedLiters), 'L');
      console.log('Litros restantes:', Math.round(remainingLiters), 'L');
      console.log('Nivel final (1-4):', finalGasLevelInt);
      
      return {
        level: finalGasLevelInt,
        liters: Math.round(remainingLiters),
        capacity: tankCapacity,
        consumed: Math.round(fuelConsumption.consumedLiters),
        efficiency: fuelConsumption.efficiency,
        trips: activeTrips,
        totalDistance: totalDistanceKm,
        percentage: finalPercentage
      };
      
    } catch (error) {
      console.error('Error calculando gasolina por viajes:', error);
      // Fallback al método anterior
      return {
        level: camion.gasolineLevel || Math.floor(Math.random() * 4) + 1,
        liters: 0,
        capacity: 200,
        consumed: 0,
        efficiency: 0,
        trips: [],
        totalDistance: 0,
        percentage: Math.min(100, Math.max(25, Math.round(((camion.gasolineLevel || 4) / 4) * 100)))
      };
    }
  };

  // Función para calcular consumo de combustible
  const calculateFuelConsumption = (camion, distanceKm) => {
    // Eficiencia base según la marca/modelo del camión
    let baseEfficiency; // km por litro
    
    switch (camion.brand?.toUpperCase()) {
      case 'FORD':
        baseEfficiency = 8; // 8 km/L
        break;
      case 'CHEVROLET':
      case 'CHEVY':
        baseEfficiency = 7.5; // 7.5 km/L
        break;
      case 'ISUZU':
        baseEfficiency = 9; // 9 km/L (más eficiente)
        break;
      case 'MERCEDES':
      case 'MERCEDES-BENZ':
        baseEfficiency = 8.5; // 8.5 km/L
        break;
      default:
        baseEfficiency = 8; // Default 8 km/L
    }
    
    // Ajustar eficiencia según la edad
    const age = camion.age || new Date().getFullYear() - 2020;
    let efficiencyPenalty = Math.max(0, (age - 2) * 0.1); // -0.1 km/L por cada año después del 2do
    
    // Ajustar según el estado
    if (camion.state === 'MANTENIMIENTO') {
      efficiencyPenalty += 0.5; // Camiones en mantenimiento consumen más
    }
    
    const finalEfficiency = Math.max(4, baseEfficiency - efficiencyPenalty);
    const consumedLiters = distanceKm / finalEfficiency;
    
    console.log('=== CÁLCULO DE EFICIENCIA ===');
    console.log('Marca:', camion.brand);
    console.log('Eficiencia base:', baseEfficiency, 'km/L');
    console.log('Penalización por edad:', efficiencyPenalty, 'km/L');
    console.log('Eficiencia final:', finalEfficiency.toFixed(1), 'km/L');
    console.log('Distancia:', distanceKm, 'km');
    console.log('Consumo calculado:', consumedLiters.toFixed(1), 'L');
    
    return {
      efficiency: finalEfficiency,
      consumedLiters: consumedLiters,
      baseEfficiency: baseEfficiency,
      penalty: efficiencyPenalty
    };
  };

  // Calcular estadísticas basadas en la edad del camión
  const age = camion.age || new Date().getFullYear() - 2020;
  const baseKilometraje = Math.max(15000, age * 12000 + Math.random() * 50000);
  
  // Generar estadísticas realistas
  const kilometraje = generateRealisticValue('kilometraje', baseKilometraje);
  const viajesRealizados = generateRealisticValue('viajes', Math.round(kilometraje / 500));
  const visitasAlTaller = Math.max(1, Math.round(age * 2 + Math.random() * 5));
  
  // NUEVO: Calcular combustible basado en viajes
  const gasData = await calculateGasBasedOnTrips(camion._id, camion.gasolineLevel || 4);
  const combustibleText = `${gasData.percentage}%`;
  
  // Calcular veces no disponible basado en estado y edad
  let vecesNoDisponible = Math.round(age * 8 + Math.random() * 20);
  if (camion.state === 'MANTENIMIENTO') {
    vecesNoDisponible += Math.round(Math.random() * 15);
  }

  // Calcular percentiles basados en todos los camiones
  const allKilometrajes = allCamiones.map(c => {
    const cAge = c.age || new Date().getFullYear() - 2020;
    return Math.max(15000, cAge * 12000 + Math.random() * 50000);
  });
  
  // Calcular porcentajes para las barras de progreso
  const maxKilometraje = Math.max(...allKilometrajes, kilometraje);
  const kilometrajePercentage = Math.round((kilometraje / maxKilometraje) * 100);
  
  const maxViajes = Math.max(200, viajesRealizados);
  const viajesPercentage = Math.round((viajesRealizados / maxViajes) * 100);
  
  const visitasPercentage = Math.min(100, Math.round((visitasAlTaller / 20) * 100));
  const combustiblePercentage = gasData.percentage; // Usar el porcentaje calculado
  const noDisponiblePercentage = Math.min(100, Math.round((vecesNoDisponible / 100) * 100));

  return {
    kilometraje: {
      value: kilometraje.toLocaleString(),
      percentage: kilometrajePercentage
    },
    viajesRealizados: {
      value: viajesRealizados.toString(),
      percentage: viajesPercentage
    },
    visitasAlTaller: {
      value: visitasAlTaller.toString(),
      percentage: visitasPercentage
    },
    combustible: {
      value: combustibleText,
      percentage: combustiblePercentage,
      // NUEVO: Información adicional sobre el combustible
      details: {
        liters: gasData.liters,
        capacity: gasData.capacity,
        consumed: gasData.consumed,
        efficiency: gasData.efficiency?.toFixed(1) + ' km/L',
        activeTrips: gasData.trips.length,
        totalDistance: gasData.totalDistance + ' km'
      }
    },
    vecesNoDisponible: {
      value: vecesNoDisponible.toString(),
      percentage: noDisponiblePercentage
    }
  };
};

// Agregar un nuevo camión
camionesController.post = async (req, res) => {
  try {
    const {
      name,
      brand,
      model,
      state,
      gasolineLevel,
      age,
      ciculatioCard,
      licensePlate,
      description,
      supplierId,
      driverId,
    } = req.body;

    let imgUrl = "";
    if (req.file) {
      const resul = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["png", "jpg", "jpeg"],
      });
      imgUrl = resul.secure_url;
    }

    const newCamion = new camionesMod({
      name,
      brand,
      model,
      state: state?.toUpperCase(),
      gasolineLevel,
      age,
      ciculatioCard,
      licensePlate,
      description,
      supplierId,
      driverId,
      img: imgUrl,
    });

    await newCamion.save();

    res.status(200).json({ message: "Camión agregado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar camión", error: error.message });
  }
};

// Actualizar un camión
camionesController.put = async (req, res) => {
  try {
    const {
      name,
      brand,
      model,
      state,
      gasolineLevel,
      age,
      ciculatioCard,
      licensePlate,
      description,
      supplierId,
      driverId,
    } = req.body;

    let imgUrl = "";
    if (req.file) {
      const resul = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["png", "jpg", "jpeg"],
      });
      imgUrl = resul.secure_url;
    }

    const updatedTruck = {
      name,
      brand,
      model,
      state: state?.toUpperCase(),
      gasolineLevel,
      age,
      ciculatioCard,
      licensePlate,
      description,
      supplierId,
      driverId,
    };

    if (imgUrl) {
      updatedTruck.img = imgUrl;
    }

    await camionesMod.findByIdAndUpdate(req.params.id, updatedTruck, { new: true });

    res.status(200).json({ message: "Camión actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar camión", error: error.message });
  }
};

// Eliminar un camión
camionesController.delete = async (req, res) => {
  try {
    const deleteCamion = await camionesMod.findByIdAndDelete(req.params.id);
    if (!deleteCamion) {
      return res.status(404).json({ message: "Camión no encontrado" });
    }
    res.status(200).json({ message: "Camión eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar camión", error: error.message });
  }
};

export default camionesController;