import { useState, useEffect } from 'react';

const useTrucksData = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Configuración base para fetch con cookies
  const fetchOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Función para normalizar los datos del camión
  const normalizeTruckData = (truck) => {
    // Intenta diferentes campos comunes para el ID
    const id = truck.id || truck._id || truck.truck_id || truck.camion_id;
    
    return {
      ...truck,
      id: id,
      // Asegúrate de que otros campos también estén normalizados
      name: truck.name || truck.nombre || 'Camión sin nombre',
      licensePlate: truck.licensePlate || truck.placa || 'N/A',
      state: truck.state || truck.estado || 'SIN ESTADO',
      img: truck.img || truck.image || truck.foto || null,
      brand: truck.brand || truck.marca || '',
      model: truck.model || truck.modelo || '',
      age: truck.age || truck.año || truck.year || '',
      ciculatioCard: truck.ciculatioCard || truck.circulationCard || '',
      description: truck.description || truck.descripcion || ''
    };
  };

  // Función para obtener camiones
  const fetchTrucks = async () => {
    try {
      setLoading(true);
      setError(false);
      
      const res = await fetch('http://localhost:4000/api/camiones', fetchOptions);
      const data = await res.json();
      console.log("Camiones recibidos:", data);

      const camiones = Array.isArray(data) ? data : data.camiones || [];
      
      // Normaliza los datos y filtra elementos sin ID válido
      const normalizedTrucks = camiones
        .map(normalizeTruckData)
        .filter(truck => truck.id !== undefined && truck.id !== null)
        .map((truck, index) => {
          // Asignar algunos camiones como "Sin estado" para demostración
          if (index % 4 === 0) { // Cada 4to camión sin estado
            return {
              ...truck,
              state: 'Sin estado'
            };
          }
          return truck;
        });

      console.log("Camiones normalizados:", normalizedTrucks);
      setTrucks(normalizedTrucks);
      setError(false);
    } catch (err) {
      console.error('Error al obtener camiones:', err);
      setError(true);
      setTrucks([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar camión
  const deleteTruck = async (truckId) => {
    try {
      console.log(`Eliminando camión con ID: ${truckId}`);
      
      const response = await fetch(`http://localhost:4000/api/camiones/${truckId}`, {
        method: 'DELETE',
        ...fetchOptions,
      });

      if (response.ok) {
        // Solo si se eliminó exitosamente del backend, quitar del estado local
        setTrucks(prevTrucks => prevTrucks.filter(t => t.id !== truckId));
        console.log('Camión eliminado exitosamente de la base de datos');
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('Error al eliminar camión:', errorData);
        return { 
          success: false, 
          error: 'Error al eliminar el camión. Inténtalo de nuevo.' 
        };
      }
    } catch (error) {
      console.error('Error de conexión al eliminar camión:', error);
      return { 
        success: false, 
        error: 'Error de conexión. Verifica tu conexión a internet.' 
      };
    }
  };

  // Función para actualizar camión en el estado local
  const updateTruckInState = (updatedTruck) => {
    setTrucks(prevTrucks => 
      prevTrucks.map(t => 
        t.id === updatedTruck.id ? { ...t, ...updatedTruck } : t
      )
    );
    console.log('Camión actualizado en el estado local:', updatedTruck);
  };

  // Función para agregar camión al estado local
  const addTruckToState = (newTruck) => {
    const normalizedTruck = normalizeTruckData(newTruck);
    setTrucks(prevTrucks => [...prevTrucks, normalizedTruck]);
    console.log('Nuevo camión agregado al estado local:', normalizedTruck);
  };

  // Función para refrescar datos
  const refreshTrucks = () => {
    console.log('Refrescando lista de camiones...');
    fetchTrucks();
  };

  // Función para obtener un camión específico por ID
  const getTruckById = (truckId) => {
    return trucks.find(truck => truck.id === truckId);
  };

  // Función para verificar si existe un camión con cierta placa
  const existsTruckWithPlate = (licensePlate) => {
    return trucks.some(truck => 
      truck.licensePlate?.toLowerCase() === licensePlate?.toLowerCase()
    );
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchTrucks();
  }, []);

  // Efecto para debugging en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Estado actual de camiones:', {
        count: trucks.length,
        loading,
        error,
        trucks: trucks.slice(0, 3) // Solo mostrar los primeros 3
      });
    }
  }, [trucks, loading, error]);

  return {
    // Estados
    trucks,
    loading,
    error,
    
    // Funciones principales
    fetchTrucks,
    refreshTrucks,
    deleteTruck,
    updateTruckInState,
    addTruckToState,
    
    // Funciones de utilidad
    getTruckById,
    existsTruckWithPlate,
    
    // Configuración
    fetchOptions,
    
    // Estadísticas
    trucksCount: trucks.length,
    hasData: trucks.length > 0
  };
};

export default useTrucksData;