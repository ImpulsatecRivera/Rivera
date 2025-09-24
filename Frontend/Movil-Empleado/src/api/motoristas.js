// src/api/motoristas.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ========= Base URL robusta =========
   - Quita barras finales
   - Si el env termina en /api, lo remueve
   - Siempre termina como https://.../api
*/
const RAW_BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');
const CLEAN_BASE = RAW_BASE.replace(/\/api$/i, '');
const API_BASE_URL =
  (CLEAN_BASE || 'https://riveraproject-production.up.railway.app') + '/api';

/** Une paths evitando // pero respetando el protocolo */
export const buildUrl = (path = '') =>
  `${API_BASE_URL}${path}`.replace(/(?<!:)\/{2,}/g, '/');

/** Lee token desde storage (acepta varios nombres) */
export const getToken = async () => {
  try {
    return (
      (await AsyncStorage.getItem('userToken')) ||
      (await AsyncStorage.getItem('authToken')) ||
      (await AsyncStorage.getItem('token')) ||
      null
    );
  } catch {
    return null;
  }
};

/** Fetch wrapper con Authorization condicional y parse robusto */
const request = async (path, { method = 'GET', signal } = {}) => {
  const url = buildUrl(path);
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token && !/^temp(-register)?-token$/.test(token)
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };

  const res = await fetch(url, { method, headers, signal });

  // 204 No Content
  if (res.status === 204) return { status: res.status, url, raw: null, payload: null };

  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${body}`);
  }

  let raw;
  try {
    raw = await res.json();
  } catch {
    // Si el servidor no envió JSON válido
    raw = null;
  }

  const payload = raw && raw.success && raw.data ? raw.data : raw;
  return { status: res.status, url, raw, payload };
};

/* ===========================
   ENDPOINTS /motoristas
   =========================== */

/** Perfil / motorista por ID (opcional, útil para debug) */
export const getMotoristaById = (motoristaId, signal) =>
  request(`/motoristas/${encodeURIComponent(motoristaId)}`, { signal });

/** Historial completo de un motorista */
export const getHistorialMotorista = (motoristaId, signal) =>
  request(`/motoristas/${encodeURIComponent(motoristaId)}/historial-completo`, { signal });

/** Viajes programados/próximos de un motorista */
export const getViajesProgramadosMotorista = (motoristaId, signal) =>
  request(`/motoristas/${encodeURIComponent(motoristaId)}/viajes-programados`, { signal });

/** Admin: próximos de todos los motoristas */
export const getAdminViajesProgramados = (signal) =>
  request(`/motoristas/viajes-programados/todos`, { signal });

/* ===========================
   FALLBACKS /viajes (backend legacy)
   =========================== */

export const getHistorialMotoristaFallback = (motoristaId, signal) =>
  request(`/viajes/conductor/${encodeURIComponent(motoristaId)}?scope=historial`, { signal });

export const getViajesProgramadosMotoristaFallback = (motoristaId, signal) =>
  request(`/viajes/conductor/${encodeURIComponent(motoristaId)}?scope=proximos`, { signal });

export const getAdminViajesProgramadosFallback = (signal) =>
  request(`/viajes?scope=proximos`, { signal });

export default {
  buildUrl,
  getToken,
  getMotoristaById,
  getHistorialMotorista,
  getViajesProgramadosMotorista,
  getAdminViajesProgramados,
  getHistorialMotoristaFallback,
  getViajesProgramadosMotoristaFallback,
  getAdminViajesProgramadosFallback,
};
