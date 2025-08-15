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

const GREEN = '#10AC84';

const CotizacionScreen = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    tipoCamion: '',
    descripcion: '',
    estado: 'Pendiente',
    horaLlegada: '',
    horaSalida: '',
    metodoPago: 'Efectivo', // por defecto
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectMetodo = (metodo) => {
    setFormData(prev => ({ ...prev, metodoPago: metodo }));
  };

  const handleSubmit = () => {
    if (!formData.tipoCamion || !formData.descripcion) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios.');
      return;
    }
    // Navega a tu pantalla de éxito 
    navigation.navigate('PaymentSuccessScreen', {
      metodoPago: formData.metodoPago,
    });
  };

  const PayOption = ({ label, icon, selected, onPress }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.payOption, selected && styles.payOptionActive]}
    >
      <Text style={styles.payIcon}>{icon}</Text>
      <Text style={[styles.payTitle, selected && styles.payTitleActive]}>
        {label}
      </Text>

      {/* Indicador de selección tipo “radio” */}
      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Realizar una nueva cotización</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tipo de camión */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tipo de camión</Text>
          <TextInput
            style={styles.input}
            placeholder="Empresas graneleras"
            placeholderTextColor="#999"
            value={formData.tipoCamion}
            onChangeText={(t) => handleInputChange('tipoCamion', t)}
          />
        </View>

        {/* Descripción */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="MAÍZ, ARROZ"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={formData.descripcion}
            onChangeText={(t) => handleInputChange('descripcion', t)}
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
          <Text style={styles.label}>Hora de llegada</Text>
          <TextInput
            style={styles.input}
            placeholder="Seleccionar hora"
            placeholderTextColor="#999"
            value={formData.horaLlegada}
            onChangeText={(t) => handleInputChange('horaLlegada', t)}
          />
        </View>

        {/* Hora de salida */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hora de salida</Text>
          <TextInput
            style={styles.input}
            placeholder="Seleccionar hora"
            placeholderTextColor="#999"
            value={formData.horaSalida}
            onChangeText={(t) => handleInputChange('horaSalida', t)}
          />
        </View>

        {/* Métodos de pago */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { marginBottom: 12 }]}>Elige tu método de pago</Text>

          <PayOption
            label="Pagar con efectivo"
            icon="💰"
            selected={formData.metodoPago === 'Efectivo'}
            onPress={() => handleSelectMetodo('Efectivo')}
          />

          <PayOption
            label="Pagar con transferencia"
            icon="💳"
            selected={formData.metodoPago === 'Transferencia'}
            onPress={() => handleSelectMetodo('Transferencia')}
          />
        </View>

        {/* Enviar */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Enviar cotización</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  backButtonText: { fontSize: 24, color: '#333', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1 },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  textArea: { height: 80, textAlignVertical: 'top' },

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
  statusIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F39C12', marginRight: 8 },
  statusText: { fontSize: 16, color: '#856404', fontWeight: '500' },

 
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  payOptionActive: {
    backgroundColor: '#4338CA',
    borderColor: '#10AC84',     
    shadowColor: '#10AC84',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  payIcon: { fontSize: 20, marginRight: 12, color: '#fff' },
  payTitle: { color: '#E5E7EB', fontSize: 16, fontWeight: '600', flex: 1 },
  payTitleActive: { color: '#FFFFFF' },

  // Radio de selección (derecha)
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: '#FFFFFF' },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },

  submitButton: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default CotizacionScreen;
