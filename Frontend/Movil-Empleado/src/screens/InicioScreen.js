import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTrips } from '../hooks/useTrips';
import { useProfile } from '../hooks/useProfile';

// Components
import LogoHeader from '../components/LogoHeader';
import GreetingSection from '../components/GreetingSection';
import ServiceCard from '../components/ServiceCard';
import StatsCard from '../components/StatsCard';
import DestinationCard from '../components/DestinationCard';
import LoadingScreen from '../components/LoadingScreen'; // Componente de carga opcional

const InicioScreen = ({ navigation }) => {
  const { profile, loading: profileLoading } = useProfile();
  
  // Usar el motoristaId del perfil del usuario
  const motoristaId = profile?.id || profile?._id; // Ajusta según tu estructura de datos
  
  const { 
    trips, 
    loading: tripsLoading, 
    error,
    totalTrips, 
    proximosDestinos,
    refrescarViajes,
    getViajesHoy,
    getEstadisticas
  } = useTrips(motoristaId);

  const loading = profileLoading || tripsLoading;

  // Función para obtener las iniciales del nombre
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Función para obtener solo el primer nombre
  const getFirstName = (fullName) => {
    if (!fullName) return 'Usuario';
    return fullName.split(' ')[0];
  };

  const handleTripPress = (trip) => {
    navigation.navigate('InfoViaje', { trip });
  };

  const handleDestinationPress = (destino) => {
    const trip = trips.find(t => t.id === destino.id) || trips[0];
    if (trip) {
      navigation.navigate('InfoViaje', { trip });
    }
  };

  const handleVerHistorial = () => {
    navigation.navigate('Viajes');
  };

  // Función para manejar refresh
  const onRefresh = () => {
    refrescarViajes();
  };

  // Obtener estadísticas
  const estadisticas = getEstadisticas();
  const viajesHoy = getViajesHoy();

  // Mostrar error si hay problemas de conexión
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error de conexión',
        'No se pudieron cargar los viajes. Verifica tu conexión a internet.',
        [
          { text: 'Reintentar', onPress: onRefresh },
          { text: 'Continuar', style: 'cancel' }
        ]
      );
    }
  }, [error]);

  // Pantalla de carga inicial
  if (loading && trips.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingScreen message="Cargando tus viajes..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        <LogoHeader />
        
        <GreetingSection
          name={getFirstName(profile.name || profile.nombre)}
          subtitle={
            viajesHoy.length > 0 
              ? `Tienes ${viajesHoy.length} viaje${viajesHoy.length > 1 ? 's' : ''} para hoy`
              : "No tienes viajes programados para hoy"
          }
          avatarText={getInitials(profile.name || profile.nombre)}
        />

        {/* Mostrar error si existe pero hay datos cached */}
        {error && trips.length > 0 && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              ⚠️ Mostrando datos guardados. Sin conexión al servidor.
            </Text>
          </View>
        )}

        {/* Service Cards - Mostrar viajes de hoy primero */}
        <View style={styles.serviceCards}>
          {viajesHoy.length > 0 ? (
            <>
              <Text style={styles.sectionSubtitle}>Viajes de hoy</Text>
              {viajesHoy.map((trip) => (
                <ServiceCard 
                  key={trip.id}
                  trip={trip}
                  onPress={handleTripPress}
                />
              ))}
            </>
          ) : (
            <View style={styles.noTripsContainer}>
              <Text style={styles.noTripsIcon}>📅</Text>
              <Text style={styles.noTripsText}>No hay viajes programados para hoy</Text>
              <Text style={styles.noTripsSubtext}>
                {proximosDestinos.length > 0 
                  ? 'Revisa tus próximos destinos abajo'
                  : 'Contacta a tu supervisor para más información'
                }
              </Text>
            </View>
          )}
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <StatsCard
            number={estadisticas.pendientes}
            label="Viajes pendientes"
            color="#FF9800"
          />
          <StatsCard
            number={totalTrips}
            label="Viajes este mes"
            color="#4CAF50"
          />
        </View>

        {/* Próximos Destinos */}
        {proximosDestinos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximos destinos</Text>
              <TouchableOpacity onPress={handleVerHistorial}>
                <Text style={styles.sectionLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.destinationGrid}>
              {proximosDestinos.map((destino) => (
                <DestinationCard 
                  key={destino.id}
                  destino={destino}
                  onPress={handleDestinationPress}
                />
              ))}
            </View>
          </View>
        )}

        {/* Si no hay viajes en absoluto */}
        {trips.length === 0 && !loading && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateIcon}>🚛</Text>
            <Text style={styles.emptyStateTitle}>No hay viajes programados</Text>
            <Text style={styles.emptyStateText}>
              Cuando tengas viajes asignados, aparecerán aquí
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  serviceCards: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionLink: {
    fontSize: 14,
    color: '#4CAF50',
  },
  destinationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  errorBanner: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  errorText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
  },
  noTripsContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 10,
  },
  noTripsIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noTripsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  noTripsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InicioScreen;