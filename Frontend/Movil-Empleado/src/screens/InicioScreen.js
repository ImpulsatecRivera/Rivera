import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTrips } from '../hooks/useTrips';
import { useProfile } from '../hooks/useProfile'; // Tu hook existente

// Components
import LogoHeader from '../components/LogoHeader';
import GreetingSection from '../components/GreetingSection';
import ServiceCard from '../components/ServiceCard';
import StatsCard from '../components/StatsCard';
import DestinationCard from '../components/DestinationCard';

const InicioScreen = ({ navigation }) => {
  const { trips, totalTrips, proximosDestinos } = useTrips();
  const { profile, loading } = useProfile(); // Obtener datos del perfil del usuario

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
    navigation.navigate('InfoViaje', { 
      trip: trips.find(t => t.hora === destino.hora) || trips[0]
    });
  };

  const handleVerHistorial = () => {
    navigation.navigate('Viajes');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.content}>
        <LogoHeader />
        
        <GreetingSection
          name={getFirstName(profile.nombre)}
          subtitle="estos son tus viajes para el día de Hoy"
          avatarText={getInitials(profile.nombre)}
        />

        {/* Service Cards */}
        <View style={styles.serviceCards}>
          {trips.map((trip) => (
            <ServiceCard 
              key={trip.id}
              trip={trip}
              onPress={handleTripPress}
            />
          ))}
        </View>

        <StatsCard 
          number={totalTrips}
          label="Viajes realizados en este mes"
        />

        {/* Próximos Destinos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximos destinos</Text>
            <TouchableOpacity onPress={handleVerHistorial}>
              <Text style={styles.sectionLink}>Ver historial</Text>
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
  serviceCards: {
    paddingHorizontal: 20,
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
});

export default InicioScreen;