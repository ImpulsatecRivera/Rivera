import camionesMod from "../Models/Camiones.js";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import mongoose from "mongoose";

const camionesController = {};

/**
 * Configuración de Cloudinary para manejo de imágenes
 */
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

/**
 * Función para validar si un ID de MongoDB es válido
 * @param {string} id - ID a validar
 * @returns {boolean} - true si es válido, false si no
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Función para validar campos requeridos
 * @param {object} data - Datos a validar
 * @param {array} requiredFields - Campos requeridos
 * @returns {object} - {isValid: boolean, missingFields: array}
 */
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => 
    !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
  );
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Función para validar nivel de gasolina
 * @param {number} level - Nivel de gasolina (1-4)
 * @returns {boolean} - true si es válido
 */
const validateGasolineLevel = (level) => {
  const numLevel = parseInt(level);
  return !isNaN(numLevel) && numLevel >= 1 && numLevel <= 4;
};

/**
 * Función para validar estados permitidos del camión
 * @param {string} state - Estado del camión
 * @returns {boolean} - true si es válido
 */
const validateTruckState = (state) => {
  const validStates = ['DISPONIBLE', 'EN RUTA', 'MANTENIMIENTO', 'FUERA DE SERVICIO'];
  return validStates.includes(state?.toUpperCase());
};

/**
 * Función para validar placa de circulación
 * @param {string} licensePlate - Placa de circulación
 * @returns {boolean} - true si es válido
 */
const validateLicensePlate = (licensePlate) => {
  // Formato básico: 3 letras + 3 números o similar
  const plateRegex = /^[A-Z0-9]{6,8}$/i;
  return plateRegex.test(licensePlate?.replace(/[-\s]/g, ''));
};

/**
 * Obtener todos los camiones
 * GET /camiones
 */
camionesController.get = async (req, res) => {
  try {
    const camiones = await camionesMod.find();
    
    if (!camiones || camiones.length === 0) {
      return res.status(200).json({ message: "No se encontraron camiones", data: [] });
    }

    res.status(200).json({
      message: "Camiones obtenidos exitosamente",
      count: camiones.length,
      data: camiones
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error interno del servidor al obtener camiones", 
      error: error.message 
    });
  }
};

/**
 * Obtener camión por ID
 * GET /camiones/:id
 */
camionesController.getById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea válido
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: "ID de camión inválido",
        error: "El ID proporcionado no tiene un formato válido"
      });
    }

    const camion = await camionesMod.findById(id)
      .populate("driverId")
      .populate("supplierId");

    if (!camion) {
      return res.status(404).json({ 
        message: "Camión no encontrado",
        error: `No existe un camión con el ID: ${id}`
      });
    }

    res.status(200).json({
      message: "Camión obtenido exitosamente",
      data: camion
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error interno del servidor al obtener camión", 
      error: error.message 
    });
  }
};

/**
 * Obtener camión por ID con estadísticas calculadas
 * GET /camiones/:id/stats
 */
camionesController.getByIdWithStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: "ID de camión inválido",
        error: "El ID proporcionado no tiene un formato válido"
      });
    }

    // Obtener el camión específico
    const camion = await camionesMod.findById(id)
      .populate("driverId")
      .populate("supplierId");

    if (!camion) {
      return res.status(404).json({ 
        message: "Camión no encontrado",
        error: `No existe un camión con el ID: ${id}`
      });
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

    res.status(200).json({
      message: "Camión con estadísticas obtenido exitosamente",
      data: camionWithStats
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error interno del servidor al obtener camión con estadísticas", 
      error: error.message 
    });
  }
};

/**
 * Función auxiliar para calcular estadísticas del camión
 * @param {object} camion - Objeto del camión
 * @param {array} allCamiones - Array de todos los camiones
 * @returns {object} - Estadísticas calculadas
 */
