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
import { useAuth } from '../Context/authContext';

const InicioSesionScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('🔐 Iniciando sesión...', { email });
      
      // ✅ IP CONFIGURADA CORRECTAMENTE
      const API_URL = 'http://192.168.1.100:4000/api/login';
      
      console.log('🌐 Conectando a:', API_URL);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message || 'Error al iniciar sesión');
        return;
      }

      console.log('✅ Login exitoso:', data);

      // Verificar que solo motoristas puedan acceder a esta app
      if (data.userType !== 'Motorista') {
        Alert.alert(
          'Acceso Denegado', 
          'Esta aplicación es exclusiva para motoristas. Tu tipo de usuario no tiene acceso.',
          [{ text: 'Entendido', style: 'cancel' }]
        );
        return;
      }

      // Guardar información en el contexto
      await login({
        user: data.user,
        userType: data.userType,
        token: data.token || null, // Si el token viene en la respuesta
      });

      console.log('🚀 Navegando a onboarding...');
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      // Manejo específico de errores de red
      if (error.message === 'Network request failed') {
        Alert.alert(
          'Error de Conexión', 
          '🔴 No se pudo conectar al servidor.\n\n' +
          'Pasos para solucionarlo:\n' +
          '1. Verifica que tu servidor esté corriendo en puerto 4000\n' +
          '2. Cambia "192.168.1.XXX" por la IP real de tu PC\n' +
          '3. Asegúrate de estar en la misma red WiFi\n\n' +
          'IP actual configurada: 192.168.1.100:4000'
        );
      } else if (error.name === 'TypeError') {
        Alert.alert(
          'Error de Red', 
          'Problema de conectividad. Verifica tu conexión a internet.'
        );
      } else {
        Alert.alert('Error', 'No se pudo iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('Recuperacion');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authContainer}>
          <Text style={styles.title}>¡Bienvenido de{'\n'}vuelta!</Text>
          
          {/* Mensaje informativo */}
          <View style={styles.infoContainer}>
            <Icon name="information-circle" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>
              Esta aplicación es exclusiva para motoristas
            </Text>
          </View>
          
          {/* Campo Email */}
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Email del motorista"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* Campo Contraseña */}
          <View style={styles.inputContainer}>
            <Icon name="key-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#999"
              editable={!loading}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              disabled={loading}
            >
              <Icon 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* Enlace olvidar contraseña */}
          <TouchableOpacity 
            onPress={handleForgotPassword} 
            style={styles.forgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {/* Botón de login */}
          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.loadingText}>Verificando credenciales...</Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
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
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  infoText: {
    fontSize: 14,
    color: '#0369a1',
    marginLeft: 8,
    fontWeight: '500',
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
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#3b82f6',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default InicioSesionScreen;