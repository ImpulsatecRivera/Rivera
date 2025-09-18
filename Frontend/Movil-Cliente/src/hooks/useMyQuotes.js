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

// Normaliza según tu schema
const normalizeQuotes = (payload) => {
  const arr = payload?.data?.cotizaciones || payload?.data || payload || [];
  return (Array.isArray(arr) ? arr : []).map((q) => {
    const currency = (q?.costos?.moneda || 'USD').toString().toUpperCase();
    const amount = Number(q?.price ?? 0);
    return {
      id: q._id || q.id,
      title: q.quoteName || q.quoteDescription || 'Cotización',
      amount,
      currency,
      status: mapStatus(q.status),
      paymentMethod: q?.paymentMethod || '—',
      deliveryPlace: q?.ruta?.destino?.nombre || '—',
      arrivalTime: q?.horarios?.fechaLlegadaEstimada || '—',
      departureTime: q?.horarios?.fechaSalida || '—',
    };
  });
};

export default function useMyQuotes(baseUrl = 'riveraproject-production.up.railway.app') {
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
        if (!alive.current) return;
        setQuotes(normalizeQuotes(data));
      } catch (err) {
        if (!alive.current) return;
        setQuotes([]);
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Error de conexión';
        setError(msg);
      } finally {
        if (!alive.current) return;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user, token, baseUrl]
  );

  // 🔒 funciones estables
  const reload = useCallback(() => load(false), [load]);
  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => { reload(); }, [reload]);

  return { quotes, loading, error, refreshing, refresh, reload };
}
