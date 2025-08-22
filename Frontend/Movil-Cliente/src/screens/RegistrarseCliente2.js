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

// ✅ CONFIGURACIÓN DE LA API - CORREGIDA
const API_BASE_URL = 'https://riveraproject-5.onrender.com';

const RegistrarseCliente2 = ({ navigation, route }) => {
  // ✅ OBTENER DATOS DE LA PANTALLA ANTERIOR
  const { email, password } = route.params || {};

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dui, setDui] = useState('');
  const [phone, setPhone] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return false;
    }
    
    if (!lastName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu apellido');
      return false;
    }
    
    if (!dui.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu DUI');
      return false;
    }

    if (dui.length !== 10) {
      Alert.alert('Error', 'El DUI debe tener exactamente 9 dígitos (formato: 12345678-9)');
      return false;
    }

    // Validar formato de DUI
    const duiPattern = /^\d{8}-\d$/;
    if (!duiPattern.test(dui)) {
      Alert.alert('Error', 'El DUI debe tener el formato correcto (12345678-9)');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu teléfono');
      return false;
    }

    if (phone.length !== 9) {
      Alert.alert('Error', 'El teléfono debe tener 8 dígitos (formato: 1234-5678)');
      return false;
    }

    // Validar formato de teléfono
    const phonePattern = /^\d{4}-\d{4}$/;
    if (!phonePattern.test(phone)) {
      Alert.alert('Error', 'El teléfono debe tener el formato correcto (1234-5678)');
      return false;
    }

    if (!fechaNacimiento.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu fecha de nacimiento');
      return false;
    }

    if (fechaNacimiento.length !== 10) {
      Alert.alert('Error', 'La fecha debe tener el formato DD/MM/AAAA');
      return false;
    }

    // Validar formato y rango de fecha
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(fechaNacimiento)) {
      Alert.alert('Error', 'La fecha debe tener el formato DD/MM/AAAA');
      return false;
    }

    const [day, month, year] = fechaNacimiento.split('/').map(Number);
    if (day < 1 || day > 31) {
      Alert.alert('Error', 'El día debe estar entre 1 y 31');
      return false;
    }
    if (month < 1 || month > 12) {
      Alert.alert('Error', 'El mes debe estar entre 1 y 12');
      return false;
    }
    if (year < 1900 || year > new Date().getFullYear()) {
      Alert.alert('Error', 'El año debe ser válido');
      return false;
    }

    // Validar que la fecha sea válida
    const birthDate = new Date(year, month - 1, day);
    if (birthDate.getDate() !== day || birthDate.getMonth() !== month - 1 || birthDate.getFullYear() !== year) {
      Alert.alert('Error', 'La fecha ingresada no es válida');
      return false;
    }

    // Validar edad mínima (ejemplo: 18 años)
    const today = new Date();
    const age = today.getFullYear() - year;
    if (age < 18) {
      Alert.alert('Error', 'Debes ser mayor de 18 años para registrarte');
      return false;
    }

    if (!direccion.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu dirección');
      return false;
    }

    return true;
  };

  const formatDUI = (text) => {
    // Eliminar todo lo que no sea número
    const cleaned = text.replace(/\D/g, '');
    
    // Limitar a 9 dígitos máximo
    const truncated = cleaned.substring(0, 9);
    
    // Formatear con guión después del 8vo dígito
    if (truncated.length >= 8) {
      return truncated.substring(0, 8) + '-' + truncated.substring(8);
    }
    return truncated;
  };

  const formatDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 4) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4) + '/' + cleaned.substring(4, 8);
    } else if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    return cleaned;
  };

  const formatPhone = (text) => {
    // Eliminar todo lo que no sea número
    const cleaned = text.replace(/\D/g, '');
    
    // Limitar a 8 dígitos máximo
    const truncated = cleaned.substring(0, 8);
    
    // Formatear con guión después del 4to dígito
    if (truncated.length >= 4) {
      return truncated.substring(0, 4) + '-' + truncated.substring(4);
    }
    return truncated;
  };

  // ✅ FUNCIÓN PARA CONECTAR CON EL BACKEND - RUTA CORREGIDA
  const registerUser = async (userData) => {
    try {
      console.log('🚀 Enviando datos al backend:', userData);
      // ✅ RUTA CORREGIDA: Cambiada de /clientes/register a /api/register
      const url = `${API_BASE_URL}/api/register-cliente`;
      console.log('🌐 URL completa:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('📊 Status de respuesta:', response.status);
      console.log('📊 Status text:', response.statusText);

      // ✅ VERIFICAR SI LA RESPUESTA ES JSON
      const contentType = response.headers.get('content-type');
      console.log('📊 Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        // Si no es JSON, leer como texto para ver qué está devolviendo
        const textResponse = await response.text();
        console.error('❌ Respuesta no es JSON:', textResponse);
        return { 
          success: false, 
          error: `Servidor no respondió JSON. Respuesta: ${textResponse.substring(0, 100)}...` 
        };
      }

      const result = await response.json();
      console.log('📋 Respuesta del servidor:', result);

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.Message || result.message || 'Error desconocido' };
      }
      
    } catch (error) {
      console.error('💥 Error de conexión:', error);
      console.error('💥 Tipo de error:', error.name);
      console.error('💥 Mensaje de error:', error.message);
      
      if (error.name === 'SyntaxError' && error.message.includes('JSON Parse error')) {
        return { 
          success: false, 
          error: 'El servidor no está respondiendo correctamente. Verifica que esté corriendo y la URL sea correcta.' 
        };
      }
      
      return { 
        success: false, 
        error: `Error de conexión: ${error.message}` 
      };
    }
  };

  const handleCreateAccount = async () => {
    console.log('🚀 INICIANDO REGISTRO...');

    if (!validateForm()) {
      console.log('❌ Validación fallida');
      return;
    }

    // ✅ VERIFICAR QUE TENEMOS LOS DATOS DE LA PANTALLA ANTERIOR
    if (!email || !password) {
      Alert.alert('Error', 'Faltan datos del email o contraseña. Regresa a la pantalla anterior.');
      return;
    }

    setLoading(true);
    try {
      // ✅ CONVERTIR FECHA AL FORMATO QUE ESPERA EL BACKEND
      const convertDateFormat = (dateStr) => {
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/');
          // Validar que todos los componentes sean números
          const dayNum = parseInt(day, 10);
          const monthNum = parseInt(month, 10);
          const yearNum = parseInt(year, 10);
          
          if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
            throw new Error('Fecha inválida');
          }
          
          return `${yearNum}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
        }
        return dateStr;
      };

      // ✅ MAPEAR DATOS DEL FRONTEND AL FORMATO DEL BACKEND
      const userData = {
        firstName: firstName.trim(),      // ⚠️ NOTA: Tu backend usa 'firtsName' (con typo)
        lastName: lastName.trim(),
        email: email.trim(),
        idNumber: dui.trim(),            // DUI → idNumber
        birthDate: convertDateFormat(fechaNacimiento), // Fecha convertida
        password: password.trim(),
        phone: phone.trim(),
        address: direccion.trim()        // direccion → address
      };
      
      console.log('📝 Datos a enviar:', userData);
      
      // ✅ LLAMAR AL BACKEND
      const result = await registerUser(userData);
      
      if (result.success) {
        console.log('✅ Registro exitoso!');
        
        Alert.alert(
          'Éxito', 
          '¡Cuenta creada exitosamente!', 
          [
            { 
              text: 'Continuar', 
              onPress: () => {
                console.log('🎯 Navegando a pantalla de carga');
                navigation.navigate('pantallacarga1');
              }
            }
          ]
        );
      } else {
        console.error('❌ Error en el registro:', result.error);
        Alert.alert('Error', result.error);
      }
      
    } catch (error) {
      console.error('💥 Exception durante el registro:', error);
      Alert.alert('Error', 'No se pudo crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    console.log('⬅️ Botón Atrás presionado');
    navigation.goBack();
  };

  const handleDUIChange = (text) => {
    const formatted = formatDUI(text);
    setDui(formatted);
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhone(text);
    setPhone(formatted);
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
          
          {/* ✅ DEBUG: Mostrar email recibido (remover en producción) */}
          {__DEV__ && (
            <View style={{ backgroundColor: '#f0f0f0', padding: 10, marginBottom: 10, borderRadius: 5 }}>
              <Text style={{ fontSize: 12, color: '#333' }}>
                DEBUG: Email recibido: {email}
              </Text>
            </View>
          )}
          
          {/* Campo Primer Nombre */}
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Primer nombre"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              placeholderTextColor="#999"
            />
          </View>

          {/* Campo Apellido */}
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Apellido"
              value={lastName}
              onChangeText={setLastName}
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

          {/* Campo Teléfono */}
          <View style={styles.inputContainer}>
            <Icon name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Teléfono (1234-5678)"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="numeric"
              maxLength={9}
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
              <View style={styles.dotInactive} />
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

export default RegistrarseCliente2;