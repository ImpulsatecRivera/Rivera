import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import SocialButton from '../components/SocialButton';
import { useAuth } from '../contenxt/authContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  // 🔐 FUNCIÓN DE LOGIN
  const handleLogin = async () => {
    // Validar campos vacíos
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        '⚠️ Campos requeridos',
        'Por favor ingresa tu email y contraseña'
      );
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        '⚠️ Email inválido',
        'Por favor ingresa un email válido'
      );
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Iniciando proceso de login...');
      
      // Llamar a la API de login
      const response = await fetch('http://192.168.1.100:4000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();
      console.log('📡 Respuesta del servidor:', data);

      // ✅ CAMBIO PRINCIPAL: Verificar response.ok en lugar de data.success
      if (response.ok && data.message === "Inicio de sesión completado") {
        // ✅ LOGIN EXITOSO
        console.log('✅ Login exitoso');
        console.log('👤 Tipo de usuario:', data.userType);

        // 🚨 VALIDAR QUE SOLO SEAN CLIENTES
        if (data.userType !== 'Cliente') {
          Alert.alert(
            '🚫 Acceso Denegado',
            `Esta aplicación es solo para clientes. Tu tipo de usuario es: ${data.userType}`
          );
          setIsLoading(false);
          return;
        }

        try {
          // Guardar en contexto (AuthContext maneja la persistencia)
          const loginResult = await login({
            token: data.token, // Nota: el servidor podría no estar enviando token en la respuesta JSON
            user: data.user,
            userType: data.userType
          });

          if (loginResult && loginResult.success !== false) {
            console.log('🎉 Login completado exitosamente');
            
            // 🚀 NAVEGAR AL TABNAVIGATOR (MAIN) - CORREGIDO
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }], // ✅ Correcto: 'Main' es el TabNavigator
            });
            
          } else {
            Alert.alert(
              '❌ Error',
              'Error al guardar la sesión. Inténtalo de nuevo.'
            );
          }
        } catch (authError) {
          console.error('Error en AuthContext:', authError);
          // Aún así navegar si el login fue exitoso en el servidor
          console.log('🚀 Navegando al Dashboard a pesar del error de contexto');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }], // ✅ Correcto: 'Main' es el TabNavigator
          });
        }

      } else {
        // ❌ ERROR DEL SERVIDOR
        let errorMessage = 'Error de conexión';
        
        if (data.message) {
          errorMessage = data.message;
        } else if (response.status === 401) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (response.status === 400) {
          errorMessage = 'Datos inválidos. Verifica tus credenciales.';
        } else if (response.status >= 500) {
          errorMessage = 'Error del servidor. Inténtalo más tarde.';
        }

        Alert.alert('❌ Error de Login', errorMessage);
      }

    } catch (error) {
      console.error('❌ Error en login:', error);
      
      let errorMessage = 'Error de conexión';
      if (error.message.includes('Network')) {
        errorMessage = 'Sin conexión a internet. Verifica tu conexión.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Tiempo de espera agotado. Inténtalo de nuevo.';
      }
      
      Alert.alert('❌ Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
    navigation.navigate('InicioRecuperar');
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Próximamente',
      'El login con Google estará disponible pronto'
    );
  };

  const handleFacebookLogin = () => {
    Alert.alert(
      'Próximamente',
      'El login con Facebook estará disponible pronto'
    );
  };

  const handleRegister = () => {
    console.log('Register pressed');
    navigation.navigate('RegistrarseCliente');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>Bienvenido de vuelta!</Text>
          <Text style={styles.subtitle}>Acceso exclusivo para clientes</Text>

          {/* Form */}
          <View style={styles.form}>
            <CustomInput
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              iconName="person"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <CustomInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              iconName="lock"
              editable={!isLoading}
            />

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <CustomButton
              title={isLoading ? "Iniciando sesión..." : "Login"}
              onPress={handleLogin}
              backgroundColor={isLoading ? "#A5D6A7" : "#4CAF50"}
              disabled={isLoading}
            />

            {/* Loading indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>Verificando credenciales...</Text>
              </View>
            )}
          </View>

          {/* Social Login */}
          {!isLoading && (
            <View style={styles.socialContainer}>
              <Text style={styles.socialText}>O inicia sesión con</Text>
              
              <View style={styles.socialButtons}>
                <SocialButton 
                  type="google" 
                  onPress={handleGoogleLogin} 
                />
                <SocialButton 
                  type="facebook" 
                  onPress={handleFacebookLogin} 
                />
              </View>
            </View>
          )}

          {/* Register Link */}
          {!isLoading && (
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>Regístrate</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    marginBottom: 30,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  socialContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  socialText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;