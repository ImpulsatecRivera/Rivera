// src/hooks/useTrips.js
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL: toma EXPO_PUBLIC_API_URL (sin barras finales) o cae a Railway
const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') || 'https://riveraproject-production.up.railway.app') + '/api';

// ====================== Utilidades de formato ======================
const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const fechaObj = new Date(fecha);
  const hoy = new Date();
  const manana = new Date();
  manana.setDate(hoy.getDate() + 1);

  if (fechaObj.toDateString() === hoy.toDateString()) return 'Hoy';
  if (fechaObj.toDateString() === manana.toDateString()) return 'Mañana';

  return fechaObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

const formatearHora = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '';

const obtenerIconoViaje = (descripcion = '') => {
  const desc = String(descripcion).toLowerCase();
  if (desc.includes('alimento') || desc.includes('comida')) return '🍽️';
  if (desc.includes('mobiliario') || desc.includes('mueble')) return '🏠';
  if (desc.includes('construcción') || desc.includes('material')) return '🏗️';
  if (desc.includes('combustible') || desc.includes('gas')) return '⛽';
  if (desc.includes('medicina') || desc.includes('farmacia')) return '💊';
  return '📦';
};

const obtenerColorEstado = (estado = '') => {
  switch (String(estado).toLowerCase()) {
    case 'programado': return '#4CAF50';
    case 'pendiente': return '#FF9800';
    case 'confirmado': return '#2196F3';
    case 'en_transito': return '#9C27B0';
    case 'en curso':
    case 'en_curso': return '#9C27B0';
    case 'completado':
    case 'finalizado': return '#8BC34A';
    case 'cancelado': return '#F44336';
    default: return '#757575';
  }
};

// ====================== Normalización / helpers ======================
const normalizarEstado = (estado) => {
  const e = (estado?.actual ?? estado ?? '').toString().toLowerCase();
  return e === 'en_curso' ? 'en_transito' : e;
};

const transformarViajeAPI = (raw, camionGlobal = null) => {
  if (!raw) return null;

  const id = (raw._id || raw.id)?.toString();

  const fechaSalida =
    raw.fechaSalida ??
    raw.departureTime ??
    raw.fecha ??
    raw.salida ??
    raw.horarios?.fechaSalida ??
    null;

  const fechaLlegada =
    raw.fechaLlegada ??
    raw.arrivalTime ??
    raw.llegada ??
    raw.horarios?.fechaLlegadaEstimada ??
    null;

  const estado = normalizarEstado(raw.estado ?? raw.estadoActual);

  const descripcion =
    raw.descripcion ??
    raw.tripDescription ??
    raw.cotizacion?.descripcion ??
    raw.detalle ??
    '';

  const origen =
    raw.origen ??
    raw.cotizacion?.ruta?.origen ??
    raw.ruta?.origen ??
    raw.origenNombre ??
    '';

  const destino =
    raw.destino ??
    raw.cotizacion?.ruta?.destino ??
    raw.ruta?.destino ??
    raw.destinoNombre ??
    '';

  const cliente =
    raw.cliente ??
    raw.cotizacion?.clienteNombre ??
    raw.cotizacion?.clientName ??
    'Cliente no especificado';

  const camion =
    camionGlobal?.licensePlate ??
    camionGlobal?.placa ??
    raw.camion?.licensePlate ??
    raw.camion?.placa ??
    raw.truck?.alias ??
    raw.truck?.placa ??
    'N/A';

  return {
    id,
    tipo: descripcion || 'Transporte de carga',
    subtitulo: `${origen} → ${destino}`,
    fecha: formatearFecha(fechaSalida),
    hora: formatearHora(fechaSalida),
    cotizacion: cliente,
    camion,
    descripcion,
    horaLlegada: formatearHora(fechaLlegada) || 'No especificada',
    horaSalida: formatearHora(fechaSalida),
    asistente: 'Por asignar',
    icon: obtenerIconoViaje(descripcion),
    color: obtenerColorEstado(estado),
    estado,
    origen,
    destino,
    carga: raw.carga,
    _fechaSalidaISO: fechaSalida,
    _fechaLlegadaISO: fechaLlegada,
  };
};

const getPayload = (data) => (data && data.success && data.data) ? data.data : data;

const getListaViajes = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  const payload = getPayload(data);
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== 'object') return [];

  return (
    payload.historialCompleto ||
    payload.trips ||
    payload.viajes ||
    payload.items ||
    payload.result ||
    payload.data?.trips ||
    payload.data?.viajes ||
    []
  );
};

const getTotalViajes = (data, lista) => {
  const payload = getPayload(data);
  return Number(
    payload?.total ??
    payload?.totalViajes ??
    payload?.count ??
    (Array.isArray(lista) ? lista.length : 0)
  );
};

