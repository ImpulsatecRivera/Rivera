// Versión mejorada del hook con mejor debugging
import { useState, useEffect } from 'react';

const useTrucksData = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Cambiar a null para mejor manejo

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
      name: truck.name || truck.nombre || 'Camión sin nombre',
      licensePlate: truck.licensePlate || truck.placa || 'N/A',
      state: truck.state || truck.estado || 'SIN ESTADO',
      img: truck.img || truck.image || truck.foto || null,
      brand: truck.brand || truck.marca || '',
      model: truck.model || truck.modelo || '',
      age: truck.age || truck.año || truck.year || '',
      circulationCard: truck.circulationCard || truck.ciculatioCard || '',
      description: truck.description || truck.descripcion || '',
      // Campos adicionales que veo en tu API
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
      
      // Verificar si el servidor está disponible
      const response = await fetch('http://localhost:4000/api/camiones', fetchOptions);
      
      console.log('📡 Status de la respuesta:', response.status);
      console.log('📡 Response OK:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("📋 Datos recibidos del servidor:", data);
      console.log("📋 Tipo de datos recibidos:", typeof data);
      console.log("📋 Es array?", Array.isArray(data));

      // Manejar diferentes formatos de respuesta
      let camiones = [];
      if (Array.isArray(data)) {
        camiones = data;
      } else if (data.data && Array.isArray(data.data)) {
        // Tu API devuelve los camiones en data.data
        camiones = data.data;
      } else if (data.camiones && Array.isArray(data.camiones)) {
        camiones = data.camiones;
      } else {
        console.warn('⚠️ Formato de datos no esperado:', data);
        console.warn('⚠️ Estructura recibida:', Object.keys(data));
        throw new Error('Formato de datos no válido');
      }

      console.log(`📊 Cantidad de camiones encontrados: ${camiones.length}`);

      if (camiones.length === 0) {
        console.log('⚠️ No se encontraron camiones en la respuesta');
        setTrucks([]);
        return;
      }

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
      console.log(`✅ Total de camiones válidos: ${normalizedTrucks.length}`);
      
      setTrucks(normalizedTrucks);
      setError(null);
      
    } catch (err) {
      console.error('❌ Error detallado:', err);
      console.error('❌ Tipo de error:', err.name);
      console.error('❌ Mensaje de error:', err.message);
      
      // Verificar si es un error de red
      if (err.message.includes('fetch')) {
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose en http://localhost:4000');
      } else {
        setError(`Error al cargar camiones: ${err.message}`);
      }
      setTrucks([]);
    } finally {
      setLoading(false);
      console.log('🏁 Carga finalizada');
    }
  };

  // Resto de funciones...
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
    setTrucks(prevTrucks => 
      prevTrucks.map(t => 
        t.id === updatedTruck.id ? { ...t, ...updatedTruck } : t
      )
    );
    console.log('✅ Camión actualizado en el estado local:', updatedTruck);
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
    return trucks.find(truck => truck.id === truckId);
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
      console.log('📋 Primeros camiones:', trucks.slice(0, 2));
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