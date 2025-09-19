import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contenxt/authContext'; // Ajusta la ruta

const useProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, logout, token } = useAuth();

  // 🔥 FUNCIÓN PARA OBTENER DATOS REALES DEL PERFIL
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar que tenemos el ID del usuario
      if (!user?.id && !user?._id) {
        throw new Error('No hay información de usuario disponible');
      }

      const userId = user.id || user._id;
      console.log('🔍 Obteniendo perfil para usuario:', userId);

      // Hacer petición a la API
      const apiUrl = `https://riveraproject-production.up.railway.app/api/clientes/${userId}`;
      console.log('🌐 URL de petición:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      console.log('📡 Status de respuesta:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📡 Respuesta del perfil:', data);

      if (data.success) {
        // ✅ PROCESAR DATOS REALES DEL BACKEND
        const clienteData = data.data.cliente;
        const actividadData = data.data.actividad;

        const formattedUserInfo = {
          name: clienteData?.nombreCompleto || `${clienteData?.firstName || ''} ${clienteData?.lastName || ''}`.trim(),
          firstName: clienteData?.firstName || '',
          lastName: clienteData?.lastName || '',
          role: 'Cliente',
          email: clienteData?.email || 'No disponible',
          dni: clienteData?.idNumber || 'No registrado',
          birthDate: clienteData?.birthDate ? formatDate(clienteData.birthDate) : 'No registrada',
          phone: clienteData?.phone || 'No registrado',
          address: clienteData?.address || 'No registrada',
          password: '••••••••••••',
          
          // Información adicional
          estadoActividad: actividadData?.estadoActividad || 'activo',
          fechaRegistro: actividadData?.fechaRegistro || 'No disponible',
          diasDesdeRegistro: actividadData?.diasDesdeRegistro || null,
          ultimoAcceso: actividadData?.ultimoAcceso || 'No registrado',
          edad: clienteData?.edad || 'No disponible',
        };

        setUserInfo(formattedUserInfo);
        console.log('✅ Perfil cargado exitosamente');

      } else {
        throw new Error(data.message || 'Error al obtener información del perfil');
      }

    } catch (error) {
      console.error('❌ Error al obtener perfil:', error);
      setError(error.message);
      
      // Fallback: usar datos del contexto si están disponibles
      if (user) {
        console.log('📋 Usando datos del contexto como fallback');
        setUserInfo({
          name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: 'Cliente',
          email: user.email || 'No disponible',
          dni: user.idNumber || 'No registrado',
          birthDate: user.birthDate || 'No registrada',
          phone: user.phone || 'No registrado',
          address: user.address || 'No registrada',
          password: '••••••••••••',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔧 FUNCIÓN AUXILIAR: Formatear fecha
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'No registrada';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // ✅ FUNCIÓN DE LOGOUT MEJORADA
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('👋 Usuario cerrando sesión...');
              await logout();
              console.log('✅ Logout completado');
            } catch (error) {
              console.error('❌ Error en logout:', error);
              Alert.alert('Error', 'Hubo un problema al cerrar sesión');
            }
          }
        },
      ]
    );
  };

  // 🔄 CARGAR DATOS AL MONTAR EL COMPONENTE
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  return {
    userInfo,
    loading,
    error,
    handleLogout,
    refreshProfile: fetchUserProfile, // Para permitir refrescar manualmente
  };
};

export { useProfile };
export default useProfile;