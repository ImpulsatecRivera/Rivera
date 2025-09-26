import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useProfile } from '../hooks/useProfile';
import InfoRow from '../components/InfoRow';
import perfilImg from '../images/perfil.png';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isLargeScreen = screenWidth > 414;

const PerfilScreen = ({ navigation }) => {
  const { profile, loading, logout, fetchProfile } = useProfile();

  // 🔁 Refresca perfil cada vez que esta pantalla vuelve a estar en foco
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí', onPress: logout }
      ]
    );
  };

  // Mostrar loading solo si no hay datos del perfil
  if (loading && !profile?.id) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  // Manejo seguro de datos del camión
  const camionInfo = profile?.camionInfo || {};
  const gasolina = typeof camionInfo.gasolineLevel === 'number' 
    ? `${camionInfo.gasolineLevel}%` 
    : camionInfo.gasolineLevel || '—';

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={fetchProfile} 
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Header Verde */}
        <View style={styles.header}>
          <Text style={styles.title}>Perfil de motorista</Text>
          
          {/* Mostrar imagen del perfil del motorista si existe, sino la por defecto */}
          <Image
            source={profile?.img ? { uri: profile.img } : perfilImg}
            style={styles.perfilImage}
            resizeMode="cover"
          />
          
          <Text style={styles.name}>{profile?.nombre || '—'}</Text>
          <Text style={styles.cargo}>{profile?.cargo || 'Motorista'}</Text>
        </View>

        {/* Información Personal */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          
          <InfoRow label="Email" value={profile?.email || '—'} />
          <InfoRow label="Camión encargado" value={profile?.camion || 'Sin asignar'} />
          <InfoRow label="Fecha de nacimiento" value={profile?.fechaNacimiento || '—'} />
          <InfoRow label="Teléfono" value={profile?.telefono || '—'} />
          <InfoRow label="Dirección" value={profile?.direccion || '—'} />
          <InfoRow label="Tarjeta de circulación" value={profile?.tarjeta || '—'} />
          
          {/* Información adicional del camión si existe */}
          {profile?.camionInfo && (
            <>
              <Text style={[styles.sectionTitle, styles.marginTop]}>Detalles del camión</Text>
              <InfoRow label="Marca" value={camionInfo.brand || camionInfo.marca || '—'} />
              <InfoRow label="Modelo" value={camionInfo.model || camionInfo.modelo || '—'} />
              <InfoRow label="Estado" value={camionInfo.state || camionInfo.estado || '—'} />
              <InfoRow label="Nivel de gasolina" value={gasolina} />
            </>
          )}

          {/* Botón Editar perfil */}
          <TouchableOpacity
            style={[styles.editButton]}
            onPress={() => navigation.navigate('EditarPerfil')}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>Editar perfil</Text>
          </TouchableOpacity>

          {/* Botón de refrescar datos */}
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={fetchProfile}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.refreshButtonText}>Actualizar datos</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 120, // Espacio para navbar flotante
  },
  
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    marginTop: 10,
    fontSize: isSmallScreen ? 14 : 16,
    color: '#666',
  },
  
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: isSmallScreen ? 50 : 60,
    paddingBottom: isSmallScreen ? 25 : 30,
    paddingHorizontal: isSmallScreen ? 15 : 20,
    alignItems: 'center',
  },
  
  title: {
    fontSize: isSmallScreen ? 18 : isLargeScreen ? 22 : 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: isSmallScreen ? 15 : 20,
  },
  
  perfilImage: {
    width: isSmallScreen ? 80 : isLargeScreen ? 120 : 100,
    height: isSmallScreen ? 80 : isLargeScreen ? 120 : 100,
    borderRadius: isSmallScreen ? 40 : isLargeScreen ? 60 : 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  
  name: {
    fontSize: isSmallScreen ? 16 : isLargeScreen ? 20 : 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    textAlign: 'center',
  },
  
  cargo: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  
  content: {
    backgroundColor: '#fff',
    marginTop: isSmallScreen ? -15 : -20,
    borderTopLeftRadius: isLargeScreen ? 25 : 20,
    borderTopRightRadius: isLargeScreen ? 25 : 20,
    padding: isSmallScreen ? 15 : 20,
    flex: 1,
  },
  
  sectionTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: isSmallScreen ? 15 : 20,
  },
  
  marginTop: {
    marginTop: isSmallScreen ? 25 : 30,
  },
  
  editButton: {
    backgroundColor: '#4CAF50',
    padding: isSmallScreen ? 12 : 15,
    borderRadius: isLargeScreen ? 12 : 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  editButtonText: {
    color: '#fff',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
  },
  
  refreshButton: {
    backgroundColor: '#2196F3',
    padding: isSmallScreen ? 12 : 15,
    borderRadius: isLargeScreen ? 12 : 8,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  refreshButtonText: {
    color: '#fff',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
  },
  
  logoutButton: {
    backgroundColor: '#F44336',
    padding: isSmallScreen ? 12 : 15,
    borderRadius: isLargeScreen ? 12 : 8,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 30, // Espacio extra para el navbar
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  logoutButtonText: {
    color: '#fff',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
  },
});

export default PerfilScreen;