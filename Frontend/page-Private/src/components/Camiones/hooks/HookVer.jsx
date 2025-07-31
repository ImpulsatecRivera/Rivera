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
  const [allDrivers, setAllDrivers] = useState([]); // Para guardar todos los motoristas

  // Función para obtener todos los motoristas
  const fetchAllDrivers = async () => {
    try {
      console.log('=== OBTENIENDO LISTA DE MOTORISTAS ===');
      
      const response = await fetchWithTimeout(
        `http://localhost:4000/api/motoristas`,
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
      
      console.log('=== OBTENIENDO DETALLE DEL CAMIÓN ===');
      console.log('ID del camión:', truckId);
      
      // Primero obtener la lista de camiones para aplicar la misma lógica de estado
      const allTrucksResponse = await fetchWithTimeout(
        'http://localhost:4000/api/camiones',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        10000
      );
      
      let truckIndex = -1;
      if (allTrucksResponse.ok) {
        const allTrucks = await allTrucksResponse.json();
        const trucksArray = Array.isArray(allTrucks) ? allTrucks : allTrucks.camiones || [];
        truckIndex = trucksArray.findIndex(truck => (truck._id || truck.id) === truckId);
        console.log('Índice del camión en la lista:', truckIndex);
      }
      
      // Luego obtener los detalles específicos del camión
      const response = await fetchWithTimeout(
        `http://localhost:4000/api/camiones/${truckId}`,
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

      const data = await response.json();
      console.log('Datos del camión recibidos:', data);

      if (data) {
        console.log('=== ESTRUCTURA COMPLETA DE LA API ===');
        console.log('Data raw:', JSON.stringify(data, null, 2));
        console.log('Propiedades disponibles:', Object.keys(data));
        
        // Función para buscar un valor en múltiples campos posibles
        const findValue = (obj, possibleKeys, defaultValue = 'No especificado') => {
          for (let key of possibleKeys) {
            if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
              return obj[key];
            }
          }
          return defaultValue;
        };

        // Mapear los datos del API al formato esperado por el componente
        const truckData = {
          // Datos básicos - probando múltiples variantes de nombres
          name: findValue(data, ['name', 'nombre', 'truck_name'], 'Sin nombre'),
          plate: findValue(data, ['licensePlate', 'placa', 'license_plate', 'plate']),
          card: findValue(data, ['ciculatioCard', 'circulationCard', 'tarjeta_circulacion', 'circulation_card']), 
          year: findValue(data, ['age', 'year', 'año', 'model_year']),
          brand: findValue(data, ['brand', 'marca', 'manufacturer']),
          model: findValue(data, ['model', 'modelo']),
          
          // STATUS: Aplicar la misma lógica que en TruckMainScreen
          status: (() => {
            const rawStatus = findValue(data, ['state', 'status', 'estado', 'condition'], null);
            
            // Aplicar la misma lógica de "cada 4to camión" si tenemos el índice
            if (truckIndex !== -1 && truckIndex % 4 === 0) {
              console.log('=== APLICANDO LÓGICA SIN ESTADO ===');
              console.log('Camión en posición:', truckIndex, '- Asignando "Sin estado"');
              return 'Sin estado';
            }
            
            // Si no hay estado definido
            if (!rawStatus || rawStatus.trim() === '' || rawStatus === 'undefined' || rawStatus === 'null') {
              return 'Sin estado';
            }
            
            return rawStatus;
          })(),
          
          description: findValue(data, ['description', 'descripcion', 'notes'], 'Sin descripción'),
          
          // Motorista - se asignará después de la llamada asíncrona
          driver: 'Cargando...',
          driverId: data.driverId, // Guardar el ID para hacer la llamada
          
          // Proveedor
          supplier: (() => {
            if (data.supplierId && typeof data.supplierId === 'object') {
              return data.supplierId.companyName || data.supplierId.name || 'Sin proveedor';
            }
            return findValue(data, ['supplier', 'proveedor', 'provider'], 'Sin proveedor');
          })(),
          
          // Imágenes
          images: (() => {
            const imageValue = findValue(data, ['img', 'image', 'images', 'foto'], null);
            if (imageValue) {
              return Array.isArray(imageValue) ? imageValue : [imageValue];
            }
            return ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"];
          })(),
          
          // Estadísticas con datos reales o valores de demostración
          stats: {
            kilometraje: { 
              value: findValue(data, ['mileage', 'kilometraje', 'odometer'], '97,528'), 
              percentage: 25 
            },
            viajesRealizados: { 
              value: findValue(data, ['trips', 'viajes', 'trips_completed'], '150'), 
              percentage: 60 
            },
            visitasAlTaller: { 
              value: findValue(data, ['maintenanceVisits', 'visitas_taller', 'maintenance_count'], '4'), 
              percentage: 15 
            },
            combustible: { 
              value: (() => {
                const level = findValue(data, ['gasolineLevel', 'fuel_level', 'combustible'], null);
                if (level && !isNaN(level)) {
                  return `${level}/4`;
                }
                return "1/2";
              })(),
              percentage: 50 
            },
            vecesNoDisponible: { 
              value: findValue(data, ['unavailableTimes', 'veces_no_disponible', 'downtime_count'], '35'), 
              percentage: 30 
            },
          },
          
          // ID original para referencias
          _id: data._id || data.id,
        };

        console.log('=== DATOS MAPEADOS ===');
        console.log('Datos procesados:', truckData);
        
        // Primero obtener todos los motoristas
        const driversList = await fetchAllDrivers();
        
        // Determinar qué motorista mostrar
        let driverName = 'Cargando...';
        
        if (data.driverId && typeof data.driverId === 'string') {
          // Buscar el motorista específico por ID
          console.log('=== BUSCANDO MOTORISTA POR ID ===');
          console.log('Driver ID:', data.driverId);
          
          const foundDriverName = getDriverNameById(data.driverId, driversList);
          if (foundDriverName) {
            driverName = foundDriverName;
            console.log('Motorista encontrado:', driverName);
          } else {
            // Si no se encuentra, asignar uno aleatorio
            console.log('Motorista no encontrado, asignando uno aleatorio');
            driverName = getRandomDriver(driversList);
          }
          
        } else if (data.driverId && typeof data.driverId === 'object') {
          // Si ya viene como objeto populated
          const firstName = data.driverId.name || data.driverId.firstName || data.driverId.nombre || '';
          const lastName = data.driverId.lastName || data.driverId.apellido || data.driverId.surname || '';
          const fullName = `${firstName} ${lastName}`.trim();
          driverName = fullName || getRandomDriver(driversList);
          
        } else {
          // No hay motorista asignado, asignar uno aleatorio
          console.log('=== NO HAY MOTORISTA ASIGNADO ===');
          console.log('Asignando motorista aleatorio...');
          driverName = getRandomDriver(driversList);
        }
        
        console.log('=== MOTORISTA FINAL ASIGNADO ===');
        console.log('Nombre del motorista:', driverName);
        
        // Setear los datos con el motorista asignado
        setTruck({
          ...truckData,
          driver: driverName
        });
      } else {
        throw new Error('No se encontraron datos del camión');
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
  // Delay de 5 segundos para mostrar la animación
  setTimeout(() => {
    setLoading(false);
    console.log('=== CARGA FINALIZADA ===');
  }, 2000); // 3 segundos
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