// src/hooks/useProfile.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../Context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL compatible con EXPO_PUBLIC_API_URL (con o sin /api)
const RAW = (process.env.EXPO_PUBLIC_API_URL || 'https://riveraproject-production-933e.up.railway.app').replace(/\/+$/, '');
const CLEAN = RAW.replace(/\/api$/i, '');
const API_BASE = `${CLEAN}/api`;

export const useProfile = () => {
  const { user, token, logout: authLogout } = useAuth();

  const [profile, setProfile] = useState({
    id: null,
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    tarjeta: '',
    cargo: 'Motorista',
    camion: 'Sin asignar',
    camionInfo: null,
    img: undefined,
  });
  const [loading, setLoading] = useState(true);

  // 👉 Control para cancelar peticiones previas
  const abortRef = useRef(null);
  const abortPrev = () => { if (abortRef.current) abortRef.current.abort(); };

  const obtenerMotoristaId = useCallback(async () => {
    try {
      let motoristaId = await AsyncStorage.getItem('motoristaId');
      if (motoristaId) return motoristaId;
      if (user?._id) { await AsyncStorage.setItem('motoristaId', String(user._id)); return String(user._id); }
      if (user?.id)  { await AsyncStorage.setItem('motoristaId', String(user.id));  return String(user.id);  }
      return null;
    } catch (e) {
      console.error('❌ Error al obtener motorista ID:', e);
      return null;
    }
  }, [user]);

  const mapServidorAEstado = useCallback((m, fallbackId) => {
    const finalId = m?._id || m?.id || fallbackId;
    return {
      id: finalId,
      nombre: `${m?.name || ''} ${m?.lastName || ''}`.trim(),
      email: m?.email || '',
      telefono: m?.phone || '',
      direccion: m?.address || '',
      fechaNacimiento: m?.birthDate ? new Date(m.birthDate).toLocaleDateString('es-ES') : '',
      tarjeta: m?.circulationCard || '',
      cargo: 'Motorista',
      camion: m?.camionAsignado
        ? `${m.camionAsignado.name || m.camionAsignado.alias || 'Camión'} - ${(m.camionAsignado.licensePlate || m.camionAsignado.placa || '').trim()}`
        : 'Sin asignar',
      camionInfo: m?.camionAsignado || null,
      img: m?.img,
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const motoristaId = await obtenerMotoristaId();
      if (!motoristaId) throw new Error('No se encontró ID de motorista');

      const authToken =
        (await AsyncStorage.getItem('authToken')) ||
        (await AsyncStorage.getItem('userToken')) ||
        token;

      abortPrev();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`${API_BASE}/motoristas/${motoristaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        // Fallback con datos del contexto
        if (user) {
          setProfile((prev) => ({
            ...prev,
            id: motoristaId,
            nombre: `${user.nombre || user.name || ''} ${user.apellido || user.lastName || ''}`.trim(),
            email: user.email || '',
            telefono: user.phone || '',
            direccion: user.address || '',
            fechaNacimiento: user.birthDate ? new Date(user.birthDate).toLocaleDateString('es-ES') : '',
            tarjeta: user.circulationCard || '',
            camion: 'Sin conexión al servidor',
            camionInfo: null,
            img: user.img,
          }));
          return;
        }
        throw new Error(`Error ${res.status}`);
      }

      const raw = await res.json().catch(() => null);
      const payload = raw && raw.success && raw.data ? raw.data : raw;
      const m = Array.isArray(payload) ? payload[0] : payload;
      if (!m || typeof m !== 'object') throw new Error('Respuesta de perfil inesperada');

      const next = mapServidorAEstado(m, motoristaId);
      setProfile(next);

      if (String(next.id) !== String(motoristaId)) {
        await AsyncStorage.setItem('motoristaId', String(next.id));
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.error('❌ Error al cargar perfil:', error.message);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, obtenerMotoristaId, token, user, mapServidorAEstado]);

  // ===== Helper: mapa app -> API y normaliza fecha =====
  const toApiBody = (partial) => {
    // nombre completo -> name + lastName (si procede)
    const full = (partial?.nombre || '').trim();
    const [firstName, ...rest] = full.split(/\s+/);

    // Normaliza fecha a ISO si viene como dd/mm/aaaa o yyyy-mm-dd
    const normalizeBirthDate = (s) => {
      if (!s) return undefined;
      const t = s.trim();
      // dd/mm/aaaa -> aaaa-mm-ddT00:00:00Z
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(t)) {
        const [dd, mm, yyyy] = t.split('/');
        return new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`).toISOString();
      }
      // yyyy-mm-dd -> yyyy-mm-ddT00:00:00Z
      if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
        return new Date(`${t}T00:00:00Z`).toISOString();
      }
      // cualquier otro formato: déjalo pasar, o conviértelo si tu backend lo tolera
      return t;
    };

    const body = {
      name: firstName || undefined,
      lastName: rest.length ? rest.join(' ') : undefined,
      phone: partial?.telefono || undefined,
      address: partial?.direccion || undefined,
      birthDate: normalizeBirthDate(partial?.fechaNacimiento),
      circulationCard: partial?.tarjeta || undefined,
      // email normalmente no se edita aquí; si tu API permite, añade:
      // email: partial?.email || undefined,
    };

    // Limpia undefined para no sobreescribir con vacío
    Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);
    return body;
  };

  // 👉 guardar cambios (PUT/PATCH según tu backend) + refetch
  const saveProfile = useCallback(async (partial) => {
    if (!profile.id) throw new Error('No hay ID de perfil para actualizar');
    setLoading(true);
    try {
      const authToken =
        (await AsyncStorage.getItem('authToken')) ||
        (await AsyncStorage.getItem('userToken')) ||
        token;

      // Mapea campos de la app a los esperados por la API
      const apiBody = toApiBody(partial);

      const res = await fetch(`${API_BASE}/motoristas/${profile.id}`, {
        method: 'PUT', // cambia a 'PATCH' si tu API así lo define
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        body: JSON.stringify(apiBody),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => '');
        throw new Error(err || `HTTP ${res.status}`);
      }

      // ✅ Releer del servidor para mostrar lo recién guardado
      await fetchProfile();
      return true;
    } finally {
      setLoading(false);
    }
  }, [API_BASE, profile.id, token, fetchProfile]);

  // 👉 cambiar avatar (puedes no usarlo si la foto es fija)
  const changeAvatar = useCallback(async (imageAsset) => {
    if (!profile.id) throw new Error('No hay ID de perfil para actualizar avatar');
    setLoading(true);
    try {
      const authToken =
        (await AsyncStorage.getItem('authToken')) ||
        (await AsyncStorage.getItem('userToken')) ||
        token;

      const form = new FormData();
      form.append('img', {
        uri: imageAsset.uri,
        name: imageAsset.fileName || 'avatar.jpg',
        type: imageAsset.mimeType || 'image/jpeg',
      });

      const res = await fetch(`${API_BASE}/motoristas/${profile.id}/avatar`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
          // NO pongas Content-Type; RN lo arma con boundary
        },
        body: form,
      });

      if (!res.ok) {
        const err = await res.text().catch(() => '');
        throw new Error(err || `HTTP ${res.status}`);
      }

      await fetchProfile();
      return true;
    } finally {
      setLoading(false);
    }
  }, [API_BASE, profile.id, token, fetchProfile]);

  const logout = async () => {
    try {
      const success = await authLogout();
      if (success) {
        await AsyncStorage.multiRemove(['motoristaId', 'authToken', 'userToken', 'token']);
        setProfile({
          id: null, nombre: '', email: '', telefono: '', direccion: '',
          fechaNacimiento: '', tarjeta: '', cargo: 'Motorista',
          camion: 'Sin asignar', camionInfo: null, img: undefined,
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  useEffect(() => {
    // cancela la petición anterior si cambia user/token o se desmonta
    abortPrev();
    if (user || token) fetchProfile(); else setLoading(false);
    return () => abortPrev();
  }, [user, token, fetchProfile]);

  return { profile, loading, fetchProfile, saveProfile, changeAvatar, logout };
};
