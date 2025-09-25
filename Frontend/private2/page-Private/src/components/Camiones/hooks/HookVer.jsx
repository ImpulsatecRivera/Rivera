import { useState, useEffect } from 'react';

// Función auxiliar para fetch con timeout usando AbortController
const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(id));
};

export const useTruckDetail = (truckId) => {
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allDrivers, setAllDrivers] = useState([]);

  // Función para obtener todos los motoristas
  const fetchAllDrivers = async () => {
    try {
      console.log('=== OBTENIENDO LISTA DE MOTORISTAS ===');
      
      const response = await fetchWithTimeout(
        `https://riveraproject-production-933e.up.railway.app/api/motoristas`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        5000
      );
      
      if (!response.ok) {
        console.warn('No se pudo obtener lista de motoristas:', response.status);
        return [];
      }
      
      const motoristasData = await response.json();
      console.log('Lista de motoristas obtenida:', motoristasData);
      setAllDrivers(motoristasData);
      return motoristasData;
      
    } catch (error) {
      console.error('Error al obtener motoristas:', error);
      return [];
    }
  };

  // Función para obtener el nombre del motorista por ID
  const getDriverNameById = (driverId, driversList) => {
    const motorista = driversList.find(m => m._id === driverId || m.id === driverId);
    
    if (motorista) {
      const firstName = motorista.name || motorista.firstName || motorista.nombre || '';
      const lastName = motorista.lastName || motorista.apellido || motorista.surname || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || 'Motorista sin nombre';
    }
    
    return null;
  };

  // Función para asignar un motorista aleatorio
  const getRandomDriver = (driversList) => {
    if (driversList.length === 0) return 'Sin motoristas disponibles';
    
    const randomIndex = Math.floor(Math.random() * driversList.length);
    const randomDriver = driversList[randomIndex];
    
    const firstName = randomDriver.name || randomDriver.firstName || randomDriver.nombre || '';
    const lastName = randomDriver.lastName || randomDriver.apellido || randomDriver.surname || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || 'Motorista sin nombre';
  };

  const fetchTruckDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== OBTENIENDO DETALLE DEL CAMIÓN CON ESTADÍSTICAS ===');
      console.log('ID del camión:', truckId);
      
      // NUEVO: Usar el endpoint que incluye estadísticas
      const response = await fetchWithTimeout(
        `https://riveraproject-production-933e.up.railway.app/api/camiones/${truckId}/stats`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        10000
      );
      
      console.log('=== RESPUESTA DEL SERVIDOR ===');
      console.log('Status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Error desconocido';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `Error ${response.status}`;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }

        switch (response.status) {
          case 400:
            throw new Error(errorMessage || 'Solicitud inválida');
          case 401:
            throw new Error('No autorizado para ver este camión');
          case 403:
            throw new Error('Acceso denegado');
          case 404:
            throw new Error('Camión no encontrado');
          case 500:
            throw new Error('Error interno del servidor');
          default:
            throw new Error(errorMessage);
        }
      }

      const apiResponse = await response.json();
      console.log('Datos del camión con estadísticas recibidos:', apiResponse);

      if (apiResponse && apiResponse.data) {
        console.log('=== ESTRUCTURA COMPLETA DE LA API ===');
        console.log('Data raw:', JSON.stringify(apiResponse, null, 2));
        console.log('Propiedades disponibles:', Object.keys(apiResponse));
        
        // FIXED: Usar apiResponse.data en lugar de data directamente
        const data = apiResponse.data;
        console.log('=== DATOS DEL CAMIÓN EXTRAÍDOS ===');
        console.log('Truck data:', data);
        
        // Función para buscar un valor en múltiples campos posibles
        const findValue = (obj, possibleKeys, defaultValue = 'No especificado') => {
          for (let key of possibleKeys) {
            if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
              console.log(`Campo encontrado: ${key} = ${obj[key]}`);
              return obj[key];
            }
          }
          console.log(`Valor por defecto usado para campos [${possibleKeys.join(', ')}]: ${defaultValue}`);
          return defaultValue;
        };

        // Obtener todos los motoristas
        const driversList = await fetchAllDrivers();
        
        console.log('=== INICIANDO MAPEO DE DATOS ===');
        
        // FIXED: Mapear los datos correctamente desde data (no apiResponse)
        const truckData = {
          // Datos básicos
          name: findValue(data, ['name', 'nombre', 'truck_name'], 'Sin nombre'),
          plate: findValue(data, ['licensePlate', 'placa', 'license_plate', 'plate']),
          // FIXED: Manejar todas las variaciones de circulationCard que aparecen en tu JSON
          card: findValue(data, ['ciculatioCard', 'circulationCard', 'tarjeta_circulacion', 'circulation_card']), 
          year: findValue(data, ['age', 'año', 'year', 'model_year']),
          // FIXED: Priorizar campos legacy que tienen más datos en tu JSON
          brand: findValue(data, ['marca', 'brand', 'manufacturer']),
          model: findValue(data, ['modelo', 'model']),
          
          // STATUS - Manejar todas las variaciones de estado
          status: (() => {
            console.log('=== MAPEANDO STATUS ===');
            // Priorizar 'state' sobre 'estado' ya que es el más consistente en tu JSON
            const rawStatus = findValue(data, ['state', 'estado', 'status', 'condition'], null);
            console.log('Raw status encontrado:', rawStatus);
            
            if (!rawStatus || rawStatus.trim() === '' || rawStatus === 'undefined' || rawStatus === 'null') {
              console.log('Status final: Sin estado');
              return 'Sin estado';
            }
            
            console.log('Status final:', rawStatus);
            return rawStatus;
          })(),
          
          description: findValue(data, ['description', 'descripcion', 'notes'], 'Sin descripción'),
          
          // Motorista
          driver: (() => {
            console.log('=== MAPEANDO MOTORISTA ===');
            console.log('Driver ID:', data.driverId);
            console.log('Tipo de Driver ID:', typeof data.driverId);
            
            if (data.driverId && typeof data.driverId === 'string') {
              console.log('Buscando motorista por ID string...');
              const foundDriverName = getDriverNameById(data.driverId, driversList);
              const finalDriver = foundDriverName || getRandomDriver(driversList);
              console.log('Motorista final (ID string):', finalDriver);
              return finalDriver;
            } else if (data.driverId && typeof data.driverId === 'object') {
              console.log('Procesando motorista como objeto...');
              const firstName = data.driverId.name || data.driverId.firstName || data.driverId.nombre || '';
              const lastName = data.driverId.lastName || data.driverId.apellido || data.driverId.surname || '';
              const fullName = `${firstName} ${lastName}`.trim();
              const finalDriver = fullName || getRandomDriver(driversList);
              console.log('Motorista final (objeto):', finalDriver);
              return finalDriver;
            } else {
              console.log('Sin motorista, asignando aleatorio...');
              const randomDriver = getRandomDriver(driversList);
              console.log('Motorista aleatorio:', randomDriver);
              return randomDriver;
            }
          })(),
          
          // Proveedor
          supplier: (() => {
            console.log('=== MAPEANDO PROVEEDOR ===');
            console.log('Supplier ID:', data.supplierId);
            console.log('Tipo de Supplier ID:', typeof data.supplierId);
            
            if (data.supplierId && typeof data.supplierId === 'object') {
              const supplierName = data.supplierId.companyName || data.supplierId.name || 'Sin proveedor';
              console.log('Proveedor (objeto):', supplierName);
              return supplierName;
            }
            const fallbackSupplier = findValue(data, ['supplier', 'proveedor', 'provider'], 'Sin proveedor');
            console.log('Proveedor (fallback):', fallbackSupplier);
            return fallbackSupplier;
          })(),
          
          // Imágenes
          images: (() => {
            console.log('=== MAPEANDO IMÁGENES ===');
            const imageValue = findValue(data, ['img', 'image', 'images', 'foto'], null);
            console.log('Valor de imagen encontrado:', imageValue);
            
            if (imageValue) {
              const finalImages = Array.isArray(imageValue) ? imageValue : [imageValue];
              console.log('Imágenes finales:', finalImages);
              return finalImages;
            }
            
            const defaultImages = ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"];
            console.log('Usando imágenes por defecto:', defaultImages);
            return defaultImages;
          })(),
          
          // ESTADÍSTICAS: Usar las estadísticas que vienen del backend
          stats: (() => {
            console.log('=== MAPEANDO ESTADÍSTICAS ===');
            console.log('Stats del API:', data.stats);
            
            if (data.stats) {
              console.log('Usando estadísticas del API');
              return data.stats;
            }
            
            console.log('Usando estadísticas por defecto');
            return {
              kilometraje: { value: '97,528', percentage: 25 },
              viajesRealizados: { value: '150', percentage: 60 },
              visitasAlTaller: { value: '4', percentage: 15 },
              combustible: { value: "100%", percentage: 100 },
              vecesNoDisponible: { value: '35', percentage: 30 },
            };
          })(),
          
          // ID original para referencias
          _id: data._id || data.id,
        };

        console.log('=== DATOS FINALES MAPEADOS ===');
        console.log('Truck Data Completo:', JSON.stringify(truckData, null, 2));
        console.log('Nombre:', truckData.name);
        console.log('Placa:', truckData.plate);
        console.log('Tarjeta:', truckData.card);
        console.log('Año:', truckData.year);
        console.log('Marca:', truckData.brand);
        console.log('Modelo:', truckData.model);
        console.log('Estado:', truckData.status);
        console.log('Motorista:', truckData.driver);
        console.log('Proveedor:', truckData.supplier);
        console.log('Estadísticas disponibles:', Object.keys(truckData.stats));

        
        // Log detallado del combustible si está disponible
        if (truckData.stats.combustible?.details) {
          console.log('=== DETALLES DEL COMBUSTIBLE ===');
          console.log('Litros actuales:', truckData.stats.combustible.details.liters);
          console.log('Capacidad total:', truckData.stats.combustible.details.capacity);
          console.log('Litros consumidos:', truckData.stats.combustible.details.consumed);
          console.log('Eficiencia:', truckData.stats.combustible.details.efficiency);
          console.log('Viajes activos:', truckData.stats.combustible.details.activeTrips);
          console.log('Distancia total:', truckData.stats.combustible.details.totalDistance);
        }
        
        console.log('=== ESTABLECIENDO DATOS EN STATE ===');
        setTruck(truckData);
        console.log('Datos establecidos exitosamente en el state');
        
      } else {
        console.error('=== ERROR: ESTRUCTURA DE API INESPERADA ===');
        console.error('Response completo:', apiResponse);
        throw new Error('No se encontraron datos del camión en la respuesta del API');
      }

    } catch (error) {
      console.error('=== ERROR AL CARGAR CAMIÓN ===');
      console.error('Error completo:', error);

      let errorMessage = 'Error desconocido';

      if (error.name === 'AbortError') {
        errorMessage = 'La solicitud tardó demasiado tiempo. Inténtalo de nuevo.';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else {
        errorMessage = error.message || 'Error al procesar la solicitud';
      }

      setError(errorMessage);
      setTruck(null);
    } finally {
      // Delay de 2 segundos para mostrar la animación
      setTimeout(() => {
        setLoading(false);
        console.log('=== CARGA FINALIZADA ===');
      }, 2000);
    }
  };

  const refetch = () => {
    if (truckId) {
      fetchTruckDetail();
    }
  };

  useEffect(() => {
    if (truckId) {
      console.log('=== INICIANDO CARGA DEL CAMIÓN ===');
      console.log('Truck ID recibido:', truckId);
      fetchTruckDetail();
    } else {
      console.warn('No se proporcionó ID del camión');
      setTruck(null);
      setLoading(false);
      setError('ID del camión no proporcionado');
    }
  }, [truckId]);

  return {
    truck,
    loading,
    error,
    refetch,
  };
};