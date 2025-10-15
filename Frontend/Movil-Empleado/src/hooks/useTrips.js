// src/hooks/useTrips.js
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ====================== Base URL ====================== */
const RAW_BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');
const CLEAN_BASE = RAW_BASE.replace(/\/api$/i, '');
const API_BASE_URL =
  (CLEAN_BASE || 'https://riveraproject-production-933e.up.railway.app') + '/api';

const DEBUG_TRIPS = false;

/* ====================== Utils ====================== */
const getDeep = (obj, path) =>
  path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);

const pickStr = (...vals) =>
  vals.find((v) => typeof v === 'string' && v.trim().length > 0) || null;

const isHex = (hex) =>
  typeof hex === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);

const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const f = new Date(fecha);
  const hoy = new Date();
  const manana = new Date();
  manana.setDate(hoy.getDate() + 1);
  if (f.toDateString() === hoy.toDateString()) return 'Hoy';
  if (f.toDateString() === manana.toDateString()) return 'Mañana';
  return f.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
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
  const d = String(descripcion || '').toLowerCase();
  if (d.includes('alimento') || d.includes('comida')) return '🍽️';
  if (d.includes('mobiliario') || d.includes('mueble')) return '🏠';
  if (d.includes('construcción') || d.includes('material')) return '🏗️';
  if (d.includes('combustible') || d.includes('gas')) return '⛽';
  if (d.includes('medicina') || d.includes('farmacia')) return '💊';
  return '📦';
};

const obtenerColorEstado = (estado = '') => {
  switch (String(estado).toLowerCase()) {
    case 'programado':
      return '#4CAF50';
    case 'pendiente':
      return '#FF9800';
    case 'confirmado':
      return '#2196F3';
    case 'en_transito':
    case 'en curso':
    case 'en_curso':
      return '#9C27B0';
    case 'completado':
    case 'finalizado':
      return '#8BC34A';
    case 'cancelado':
      return '#F44336';
    default:
      return '#757575';
  }
};

const normalizarEstado = (estadoIn) => {
  let raw =
    estadoIn && typeof estadoIn === 'object'
      ? estadoIn.actual ?? estadoIn.nombre ?? estadoIn.name ?? estadoIn.status ?? ''
      : estadoIn ?? '';
  raw = String(raw || '').trim().toLowerCase();
  if (['en curso', 'en_curso', 'en transito', 'en_transito'].includes(raw)) return 'en_transito';
  if (raw === 'finalizado') return 'completado';
  return raw || 'programado';
};

const pickFechaSalida = (raw) =>
  raw?.departureTime ?? raw?.fechaSalida ?? raw?.horarios?.fechaSalida ?? raw?.createdAt ?? null;

const pickFechaLlegada = (raw) =>
  raw?.arrivalTime ?? raw?.fechaLlegada ?? raw?.horarios?.fechaLlegadaEstimada ?? null;

/* ===== Preferir bloque __ui (si backend lo envía) ===== */
const fromUI = (raw) => {
  const ui = raw && raw.__ui ? raw.__ui : null;
  if (!ui) return null;

  const normHora = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    const d = new Date(v);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return {
    cliente: ui.cliente || 'Cliente no especificado',
    camion: ui.camion || 'N/A',
    descripcion: ui.descripcion || 'Sin descripción',
    asistente: ui.asistente || 'Por asignar',
    horaSalida: normHora(ui.horaSalida) || 'No especificada',
    horaLlegada: normHora(ui.horaLlegada) || 'No especificada',
    origen: ui.origen || null,
    destino: ui.destino || null,
    color: ui.color || null,
  };
};

/* ============= Resuelve información de la cotización ============= */
const resolveQuote = (raw) => {
  const q = raw?.quoteId ?? raw?.quote ?? raw?.cotizacion ?? null;
  const obj = q && typeof q === 'object' ? q : {};

  const clientName =
    pickStr(
      getDeep(obj, 'clientId.name'),
      getDeep(obj, 'clientId.nombre'),
      obj.clientName,
      obj.clienteNombre,
      getDeep(raw, 'customer.name')
    ) || null;

  const name =
    pickStr(obj.quoteName, obj.nombre, obj.name, obj.title, raw?.quoteName) || null;

  const description =
    pickStr(
      obj.quoteDescription,
      obj.descripcion,
      obj.description,
      raw?.tripDescription,
      raw?.quoteDescription,
      raw?.descripcion,
      raw?.observaciones,
      raw?.detalle,
      raw?.detalles
    ) || null;

  const origen =
    pickStr(
      getDeep(obj, 'ruta.origen.nombre'),
      obj.pickupLocation,
      getDeep(obj, 'ruta.origen'),
      raw?.pickupLocation,
      raw?.origenNombre,
      raw?.origen
    ) || null;

  const destino =
    pickStr(
      getDeep(obj, 'ruta.destino.nombre'),
      obj.destinationLocation,
      getDeep(obj, 'ruta.destino'),
      raw?.destinationLocation,
      raw?.destinoNombre,
      raw?.destino
    ) || null;

  return {
    clientName,
    name,
    description,
    origen,
    destino,
    id: typeof q === 'string' ? q : obj?._id || obj?.id || null,
  };
};

