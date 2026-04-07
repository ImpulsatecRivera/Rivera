import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../Context/authContext';

const { width, height } = Dimensions.get('window');

const InicioSesionScreen = ({ navigation }) => {
  const [dui, setDui] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ✅ FORMATO DUI
  const formatDUI = (text) => {
    const numbers = text.replace(/[^0-9]/g, '');
    const limited = numbers.slice(0, 9);
    if (limited.length > 8) {
      return `${limited.slice(0, 8)}-${limited.slice(8)}`;
    }
    return limited;
  };

  const handleDuiChange = (text) => {
    setDui(formatDUI(text));
  };

  const validateForm = () => {
    const duiSinGuion = dui.replace(/-/g, '');

    if (!duiSinGuion || duiSinGuion.length !== 9) {
      Alert.alert('Error', 'El DUI debe tener 9 dígitos');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Ingresa tu contraseña');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const API_URL = 'https://rivera-test.onrender.com/api';
      
      // 🔥 PRUEBA DIFERENTES ENDPOINTS POSIBLES
      const posiblesEndpoints = [
        `${API_URL}/auth/login`,
        `${API_URL}/login`,
        `${API_URL}/usuarios/login`,
        `${API_URL}/user/login`,
      ];

      console.log('🔄 Intentando login...');
      console.log('📤 DUI:', dui.trim());

      let loginExitoso = false;
      let ultimoError = null;

      // Intenta cada endpoint hasta que uno funcione
      for (const endpoint of posiblesEndpoints) {
        try {
          console.log(`\n🌐 Probando endpoint: ${endpoint}`);

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              dui: dui.trim(),
              password: password.trim(),
            }),
          });

          console.log(`📥 Status: ${response.status}`);

          // Verifica el content-type antes de parsear
          const contentType = response.headers.get('content-type');
          console.log(`📋 Content-Type: ${contentType}`);

          if (!contentType || !contentType.includes('application/json')) {
            console.log('⚠️ Respuesta no es JSON, probando siguiente endpoint...');
            continue;
          }

          const data = await response.json();
          console.log('📦 Datos recibidos:', JSON.stringify(data, null, 2));

          if (response.ok && (data.token || data.success)) {
            console.log('✅ Login exitoso!');
            
            // 🎯 Login exitoso
            await login({
              user: data.user || data.usuario || data.data,
              token: data.token,
              userType: data.userType || data.user?.userType || data.user?.rol || 'motorista',
            });

            loginExitoso = true;
            break; // Salir del loop si fue exitoso
          } else {
            // El endpoint respondió pero hubo error
            ultimoError = data.message || 'Credenciales incorrectas';
            console.log('❌ Error del servidor:', ultimoError);
            break; // Salir del loop si el endpoint es correcto pero las credenciales no
          }

        } catch (endpointError) {
          console.log(`⚠️ Error en ${endpoint}:`, endpointError.message);
          ultimoError = endpointError;
          // Continúa al siguiente endpoint
        }
      }

      // Si ningún endpoint funcionó
      if (!loginExitoso) {
        throw new Error(ultimoError?.message || 'No se pudo conectar con ningún endpoint');
      }

    } catch (error) {
      console.error('❌ Error final:', error);
      
      let mensajeError = 'No se pudo conectar al servidor';
      
      if (error.message.includes('JSON')) {
        mensajeError = 'Error de comunicación con el servidor. Verifica tu conexión.';
      } else if (error.message.includes('Network')) {
        mensajeError = 'Sin conexión a internet. Verifica tu red.';
      } else if (error.message) {
        mensajeError = error.message;
      }

      Alert.alert('Error de inicio de sesión', mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <LottieView
        source={require('../../assets/lottie/Background Full Screen-Train.json')}
        autoPlay
        loop
        resizeMode="cover"
        style={styles.lottie}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }],
          }}
        >
          <BlurView intensity={45} tint="light" style={styles.card}>
            <Image
              source={require('../images/logo.png')}
              style={styles.logo}
            />

            <Text style={styles.title}>
              Rivera distribuidora y transporte
            </Text>
            <Text style={styles.subtitle}>
              Inicia sesión para continuar
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <Icon name="card-outline" size={16} color="#555" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="DUI (12345678-9)"
                placeholderTextColor="#777"
                value={dui}
                onChangeText={handleDuiChange}
                keyboardType="number-pad"
                maxLength={10}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <Icon name="lock-closed-outline" size={16} color="#555" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#777"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  name={
                    showPassword
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={18}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPill}
              onPress={() =>
                navigation.navigate('elegirMetodoRecuperacion')
              }
              disabled={loading}
            >
              <Icon
                name="help-circle-outline"
                size={14}
                color="#2ecc71"
              />
              <Text style={styles.forgotText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={['#4CAF50', '#2ecc71']}
                style={styles.button}
              >
                {loading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.buttonText}>Conectando...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  lottie: { position: 'absolute', width, height },
  card: {
    width: '85%',
    alignSelf: 'center',
    padding: 24,
    borderRadius: 26,
  },
  logo: {
    width: 64,
    height: 64,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: { flex: 1, fontSize: 15, color: '#111' },
  forgotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 12,
  },
  forgotText: {
    fontSize: 13,
    color: '#2ecc71',
    marginLeft: 6,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default InicioSesionScreen;