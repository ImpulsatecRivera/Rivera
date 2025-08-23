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
import { useAuth } from '../context/authContext'; // <-- CAMBIO 1: ruta corregida

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  // 🔐 FUNCIÓN DE LOGIN
  // En tu LoginScreen.js, agrega este debugging:

  const handleLogin = async () => {
    // Validaciones...

    setIsLoading(true);

    try {
      const loginData = {
        email: email.trim(),
        password: password.trim(),
      };

      console.log('🔐 Iniciando proceso de login...');
      console.log('📧 Email limpio:', loginData.email);
      console.log('🔒 Password length:', loginData.password.length);
      console.log('🔒 Password (primeros 3 chars):', loginData.password.substring(0, 3) + '***');
      
      const response = await fetch('https://riveraproject-5.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      console.log('📡 Status de respuesta:', response.status);
      console.log('📡 Status text:', response.statusText);

      const data = await response.json();
      console.log('📡 Respuesta completa del servidor:');
      console.log(JSON.stringify(data, null, 2));

      if (response.ok && data.message === "Inicio de sesión completado") {
        console.log('✅ Login exitoso');
        // CAMBIO 2: guardar sesión y entrar a la app
        const result = await login({
          token: data.token,
          user: data.user,
          userType: data.userType,
        });

        if (!result?.success) {
          Alert.alert('Error', result?.error || 'No se pudo guardar la sesión');
          return;
        }

        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }], // usa 'pantallacarga1' si quieres pasar por esa pantalla
        });

      } else {
        console.log('❌ Login fallido');
        console.log('📄 Mensaje específico:', data.message);
        console.log('🔢 Intentos restantes:', data.attemptsRemaining);
        console.log('🚫 Está bloqueado:', data.blocked);
        
        Alert.alert('❌ Error de Login', data.message);
      }

    } catch (error) {
      console.error('❌ Error en login:', error);
      Alert.alert('❌ Error', 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
    // ✅ RESTAURAR ESTA LÍNEA:
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
