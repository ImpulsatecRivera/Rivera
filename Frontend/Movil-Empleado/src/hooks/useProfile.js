import { useState, useEffect } from 'react';
import { useAuth } from '../Context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useProfile = () => {
  const { user, token, logout: authLogout } = useAuth();
  const [profile, setProfile] = useState({
    id: null, // Agregar ID al estado inicial
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

  // Función para obtener el ID del motorista desde múltiples fuentes
  const obtenerMotoristaId = async () => {
    try {
      // 1. Prioridad: AsyncStorage (donde se guarda después del login)
      let motoristaId = await AsyncStorage.getItem('motoristaId');
      
      if (motoristaId) {
        console.log('🆔 ID encontrado en AsyncStorage:', motoristaId);
        return motoristaId;
      }

      // 2. Fallback: Contexto de autenticación
      if (user?._id) {
        console.log('🆔 ID encontrado en contexto user._id:', user._id);
        // Guardar en AsyncStorage para próximas veces
        await AsyncStorage.setItem('motoristaId', user._id);
        return user._id;
      }

      if (user?.id) {
        console.log('🆔 ID encontrado en contexto user.id:', user.id);
        // Guardar en AsyncStorage para próximas veces
        await AsyncStorage.setItem('motoristaId', user.id);
        return user.id;
      }

      console.log('❌ No se encontró ID de motorista en ninguna fuente');
      return null;

    } catch (error) {
      console.error('❌ Error al obtener motorista ID:', error);
      return null;
    }
  };

  // Función para obtener datos del perfil
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Obtener ID del motorista
      const motoristaId = await obtenerMotoristaId();
      
      if (!motoristaId) {
        throw new Error('No se encontró ID de motorista. Por favor, inicia sesión nuevamente.');
      }

      // Obtener token de autenticación
      const authToken = await AsyncStorage.getItem('authToken') || token;
      
      console.log('🌐 Conectando al backend con ID:', motoristaId);
      console.log('🔑 Auth token:', authToken ? 'Presente' : 'No presente');

      // Hacer petición al backend para obtener datos actualizados
      const response = await fetch(`https://riveraproject-production.up.railway.app/api/motoristas/${motoristaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('❌ Error response:', errorData);
        
        // Si hay error del servidor, usar datos del contexto como fallback
        if (user) {
          console.log('📋 Usando datos del contexto como fallback');
          setProfile({
            id: motoristaId, // IMPORTANTE: Incluir el ID
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

      const motoristaData = await response.json();
      console.log('✅ Datos recibidos del backend:', {
        id: motoristaData._id,
        name: motoristaData.name,
        email: motoristaData.email,
        camion: motoristaData.camionAsignado ? 'Asignado' : 'Sin asignar'
      });
      
      // Mapear los datos del backend al formato del perfil
      setProfile({
        id: motoristaData._id, // IMPORTANTE: Incluir el ID del backend
        nombre: `${motoristaData.name} ${motoristaData.lastName}`,
        email: motoristaData.email,
        telefono: motoristaData.phone || 'No disponible',
        direccion: motoristaData.address || 'No disponible',
        fechaNacimiento: motoristaData.birthDate 
          ? new Date(motoristaData.birthDate).toLocaleDateString('es-ES')
          : 'No disponible',
        tarjeta: motoristaData.circulationCard || 'No disponible',
        cargo: 'Motorista',
        camion: motoristaData.camionAsignado 
          ? `${motoristaData.camionAsignado.name} - ${motoristaData.camionAsignado.licensePlate}`
          : 'Sin asignar',
        camionInfo: motoristaData.camionAsignado,
        img: motoristaData.img
      });

      // Asegurar que el ID esté guardado en AsyncStorage
      if (motoristaData._id !== motoristaId) {
        await AsyncStorage.setItem('motoristaId', motoristaData._id);
        console.log('🔄 ID actualizado en AsyncStorage:', motoristaData._id);
      }
      
    } catch (error) {
      console.error('❌ Error al cargar perfil:', error.message);
      
      // Como último recurso, usar datos del contexto si están disponibles
      if (user) {
        console.log('📋 Usando datos del contexto por error');
        const fallbackId = await obtenerMotoristaId();
        setProfile({
          id: fallbackId, // Incluir ID aunque sea fallback
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
        setProfile(prevProfile => ({
          ...prevProfile,
          nombre: 'Error al cargar',
          email: error.message,
          camion: 'Error'
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      const success = await authLogout();
      if (success) {
        // Limpiar datos del perfil al cerrar sesión
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

  // Cargar datos al montar el componente y cuando cambie el usuario del contexto
  useEffect(() => {
    console.log('🔄 useProfile useEffect ejecutado');
    console.log('👤 User del contexto:', user ? 'Presente' : 'No presente');
    console.log('🔑 Token del contexto:', token ? 'Presente' : 'No presente');
    
    // Solo cargar si hay usuario en el contexto o datos en AsyncStorage
    if (user || token) {
      fetchProfile();
    } else {
      console.log('⏳ Esperando datos del contexto...');
      setLoading(false);
    }
  }, [user, token]); // Dependencias en user y token para reaccionar a cambios

  return {
    profile,
    loading,
    fetchProfile,
    logout
  };
};