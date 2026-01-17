import { useState, useEffect } from 'react';
import { config } from '../../../config';
import { api } from '../../../Context/authContext'; // ✅ IMPORTAR API

const API_URL = config.api.API_URL;

const useTrucksData = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeTruckData = (truck) => {
    const id = truck.id || truck._id || truck.truck_id || truck.camion_id;
    
    return {
      ...truck,
      id: id,
      _id: truck._id || id,
      name: truck.name || truck.nombre || 'Camión sin nombre',
      licensePlate: truck.licensePlate || truck.placa || 'N/A',
      state: truck.state || truck.estado || 'SIN ESTADO',
      img: truck.img || truck.image || truck.foto || null,
      brand: truck.brand || truck.marca || '',
      model: truck.model || truck.modelo || '',
      age: truck.age || truck.año || truck.year || '',
      circulationCard: truck.circulationCard || truck.ciculatioCard || '',
      ciculatioCard: truck.ciculatioCard || truck.circulationCard || '',
      description: truck.description || truck.descripcion || '',
      gasolineLevel: truck.gasolineLevel || truck.nivelGasolina || 0,
      supplierId: truck.supplierId || '',
      driverId: truck.driverId || ''
    };
  };

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚚 Iniciando petición a la API...');
      
      // ✅ USAR API EN LUGAR DE FETCH
      const response = await api.get('/camiones');
      
      console.log('📡 Datos recibidos:', response.data);
      
      const data = response.data;

      // Manejar diferentes formatos de respuesta
      let camiones = [];
      if (Array.isArray(data)) {
        camiones = data;
      } else if (data.data && Array.isArray(data.data)) {
        camiones = data.data;
      } else if (data.camiones && Array.isArray(data.camiones)) {
        camiones = data.camiones;
      } else {
        console.warn('⚠️ Formato de datos no esperado:', data);
        throw new Error('Formato de datos no válido');
      }

      console.log(`📊 Cantidad de camiones encontrados: ${camiones.length}`);

      // Normalizar datos
      const normalizedTrucks = camiones
        .map((truck, index) => {
          console.log(`🔄 Normalizando camión ${index + 1}:`, truck);
          return normalizeTruckData(truck);
        })
        .filter(truck => {
          const hasValidId = truck.id !== undefined && truck.id !== null;
          if (!hasValidId) {
            console.warn('❌ Camión sin ID válido encontrado:', truck);
          }
          return hasValidId;
        });

      console.log("✅ Camiones normalizados:", normalizedTrucks);
      
      setTrucks(normalizedTrucks);
      setError(null);
      
    } catch (err) {
      console.error('❌ Error detallado:', err);
      
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose.');
      } else if (err.response?.status === 401) {
        setError('No autorizado. Por favor inicia sesión nuevamente.');
      } else if (err.response?.status === 403) {
        setError('No tienes permisos para ver los camiones.');
      } else {
        setError(`Error al cargar camiones: ${err.message}`);
      }
      setTrucks([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteTruck = async (truckId) => {
    try {
      console.log(`🗑️ Eliminando camión con ID: ${truckId}`);
      
      // ✅ USAR API Y CORREGIR LA URL (agregar /)
      const response = await api.delete(`/camiones/${truckId}`);

      console.log('✅ Camión eliminado exitosamente');
      setTrucks(prevTrucks => prevTrucks.filter(t => t.id !== truckId && t._id !== truckId));
      return { success: true };

    } catch (error) {
      console.error('❌ Error al eliminar camión:', error);
      
      if (error.response?.status === 404) {
        return { 
          success: false, 
          error: 'Camión no encontrado.' 
        };
      } else if (error.response?.status === 401) {
        return { 
          success: false, 
          error: 'No autorizado para eliminar este camión.' 
        };
      } else if (error.response?.status === 403) {
        return { 
          success: false, 
          error: 'No tienes permisos para eliminar camiones.' 
        };
      } else {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Error al eliminar el camión. Inténtalo de nuevo.' 
        };
      }
    }
  };

  const updateTruckInState = (updatedTruck) => {
    console.log('🔄 Actualizando camión en estado:', updatedTruck);
    
    const normalizedUpdatedTruck = normalizeTruckData(updatedTruck);
    console.log('🔄 Camión normalizado para actualización:', normalizedUpdatedTruck);
    
    setTrucks(prevTrucks => {
      console.log('📋 Estado previo de camiones:', prevTrucks.length, 'camiones');
      
      const truckIndex = prevTrucks.findIndex(t => 
        t.id === normalizedUpdatedTruck.id || 
        t._id === normalizedUpdatedTruck._id ||
        t.id === normalizedUpdatedTruck._id ||
        t._id === normalizedUpdatedTruck.id
      );
      
      if (truckIndex === -1) {
        console.warn('⚠️ No se encontró el camión para actualizar:', {
          searchingFor: normalizedUpdatedTruck.id || normalizedUpdatedTruck._id,
          availableIds: prevTrucks.map(t => ({ id: t.id, _id: t._id }))
        });
        return prevTrucks;
      }
      
      console.log(`✅ Camión encontrado en índice ${truckIndex}, actualizando...`);
      
      const newTrucks = [...prevTrucks];
      newTrucks[truckIndex] = {
        ...prevTrucks[truckIndex],
        ...normalizedUpdatedTruck
      };
      
      console.log('✅ Estado actualizado, nuevo camión:', newTrucks[truckIndex]);
      return newTrucks;
    });
  };

  const addTruckToState = (newTruck) => {
    const normalizedTruck = normalizeTruckData(newTruck);
    setTrucks(prevTrucks => [...prevTrucks, normalizedTruck]);
    console.log('✅ Nuevo camión agregado al estado local:', normalizedTruck);
  };

  const refreshTrucks = () => {
    console.log('🔄 Refrescando lista de camiones...');
    fetchTrucks();
  };

  const getTruckById = (truckId) => {
    return trucks.find(truck => 
      truck.id === truckId || 
      truck._id === truckId
    );
  };

  const existsTruckWithPlate = (licensePlate) => {
    return trucks.some(truck => 
      truck.licensePlate?.toLowerCase() === licensePlate?.toLowerCase()
    );
  };

  useEffect(() => {
    console.log('🚀 Hook montado, cargando camiones...');
    fetchTrucks();
  }, []);

  useEffect(() => {
    console.log('📊 Estado actual:', {
      trucksCount: trucks.length,
      loading,
      error,
      hasData: trucks.length > 0
    });
    
    if (trucks.length > 0) {
      console.log('📋 IDs de camiones en estado:', trucks.map(t => ({ 
        id: t.id, 
        _id: t._id, 
        name: t.name 
      })));
    }
  }, [trucks, loading, error]);

  return {
    trucks,
    loading,
    error,
    fetchTrucks,
    refreshTrucks,
    deleteTruck,
    updateTruckInState,
    addTruckToState,
    getTruckById,
    existsTruckWithPlate,
    trucksCount: trucks.length,
    hasData: trucks.length > 0
  };
};

export default useTrucksData;