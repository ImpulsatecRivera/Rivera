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

  const fetchTruckDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== OBTENIENDO DETALLE DEL CAMIÓN ===');
      console.log('ID del camión:', truckId);
      
      const response = await fetchWithTimeout(
        `http://localhost:4000/api/camiones/${truckId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        10000 // 10 segundos
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
      console.log('Datos del camión:', data);

      if (data) {
        const truckData = {
          plate: data.licensePlate || 'No especificado',
          card: data.ciculatioCard || 'No especificado', 
          year: data.age?.toString() || 'No especificado',
          driver: data.driverId 
            ? `${data.driverId.name || ''} ${data.driverId.lastName || ''}`.trim() || 'Sin asignar'
            : 'Sin asignar',
          brand: data.brand || 'No especificado',
          model: data.model || 'No especificado',
          status: data.state || 'No especificado',
          name: data.name || 'Sin nombre',
          description: data.description || 'Sin descripción',
          gasolineLevel: data.gasolineLevel || 0,
          images: data.img 
            ? [data.img] 
            : ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"],
          supplier: data.supplierId?.companyName || 'Sin proveedor',
          _id: data._id,
        };

        console.log('=== DATOS MAPEADOS ===');
        console.log('Datos procesados:', truckData);
        setTruck(truckData);
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
      setLoading(false);
      console.log('=== CARGA FINALIZADA ===');
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
