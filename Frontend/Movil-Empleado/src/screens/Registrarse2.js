import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Registrarse2Screen = ({ navigation }) => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [dui, setDui] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!nombreUsuario.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre de usuario');
      return false;
    }
    
    if (!dui.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu DUI');
      return false;
    }

    if (dui.length !== 10) {
      Alert.alert('Error', 'El DUI debe tener 10 dígitos (incluyendo el guión)');
      return false;
    }

    if (!fechaNacimiento.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu fecha de nacimiento');
      return false;
    }

    if (!direccion.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu dirección');
      return false;
    }

    return true;
  };

  const formatDUI = (text) => {
    // Remover todo lo que no sea número
    const cleaned = text.replace(/\D/g, '');
    
    // Aplicar formato: 12345678-9
    if (cleaned.length >= 8) {
      return cleaned.substring(0, 8) + '-' + cleaned.substring(8, 9);
    }
    return cleaned;
  };

  const formatDate = (text) => {
    // Remover todo lo que no sea número
    const cleaned = text.replace(/\D/g, '');
    
    // Aplicar formato: DD/MM/YYYY
    if (cleaned.length >= 4) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4) + '/' + cleaned.substring(4, 8);
    } else if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    return cleaned;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Creando cuenta...', { 
        nombreUsuario, 
        dui, 
        fechaNacimiento, 
        direccion 
      });
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Éxito', 
        '¡Cuenta creada exitosamente!', 
        [
          { 
            text: 'Continuar', 
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            })
          }
        ]
      );
      
    } catch (error) {
      console.error('Error creando cuenta:', error);
      Alert.alert('Error', 'No se pudo crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    console.log('Atrás pressed');
    navigation.goBack();
  };

  const handleDUIChange = (text) => {
    const formatted = formatDUI(text);
    setDui(formatted);
  };

  const handleDateChange = (text) => {
    const formatted = formatDate(text);
    setFechaNacimiento(formatted);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authContainer}>
          <Text style={styles.title}>¡Ya casi{'\n'}terminamos!</Text>
          <Text style={styles.subtitle}>
            Solo necesitamos algunos datos más para completar tu perfil
          </Text>
          
          {/* Campo Nombre del usuario */}
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Nombre del usuario"
              value={nombreUsuario}
              onChangeText={setNombreUsuario}
              autoCapitalize="words"
              placeholderTextColor="#999"
            />
          </View>

          {/* Campo DUI */}
          <View style={styles.inputContainer}>
            <Icon name="card-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="DUI (12345678-9)"
              value={dui}
              onChangeText={handleDUIChange}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#999"
            />
          </View>

          {/* Campo Fecha de nacimiento */}
          <View style={styles.inputContainer}>
            <Icon name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Fecha de nacimiento (DD/MM/AAAA)"
              value={fechaNacimiento}
              onChangeText={handleDateChange}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#999"
            />
          </View>

          {/* Campo Dirección */}
          <View style={[styles.inputContainer, { marginBottom: 24 }]}>
            <Icon name="location-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Dirección completa"
              value={direccion}
              onChangeText={setDireccion}
              multiline={true}
              numberOfLines={2}
              placeholderTextColor="#999"
            />
          </View>

          {/* Texto de términos */}
          <Text style={styles.termsText}>
            Al hacer click en el botón{' '}
            <Text style={styles.termsHighlight}>Crear cuenta</Text>
            ,{'\n'}aceptas la oferta pública y nuestros términos.
          </Text>

          {/* Botón crear cuenta */}
          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleCreateAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Indicadores de página */}
          <View style={styles.pageIndicatorContainer}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Icon name="arrow-back" size={20} color="#9ca3af" />
              <Text style={styles.backText}>Atrás</Text>
            </TouchableOpacity>
            
            <View style={styles.dotsContainer}>
              {/* Indicador página anterior */}
              <View style={styles.dotInactive} />
              {/* Indicador página actual */}
              <View style={styles.dotActive} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 20,
  },
  termsText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  termsHighlight: {
    color: '#ef4444',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    color: '#9ca3af',
    fontSize: 16,
    marginLeft: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4,
  },
});

export default Registrarse2Screen;