/* ======= EXPANSIÓN DE REFERENCIAS CUANDO SON STRINGS (IDs) ======= */
const getPayload = (data) => (data && data.success && data.data ? data.data : data);

const tryFetchFirst = async (hacerPeticion, candidates) => {
  for (const url of candidates) {
    try {
      const data = await hacerPeticion(url);
      if (data) return getPayload(data);
    } catch (_) {}
  }
  return null;
};

const expandTripRefs = async (hacerPeticion, raw) => {
  if (!raw || typeof raw !== 'object') return raw;
  const enriched = { ...raw };

  // Quote
  if (typeof enriched.quoteId === 'string') {
    const q = await tryFetchFirst(hacerPeticion, [
      `${API_BASE_URL}/cotizaciones/${encodeURIComponent(enriched.quoteId)}`,
      `${API_BASE_URL}/quotes/${encodeURIComponent(enriched.quoteId)}`,
      `${API_BASE_URL}/quote/${encodeURIComponent(enriched.quoteId)}`,
    ]);
    if (q && typeof q === 'object') enriched.quoteId = q;
  }

  // Truck
  if (typeof enriched.truckId === 'string') {
    const t = await tryFetchFirst(hacerPeticion, [
      `${API_BASE_URL}/camiones/${encodeURIComponent(enriched.truckId)}`,
      `${API_BASE_URL}/trucks/${encodeURIComponent(enriched.truckId)}`,
      `${API_BASE_URL}/truck/${encodeURIComponent(enriched.truckId)}`,
    ]);
    if (t && typeof t === 'object') enriched.truckId = t;
  }

  // Conductor
  if (typeof enriched.conductorId === 'string') {
    const d = await tryFetchFirst(hacerPeticion, [
      `${API_BASE_URL}/motoristas/${encodeURIComponent(enriched.conductorId)}`,
      `${API_BASE_URL}/drivers/${encodeURIComponent(enriched.conductorId)}`,
      `${API_BASE_URL}/usuarios/${encodeURIComponent(enriched.conductorId)}`,
    ]);
    if (d && typeof d === 'object') enriched.conductorId = d;
  }

  return enriched;
};

