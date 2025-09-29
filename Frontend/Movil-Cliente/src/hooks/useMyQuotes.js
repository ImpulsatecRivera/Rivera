import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/authContext';
import { fetchQuotesByClient } from '../api/quotes';

// Map de estado backend → UI
const mapStatus = (s) => {
  switch ((s || '').toString().toLowerCase()) {
    case 'pending':
    case 'pendiente':
      return 'pendiente';
    case 'in_route':
    case 'en ruta':
    case 'en_ruta':
      return 'en ruta';
    case 'completed':
    case 'completado':
      return 'completado';
    case 'enviada':
      return 'enviada';
    case 'aceptada':
      return 'aceptada';
    case 'rechazada':
      return 'rechazada';
    case 'ejecutada':
      return 'ejecutada';
    case 'cancelada':
    case 'canceled':
      return 'cancelado';
    default:
      return 'pendiente';
  }
};

// Normaliza según tu schema - VERSIÓN COMPLETA
const normalizeQuotes = (payload) => {
  const arr = payload?.data?.cotizaciones || payload?.data || payload || [];
  return (Array.isArray(arr) ? arr : []).map((q) => {
    const currency = (q?.costos?.moneda || 'USD').toString().toUpperCase();
    const amount = Number(q?.price ?? 0);
    
    return {
      // IDs
      id: q._id || q.id,
      _id: q._id || q.id,
      
      // Información básica
      title: q.quoteName || q.quoteDescription || 'Cotización',
      quoteName: q.quoteName,
      quoteDescription: q.quoteDescription,
      amount,
      currency,
      price: amount,
      
      // Estado y método de pago
      status: mapStatus(q.status),
      paymentMethod: q?.paymentMethod || 'efectivo',
      
      // UBICACIONES COMPLETAS
      pickupLocation: q?.pickupLocation || q?.ruta?.origen?.nombre || 'Ubicación de recogida no especificada',
      destinationLocation: q?.destinationLocation || q?.ruta?.destino?.nombre || 'Ubicación de destino no especificada',
      deliveryPlace: q?.ruta?.destino?.nombre || q?.destinationLocation || 'No especificado',
      
      // RUTA COMPLETA
      ruta: q?.ruta || {
        origen: {
          nombre: q?.pickupLocation || 'Origen no especificado',
          coordenadas: q?.ruta?.origen?.coordenadas || null,
          tipo: q?.ruta?.origen?.tipo || 'cliente'
        },
        destino: {
          nombre: q?.destinationLocation || q?.ruta?.destino?.nombre || 'Destino no especificado',
          coordenadas: q?.ruta?.destino?.coordenadas || null,
          tipo: q?.ruta?.destino?.tipo || 'cliente'
        },
        distanciaTotal: q?.estimatedDistance || q?.ruta?.distanciaTotal || 0,
        tiempoEstimado: q?.ruta?.tiempoEstimado || 0
      },
      
      // HORARIOS COMPLETOS
      horarios: q?.horarios || {
        fechaSalida: q?.departureTime,
        fechaLlegadaEstimada: q?.arrivalTime,
        horaSalida: q?.horarios?.horaSalida,
        horaLlegadaEstimada: q?.horarios?.horaLlegadaEstimada,
        tiempoEstimadoViaje: q?.horarios?.tiempoEstimadoViaje || 0,
        flexibilidadHoraria: q?.horarios?.flexibilidadHoraria || {}
      },
      arrivalTime: q?.horarios?.fechaLlegadaEstimada || q?.arrivalTime || 'No especificado',
      departureTime: q?.horarios?.fechaSalida || q?.departureTime || 'No especificado',
      
      // CARGA
      carga: q?.carga || {
        categoria: q?.truckType || 'otros',
        tipo: 'general',
        descripcion: '',
        peso: {},
        clasificacionRiesgo: 'normal',
        observaciones: ''
      },
      
      // DISTANCIA
      estimatedDistance: q?.estimatedDistance || q?.ruta?.distanciaTotal || 0,
      distance: q?.estimatedDistance || q?.ruta?.distanciaTotal || 0,
      
      // TIPO DE CAMIÓN
      truckType: q?.truckType || 'otros',
      
      // COSTOS
      costos: q?.costos || {
        combustible: 0,
        peajes: 0,
        conductor: 0,
        otros: 0,
        subtotal: 0,
        impuestos: 0,
        total: amount,
        moneda: currency
      },
      
      // FECHAS
      fechaNecesaria: q?.fechaNecesaria,
      deliveryDate: q?.deliveryDate,
      requestDate: q?.requestDate,
      
      // OBSERVACIONES
      observaciones: q?.observaciones || '',
      notasInternas: q?.notasInternas || '',
      
      // CLIENTE
      clientId: q?.clientId,
      
      // TIMESTAMPS
      createdAt: q?.createdAt,
      updatedAt: q?.updatedAt,
      
      // METADATA
      createdFrom: q?.createdFrom || 'unknown',
      travelLocations: q?.travelLocations || `De ${q?.pickupLocation || 'origen'} a ${q?.destinationLocation || 'destino'}`,
      version: q?.version || '1.0',
      
      // FECHAS DE SEGUIMIENTO
      fechaEnvio: q?.fechaEnvio,
      fechaAceptacion: q?.fechaAceptacion,
      fechaRechazo: q?.fechaRechazo,
      motivoRechazo: q?.motivoRechazo
    };
  });
};

export default function useMyQuotes(baseUrl = 'https://riveraproject-production-933e.up.railway.app') {
  const { user, token } = useAuth();

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const load = useCallback(
    async (asRefresh = false) => {
      try {
        setError(null);
        asRefresh ? setRefreshing(true) : setLoading(true);

        const clientId = user?.id || user?._id;
        if (!clientId) {
          if (!alive.current) return;
          setQuotes([]);
          return;
        }

        const data = await fetchQuotesByClient({ baseUrl, token, clientId });
        
        console.log('📦 Datos recibidos del backend:', data);
        
        if (!alive.current) return;
        
        const normalized = normalizeQuotes(data);
        
        console.log('✅ Cotizaciones normalizadas:', normalized.length);
        if (normalized.length > 0) {
          console.log('🔍 Primera cotización normalizada:', normalized[0]);
        }
        
        setQuotes(normalized);
      } catch (err) {
        if (!alive.current) return;
        setQuotes([]);
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Error de conexión';
        console.error('❌ Error cargando cotizaciones:', msg);
        setError(msg);
      } finally {
        if (!alive.current) return;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user, token, baseUrl]
  );

  // funciones estables
  const reload = useCallback(() => load(false), [load]);
  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => { reload(); }, [reload]);

  return { quotes, loading, error, refreshing, refresh, reload };
}