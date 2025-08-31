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
import * as WebBrowser from 'expo-web-browser';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import SocialButton from '../components/SocialButton';
import { useAuth } from '../context/authContext';

// ❌ NO IMPORTES ESTO EN REACT NATIVE:
// import jwt from "jsonwebtoken"; // ESTO CAUSA EL ERROR

// Necesario para iOS
WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigation = useNavigation();
  const { login, needsGoogleProfileCompletion } = useAuth();

  const googleClientId = '1035488574954-2agjnnugu7d1lnhen68e6n06lvfdip3u.apps.googleusercontent.com';
  const redirectUri = 'https://auth.expo.io/@fitoDev/movil-cliente';

  // Google OAuth con OpenID Connect
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);

      const state = Math.random().toString(36).substring(2, 15);
      const nonce = Math.random().toString(36).substring(2, 15);

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=id_token%20token&` +
        `scope=openid%20profile%20email&` +
        `state=${state}&` +
        `nonce=${nonce}&` +
        `prompt=consent`;

      console.log('🔗 URL OAuth construida:', authUrl);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      console.log('📱 Resultado de WebBrowser:', result);

      if (result.type === 'success' && result.url) {
        const url = result.url;

        const accessTokenMatch = url.match(/access_token=([^&]*)/);
        const idTokenMatch = url.match(/id_token=([^&]*)/);

        if (accessTokenMatch && idTokenMatch) {
          const accessToken = accessTokenMatch[1];
          const idToken = idTokenMatch[1];

          console.log('✅ Tokens extraídos:');
          console.log('Access Token:', accessToken);
          console.log('ID Token:', idToken);

          // ✅ CAMBIO PRINCIPAL: Usar directamente el idToken
          await handleGoogleSuccess(idToken);
        } else {
          console.error('❌ No se encontraron tokens en la URL:', url);
          Alert.alert('Error', 'No se pudo obtener los tokens de autenticación');
          setIsGoogleLoading(false);
        }
      } else {
        console.log('🚫 Usuario canceló o error en OAuth');
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error('❌ Error en Google Login:', error);
      Alert.alert('Error', 'No se pudo iniciar el login con Google');
      setIsGoogleLoading(false);
    }
  };

  // ✅ MÉTODO SIMPLIFICADO - Solo necesita el idToken
  const handleGoogleSuccess = async (idToken) => {
    try {
      console.log('🔍 Enviando idToken al backend...');

      // ✅ ESTRUCTURA CORRECTA PARA EL NUEVO BACKEND
      const backendResponse = await fetch('https://riveraproject-5.onrender.com/api/login/GoogleLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleToken: idToken, // ✅ Coincide con lo que espera el backend
        }),
      });

      const backendData = await backendResponse.json();
      console.log('📡 Respuesta del backend:', backendData);

      if (backendResponse.ok && backendData.token) {
        console.log('✅ Login con Google exitoso');

        // ✅ VERIFICAR SI NECESITA COMPLETAR PERFIL
        if (backendData.user?.needsProfileCompletion) {
          Alert.alert(
            'Completar Perfil',
            'Para continuar, necesitas completar tu información personal.',
            [
              {
                text: 'Ahora no',
                style: 'cancel',
                onPress: () => {
                  // Aun así permitir el login
                  proceedWithLogin(backendData);
                }
              },
              {
                text: 'Completar',
                onPress: () => {
                  // Guardar datos temporalmente y navegar a completar perfil
                  proceedWithLogin(backendData, true);
                }
              }
            ]
          );
        } else {
          proceedWithLogin(backendData);
        }
      } else {
        console.error('❌ Error del backend:', backendData);
        Alert.alert('Error', backendData.error || backendData.message || 'Error en el servidor');
      }
    } catch (error) {
      console.error('❌ Error en handleGoogleSuccess:', error);
      Alert.alert('Error', 'Error de conexión: ' + error.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ✅ FUNCIÓN AUXILIAR PARA PROCESAR EL LOGIN CON NUEVAS FUNCIONES
  const proceedWithLogin = async (backendData, needsProfileCompletion = false) => {
    try {
      const result = await login({
        token: backendData.token,
        user: backendData.user,
        userType: backendData.userType,
      });

      if (result?.success) {
        // ✅ USAR LA NUEVA FUNCIÓN DEL AUTHCONTEXT
        if (needsProfileCompletion || needsGoogleProfileCompletion()) {
          Alert.alert(
            'Completar Perfil',
            'Para usar todas las funciones de la app, completa tu información personal.',
            [
              {
                text: 'Después',
                style: 'cancel',
                onPress: () => {
                  navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
                }
              },
              {
                text: 'Completar',
                onPress: () => {
                  navigation.navigate('CompleteProfile', {
                    user: backendData.user,
                    token: backendData.token
                  });
                }
              }
            ]
          );
        } else {
          // Navegar a la pantalla principal
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        }
      } else {
        Alert.alert('Error', result?.error || 'No se pudo guardar la sesión');
      }
    } catch (error) {
      console.error('❌ Error en proceedWithLogin:', error);
      Alert.alert('Error', 'Error al procesar el login');
    }
  };

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

      const response = await fetch('https://riveraproject-5.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok && data.message === "Inicio de sesión completado") {
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
        // ✅ MEJORAR MANEJO DE ERRORES
        if (data.blocked) {
          Alert.alert(
            'Cuenta Bloqueada',
            data.message,
            [{ text: 'OK', style: 'default' }]
          );
        } else if (data.attemptsRemaining !== undefined) {
          Alert.alert(
            'Credenciales Incorrectas',
            data.message,
            [{ text: 'OK', style: 'default' }]
          );
        } else {
          Alert.alert('Error de Login', data.message);
        }
      }
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert('Error', 'Error de conexión: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('InicioRecuperar');
  };

  const handleFacebookLogin = () => {
    Alert.alert('Próximamente', 'El login con Facebook estará disponible pronto');
  };

  const handleRegister = () => {
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
              editable={!isLoading && !isGoogleLoading}
            />

            <CustomInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              iconName="lock"
              editable={!isLoading && !isGoogleLoading}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              disabled={isLoading || isGoogleLoading}
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <CustomButton
              title={isLoading ? "Iniciando sesión..." : "Login"}
              onPress={handleLogin}
              backgroundColor={isLoading ? "#A5D6A7" : "#4CAF50"}
              disabled={isLoading || isGoogleLoading}
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
                  disabled={isGoogleLoading}
                />
                <SocialButton
                  type="facebook"
                  onPress={handleFacebookLogin}
                  disabled={isLoading || isGoogleLoading}
                />
              </View>

              {isGoogleLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#DB4437" />
                  <Text style={styles.loadingText}>Conectando con Google...</Text>
                </View>
              )}
            </View>
          )}

          {!isLoading && !isGoogleLoading && (
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