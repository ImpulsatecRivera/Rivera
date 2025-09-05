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
import LoadingScreen from '../components/LoadingScreen';

const InicioScreen = ({ navigation }) => {
  const { profile, loading: profileLoading } = useProfile();
  
  // Usar el motoristaId del perfil del usuario
  const motoristaId = profile?.id || profile?._id;
  
  const { 
    trips, 
    loading: tripsLoading, 
    error,
    totalTrips, 
    proximosDestinos,
    refrescarViajes,
    getViajesHoy,
    getEstadisticas,
    viajesPorDia // Los viajes ya agrupados por día desde el backend
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

  // Obtener estadísticas y viajes de hoy
  const estadisticas = getEstadisticas();
  const viajesHoy = getViajesHoy();

  // Función para formatear las fechas de manera más amigable
  const formatearFechaAmigable = (fechaString) => {
    const fecha = new Date(fechaString + 'T00:00:00');
    const hoy = new Date();
    const mañana = new Date();
    mañana.setDate(hoy.getDate() + 1);
    
    hoy.setHours(0, 0, 0, 0);
    mañana.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);

    if (fecha.getTime() === hoy.getTime()) {
      return 'Hoy';
    } else if (fecha.getTime() === mañana.getTime()) {
      return 'Mañana';
    } else {
      return fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };

  // Mostrar error si hay problemas de conexión
  useEffect(() => {
    if (error && !trips.length) {
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

  // Debug: Mostrar información en consola
  useEffect(() => {
    console.log('=== DEBUG VIAJES ===');
    console.log('motoristaId:', motoristaId);
    console.log('loading:', loading);
    console.log('trips length:', trips.length);
    console.log('viajesPorDia:', viajesPorDia);
    console.log('error:', error);
    console.log('===================');
  }, [motoristaId, loading, trips, viajesPorDia, error]);

  // Pantalla de carga inicial
  if (loading && (!trips || trips.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingScreen message="Cargando tus viajes asignados..." />
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
          name={getFirstName(profile?.name || profile?.nombre)}
          subtitle={
            viajesHoy.length > 0 
              ? `Tienes ${viajesHoy.length} viaje${viajesHoy.length > 1 ? 's' : ''} para hoy`
              : totalTrips > 0 
                ? `Tienes ${totalTrips} viajes programados`
                : "No tienes viajes programados"
          }
          avatarText={getInitials(profile?.name || profile?.nombre)}
        />

        {/* Mostrar información de conexión para debug */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            🔄 Estado: {loading ? 'Cargando...' : 'Conectado'}
          </Text>
          <Text style={styles.debugText}>
            📊 Viajes totales: {totalTrips}
          </Text>
          <Text style={styles.debugText}>
            📅 Días con viajes: {viajesPorDia ? viajesPorDia.length : 0}
          </Text>
          {error && (
            <Text style={styles.debugError}>
              ❌ Error: {error}
            </Text>
          )}
        </View>

        {/* Mostrar error si existe pero hay datos cached */}
        {error && trips.length > 0 && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              ⚠️ Mostrando datos guardados. Sin conexión al servidor.
            </Text>
          </View>
        )}

        {/* VIAJES POR DÍA - Mostrar TODOS los viajes asignados */}
        {viajesPorDia && viajesPorDia.length > 0 ? (
          <View style={styles.viajesContainer}>
            <Text style={styles.mainTitle}>Tus viajes asignados</Text>
            
            {viajesPorDia.map((dia, diaIndex) => (
              <View key={dia.fecha || diaIndex} style={styles.diaContainer}>
                <View style={styles.diaHeader}>
                  <Text style={styles.fechaTitulo}>
                    {formatearFechaAmigable(dia.fecha)}
                  </Text>
                  <Text style={styles.cantidadViajes}>
                    {dia.viajes ? dia.viajes.length : 0} viaje{(dia.viajes && dia.viajes.length !== 1) ? 's' : ''}
                  </Text>
                </View>

                {/* Mostrar cada viaje del día */}
                {dia.viajes && dia.viajes.length > 0 ? (
                  dia.viajes.map((viaje, viajeIndex) => {
                    // Transformar el viaje para ServiceCard
                    const viajeParaCard = {
                      id: viaje._id || `${dia.fecha}-${viajeIndex}`,
                      tipo: `${viaje.origen} → ${viaje.destino}`,
                      subtitulo: viaje.descripcion || viaje.carga || 'Transporte de carga',
                      fecha: formatearFechaAmigable(dia.fecha),
                      hora: new Date(viaje.fechaSalida).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }),
                      estado: viaje.estado,
                      // Datos completos para InfoViaje
                      ...viaje
                    };

                    return (
                      <ServiceCard 
                        key={viajeParaCard.id}
                        trip={viajeParaCard}
                        onPress={handleTripPress}
                      />
                    );
                  })
                ) : (
                  <View style={styles.noViajesDelDia}>
                    <Text style={styles.noViajesDelDiaText}>
                      No hay viajes para este día
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          /* Mostrar si NO hay viajes asignados */
          <View style={styles.noTripsContainer}>
            <Text style={styles.noTripsIcon}>📅</Text>
            <Text style={styles.noTripsText}>No tienes viajes asignados</Text>
            <Text style={styles.noTripsSubtext}>
              Contacta a tu supervisor para que te asigne viajes
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Estadísticas - Solo mostrar si hay viajes */}
        {totalTrips > 0 && (
          <View style={styles.statsContainer}>
            <StatsCard
              number={estadisticas.pendientes}
              label="Viajes pendientes"
              color="#FF9800"
            />
            <StatsCard
              number={totalTrips}
              label="Total asignados"
              color="#4CAF50"
            />
          </View>
        )}

        {/* Próximos Destinos - Solo mostrar si hay destinos */}
        {proximosDestinos && proximosDestinos.length > 0 && (
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
  debugInfo: {
    backgroundColor: '#e8f5e8',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#2e7d32',
    marginBottom: 2,
  },
  debugError: {
    fontSize: 12,
    color: '#d32f2f',
    marginTop: 5,
    fontWeight: 'bold',
  },
  viajesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  diaContainer: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  diaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fechaTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'capitalize',
  },
  cantidadViajes: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  noViajesDelDia: {
    alignItems: 'center',
    padding: 20,
  },
  noViajesDelDiaText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
    padding: 40,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  noTripsIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noTripsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  noTripsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
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