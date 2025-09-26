import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Header from '../components/Header';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isLargeScreen = screenWidth > 414;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: Platform.OS === 'ios'
      ? isLargeScreen ? 180 : 120
      : isLargeScreen ? 160 : 100, // Espacio extra para la tab bar
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  inputText: {
    fontSize: 16,
    color: '#666',
  },
  volverButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  volverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

const InfoViajeScreen = ({ navigation, route }) => {
  const { trip } = route.params || {};

  if (!trip) {
    return (
      <View style={styles.container}>
        <Header 
          title="Información del viaje" 
          showBack 
          onBack={() => navigation.goBack()} 
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se encontró información del viaje</Text>
        </View>
      </View>
    );
  }

  const FormField = ({ label, value }) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}:</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputText}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="Información del viaje" 
        showBack 
        onBack={() => navigation.goBack()} 
      />
      
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <FormField label="Cotización de" value={trip.cotizacion} />
        <FormField label="Camión encargado" value={trip.camion} />
        <FormField label="Descripción" value={trip.descripcion} />
        <FormField label="Hora de llegada" value={trip.horaLlegada} />
        <FormField label="Hora de Salida" value={trip.horaSalida} />
        <FormField label="Asistente" value={trip.asistente} />

        <TouchableOpacity 
          style={styles.volverButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.volverButtonText}>Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default InfoViajeScreen;