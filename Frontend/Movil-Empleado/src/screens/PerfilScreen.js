// src/screens/PerfilScreen.js
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
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useProfile } from '../hooks/useProfile';
import InfoRow from '../components/InfoRow';
import perfilImg from '../images/perfil.png';

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
        { text: 'Sí', onPress: logout },
      ]
    );
  };

  if (loading && !profile?.id) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  const camionInfo = profile?.camionInfo || {};
  const gasolina =
    typeof camionInfo.gasolineLevel === 'number'
      ? `${camionInfo.gasolineLevel}%`
      : camionInfo.gasolineLevel || '—';

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchProfile} colors={['#4CAF50']} />
        }
      >
        {/* Header Verde */}
        <View style={styles.header}>
          <Text style={styles.title}>Perfil de motorista</Text>

          {/* Foto de perfil */}
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
              <InfoRow label="Modelo" value={camionInfo.model || '—'} />
              <InfoRow label="Estado" value={camionInfo.state || camionInfo.estado || '—'} />
              <InfoRow label="Nivel de gasolina" value={gasolina} />
            </>
          )}

          {/* Botón Editar perfil */}
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => navigation.navigate('EditarPerfil')}
          >
            <Text style={styles.refreshButtonText}>Editar perfil</Text>
          </TouchableOpacity>

          {/* Botón de refrescar datos */}
          <TouchableOpacity style={styles.refreshButton} onPress={fetchProfile} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.refreshButtonText}>Actualizar datos</Text>
            )}
          </TouchableOpacity>

          {/* Cerrar sesión */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  perfilImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  cargo: { fontSize: 14, color: '#fff', opacity: 0.9 },
  content: {
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flex: 1,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  marginTop: { marginTop: 30 },
  refreshButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  refreshButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default PerfilScreen;