/* ============= Normalizador de cada viaje ============= */
const transformarViajeAPI = (raw) => {
  if (!raw) return null;

  const ui = fromUI(raw);

  const id =
    (raw._id || raw.id || `${pickFechaSalida(raw) || Date.now()}-${Math.random()}`)?.toString();

  const fechaSalida = pickFechaSalida(raw);
  const fechaLlegada = pickFechaLlegada(raw);
  const estado = normalizarEstado(raw.estado ?? raw.estadoActual);

  const q = resolveQuote(raw);

  const descripcion =
    ui?.descripcion || pickStr(raw.tripDescription, raw.descripcion, q.description) || '';

  const origen = ui?.origen || pickStr(q.origen, raw.origen, raw.pickupLocation) || '';
  const destino = ui?.destino || pickStr(q.destino, raw.destino, raw.destinationLocation) || '';

  const cliente =
    ui?.cliente ||
    pickStr(
      q.clientName,
      getDeep(raw, 'quoteId.clientId.name'),
      getDeep(raw, 'quoteId.clientId.nombre'),
      getDeep(raw, 'cotizacion.clientId.name'),
      getDeep(raw, 'cotizacion.clientId.nombre'),
      q.name
    ) || 'Cliente no especificado';

  const truckPlate =
    pickStr(
      getDeep(raw, 'truckId.licensePlate'),
      getDeep(raw, 'truckId.placa'),
      raw.placa,
      raw.unidad,
      raw.camion
    ) || null;

  const truckBrand = pickStr(getDeep(raw, 'truckId.brand'), getDeep(raw, 'truckId.marca'));
  const truckModel = pickStr(getDeep(raw, 'truckId.model'), getDeep(raw, 'truckId.modelo'));
  const truckName  = pickStr(getDeep(raw, 'truckId.name'),  getDeep(raw, 'truckId.nombre'));

  let camion = ui?.camion || 'N/A';
  if (!ui) {
    if (truckBrand || truckModel) {
      camion = `${truckBrand || ''} ${truckModel || ''}`.trim();
      if (truckPlate) camion += ` (${truckPlate})`;
    } else if (truckName) {
      camion = truckPlate ? `${truckName} (${truckPlate})` : truckName;
    } else if (truckPlate) {
      camion = truckPlate;
    }
  }

  const conductorNombre =
    pickStr(
      getDeep(raw, 'conductorId.name'),
      getDeep(raw, 'conductorId.nombre'),
      raw.driverName,
      raw.conductor
    ) || null;

  const asistente =
    ui?.asistente ||
    pickStr(
      getDeep(raw, 'asistente.nombre'),
      raw.asistente,
      raw.ayudante,
      raw.helper,
      conductorNombre
    ) || 'Por asignar';

  const color =
    (ui?.color && isHex(ui.color) && ui.color) ||
    (isHex(raw?.color) && raw.color) ||
    obtenerColorEstado(estado);

  const tipo =
    pickStr(q.name, raw?.tipo) || 'Transporte de carga';

  const out = {
    id,
    tipo,
    subtitulo: `${origen}${origen && destino ? ' → ' : ''}${destino}`,
    fecha: formatearFecha(fechaSalida),
    hora: formatearHora(fechaSalida),

    cotizacion: cliente,
    camion,
    descripcion: descripcion || 'Sin descripción',
    horaLlegada: ui?.horaLlegada || formatearHora(fechaLlegada) || 'No especificada',
    horaSalida: ui?.horaSalida || formatearHora(fechaSalida) || 'No especificada',
    asistente,

    icon: obtenerIconoViaje(descripcion),
    color,
    // asegurar string:
    estado: typeof estado === 'object'
      ? (estado.actual ?? estado.nombre ?? estado.status ?? 'programado')
      : estado,

    origen,
    destino,
    _fechaSalidaISO: fechaSalida,
    _fechaLlegadaISO: fechaLlegada,

    // ⚠️ conservar raw y exponer IDs para la pantalla de detalle
    raw,
    quoteId: raw?.quoteId ?? null,
    truckId: raw?.truckId ?? null,
    conductorId: raw?.conductorId ?? null,
  };

  if (DEBUG_TRIPS) {
    // eslint-disable-next-line no-console
    console.log('🧩 viaje normalizado:', out, '\nRAW:', raw);
  }

  return out;
};

/* ====================== helpers payload ====================== */
const collectAllTripsFromPayload = (data) => {
  const payload = getPayload(data) || {};
  const all = [];

  const flat =
    payload.historialCompleto ||
    payload.viajes ||
    payload.trips ||
    payload.items ||
    payload.result ||
    payload.viajesProgramados ||
    (payload.data && payload.data.viajes) ||
    (payload.data && payload.data.trips) ||
    [];

  if (Array.isArray(flat)) all.push(...flat);

  (payload.viajesPorDia || []).forEach((dia) => {
    if (Array.isArray(dia?.viajes)) all.push(...dia.viajes);
    if (Array.isArray(dia?.items)) all.push(...dia.items);
  });

  return all;
};

