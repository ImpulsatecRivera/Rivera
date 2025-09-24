// src/hooks/useProfile.js
import { useState, useEffect } from 'react';
import { useAuth } from '../Context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL compatible con EXPO_PUBLIC_API_URL (con o sin /api)
const RAW = (process.env.EXPO_PUBLIC_API_URL || 'https://riveraproject-production.up.railway.app').replace(/\/+$/, '');
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

  const obtenerMotoristaId = async () => {
    try {
      let motoristaId = await AsyncStorage.getItem('motoristaId');
      if (motoristaId) {
        console.log('🆔 ID en AsyncStorage:', motoristaId);
        return motoristaId;
      }
      if (user?._id) {
        await AsyncStorage.setItem('motoristaId', String(user._id));
        return String(user._id);
      }
      if (user?.id) {
        await AsyncStorage.setItem('motoristaId', String(user.id));
        return String(user.id);
      }
      console.log('❌ No se encontró ID de motorista');
      return null;
    } catch (error) {
      console.error('❌ Error al obtener motorista ID:', error);
      return null;
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const motoristaId = await obtenerMotoristaId();
      if (!motoristaId) throw new Error('No se encontró ID de motorista');

      const authToken =
        (await AsyncStorage.getItem('authToken')) ||
        (await AsyncStorage.getItem('userToken')) ||
        token;

      console.log('🌐 Perfil ->', `${API_BASE}/motoristas/${motoristaId}`);
      const res = await fetch(`${API_BASE}/motoristas/${motoristaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
      });

      console.log('📡 Profile status:', res.status);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.log('❌ Profile error body:', errText);
        if (user) {
          // fallback con datos del contexto
          setProfile((prev) => ({
            ...prev,
            id: motoristaId,
            nombre: `${user.nombre || user.name || ''} ${user.apellido || user.lastName || ''}`.trim(),
            email: user.email || 'No disponible',
            telefono: user.phone || 'No disponible',
            direccion: user.address || 'No disponible',
            fechaNacimiento: user.birthDate
              ? new Date(user.birthDate).toLocaleDateString('es-ES')
              : 'No disponible',
            tarjeta: user.circulationCard || 'No disponible',
            camion: 'Sin conexión al servidor',
            camionInfo: null,
            img: user.img,
          }));
          return;
        }
        throw new Error(`Error ${res.status}: ${errText}`);
      }

      const raw = await res.json();
      const payload = raw && raw.success && raw.data ? raw.data : raw;
      const m = Array.isArray(payload) ? payload[0] : payload;

      console.log('✅ Perfil recibido:', {
        id: m?._id || m?.id,
        name: m?.name,
        email: m?.email,
        camion: m?.camionAsignado ? 'Asignado' : 'Sin asignar',
      });

      if (!m || typeof m !== 'object') throw new Error('Respuesta de perfil inesperada');

      const finalId = m._id || m.id || motoristaId;

      setProfile({
        id: finalId,
        nombre: `${m.name || ''} ${m.lastName || ''}`.trim(),
        email: m.email || 'No disponible',
        telefono: m.phone || 'No disponible',
        direccion: m.address || 'No disponible',
        fechaNacimiento: m.birthDate
          ? new Date(m.birthDate).toLocaleDateString('es-ES')
          : 'No disponible',
        tarjeta: m.circulationCard || 'No disponible',
        cargo: 'Motorista',
        camion: m.camionAsignado
          ? `${m.camionAsignado.name || m.camionAsignado.alias || 'Camión'} - ${(m.camionAsignado.licensePlate || m.camionAsignado.placa || '').trim()}`
          : 'Sin asignar',
        camionInfo: m.camionAsignado || null,
        img: m.img,
      });

      // Mantén AsyncStorage sincronizado si cambió el ID
      if (String(finalId) !== String(motoristaId)) {
        await AsyncStorage.setItem('motoristaId', String(finalId));
        console.log('🔄 motoristaId actualizado en AsyncStorage:', finalId);
      }
    } catch (error) {
      console.error('❌ Error al cargar perfil:', error.message);
      if (user) {
        const fallbackId = await obtenerMotoristaId();
        setProfile({
          id: fallbackId,
          nombre: `${user.nombre || user.name || 'Usuario'} ${user.apellido || user.lastName || ''}`.trim(),
          email: user.email || 'No disponible',
          telefono: user.phone || 'No disponible',
          direccion: user.address || 'No disponible',
          fechaNacimiento: user.birthDate
            ? new Date(user.birthDate).toLocaleDateString('es-ES')
            : 'No disponible',
          tarjeta: user.circulationCard || 'No disponible',
          cargo: 'Motorista',
          camion: 'Error al cargar',
          camionInfo: null,
          img: user.img,
        });
      } else {
        setProfile((prev) => ({
          ...prev,
          nombre: 'Error al cargar',
          email: error.message,
          camion: 'Error',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const success = await authLogout();
      if (success) {
        // Limpia storage relevante para evitar IDs/tokens huérfanos
        await AsyncStorage.multiRemove(['motoristaId', 'authToken', 'userToken', 'token']);

        setProfile({
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
        console.log('Sesión cerrada y storage limpiado');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  useEffect(() => {
    console.log('🔄 useProfile effect');
    console.log('👤 User en contexto:', user ? 'Presente' : 'No');
    console.log('🔑 Token en contexto:', token ? 'Presente' : 'No');
    if (user || token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  return { profile, loading, fetchProfile, logout };
};
