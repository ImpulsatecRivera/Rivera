import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../components/Header';

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
      
      <ScrollView style={styles.content}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
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

export default InfoViajeScreen;