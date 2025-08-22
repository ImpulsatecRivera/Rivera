import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ AGREGAR ESTA IMPORTACIÓN
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contenxt/authContext';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

const GREEN = '#10AC84';
const BG = '#F5F5F5';

const ProfileScreen = () => {
  // Estados para manejo de datos y UI
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [error, setError] = useState(null);

  // Hooks de navegación y autenticación
  const navigation = useNavigation();
  const { user, logout, token } = useAuth();

  // 🔍 DEBUG: Para monitorear el contexto de autenticación
  useEffect(() => {
    console.log('🔍 DEBUG - Usuario en contexto:', JSON.stringify(user, null, 2));
    console.log('🔍 DEBUG - Token en contexto:', token);
    console.log('🔍 DEBUG - Tipo de user:', typeof user);
    console.log('🔍 DEBUG - User tiene ID?:', !!(user?.id || user?._id));
    
    // Verificar AsyncStorage también
    const checkAsyncStorage = async () => {
      try {
        const clientData = await AsyncStorage.getItem('clientData');
        const clientId = await AsyncStorage.getItem('clientId');
        const clientToken = await AsyncStorage.getItem('clientToken');
        
        console.log('🔍 DEBUG - AsyncStorage clientData:', clientData);
        console.log('🔍 DEBUG - AsyncStorage clientId:', clientId);
        console.log('🔍 DEBUG - AsyncStorage clientToken:', clientToken);
      } catch (error) {
        console.error('Error leyendo AsyncStorage:', error);
      }
    };
    
    checkAsyncStorage();
  }, [user, token]);

  // 🚨 DEBUG: Para monitorear los datos del usuario
  useEffect(() => {
    if (userInfo) {
      console.log('🔍 DEBUGGING UserInfo:', JSON.stringify(userInfo, null, 2));
    }
  }, [userInfo]);

  /**
   * 🔥 FUNCIÓN PRINCIPAL: Obtener información del perfil desde la API
   */
  const fetchUserProfile = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Verificar que tenemos el ID del usuario
      if (!user?.id && !user?._id) {
        console.log('⚠️ No hay user ID, usando datos dummy para debug');
        const dummyUserInfo = createDummyUserInfo();
        setUserInfo(dummyUserInfo);
        return;
      }

      const userId = user.id || user._id;
      console.log('🔍 Obteniendo perfil para usuario:', userId);

      // Hacer petición a la API con el endpoint corregido
      const apiUrl = `https://riveraproject-5.onrender.com/api/clientes/${userId}`;
      console.log('🌐 URL de petición:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      console.log('📡 Status de respuesta:', response.status);
      console.log('📡 Headers de respuesta:', response.headers.get('content-type'));
      
      // Verificar si la respuesta es JSON válido
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const htmlResponse = await response.text();
        console.log('❌ Respuesta no es JSON:', htmlResponse.substring(0, 200));
        throw new Error(`Servidor devolvió ${contentType || 'HTML'} en lugar de JSON. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 Respuesta del perfil:', data);

      if (response.ok && data.success) {
        // ✅ ÉXITO: Procesar y formatear los datos del backend
        const clienteData = data.data.cliente;
        const actividadData = data.data.actividad;

        // Formatear la información de forma segura
        const formattedUserInfo = {
          name: String(clienteData?.nombreCompleto || `${clienteData?.firstName || ''} ${clienteData?.lastName || ''}`.trim() || 'Usuario sin nombre'),
          firstName: String(clienteData?.firstName || ''),
          lastName: String(clienteData?.lastName || ''),
          role: 'Cliente',
          email: String(clienteData?.email || 'No disponible'),
          dni: String(clienteData?.idNumber || 'No registrado'),
          birthDate: clienteData?.birthDate ? formatDate(clienteData.birthDate) : 'No registrada',
          phone: String(clienteData?.phone || 'No registrado'),
          address: String(clienteData?.address || 'No registrada'),
          password: '••••••••••••',
          
          // Información adicional de actividad - asegurar que sean strings
          estadoActividad: String(actividadData?.estadoActividad || 'activo'),
          fechaRegistro: String(actividadData?.fechaRegistro || 'No disponible'),
          diasDesdeRegistro: actividadData?.diasDesdeRegistro ? Number(actividadData.diasDesdeRegistro) : null,
          ultimoAcceso: String(actividadData?.ultimoAcceso || 'No registrado'),
          edad: String(clienteData?.edad || 'No disponible'),
        };

        setUserInfo(formattedUserInfo);
        console.log('✅ Perfil cargado exitosamente');

      } else {
        // ❌ ERROR DE LA API
        throw new Error(data.message || 'Error al obtener información del perfil');
      }

    } catch (error) {
      console.error('❌ Error al obtener perfil:', error);
      handleProfileError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * 🔧 FUNCIÓN AUXILIAR: Crear datos dummy para debug
   */
  const createDummyUserInfo = () => {
    return {
      name: 'Usuario de Prueba',
      firstName: 'Usuario',
      lastName: 'Prueba',
      role: 'Cliente',
      email: 'usuario@prueba.com',
      dni: '12345678-9',
      birthDate: '01/01/1990',
      phone: '7000-0000',
      address: 'Dirección de prueba',
      password: '••••••••••••',
      estadoActividad: 'activo',
      fechaRegistro: '1 de enero de 2024',
      diasDesdeRegistro: 30,
      ultimoAcceso: 'Hoy',
      edad: '34 años',
    };
  };

  /**
   * 🔧 FUNCIÓN AUXILIAR: Manejar errores del perfil
   */
  const handleProfileError = (error) => {
    let errorMessage = 'Error de conexión';
    if (error.message.includes('Network')) {
      errorMessage = 'Sin conexión a internet';
    } else if (error.message.includes('ID de usuario')) {
      errorMessage = 'Sesión inválida. Por favor inicia sesión nuevamente.';
    } else {
      errorMessage = error.message || 'Error al cargar el perfil';
    }

    setError(errorMessage);
    
    // Si es error de sesión, mostrar alerta para re-login
    if (error.message.includes('ID de usuario') || error.message.includes('401')) {
      Alert.alert(
        '🔐 Sesión Expirada',
        'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
        [
          {
            text: 'Iniciar Sesión',
            onPress: () => {
              logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        ],
        { cancelable: false }
      );
    }
  };

  /**
   * 🔧 FUNCIÓN AUXILIAR: Formatear fecha de forma segura
   */
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

  /**
   * 🔧 FUNCIÓN AUXILIAR: Formatear número de días de forma segura
   */
  const formatDaysCount = (days) => {
    if (days === null || days === undefined || isNaN(days)) {
      return null;
    }
    return `${days} días`;
  };

  /**
   * 🔄 FUNCIÓN: Refrescar datos (pull to refresh)
   */
  const onRefresh = () => {
    fetchUserProfile(true);
  };

  /**
   * 🔥 EFECTO: Cargar datos cuando la pantalla se enfoca
   */
  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
    }, [user])
  );

  /**
   * 🚪 FUNCIÓN: Manejo de logout
   */
  const openConfirm = () => setConfirmVisible(true);
  const closeConfirm = () => setConfirmVisible(false);
  
  const handleConfirmLogout = async () => {
    try {
      setConfirmVisible(false);
      console.log('👋 Usuario cerrando sesión...');
      
      await logout();
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'Hubo un problema al cerrar sesión');
    }
  };

  /**
   * 🎨 RENDERIZADO CONDICIONAL: Loading
   */
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <FocusAwareStatusBar barStyle="light-content" backgroundColor={GREEN} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * 🚨 RENDERIZADO CONDICIONAL: Error
   */
  if (error && !userInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <FocusAwareStatusBar barStyle="light-content" backgroundColor={GREEN} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Error al cargar perfil</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => fetchUserProfile()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * 🎨 RENDERIZADO PRINCIPAL
   */
  return (
    <SafeAreaView style={styles.container}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor={GREEN} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[GREEN]}
            tintColor={GREEN}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil de usuario</Text>
          {userInfo?.estadoActividad && (
            <View style={[
              styles.activityBadge, 
              { backgroundColor: getActivityColor(userInfo.estadoActividad) }
            ]}>
              <Text style={styles.activityText}>
                {getActivityLabel(userInfo.estadoActividad)}
              </Text>
            </View>
          )}
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Image source={require('../images/perfil.png')} style={styles.avatarImg} />
          </View>
          <Text style={styles.userName}>{userInfo?.name || 'Usuario'}</Text>
          <Text style={styles.userRole}>{userInfo?.role || 'Cliente'}</Text>
          {userInfo?.edad && (
            <Text style={styles.userAge}>{userInfo.edad}</Text>
          )}
        </View>

        {/* Información personal */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información personal</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userInfo?.email || 'No disponible'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>DUI</Text>
            <Text style={styles.infoValue}>{userInfo?.dni || 'No disponible'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fecha de nacimiento</Text>
            <Text style={styles.infoValue}>{userInfo?.birthDate || 'No disponible'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{userInfo?.phone || 'No disponible'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Dirección</Text>
            <Text style={styles.infoValue}>{userInfo?.address || 'No disponible'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Contraseña</Text>
            <Text style={styles.infoValue}>{userInfo?.password || '••••••••'}</Text>
          </View>
        </View>

        {/* Información de actividad */}
        {userInfo?.fechaRegistro && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Información de cuenta</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Miembro desde</Text>
              <Text style={styles.infoValue}>{userInfo.fechaRegistro}</Text>
            </View>
            
            {userInfo.diasDesdeRegistro !== null && userInfo.diasDesdeRegistro !== undefined && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Días registrado</Text>
                <Text style={styles.infoValue}>{formatDaysCount(userInfo.diasDesdeRegistro)}</Text>
              </View>
            )}
            
            {userInfo.ultimoAcceso && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Último acceso</Text>
                <Text style={styles.infoValue}>{userInfo.ultimoAcceso}</Text>
              </View>
            )}
          </View>
        )}

        {/* Botón Cerrar sesión */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={openConfirm} activeOpacity={0.9}>
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de confirmación */}
      <Modal transparent visible={confirmVisible} animationType="fade" onRequestClose={closeConfirm}>
        <Pressable style={styles.backdrop} onPress={closeConfirm}>
          <Pressable style={styles.modalCard}>
            <View style={styles.iconWrap}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>🔒</Text>
              </View>
            </View>

            <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
            <Text style={styles.modalSubtitle}>
              Se cerrará tu sesión en este dispositivo. Podrás volver a iniciar cuando quieras.
            </Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.btnLight} onPress={closeConfirm} activeOpacity={0.9}>
                <Text style={styles.btnLightText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnDanger} onPress={handleConfirmLogout} activeOpacity={0.9}>
                <Text style={styles.btnDangerText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

/**
 * 🔧 FUNCIONES AUXILIARES - Validadas para devolver siempre strings
 */
const getActivityColor = (activity) => {
  switch (String(activity).toLowerCase()) {
    case 'online': return '#00D68F';
    case 'activo': return '#FFA500';
    case 'poco_activo': return '#FF6B35';
    default: return '#FF4757';
  }
};

const getActivityLabel = (activity) => {
  switch (String(activity).toLowerCase()) {
    case 'online': return '🟢 En línea';
    case 'activo': return '🟡 Activo';
    case 'poco_activo': return '🟠 Poco activo';
    default: return '🔴 Inactivo';
  }
};

/**
 * 🎨 ESTILOS
 */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Estados de loading y error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: GREEN,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Header mejorado
  header: {
    backgroundColor: GREEN,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  activityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  activityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Profile card mejorado
  profileCard: {
    backgroundColor: GREEN,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  userRole: { fontSize: 16, color: '#FFFFFF', opacity: 0.9 },
  userAge: { fontSize: 14, color: '#FFFFFF', opacity: 0.8, marginTop: 4 },

  // Secciones de información
  infoSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 20 },
  infoItem: { marginBottom: 15 },
  infoLabel: { fontSize: 14, color: '#7F8C8D', marginBottom: 5, fontWeight: '500' },
  infoValue: { fontSize: 16, color: '#2C3E50', fontWeight: '400' },

  // Botón de logout
  buttonContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  logoutButton: {
    backgroundColor: '#FF4757',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  // Modal styles
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 18,
    padding: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  iconWrap: { alignItems: 'center', marginBottom: 8 },
  iconCircle: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFECEF',
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 34 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', textAlign: 'center', marginTop: 6 },
  modalSubtitle: { fontSize: 14, color: '#4B5563', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btnLight: {
    flex: 1, backgroundColor: '#EEF2F6', paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  },
  btnLightText: { color: '#334155', fontWeight: '700', fontSize: 15 },
  btnDanger: {
    flex: 1, backgroundColor: '#FF4757', paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  },
  btnDangerText: {
    color: '#FFFFFF', fontWeight: '800', fontSize: 15,
  },
});

export default ProfileScreen;