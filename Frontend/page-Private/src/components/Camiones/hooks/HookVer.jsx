import { useState, useEffect } from 'react';
import { config } from '../../../config';
import { api } from '../../../Context/authContext';

const API_URL = config.api.API_URL;

export const useTruckDetail = (truckId) => {
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allDrivers, setAllDrivers] = useState([]);

  const fetchAllDrivers = async () => {
    try {
      console.log('=== OBTENIENDO LISTA DE MOTORISTAS ===');
      
      const response = await api.get('/motoristas', {
        timeout: 5000
      });
      
      console.log('Lista de motoristas obtenida:', response.data);
      setAllDrivers(response.data);
      return response.data;
      
    } catch (error) {
      console.error('Error al obtener motoristas:', error);
      return [];
    }
  };

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
      
      console.log('=== OBTENIENDO DETALLE DEL CAMIÓN ===');
      console.log('ID del camión:', truckId);
      
      // ✅ ENDPOINT NORMAL SIN /stats
      const response = await api.get(`/camiones/${truckId}`, {
        timeout: 10000
      });
      
      console.log('=== RESPUESTA DEL SERVIDOR ===');
      console.log('Status:', response.status);
      console.log('Datos del camión recibidos:', response.data);

      const apiResponse = response.data;

      if (apiResponse && apiResponse.data) {
        console.log('=== ESTRUCTURA COMPLETA DE LA API ===');
        console.log('Data raw:', JSON.stringify(apiResponse, null, 2));
        console.log('Propiedades disponibles:', Object.keys(apiResponse));
        
        const data = apiResponse.data;
        console.log('=== DATOS DEL CAMIÓN EXTRAÍDOS ===');
        console.log('Truck data:', data);
        
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
        
        const truckData = {
          // Datos básicos
          name: findValue(data, ['name', 'nombre', 'truck_name'], 'Sin nombre'),
          plate: findValue(data, ['licensePlate', 'placa', 'license_plate', 'plate']),
          card: findValue(data, ['ciculatioCard', 'circulationCard', 'tarjeta_circulacion', 'circulation_card']), 
          year: findValue(data, ['age', 'año', 'year', 'model_year']),
          brand: findValue(data, ['marca', 'brand', 'manufacturer']),
          model: findValue(data, ['modelo', 'model']),
          
          // STATUS
          status: (() => {
            console.log('=== MAPEANDO STATUS ===');
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
          
          // ✅ ESTADÍSTICAS POR DEFECTO (ya que no usamos /stats)
          stats: {
            kilometraje: { value: '0', percentage: 0 },
            viajesRealizados: { value: '0', percentage: 0 },
            visitasAlTaller: { value: '0', percentage: 0 },
            combustible: { value: "0%", percentage: 0 },
            vecesNoDisponible: { value: '0', percentage: 0 },
          },
          
          // ID original
          _id: data._id || data.id,
        };

        console.log('=== DATOS FINALES MAPEADOS ===');
        console.log('Truck Data Completo:', JSON.stringify(truckData, null, 2));
        
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

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'La solicitud tardó demasiado tiempo. Inténtalo de nuevo.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'No autorizado para ver este camión';
            break;
          case 403:
            errorMessage = 'Acceso denegado';
            break;
          case 404:
            errorMessage = 'Camión no encontrado';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = error.response.data?.message || error.response.data?.error || `Error ${error.response.status}`;
        }
      } else {
        errorMessage = error.message || 'Error al procesar la solicitud';
      }

      setError(errorMessage);
      setTruck(null);
    } finally {
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