// ====================== Hook principal ======================
export const useTrips = (motoristaId = null, tipoConsulta = 'programados') => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalTrips, setTotalTrips] = useState(0);
  const [proximosDestinos, setProximosDestinos] = useState([]);
  const [historialViajes, setHistorialViajes] = useState([]);
  const [viajesPorDia, setViajesPorDia] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    programados: 0,
    completados: 0,
    cancelados: 0,
    enProgreso: 0,
  });

  const abortRef = useRef(null);

  const obtenerToken = async () => {
    try {
      let token =
        (await AsyncStorage.getItem('userToken')) ||
        (await AsyncStorage.getItem('authToken')) ||
        (await AsyncStorage.getItem('token'));
      console.log(`🔑 Token obtenido: ${token ? 'Presente' : 'No encontrado'}`);
      return token;
    } catch (e) {
      console.error('❌ Error obteniendo token:', e);
      return null;
    }
  };

  const hacerPeticion = async (url) => {
    console.log(`🌐 GET ${url}`);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const authToken = await obtenerToken();
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(authToken && !/^temp(-register)?-token$/.test(authToken)
          ? { Authorization: `Bearer ${authToken}` }
          : {}),
      };

      const resp = await fetch(url, { headers, signal: controller.signal });
      console.log(`📡 Status: ${resp.status}`);
      if (!resp.ok) {
        const text = await resp.text();
        console.log('❌ Error body:', text);
        throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      }
      const data = await resp.json();

      const payload = getPayload(data);
      console.log('✅ JSON OK', Array.isArray(payload) ? ['<array>'] : Object.keys(payload));
      if (Array.isArray(payload) && payload[0]) {
        console.log('🧪 Ejemplo item:', Object.keys(payload[0]));
      }

      return data;
    } catch (e) {
      if (e.name === 'AbortError') {
        console.log('⛔ Fetch abortado');
        return null;
      }
      console.error('❌ Fetch error:', e.message);
      throw e;
    }
  };

  // ====================== Cargadores ======================
  const cargarHistorialCompleto = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const safeId = encodeURIComponent(id);
      const url = `${API_BASE_URL}/motoristas/${safeId}/historial-completo`;
      const data = await hacerPeticion(url);
      if (!data) return;

      const lista = getListaViajes(data);
      if (Array.isArray(lista)) {
        const todos = lista.map((v) => transformarViajeAPI(v)).filter(Boolean);
        console.log('🧾 Viajes transformados (historial):', todos.length);

        setTrips(todos);
        setViajesPorDia([]);
        setProximosDestinos([]);
        setTotalTrips(getTotalViajes(data, todos));
        const payload = getPayload(data);
        setEstadisticas(
          payload?.estadisticas || {
            programados: todos.filter((x) => ['programado', 'pendiente', 'confirmado'].includes(x.estado)).length,
            completados: todos.filter((x) => ['completado', 'finalizado'].includes(x.estado)).length,
            cancelados: todos.filter((x) => x.estado === 'cancelado').length,
            enProgreso: todos.filter((x) => ['en_transito', 'iniciado', 'en_curso'].includes(x.estado)).length,
          }
        );
        setHistorialViajes(todos);
        return;
      }

      const payload = getPayload(data);
      const raw = Array.isArray(payload?.historialCompleto) ? payload.historialCompleto : [];
      const todos = raw.map((v) => transformarViajeAPI(v, payload?.camionAsignado)).filter(Boolean);

      setTrips(todos);
      setViajesPorDia(payload?.viajesPorDia || []);
      setProximosDestinos([]);
      setTotalTrips(payload?.totalViajes || todos.length);
      setEstadisticas(
        payload?.estadisticas || {
          programados: todos.filter((x) => ['programado', 'pendiente', 'confirmado'].includes(x.estado)).length,
          completados: todos.filter((x) => ['completado', 'finalizado'].includes(x.estado)).length,
          cancelados: todos.filter((x) => x.estado === 'cancelado').length,
          enProgreso: todos.filter((x) => ['en_transito', 'iniciado', 'en_curso'].includes(x.estado)).length,
        }
      );
      setHistorialViajes(todos);
    } catch (e) {
      setError(`Error de conexión: ${e.message}`);
      setTrips([]);
      setViajesPorDia([]);
      setProximosDestinos([]);
      setTotalTrips(0);
      setEstadisticas({ programados: 0, completados: 0, cancelados: 0, enProgreso: 0 });
      setHistorialViajes([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarViajesMotorista = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const safeId = encodeURIComponent(id);
      const url = `${API_BASE_URL}/motoristas/${safeId}/viajes-programados`;
      const data = await hacerPeticion(url);
      if (!data) return;

      const lista = getListaViajes(data);
      if (Array.isArray(lista)) {
        const todos = lista.map((v) => transformarViajeAPI(v)).filter(Boolean);
        const prox = todos.slice(0, 3).map((t) => ({
          id: t.id,
          tipo: `${t.origen} → ${t.destino}`,
          fecha: t.fecha,
          hora: t.hora,
        }));
        console.log('🧾 Viajes transformados (proximos):', todos.length);

        setTrips(todos);
        setViajesPorDia([]);
        setProximosDestinos(prox);
        setTotalTrips(getTotalViajes(data, todos));
        setHistorialViajes(todos.slice(-5));

        const payload = getPayload(data);
        if (payload?.estadisticas) setEstadisticas(payload.estadisticas);
        return;
      }

      // Fallback agrupado por día
      const todos = [];
      const prox = [];
      const payload = getPayload(data);

      (payload.viajesPorDia || []).forEach((dia) => {
        (dia.viajes || []).forEach((v) => {
          const t = transformarViajeAPI(v, payload.camionAsignado);
          if (t) todos.push(t);

          if (prox.length < 3) {
            const f = v.fechaSalida ?? v.departureTime ?? v.fecha ?? v.horarios?.fechaSalida;
            prox.push({
              id: v._id || v.id,
              tipo: `${t?.origen || v.origen} → ${t?.destino || v.destino}`,
              fecha: formatearFecha(f),
              hora: formatearHora(f),
            });
          }
        });
      });

      setTrips(todos);
      setViajesPorDia(payload.viajesPorDia || []);
      setProximosDestinos(prox);
      setTotalTrips(payload.totalViajes || todos.length);
      setHistorialViajes(todos.slice(-5));
    } catch (e) {
      setError(`Error de conexión: ${e.message}`);
      setTrips([]);
      setViajesPorDia([]);
      setProximosDestinos([]);
      setTotalTrips(0);
      setHistorialViajes([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarTodosLosViajes = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/viajes?scope=proximos`;
      const data = await hacerPeticion(url);
      if (!data) return;

      const lista = getListaViajes(data);
      if (Array.isArray(lista)) {
        const todos = lista.map((v) => transformarViajeAPI(v)).filter(Boolean);
        setTrips(todos);
        setViajesPorDia([]);
        setTotalTrips(getTotalViajes(data, todos));
        const payload = getPayload(data);
        if (payload?.estadisticas) setEstadisticas(payload.estadisticas);
        return;
      }

      // Fallback
      const todos = [];
      const payload = getPayload(data);

      (payload.viajesPorDia || []).forEach((dia) => {
        (dia.motoristasConViajes || []).forEach((m) => {
          (m.viajes || []).forEach((v) => {
            const t = transformarViajeAPI(v, m.camion);
            if (t) {
              t.motorista = m.motorista;
              todos.push(t);
            }
          });
        });
      });

      setTrips(todos);
      setViajesPorDia(payload.viajesPorDia || []);
      setTotalTrips(payload.totalViajes || todos.length);
    } catch (e) {
      setError(`Error de conexión: ${e.message}`);
      setTrips([]);
      setViajesPorDia([]);
      setTotalTrips(0);
    } finally {
      setLoading(false);
    }
  };

  // ====================== Effect principal ======================
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const storedId = (await AsyncStorage.getItem('motoristaId')) || '';
      const paramId = String(motoristaId ?? '').trim();
      const id = (paramId || storedId).trim();

      console.log(
        `🔄 useEffect -> motoristaId(param)="${paramId}" | motoristaId(storage)="${storedId}" | usando="${id}"  tipo="${tipoConsulta}"`
      );

      if (!mounted) return;

      if (id) {
        if (tipoConsulta === 'historial') {
          await cargarHistorialCompleto(id);
        } else {
          await cargarViajesMotorista(id);
        }
      } else {
        await cargarTodosLosViajes();
      }
    };

    run();

    return () => {
      mounted = false;
      abortRef.current?.abort();
    };
  }, [motoristaId, tipoConsulta]);

  // ====================== API pública del hook ======================
  const getTripById = (id) => trips.find((t) => t.id === id);

  const refrescarViajes = () => {
    console.log('🔄 Refrescando viajes…');
    const id = String(motoristaId ?? '').trim();
    if (id) {
      if (tipoConsulta === 'historial') cargarHistorialCompleto(id);
      else cargarViajesMotorista(id);
    } else {
      cargarTodosLosViajes();
    }
  };

  const getViajesHoy = () => trips.filter((t) => t.fecha === 'Hoy');

  const getEstadisticas = () => {
    const total = trips.length;
    const hoy = getViajesHoy().length;
    const pendientes = trips.filter((t) => ['programado', 'pendiente'].includes(t.estado)).length;
    const completados = trips.filter((t) => ['completado', 'finalizado'].includes(t.estado)).length;
    return { total, hoy, pendientes, completados };
  };

  return {
    trips,
    loading,
    error,
    totalTrips,
    proximosDestinos,
    historialViajes,
    viajesPorDia,
    estadisticas,
    getTripById,
    setTrips,
    refrescarViajes,
    cargarViajesMotorista,
    cargarTodosLosViajes,
    cargarHistorialCompleto,
    getViajesHoy,
    getEstadisticas,
  };
};
