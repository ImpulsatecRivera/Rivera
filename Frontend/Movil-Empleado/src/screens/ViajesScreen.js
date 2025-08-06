import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTrips } from '../hooks/useTrips';
import HistoryItem from '../components/HistoryItem';
import senalImg from '../images/senal.png'; // Asegúrate de que la ruta sea correcta

const ViajesScreen = ({ navigation }) => {
  const { historialViajes } = useTrips();

  const handleInfoPress = (item) => {
    navigation.navigate('InfoViaje', { 
      trip: {
        id: item.id,
        tipo: item.tipo,
        cotizacion: 'Empresas gremiales',
        camion: 'P-438-MLR',
        descripcion: 'Entrega de mercancías a Usulután',
        horaLlegada: '9:00 AM',
        horaSalida: '8:00 PM',
        asistente: 'Laura Sánchez',
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        
        {/* Título más abajo */}
        <Text style={styles.title}>Historial de viajes</Text>

        {/* Subtítulo + imagen */}
        <View style={styles.greetingContainer}>
          <Text style={styles.subtitle}>
            Aquí podrás ver tus viajes realizados con nosotros
          </Text>
          <Image source={senalImg} style={styles.avatarImage} />
        </View>

        {/* Lista de viajes */}
        <View style={styles.historyList}>
          {historialViajes.map((item) => (
            <HistoryItem 
              key={item.id}
              item={item}
              onInfoPress={handleInfoPress}
            />
          ))}
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 70,   // ✅ MÁS ABAJO
    marginBottom: 10,
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    marginRight: 15,
  },
  avatarImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  historyList: {
    marginTop: 10,
    marginBottom: 20,
  },
});

export default ViajesScreen;
