// Versión mejorada del hook con mejor debugging y actualización de estado
import { useState, useEffect } from 'react';

const useTrucksData = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const normalizeTruckData = (truck) => {
    const id = truck.id || truck._id || truck.truck_id || truck.camion_id;
    
    return {
      ...truck,
      id: id,
      _id: truck._id || id, // Mantener ambos para compatibilidad
      name: truck.name || truck.nombre || 'Camión sin nombre',
      licensePlate: truck.licensePlate || truck.placa || 'N/A',
      // Manejar todas las variaciones de estado que aparecen en tu JSON
      state: truck.state || truck.estado || 'SIN ESTADO',
      img: truck.img || truck.image || truck.foto || null,
      // Priorizar campos nuevos sobre campos legacy
      brand: truck.brand || truck.marca || '',
      model: truck.model || truck.modelo || '',
      age: truck.age || truck.año || truck.year || '',
      // Manejar todas las variaciones de circulationCard
      circulationCard: truck.circulationCard || truck.ciculatioCard || '',
      ciculatioCard: truck.ciculatioCard || truck.circulationCard || '', // Mantener ambos
      description: truck.description || truck.descripcion || '',
      // Manejar nivel de gasolina con diferentes nombres
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
      
      const response = await fetch('http://localhost:4000/api/camiones', fetchOptions);
      
      console.log('📡 Status de la respuesta:', response.status);
      console.log('📡 Response OK:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("📋 Datos recibidos del servidor:", data);

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
      
      if (err.message.includes('fetch')) {
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose en http://localhost:4000');
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
      
      const response = await fetch(`http://localhost:4000/api/camiones/${truckId}`, {
        method: 'DELETE',
        ...fetchOptions,
      });

      if (response.ok) {
        setTrucks(prevTrucks => prevTrucks.filter(t => t.id !== truckId));
        console.log('✅ Camión eliminado exitosamente');
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('❌ Error al eliminar camión:', errorData);
        return { 
          success: false, 
          error: 'Error al eliminar el camión. Inténtalo de nuevo.' 
        };
      }
    } catch (error) {
      console.error('❌ Error de conexión al eliminar camión:', error);
      return { 
        success: false, 
        error: 'Error de conexión. Verifica tu conexión a internet.' 
      };
    }
  };

  const updateTruckInState = (updatedTruck) => {
    console.log('🔄 Actualizando camión en estado:', updatedTruck);
    
    // Normalizar el camión actualizado para mantener consistencia
    const normalizedUpdatedTruck = normalizeTruckData(updatedTruck);
    console.log('🔄 Camión normalizado para actualización:', normalizedUpdatedTruck);
    
    setTrucks(prevTrucks => {
      console.log('📋 Estado previo de camiones:', prevTrucks.length, 'camiones');
      
      // Buscar el camión por ID y _id para mayor compatibilidad
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

  // Debug mejorado
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
    fetchOptions,
    trucksCount: trucks.length,
    hasData: trucks.length > 0
  };
};

export default useTrucksData;