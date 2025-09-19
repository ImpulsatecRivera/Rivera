// src/api/viajes.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL desde .env de Expo (fallback a tu Render)
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ||
  'https://riveraproject-5.onrender.com/api';

const buildUrl = (path) => `${API_BASE_URL}${path}`.replace(/(?<!:)\/{2,}/g, '/');

const getToken = async () => {
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

const request = async (path, { signal } = {}) => {
  const url = buildUrl(path);
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token && !/^temp(-register)?-token$/.test(token)) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers, signal });
  const status = res.status;
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${status} ${res.statusText} :: ${text}`);
  }
  const data = await res.json();
  return { data, url, status };
};

/* ============================
   Endpoints PRINCIPALES: /motoristas
   ============================ */

// Historial completo del motorista
export const getHistorial = (motoristaId, signal) =>
  request(`/motoristas/${motoristaId}/historial-completo`, { signal });

// Próximos/Programados del motorista
export const getProximos = (motoristaId, signal) =>
  request(`/motoristas/${motoristaId}/viajes-programados`, { signal });

// Admin: próximos de todos los motoristas
export const getAdminProximos = (signal) =>
  request(`/motoristas/viajes-programados/todos`, { signal });

/* ============================
   Fallbacks: /viajes (por si el backend expone estos)
   ============================ */

// Fallback historial por /viajes
export const getHistorialFallback = (motoristaId, signal) =>
  request(`/viajes/conductor/${motoristaId}?scope=historial`, { signal });

// Fallback próximos por /viajes
export const getProximosFallback = (motoristaId, signal) =>
  request(`/viajes/conductor/${motoristaId}?scope=proximos`, { signal });

// Fallback admin por /viajes
export const getAdminFallback = (signal) =>
  request(`/viajes?scope=proximos`, { signal });
