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
import { useIdTokenAuthRequest } from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import SocialButton from '../components/SocialButton';
import { useAuth } from '../context/authContext';

// Configuración para WebBrowser
WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  // Configuración específica para tu backend
  const [request, response, promptAsync] = useIdTokenAuthRequest(
    {
      clientId: '381380616869-00n79jsmvdtc333v1drbfktj7mjpne4u.apps.googleusercontent.com',
      selectAccount: true,
    }
  );

  // Manejar la respuesta de Google
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      console.log('✅ [GOOGLE] ID Token recibido');
      handleGoogleSuccess(id_token);
    } else if (response?.type === 'error') {
      console.error('❌ [GOOGLE ERROR]:', response.error);
      setIsGoogleLoading(false);
      Alert.alert('Error', `Error en autorización: ${response.error?.message || 'Desconocido'}`);
    } else if (response?.type === 'cancel') {
      console.log('🚫 [GOOGLE] Usuario canceló');
      setIsGoogleLoading(false);
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      console.log('🔍 [GOOGLE LOGIN] Iniciando...');

      if (!request) {
        console.error('❌ [NO REQUEST] Request no disponible');
        Alert.alert('Error', 'Configuración no lista, intenta nuevamente');
        setIsGoogleLoading(false);
        return;
      }

      console.log('🚀 [PROMPT] Abriendo Google Auth...');
      const result = await promptAsync();
      
      if (result.type === 'dismiss') {
        setIsGoogleLoading(false);
      }

    } catch (error) {
      console.error('💥 [GOOGLE LOGIN ERROR]:', error);
      Alert.alert('Error', 'Error iniciando Google Auth: ' + error.message);
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleToken) => {
    try {
      console.log('🔍 [BACKEND] Enviando token a tu backend...');

      const response = await fetch('https://riveraproject-5.onrender.com/api/login/GoogleLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          googleToken: googleToken // Tu backend espera este formato
        }),
      });

      console.log('📡 [RESPONSE] Status:', response.status);
      const data = await response.json();

      if (response.ok && data.token) {
        console.log('✅ [LOGIN SUCCESS] Éxito');
        
        const result = await login({
          token: data.token,
          user: data.user,
          userType: data.userType,
        });

        if (result?.success) {
          if (data.user?.needsProfileCompletion) {
            Alert.alert(
              'Completar Perfil',
              'Para usar todas las funciones, completa tu información personal.',
              [
                { 
                  text: 'Después', 
                  onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
                },
                { 
                  text: 'Completar', 
                  onPress: () => navigation.navigate('CompleteProfile', { user: data.user, token: data.token })
                }
              ]
            );
          } else {
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
          }
        } else {
          Alert.alert('Error', result?.error || 'Error guardando sesión');
        }
      } else {
        console.error('❌ [BACKEND ERROR]:', data);
        Alert.alert('Error', data.error || data.message || 'Error del servidor');
      }
    } catch (error) {
      console.error('💥 [BACKEND ERROR]:', error);
      Alert.alert('Error', 'Error de conexión: ' + error.message);
    } finally {
      setIsGoogleLoading(false);
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
      const response = await fetch('https://riveraproject-5.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
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
        if (data.blocked) {
          Alert.alert('Cuenta Bloqueada', data.message);
        } else if (data.attemptsRemaining !== undefined) {
          Alert.alert('Credenciales Incorrectas', data.message);
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

  const handleForgotPassword = () => navigation.navigate('InicioRecuperar');
  const handleFacebookLogin = () => Alert.alert('Próximamente', 'El login con Facebook estará disponible pronto');
  const handleRegister = () => navigation.navigate('RegistrarseCliente');

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
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
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
                  disabled={isGoogleLoading || !request}
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
                  <Text style={styles.loadingText}>Autenticando con Google...</Text>
                </View>
              )}

              {!request && (
                <Text style={styles.debugText}>
                  Configurando autenticación...
                </Text>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  form: { marginBottom: 30 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { color: '#007AFF', fontSize: 14 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  loadingText: { marginLeft: 8, color: '#666', fontSize: 14 },
  socialContainer: { alignItems: 'center', marginBottom: 30 },
  socialText: { color: '#666', fontSize: 14, marginBottom: 20 },
  socialButtons: { flexDirection: 'row', justifyContent: 'center' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { color: '#666', fontSize: 14 },
  registerLink: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
  debugText: { color: '#999', fontSize: 12, marginTop: 8, textAlign: 'center' },
});

export default LoginScreen;