const calculateTruckStats = async (camion, allCamiones) => {
  /**
   * Generar valores realistas basados en características del camión
   * @param {string} field - Campo de referencia
   * @param {number} baseValue - Valor base
   * @param {number} variation - Variación permitida (0.3 = 30%)
   * @returns {number} - Valor calculado
   */
  const generateRealisticValue = (field, baseValue, variation = 0.3) => {
    const factor = 1 + (Math.random() - 0.5) * variation;
    return Math.round(baseValue * factor);
  };

  /**
   * Calcular gasolina basada en viajes asignados
   * @param {string} camionId - ID del camión
   * @param {number} initialGasLevel - Nivel inicial de gasolina (1-4)
   * @returns {object} - Información detallada del combustible
   */
  const calculateGasBasedOnTrips = async (camionId, initialGasLevel = 4) => {
    try {
      // Simulación de viajes activos basados en el estado del camión
      let totalDistanceKm = 0;
      let activeTrips = [];
      
      if (camion.state === 'EN RUTA') {
        // Simular viajes activos para camiones en ruta
        const numTrips = Math.floor(Math.random() * 2) + 1; // 1-2 viajes
        for (let i = 0; i < numTrips; i++) {
          const trip = {
            distance: Math.floor(Math.random() * 100) + 30, // 30-130 km
            status: 'EN_CURSO',
            origin: 'Ciudad A',
            destination: 'Ciudad B'
          };
          activeTrips.push(trip);
          totalDistanceKm += trip.distance;
        }
      } else if (camion.state === 'DISPONIBLE') {
        // Sin viajes activos, tanque puede estar lleno
        totalDistanceKm = 0;
      } else if (camion.state === 'MANTENIMIENTO') {
        // Variable, puede no haber consumido mucho si está en taller
        const hasConsumed = Math.random() > 0.5;
        totalDistanceKm = hasConsumed ? Math.floor(Math.random() * 50) : 0; // 0-50 km
      }
      
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
      // Fallback en caso de error
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

  /**
   * Calcular consumo de combustible basado en características del camión
   * @param {object} camion - Objeto del camión
   * @param {number} distanceKm - Distancia en kilómetros
   * @returns {object} - Información del consumo
   */
  const calculateFuelConsumption = (camion, distanceKm) => {
    // Eficiencia base según la marca del camión (km por litro)
    let baseEfficiency;
    
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
    
    // Ajustar eficiencia según la edad del camión
    const age = camion.age || new Date().getFullYear() - 2020;
    let efficiencyPenalty = Math.max(0, (age - 2) * 0.1); // -0.1 km/L por cada año después del 2do
    
    // Ajustar según el estado del camión
    if (camion.state === 'MANTENIMIENTO') {
      efficiencyPenalty += 0.5; // Camiones en mantenimiento consumen más
    }
    
    const finalEfficiency = Math.max(4, baseEfficiency - efficiencyPenalty);
    const consumedLiters = distanceKm / finalEfficiency;
    
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
  
  // Calcular combustible basado en viajes
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
  const combustiblePercentage = gasData.percentage;
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

/**
 * Agregar un nuevo camión
 * POST /camiones
 */
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

    // Validar campos requeridos
    const requiredFields = ['name', 'brand', 'model', 'licensePlate'];
    const validation = validateRequiredFields(req.body, requiredFields);
    
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Faltan campos requeridos",
        error: `Los siguientes campos son obligatorios: ${validation.missingFields.join(', ')}`
      });
    }

    // Validar nivel de gasolina si se proporciona
    if (gasolineLevel && !validateGasolineLevel(gasolineLevel)) {
      return res.status(400).json({
        message: "Nivel de gasolina inválido",
        error: "El nivel de gasolina debe estar entre 1 y 4"
      });
    }

    // Validar estado si se proporciona
    if (state && !validateTruckState(state)) {
      return res.status(400).json({
        message: "Estado de camión inválido",
        error: "Estados válidos: DISPONIBLE, EN RUTA, MANTENIMIENTO, FUERA DE SERVICIO"
      });
    }

    // Validar placa de circulación
    if (!validateLicensePlate(licensePlate)) {
      return res.status(400).json({
        message: "Placa de circulación inválida",
        error: "La placa debe tener entre 6 y 8 caracteres alfanuméricos"
      });
    }

    // Validar edad si se proporciona
    const currentYear = new Date().getFullYear();
    if (age && (age < 1990 || age > currentYear)) {
      return res.status(400).json({
        message: "Año del camión inválido",
        error: `El año debe estar entre 1990 y ${currentYear}`
      });
    }

    // Validar IDs de proveedor y conductor si se proporcionan
    if (supplierId && !isValidObjectId(supplierId)) {
      return res.status(400).json({
        message: "ID de proveedor inválido",
        error: "El ID del proveedor no tiene un formato válido"
      });
    }

    if (driverId && !isValidObjectId(driverId)) {
      return res.status(400).json({
        message: "ID de conductor inválido",
        error: "El ID del conductor no tiene un formato válido"
      });
    }

    // Verificar que no exista otro camión con la misma placa
    const existingTruck = await camionesMod.findOne({ 
      licensePlate: licensePlate.toUpperCase() 
    });
    
    if (existingTruck) {
      return res.status(409).json({
        message: "Placa de circulación duplicada",
        error: "Ya existe un camión registrado con esta placa"
      });
    }

    // Manejar subida de imagen a Cloudinary
    let imgUrl = "";
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "public",
          allowed_formats: ["png", "jpg", "jpeg"],
          transformation: [
            { width: 800, height: 600, crop: "fill" },
            { quality: "auto" }
          ]
        });
        imgUrl = result.secure_url;
      } catch (uploadError) {
        return res.status(400).json({
          message: "Error al subir la imagen",
          error: "No se pudo procesar la imagen proporcionada"
        });
      }
    }

    // Crear nuevo camión
    const newCamion = new camionesMod({
      name: name.trim(),
      brand: brand.trim(),
      model: model.trim(),
      state: state?.toUpperCase() || 'DISPONIBLE',
      gasolineLevel: gasolineLevel || 4,
      age,
      ciculatioCard: ciculatioCard?.trim(),
      licensePlate: licensePlate.toUpperCase(),
      description: description?.trim(),
      supplierId,
      driverId,
      img: imgUrl,
    });

    await newCamion.save();

    res.status(201).json({ 
      message: "Camión agregado correctamente",
      data: {
        id: newCamion._id,
        name: newCamion.name,
        licensePlate: newCamion.licensePlate
      }
    });
  } catch (error) {
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Datos duplicados",
        error: "Ya existe un camión con esos datos"
      });
    }
    
    res.status(500).json({ 
      message: "Error interno del servidor al agregar camión", 
      error: error.message 
    });
  }
};

