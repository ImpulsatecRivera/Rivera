// src/hooks/useProfile.js
import { useState, useEffect } from 'react';
import { useAuth } from '../Context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    camionInfo: null
  });
  
  const [loading, setLoading] = useState(true);

  const obtenerMotoristaId = async () => {
    try {
      let motoristaId = await AsyncStorage.getItem('motoristaId');
      if (motoristaId) {
        console.log('🆔 ID encontrado en AsyncStorage:', motoristaId);
        return motoristaId;
      }
      if (user?._id) {
        console.log('🆔 ID encontrado en contexto user._id:', user._id);
        await AsyncStorage.setItem('motoristaId', String(user._id));
        return String(user._id);
      }
      if (user?.id) {
        console.log('🆔 ID encontrado en contexto user.id:', user.id);
        await AsyncStorage.setItem('motoristaId', String(user.id));
        return String(user.id);
      }
      console.log('❌ No se encontró ID de motorista en ninguna fuente');
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
      if (!motoristaId) {
        throw new Error('No se encontró ID de motorista. Por favor, inicia sesión nuevamente.');
      }

      // ⬇️ usa cualquiera disponible; en tu AuthContext no expones token, por eso caemos a AsyncStorage
      const authToken = (await AsyncStorage.getItem('authToken')) ||
                        (await AsyncStorage.getItem('userToken')) ||
                        token;

      console.log('🌐 Conectando al backend con ID:', motoristaId);
      console.log('🔑 Auth token:', authToken ? 'Presente' : 'No presente');

      const response = await fetch(`https://riveraproject-5.onrender.com/api/motoristas/${motoristaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text().catch(() => '');
        console.log('❌ Error response:', errorData);
        if (user) {
          console.log('📋 Usando datos del contexto como fallback');
          setProfile({
            id: motoristaId,
            nombre: `${user.name || ''} ${user.lastName || ''}`.trim(),
            email: user.email || 'No disponible',
            telefono: user.phone || 'No disponible',
            direccion: user.address || 'No disponible',
            fechaNacimiento: user.birthDate 
              ? new Date(user.birthDate).toLocaleDateString('es-ES')
              : 'No disponible',
            tarjeta: user.circulationCard || 'No disponible',
            cargo: 'Motorista',
            camion: 'Sin conexión al servidor',
            camionInfo: null,
            img: user.img
          });
          return;
        }
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      // ✅ Desempaquetar { success, data, message } si viene así
      const raw = await response.json();
      const payload = (raw && raw.success && raw.data) ? raw.data : raw;

      // Por si alguna API devuelve un array (tomamos el primero)
      const motoristaData = Array.isArray(payload) ? payload[0] : payload;

      console.log('✅ Datos recibidos del backend:', {
        id: motoristaData?._id || motoristaData?.id,
        name: motoristaData?.name,
        email: motoristaData?.email,
        camion: motoristaData?.camionAsignado ? 'Asignado' : 'Sin asignar'
      });

      if (!motoristaData || typeof motoristaData !== 'object') {
        throw new Error('Respuesta de perfil inesperada');
      }

      setProfile({
        id: motoristaData._id || motoristaData.id || motoristaId,
        nombre: `${motoristaData.name || ''} ${motoristaData.lastName || ''}`.trim(),
        email: motoristaData.email || 'No disponible',
        telefono: motoristaData.phone || 'No disponible',
        direccion: motoristaData.address || 'No disponible',
        fechaNacimiento: motoristaData.birthDate 
          ? new Date(motoristaData.birthDate).toLocaleDateString('es-ES')
          : 'No disponible',
        tarjeta: motoristaData.circulationCard || 'No disponible',
        cargo: 'Motorista',
        camion: motoristaData.camionAsignado 
          ? `${motoristaData.camionAsignado.name || motoristaData.camionAsignado.alias || 'Camión'} - ${motoristaData.camionAsignado.licensePlate || motoristaData.camionAsignado.placa || ''}`.trim()
          : 'Sin asignar',
        camionInfo: motoristaData.camionAsignado || null,
        img: motoristaData.img
      });

      // Mantener AsyncStorage en sync si cambió
      const finalId = motoristaData._id || motoristaData.id;
      if (finalId && String(finalId) !== String(motoristaId)) {
        await AsyncStorage.setItem('motoristaId', String(finalId));
        console.log('🔄 ID actualizado en AsyncStorage:', finalId);
      }
      
    } catch (error) {
      console.error('❌ Error al cargar perfil:', error.message);
      if (user) {
        console.log('📋 Usando datos del contexto por error');
        const fallbackId = await obtenerMotoristaId();
        setProfile({
          id: fallbackId,
          nombre: `${user.name || 'Usuario'} ${user.lastName || ''}`.trim(),
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
          img: user.img
        });
      } else {
        setProfile(prev => ({
          ...prev,
          nombre: 'Error al cargar',
          email: error.message,
          camion: 'Error'
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
          camionInfo: null
        });
        console.log('Sesión cerrada correctamente');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  useEffect(() => {
    console.log('🔄 useProfile useEffect ejecutado');
    console.log('👤 User del contexto:', user ? 'Presente' : 'No presente');
    console.log('🔑 Token del contexto:', token ? 'Presente' : 'No presente');
    if (user || token) {
      fetchProfile();
    } else {
      console.log('⏳ Esperando datos del contexto...');
      setLoading(false);
    }
  }, [user, token]);

  return {
    profile,
    loading,
    fetchProfile,
    logout
  };
};