const getTotalViajes = (data, lista) => {
  const payload = getPayload(data);
  return Number(
    payload?.total ?? payload?.totalViajes ?? payload?.count ?? (Array.isArray(lista) ? lista.length : 0)
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
      return (
        (await AsyncStorage.getItem('userToken')) ||
        (await AsyncStorage.getItem('authToken')) ||
        (await AsyncStorage.getItem('token'))
      );
    } catch {
      return null;
    }
  };

  // Petición "principal" (cancela la anterior)
  const hacerPeticion = async (url) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const token = await obtenerToken();
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token && !/^temp(-register)?-token$/.test(token) ? { Authorization: `Bearer ${token}` } : {}),
      };
      const resp = await fetch(url, { headers, signal: controller.signal });
      if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      return await resp.json();
    } catch (e) {
      if (e.name === 'AbortError') return null;
      throw e;
    }
  };

  // Petición "interna" para expandir refs (NO cancela otras)
  const hacerPeticionNoAbort = async (url) => {
    const controller = new AbortController();
    try {
      const token = await obtenerToken();
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token && !/^temp(-register)?-token$/.test(token) ? { Authorization: `Bearer ${token}` } : {}),
      };
      const resp = await fetch(url, { headers, signal: controller.signal });
      if (!resp.ok) return null;
      return await resp.json();
    } catch {
      return null;
    }
  };

  const cargarProximosFallback = async (id) => {
    try {
      const url = `${API_BASE_URL}/viajes/conductor/${encodeURIComponent(id)}?scope=proximos`;
      const data = await hacerPeticion(url);
      if (!data) return [];
      const rawTrips = collectAllTripsFromPayload(data);
      const enriched = await Promise.all(rawTrips.map((v) => expandTripRefs(hacerPeticionNoAbort, v)));
      return enriched.map((v) => transformarViajeAPI(v)).filter(Boolean);
    } catch {
      return [];
    }
  };

  const cargarHistorialFallback = async (id) => {
    try {
      const url = `${API_BASE_URL}/viajes/conductor/${encodeURIComponent(id)}?scope=historial`;
      const data = await hacerPeticion(url);
      if (!data) return [];
      const rawTrips = collectAllTripsFromPayload(data);
      const enriched = await Promise.all(rawTrips.map((v) => expandTripRefs(hacerPeticionNoAbort, v)));
      return enriched.map((v) => transformarViajeAPI(v)).filter(Boolean);
    } catch {
      return [];
    }
  };

  const cargarHistorialCompleto = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/motoristas/${encodeURIComponent(id)}/historial-completo`;
      const data = await hacerPeticion(url);
      if (!data) return;

      const payload = getPayload(data) || {};
      const rawTrips = collectAllTripsFromPayload(data);

      const enriched = await Promise.all(rawTrips.map((v) => expandTripRefs(hacerPeticionNoAbort, v)));
      let todos = enriched.map((v) => transformarViajeAPI(v)).filter(Boolean);
      if (todos.length === 0) {
        const fb = await cargarHistorialFallback(id);
        if (fb.length) todos = fb;
      }

      if (DEBUG_TRIPS && todos[0]) console.log('NORMALIZADO:', todos[0], '\nRAW:', todos[0].raw);

      setTrips(todos);
      setViajesPorDia(payload?.viajesPorDia || []);
      setProximosDestinos([]);
      setTotalTrips(getTotalViajes(data, todos));
      setEstadisticas(
        payload?.estadisticas || {
          programados: todos.filter((x) => ['programado', 'pendiente', 'confirmado'].includes(x.estado)).length,
          completados: todos.filter((x) => ['completado', 'finalizado'].includes(x.estado)).length,
          cancelados: todos.filter((x) => x.estado === 'cancelado').length,
          enProgreso: todos.filter((x) => ['en_transito', 'en_curso'].includes(x.estado)).length,
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

      const url = `${API_BASE_URL}/motoristas/${encodeURIComponent(id)}/viajes-programados`;
      const data = await hacerPeticion(url);
      if (!data) return;

      const payload = getPayload(data) || {};
      const rawTrips = collectAllTripsFromPayload(data);

      const enriched = await Promise.all(rawTrips.map((v) => expandTripRefs(hacerPeticionNoAbort, v)));
      let todos = enriched.map((v) => transformarViajeAPI(v)).filter(Boolean);
      if (todos.length === 0) {
        const fb = await cargarProximosFallback(id);
        if (fb.length) todos = fb;
      }

      const ordenados = [...todos].sort(
        (a, b) => new Date(a._fechaSalidaISO || 0) - new Date(b._fechaSalidaISO || 0)
      );
      const prox = ordenados.slice(0, 3).map((t) => ({
        id: t.id,
        tipo: `${t.origen} → ${t.destino}`,
        fecha: t.fecha,
        hora: t.hora,
      }));

      if (DEBUG_TRIPS && todos[0]) console.log('NORMALIZADO:', todos[0], '\nRAW:', todos[0].raw);

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

      const enriched = await Promise.all(rawTrips.map((v) => expandTripRefs(hacerPeticionNoAbort, v)));
      const todos = enriched.map((v) => transformarViajeAPI(v)).filter(Boolean);

      if (DEBUG_TRIPS && todos[0]) console.log('NORMALIZADO:', todos[0], '\nRAW:', todos[0].raw);

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

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const storedId = (await AsyncStorage.getItem('motoristaId')) || '';
      const paramId = String(motoristaId ?? '').trim();
      const id = (paramId || storedId).trim();
      if (!mounted) return;
      if (id) {
        if (tipoConsulta === 'historial') await cargarHistorialCompleto(id);
        else await cargarViajesMotorista(id);
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

  const getTripById = (id) => trips.find((t) => t.id === id);

  const refrescarViajes = async () => {
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