/**
 * Actualizar un camión existente
 * PUT /camiones/:id
 */
camionesController.put = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID de camión inválido",
        error: "El ID proporcionado no tiene un formato válido"
      });
    }

    // Verificar que el camión existe
    const existingCamion = await camionesMod.findById(id);
    if (!existingCamion) {
      return res.status(404).json({
        message: "Camión no encontrado",
        error: `No existe un camión con el ID: ${id}`
      });
    }

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

    // Validar campos si se proporcionan
    if (gasolineLevel && !validateGasolineLevel(gasolineLevel)) {
      return res.status(400).json({
        message: "Nivel de gasolina inválido",
        error: "El nivel de gasolina debe estar entre 1 y 4"
      });
    }

    if (state && !validateTruckState(state)) {
      return res.status(400).json({
        message: "Estado de camión inválido",
        error: "Estados válidos: DISPONIBLE, EN RUTA, MANTENIMIENTO, FUERA DE SERVICIO"
      });
    }

    if (licensePlate && !validateLicensePlate(licensePlate)) {
      return res.status(400).json({
        message: "Placa de circulación inválida",
        error: "La placa debe tener entre 6 y 8 caracteres alfanuméricos"
      });
    }

    // Validar edad si se proporciona
    const currentYear = new Date().getFullYear();
    if (age && (age < 1990 || age > currentYear)) {
      return res.status(400).json({
        message: "Año del camión inválido",
        error: `El año debe estar entre 1990 y ${currentYear}`
      });
    }

    // Validar IDs si se proporcionan
    if (supplierId && !isValidObjectId(supplierId)) {
      return res.status(400).json({
        message: "ID de proveedor inválido",
        error: "El ID del proveedor no tiene un formato válido"
      });
    }

    if (driverId && !isValidObjectId(driverId)) {
      return res.status(400).json({
        message: "ID de conductor inválido",
        error: "El ID del conductor no tiene un formato válido"
      });
    }

    // Verificar unicidad de placa si se está actualizando
    if (licensePlate && licensePlate !== existingCamion.licensePlate) {
      const duplicatePlate = await camionesMod.findOne({ 
        licensePlate: licensePlate.toUpperCase(),
        _id: { $ne: id }
      });
      
      if (duplicatePlate) {
        return res.status(409).json({
          message: "Placa de circulación duplicada",
          error: "Ya existe otro camión registrado con esta placa"
        });
      }
    }

    // Manejar subida de imagen a Cloudinary
    let imgUrl = "";
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "public",
          allowed_formats: ["png", "jpg", "jpeg"],
          transformation: [
            { width: 800, height: 600, crop: "fill" },
            { quality: "auto" }
          ]
        });
        imgUrl = result.secure_url;
      } catch (uploadError) {
        return res.status(400).json({
          message: "Error al subir la imagen",
          error: "No se pudo procesar la imagen proporcionada"
        });
      }
    }

    // Preparar datos para actualización (solo campos proporcionados)
    const updatedTruck = {};
    
    if (name) updatedTruck.name = name.trim();
    if (brand) updatedTruck.brand = brand.trim();
    if (model) updatedTruck.model = model.trim();
    if (state) updatedTruck.state = state.toUpperCase();
    if (gasolineLevel) updatedTruck.gasolineLevel = gasolineLevel;
    if (age) updatedTruck.age = age;
    if (ciculatioCard) updatedTruck.ciculatioCard = ciculatioCard.trim();
    if (licensePlate) updatedTruck.licensePlate = licensePlate.toUpperCase();
    if (description !== undefined) updatedTruck.description = description?.trim();
    if (supplierId !== undefined) updatedTruck.supplierId = supplierId;
    if (driverId !== undefined) updatedTruck.driverId = driverId;
    if (imgUrl) updatedTruck.img = imgUrl;

    // Actualizar camión
    const updatedCamion = await camionesMod.findByIdAndUpdate(
      id, 
      updatedTruck, 
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      message: "Camión actualizado correctamente",
      data: {
        id: updatedCamion._id,
        name: updatedCamion.name,
        licensePlate: updatedCamion.licensePlate
      }
    });
  } catch (error) {
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Datos duplicados",
        error: "Ya existe un camión con esos datos"
      });
    }
    
    res.status(500).json({ 
      message: "Error interno del servidor al actualizar camión", 
      error: error.message 
    });
  }
};

/**
 * Eliminar un camión
 * DELETE /camiones/:id
 */
camionesController.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID de camión inválido",
        error: "El ID proporcionado no tiene un formato válido"
      });
    }

    // Intentar eliminar el camión
    const deletedCamion = await camionesMod.findByIdAndDelete(id);
    
    if (!deletedCamion) {
      return res.status(404).json({ 
        message: "Camión no encontrado",
        error: `No existe un camión con el ID: ${id}`
      });
    }

    res.status(200).json({ 
      message: "Camión eliminado correctamente",
      data: {
        id: deletedCamion._id,
        name: deletedCamion.name,
        licensePlate: deletedCamion.licensePlate
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error interno del servidor al eliminar camión", 
      error: error.message 
    });
  }
};

export default camionesController;