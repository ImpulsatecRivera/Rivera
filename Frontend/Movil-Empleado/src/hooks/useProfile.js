import { useState, useEffect } from 'react';
import { useAuth } from '../Context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useProfile = () => {
  const { user, token, logout: authLogout } = useAuth();
  const [profile, setProfile] = useState({
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

  // Función para obtener datos del perfil
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // 🔍 Verificar datos en AsyncStorage
      const motoristaId = await AsyncStorage.getItem('motoristaId');
      const authToken = await AsyncStorage.getItem('authToken');
      
      console.log('🆔 Motorista ID encontrado:', motoristaId);
      console.log('🔑 Auth token:', authToken ? 'Presente' : 'No presente');
      
      // Usar datos del contexto como fallback
      const userId = motoristaId || user?._id || user?.id;
      
      if (!userId) {
        throw new Error('No se encontró ID de motorista. Por favor, inicia sesión nuevamente.');
      }

      console.log('🌐 Conectando al backend con ID:', userId);

      // Hacer petición al backend para obtener datos actualizados
      const response = await fetch(`http://192.168.1.100:4000/api/motoristas/${userId}`, {
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
        name: motoristaData.name,
        email: motoristaData.email,
        camion: motoristaData.camionAsignado ? 'Asignado' : 'Sin asignar'
      });
      
      // Mapear los datos del backend al formato del perfil
      setProfile({
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
      
    } catch (error) {
      console.error('❌ Error al cargar perfil:', error.message);
      
      // Como último recurso, usar datos del contexto si están disponibles
      if (user) {
        console.log('📋 Usando datos del contexto por error');
        setProfile({
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
        console.log('Sesión cerrada correctamente');
        // Aquí puedes agregar navegación si es necesario
        // navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    fetchProfile,
    logout
  };
};