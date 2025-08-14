import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CotizacionScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    tipoCamion: '',
    descripcion: '',
    estado: 'Pendiente',
    horaLlegada: '',
    horaSalida: '',
    metodoPago: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.tipoCamion || !formData.descripcion) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    Alert.alert(
      'Cotización Enviada',
      'Tu cotización ha sido enviada exitosamente',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Realizar una nueva cotización</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tipo de camión */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tipo de camión</Text>
          <TextInput
            style={styles.input}
            placeholder="Empresas graneleras"
            placeholderTextColor="#999999"
            value={formData.tipoCamion}
            onChangeText={(text) => handleInputChange('tipoCamion', text)}
          />
        </View>

        {/* Descripción */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="MAIZ, ARROZ"
            placeholderTextColor="#999999"
            multiline
            numberOfLines={3}
            value={formData.descripcion}
            onChangeText={(text) => handleInputChange('descripcion', text)}
          />
        </View>

        {/* Estado */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Estado</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>Pendiente</Text>
          </View>
        </View>

        {/* Hora de llegada */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hora de llegada:</Text>
          <TextInput
            style={styles.input}
            placeholder="Seleccionar hora"
            placeholderTextColor="#999999"
            value={formData.horaLlegada}
            onChangeText={(text) => handleInputChange('horaLlegada', text)}
          />
        </View>

        {/* Hora de salida */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hora de Salida:</Text>
          <TextInput
            style={styles.input}
            placeholder="Seleccionar hora"
            placeholderTextColor="#999999"
            value={formData.horaSalida}
            onChangeText={(text) => handleInputChange('horaSalida', text)}
          />
        </View>

        {/* Método de pago */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Método de pago</Text>
          <TextInput
            style={styles.input}
            placeholder="Seleccionar método"
            placeholderTextColor="#999999"
            value={formData.metodoPago}
            onChangeText={(text) => handleInputChange('metodoPago', text)}
          />
        </View>

        {/* Botón Enviar */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Enviar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333333',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  statusContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F39C12',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#856404',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#10AC84',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
    shadowColor: '#10AC84',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CotizacionScreen;