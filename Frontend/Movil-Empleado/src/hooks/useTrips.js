// src/hooks/useTrips.js
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ====================== Base URL ====================== */
/** Acepta EXPO_PUBLIC_API_URL con o sin /api al final. */
const RAW_BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');
const CLEAN_BASE = RAW_BASE.replace(/\/api$/i, '');
const API_BASE_URL =
  (CLEAN_BASE || 'https://riveraproject-production.up.railway.app') + '/api';

/* ====================== Utilidades de formato ====================== */
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
    case 'pendiente':  return '#FF9800';
    case 'confirmado': return '#2196F3';
    case 'en_transito':
    case 'en curso':
    case 'en_curso':   return '#9C27B0';
    case 'completado':
    case 'finalizado': return '#8BC34A';
    case 'cancelado':  return '#F44336';
    default:           return '#757575';
  }
};

/* ====================== Normalización / helpers ====================== */
const normalizarEstado = (estado) => {
  const e = (estado?.actual ?? estado ?? '').toString().toLowerCase();
  if (e === 'en_curso') return 'en_transito';
  return e || 'programado';
};

const pickFechaSalida = (raw) =>
  raw?.fechaSalida ??
  raw?.fecha ??
  raw?.createdAt ??
  raw?.departureTime ??
  raw?.salida ??
  raw?.horarios?.fechaSalida ??
  null;

const pickFechaLlegada = (raw) =>
  raw?.fechaLlegada ??
  raw?.arrivalTime ??
  raw?.llegada ??
  raw?.horarios?.fechaLlegadaEstimada ??
  null;

const transformarViajeAPI = (raw, camionGlobal = null) => {
  if (!raw) return null;

  const id = (
    raw._id ||
    raw.id ||
    raw.folio ||
    raw.codigo ||
    `${pickFechaSalida(raw) || Date.now()}-${Math.random()}`
  )?.toString();

  const fechaSalida = pickFechaSalida(raw);
  const fechaLlegada = pickFechaLlegada(raw);

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
    carga: raw.carga || raw.tipoCarga,
    _fechaSalidaISO: fechaSalida,
    _fechaLlegadaISO: fechaLlegada,
    raw,
  };
};

const getPayload = (data) =>
  data && data.success && data.data ? data.data : data;

