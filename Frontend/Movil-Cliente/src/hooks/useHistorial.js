import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/authContext';
import { fetchQuotesByClient } from '../api/quotes';

// Mapeo de estados completados
const isCompletedStatus = (status) => {
  const completed = ['completado', 'completed', 'ejecutada', 'aceptada'];
  return completed.includes((status || '').toString().toLowerCase());
};

// Normalizar cotización para historial
const normalizeHistorialItem = (quote) => {
  return {
    id: quote._id || quote.id,
    _id: quote._id || quote.id,
    title: quote.quoteName || quote.quoteDescription || 'Cotización sin nombre',
    icon: getTruckIcon(quote.truckType),
    status: 'completed',
    originalStatus: quote.status,
    
    // UBICACIONES
    pickupLocation: quote.pickupLocation || quote.ruta?.origen?.nombre || 'Origen no especificado',
    destinationLocation: quote.destinationLocation || quote.ruta?.destino?.nombre || 'Destino no especificado',
    location: quote.destinationLocation || quote.ruta?.destino?.nombre || 'Destino no especificado',
    
    // DATOS BÁSICOS
    quoteName: quote.quoteName,
    quoteDescription: quote.quoteDescription,
    price: quote.price || 0,
    total: quote.price || 0,
    paymentMethod: quote.paymentMethod || 'efectivo',
    truckType: quote.truckType || 'otros',
    
    // RUTA
    ruta: quote.ruta,
    
    // HORARIOS
    horarios: quote.horarios || {},
    departureTime: quote.horarios?.fechaSalida || quote.departureTime,
    arrivalTime: quote.horarios?.fechaLlegadaEstimada || quote.arrivalTime,
    horaSalida: quote.horarios?.fechaSalida,
    horaLlegada: quote.horarios?.fechaLlegadaEstimada,
    
    // CARGA Y DISTANCIA
    carga: quote.carga || {},
    estimatedDistance: quote.estimatedDistance || quote.ruta?.distanciaTotal || 0,
    costos: quote.costos || {},
    
    // FECHAS
    fechaNecesaria: quote.fechaNecesaria,
    deliveryDate: quote.deliveryDate,
    requestDate: quote.fechaNecesaria,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
    
    // OTROS
    observaciones: quote.observaciones || '',
    travelLocations: quote.travelLocations,
    clientId: quote.clientId,
    _raw: quote
  };
};
// Obtener icono según tipo de camión
const getTruckIcon = (truckType) => {
  const icons = {
    'alimentos_perecederos': '🧊',
    'alimentos_no_perecederos': '📦',
    'otros': '🚛',
    'materiales_construccion': '🏗️',
    'bebidas': '🥤',
    'combustibles': '⛽',
    'maquinaria': '⚙️',
    'vehiculos': '🚗'
  };
  return icons[truckType] || '🚛';
};

const useHistorial = (baseUrl = 'https://riveraproject-production-933e.up.railway.app') => {
  const { user, token } = useAuth();
  
  const [historialItems, setHistorialItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const loadHistorial = useCallback(async (asRefresh = false) => {
    try {
      setError(null);
      asRefresh ? setRefreshing(true) : setLoading(true);

      const clientId = user?.id || user?._id;
      
      if (!clientId) {
        console.log('⚠️ No hay clientId, mostrando historial vacío');
        if (!alive.current) return;
        setHistorialItems([]);
        return;
      }

      console.log('📡 Cargando historial para cliente:', clientId);

      const data = await fetchQuotesByClient({ baseUrl, token, clientId });
      
      if (!alive.current) return;

      console.log('📦 Datos recibidos del backend:', data);

      // Normalizar datos
      const quotes = data?.data?.cotizaciones || data?.data || data || [];
      const quotesArray = Array.isArray(quotes) ? quotes : [];

      console.log(`📊 Total de cotizaciones: ${quotesArray.length}`);

      // Filtrar solo las completadas
      const completedQuotes = quotesArray.filter(q => isCompletedStatus(q.status));

      console.log(`✅ Cotizaciones completadas: ${completedQuotes.length}`);

      // Normalizar para historial
      const normalized = completedQuotes.map(normalizeHistorialItem);

      if (normalized.length > 0) {
        console.log('🔍 Primera cotización del historial:', normalized[0]);
      }

      setHistorialItems(normalized);

    } catch (err) {
      if (!alive.current) return;
      
      console.error('❌ Error cargando historial:', err);
      
      setHistorialItems([]);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Error de conexión';
      setError(msg);
      
      Alert.alert(
        'Error',
        `No se pudo cargar el historial: ${msg}`,
        [{ text: 'OK' }]
      );
    } finally {
      if (!alive.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, token, baseUrl]);

  // Filtrar por búsqueda
  const filteredItems = historialItems.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase()) ||
    item.location.toLowerCase().includes(searchText.toLowerCase()) ||
    item.pickupLocation.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handler para presionar un item
  const handleItemPress = useCallback((item, navigation) => {
    console.log('📱 Abriendo detalles de cotización:', item.id);
    
    if (navigation) {
      // Si hay navegación, ir a la pantalla de detalles
      navigation.navigate('QuoteDetails', { 
        quote: item,
        item: item // Por compatibilidad
      });
    } else {
      // Fallback: mostrar alert
      Alert.alert(
        'Historial',
        `${item.title}\n\n` +
        `Origen: ${item.pickupLocation}\n` +
        `Destino: ${item.location}\n` +
        `Estado: Completado\n` +
        `Precio: $${item.price.toFixed(2)}`,
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Funciones de recarga
  const reload = useCallback(() => loadHistorial(false), [loadHistorial]);
  const refresh = useCallback(() => loadHistorial(true), [loadHistorial]);

  // Cargar al montar
  useEffect(() => {
    reload();
  }, [reload]);

  return {
    historialItems: filteredItems,
    allItems: historialItems,
    loading,
    refreshing,
    error,
    searchText,
    setSearchText,
    handleItemPress,
    reload,
    refresh,
    totalCompleted: historialItems.length
  };
};

export { useHistorial };
export default useHistorial;