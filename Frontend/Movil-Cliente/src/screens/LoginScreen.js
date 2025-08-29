import React, { useState, useEffect } from 'react';
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
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import SocialButton from '../components/SocialButton';
import { useAuth } from '../context/authContext';

// Necesario para iOS
WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // 🆕 NUEVO ESTADO
  const navigation = useNavigation();
  const { login } = useAuth();

  // 🆕 CONFIGURACIÓN DE GOOGLE AUTH
  const googleClientId = Constants.expoConfig?.extra?.googleClientId || 
                         'TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: googleClientId,
      scopes: ['openid', 'profile', 'email'],
      additionalParameters: {},
      extraParams: {
        nonce: Math.random().toString(36).substring(2, 15),
      },
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
    }
  );

  // 🆕 MANEJAR RESPUESTA DE GOOGLE
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleAuthSuccess(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      console.error('Error de Google Auth:', response.error);
      Alert.alert('Error', 'Error en la autenticación con Google');
      setIsGoogleLoading(false);
    } else if (response?.type === 'dismiss') {
      setIsGoogleLoading(false);
    }
  }, [response]);

  // 🆕 FUNCIÓN PARA PROCESAR ÉXITO DE GOOGLE
  const handleGoogleAuthSuccess = async (accessToken) => {
    try {
      console.log('🔍 Obteniendo información de Google...');
      
      const userResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) {
        throw new Error('Error al obtener información de Google');
      }

      const googleUser = await userResponse.json();
      console.log('👤 Usuario de Google:', googleUser);

      await loginWithGoogle(googleUser, accessToken);

    } catch (error) {
      console.error('❌ Error en Google Auth:', error);
      Alert.alert('Error', 'No se pudo completar el login con Google');
      setIsGoogleLoading(false);
    }
  };

  // 🆕 FUNCIÓN PARA LOGIN CON GOOGLE
  const loginWithGoogle = async (googleUser, googleToken) => {
    try {
      console.log('🚀 Enviando datos de Google al backend...');
      
      const response = await fetch('https://riveraproject-5.onrender.com/api/login/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          googleToken,
          googleUser,
        }),
      });

      console.log('📡 Status de respuesta Google:', response.status);
      const data = await response.json();
      console.log('📡 Respuesta del servidor Google:', data);

      if (response.ok && data.token) {
        console.log('✅ Login con Google exitoso');
        
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
          routes: [{ name: 'Main' }],
        });

      } else {
        console.log('❌ Error en login con Google');
        Alert.alert('Error', data.message || 'Error en el login con Google');
      }

    } catch (error) {
      console.error('❌ Error enviando a backend:', error);
      Alert.alert('Error', 'Error de conexión con el servidor');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // TU FUNCIÓN DE LOGIN ORIGINAL (sin cambios)
  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const loginData = {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      };

      console.log('🔐 Iniciando proceso de login...');
      console.log('📧 Email limpio:', loginData.email);
      console.log('🔒 Password length:', loginData.password.length);
      console.log('🔒 Password (primeros 3 chars):', loginData.password.substring(0, 3) + '***');
      
      console.log('🔍 Email tiene espacios?', loginData.email.includes(' '));
      console.log('🔍 Password tiene espacios al inicio/final?', password !== password.trim());
      console.log('🔍 Password caracteres especiales:', /[^a-zA-Z0-9]/.test(loginData.password));
      
      console.log('🔍 Password char codes:', [...loginData.password].map(char => ({char, code: char.charCodeAt(0)})));
      
      const response = await fetch('https://riveraproject-5.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
          routes: [{ name: 'Main' }],
        });

      } else {
        console.log('❌ Login fallido');
        console.log('📄 Mensaje específico:', data.message);
        console.log('🔢 Intentos restantes:', data.attemptsRemaining);
        console.log('🚫 Está bloqueado:', data.blocked);
        
        if (data.debug) {
          console.log('🔍 Debug del servidor:', data.debug);
        }
        
        Alert.alert('❌ Error de Login', data.message);
      }

    } catch (error) {
      console.error('❌ Error en login:', error);
      console.error('❌ Error stack:', error.stack);
      Alert.alert('❌ Error', 'Error de conexión: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
    navigation.navigate('InicioRecuperar');
  };

  // 🔄 FUNCIÓN GOOGLE LOGIN ACTUALIZADA
  const handleGoogleLogin = async () => {
    if (!request) {
      Alert.alert('Error', 'Google Login no está configurado correctamente');
      return;
    }

    try {
      setIsGoogleLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Error iniciando Google Login:', error);
      Alert.alert('Error', 'Error al iniciar Google Login');
      setIsGoogleLoading(false);
    }
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
          <Text style={styles.title}>Bienvenido de vuelta!</Text>
          <Text style={styles.subtitle}>Acceso exclusivo para clientes</Text>

          <View style={styles.form}>
            <CustomInput
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              iconName="person"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading && !isGoogleLoading} // 🔄 ACTUALIZADO
            />

            <CustomInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              iconName="lock"
              editable={!isLoading && !isGoogleLoading} // 🔄 ACTUALIZADO
            />

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              disabled={isLoading || isGoogleLoading} // 🔄 ACTUALIZADO
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <CustomButton
              title={isLoading ? "Iniciando sesión..." : "Login"}
              onPress={handleLogin}
              backgroundColor={isLoading ? "#A5D6A7" : "#4CAF50"}
              disabled={isLoading || isGoogleLoading} // 🔄 ACTUALIZADO
            />

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>Verificando credenciales...</Text>
              </View>
            )}
          </View>

          {!isLoading && (
            <View style={styles.socialContainer}>
              <Text style={styles.socialText}>O inicia sesión con</Text>
              
              <View style={styles.socialButtons}>
                <SocialButton 
                  type="google" 
                  onPress={handleGoogleLogin}
                  disabled={isGoogleLoading || !request} // 🆕 AGREGADO
                />
                <SocialButton 
                  type="facebook" 
                  onPress={handleFacebookLogin}
                  disabled={isLoading || isGoogleLoading} // 🆕 AGREGADO
                />
              </View>

              {/* 🆕 GOOGLE LOADING */}
              {isGoogleLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#DB4437" />
                  <Text style={styles.loadingText}>Conectando con Google...</Text>
                </View>
              )}
            </View>
          )}

          {!isLoading && !isGoogleLoading && ( // 🔄 ACTUALIZADO
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

// TUS ESTILOS ORIGINALES (sin cambios)
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