/** Recolecta viajes desde todas las variantes posibles del backend */
const collectAllTripsFromPayload = (data) => {
  const payload = getPayload(data) || {};
  const all = [];

  // 1) Listas planas conocidas
  const flat =
    payload.historialCompleto ||
    payload.trips ||
    payload.viajes ||
    payload.items ||
    payload.result ||
    payload.viajesProgramados || // posible nombre
    payload.data?.trips ||
    payload.data?.viajes ||
    [];
  if (Array.isArray(flat)) all.push(...flat);

  // 2) Agrupado por MES
  (payload.historialPorMes || []).forEach((mes) => {
    if (Array.isArray(mes?.items)) all.push(...mes.items);
    if (Array.isArray(mes?.viajes)) all.push(...mes.viajes);
  });

  // 3) Agrupado por DÍA
  (payload.viajesPorDia || []).forEach((dia) => {
    if (Array.isArray(dia?.items)) all.push(...dia.items);
    if (Array.isArray(dia?.viajes)) all.push(...dia.viajes);
    if (Array.isArray(dia?.motoristasConViajes)) {
      dia.motoristasConViajes.forEach((mc) => {
        if (Array.isArray(mc?.viajes)) {
          mc.viajes.forEach((v) =>
            all.push({ ...v, camion: mc?.camion, motorista: mc?.motorista })
          );
        }
      });
    }
  });

  // 4) Motoristas con viajes a nivel raíz
  (payload.motoristasConViajes || []).forEach((m) => {
    if (Array.isArray(m?.viajes)) {
      m.viajes.forEach((v) =>
        all.push({ ...v, camion: v?.camion || m?.camion, motorista: m?.motorista })
      );
    }
  });

  // 5) Variante anidada en payload.data
  if (payload.data) {
    (payload.data.viajesPorDia || []).forEach((dia) => {
      if (Array.isArray(dia?.viajes)) all.push(...dia.viajes);
      if (Array.isArray(dia?.items)) all.push(...dia.items);
    });
    if (Array.isArray(payload.data?.historialCompleto)) {
      all.push(...payload.data.historialCompleto);
    }
  }

  return all;
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

/* ====================== Hook principal ====================== */
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
      const payload = getPayload(data) || {};
      console.log(
        '✅ JSON OK',
        Array.isArray(payload) ? ['<array>'] : Object.keys(payload)
      );

      if (payload?.historialCompleto)
        console.log('ℹ️ historialCompleto len:', Array.isArray(payload.historialCompleto) ? payload.historialCompleto.length : 'no-array');
      if (payload?.viajesPorDia)
        console.log('ℹ️ viajesPorDia len:', Array.isArray(payload.viajesPorDia) ? payload.viajesPorDia.length : 'no-array');
      if (Array.isArray(payload?.viajes))
        console.log('ℹ️ viajes (plano) len:', payload.viajes.length);

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

  /* ====================== Fallbacks ====================== */
  const cargarProximosFallback = async (id) => {
    try {
      const url = `${API_BASE_URL}/viajes/conductor/${encodeURIComponent(id)}?scope=proximos`;
      const data = await hacerPeticion(url);
      if (!data) return [];
      const payload = getPayload(data) || {};
      const rawTrips = collectAllTripsFromPayload(data);
      const todos = rawTrips
        .map((v) => transformarViajeAPI(v, payload?.camionAsignado))
        .filter(Boolean);
      console.log('🛟 Fallback proximos ->', todos.length);
      return todos;
    } catch (e) {
      console.log('⚠️ Fallback proximos falló:', e.message);
      return [];
    }
  };

  const cargarHistorialFallback = async (id) => {
    try {
      const url = `${API_BASE_URL}/viajes/conductor/${encodeURIComponent(id)}?scope=historial`;
      const data = await hacerPeticion(url);
      if (!data) return [];
      const payload = getPayload(data) || {};
      const rawTrips = collectAllTripsFromPayload(data);
      const todos = rawTrips
        .map((v) => transformarViajeAPI(v, payload?.camionAsignado))
        .filter(Boolean);
      console.log('🛟 Fallback historial ->', todos.length);
      return todos;
    } catch (e) {
      console.log('⚠️ Fallback historial falló:', e.message);
      return [];
    }
  };

  /* ====================== Cargadores ====================== */
  const cargarHistorialCompleto = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const safeId = encodeURIComponent(id);
      const url = `${API_BASE_URL}/motoristas/${safeId}/historial-completo`;
      const data = await hacerPeticion(url);
      if (!data) return;

      const payload = getPayload(data) || {};
      const rawTrips = collectAllTripsFromPayload(data);

      let todos = rawTrips
        .map((v) => transformarViajeAPI(v, payload?.camionAsignado))
        .filter(Boolean);

      // ⛑️ Fallback si vino vacío
      if (todos.length === 0) {
        const fb = await cargarHistorialFallback(id);
        if (fb.length) todos = fb;
      }

      console.log('🧾 Viajes transformados (historial):', todos.length);

      setTrips(todos);
      setViajesPorDia(payload?.viajesPorDia || []);
      setProximosDestinos([]);
      setTotalTrips(getTotalViajes(data, todos));
      setEstadisticas(
        payload?.estadisticas || {
          programados: todos.filter((x) =>
            ['programado', 'pendiente', 'confirmado'].includes(x.estado)
          ).length,
          completados: todos.filter((x) =>
            ['completado', 'finalizado'].includes(x.estado)
          ).length,
          cancelados: todos.filter((x) => x.estado === 'cancelado').length,
          enProgreso: todos.filter((x) =>
            ['en_transito', 'iniciado', 'en_curso'].includes(x.estado)
          ).length,
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

      const payload = getPayload(data) || {};
      const rawTrips = collectAllTripsFromPayload(data);

      let todos = rawTrips
        .map((v) => transformarViajeAPI(v, payload?.camionAsignado))
        .filter(Boolean);

      // ⛑️ Fallback si vino vacío
      if (todos.length === 0) {
        const fb = await cargarProximosFallback(id);
        if (fb.length) todos = fb;
      }

      // Próximos 3 por fecha de salida
      const ordenados = [...todos].sort((a, b) => {
        const ta = new Date(a._fechaSalidaISO || 0).getTime();
        const tb = new Date(b._fechaSalidaISO || 0).getTime();
        return ta - tb;
      });
      const prox = ordenados.slice(0, 3).map((t) => ({
        id: t.id,
        tipo: `${t.origen} → ${t.destino}`,
        fecha: t.fecha,
        hora: t.hora,
      }));

      console.log('🧾 Viajes transformados (proximos):', todos.length);

      setTrips(todos);
      setViajesPorDia(payload?.viajesPorDia || []);
      setProximosDestinos(prox);
      setTotalTrips(getTotalViajes(data, todos));
      setHistorialViajes(todos.slice(-5));
      if (payload?.estadisticas) setEstadisticas(payload.estadisticas);
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

      const payload = getPayload(data) || {};
      const rawTrips = collectAllTripsFromPayload(data);

      const todos = rawTrips
        .map((v) => transformarViajeAPI(v, v?.camion || payload?.camionAsignado))
        .filter(Boolean);

      setTrips(todos);
      setViajesPorDia(payload?.viajesPorDia || []);
      setProximosDestinos([]);
      setTotalTrips(getTotalViajes(data, todos));
      if (payload?.estadisticas) setEstadisticas(payload.estadisticas);
    } catch (e) {
      setError(`Error de conexión: ${e.message}`);
      setTrips([]);
      setViajesPorDia([]);
      setProximosDestinos([]);
      setTotalTrips(0);
    } finally {
      setLoading(false);
    }
  };

  /* ====================== Effect principal ====================== */
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

  /* ====================== API pública del hook ====================== */
  const getTripById = (id) => trips.find((t) => t.id === id);

  const refrescarViajes = async () => {
    console.log('🔄 Refrescando viajes…');
    const storedId = (await AsyncStorage.getItem('motoristaId')) || '';
    const paramId = String(motoristaId ?? '').trim();
    const id = (paramId || storedId).trim();

    if (id) {
      if (tipoConsulta === 'historial') await cargarHistorialCompleto(id);
      else await cargarViajesMotorista(id);
    } else {
      await cargarTodosLosViajes();
    }
  };

  const getViajesHoy = () => trips.filter((t) => t.fecha === 'Hoy');

  const getEstadisticas = () => {
    const total = trips.length;
    const hoy = getViajesHoy().length;
    const pendientes = trips.filter((t) =>
      ['programado', 'pendiente'].includes(t.estado)
    ).length;
    const completados = trips.filter((t) =>
      ['completado', 'finalizado'].includes(t.estado)
    ).length;
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
