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
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/authContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

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
      const response = await fetch('https://riveraproject-production-933e.up.railway.app/api/login', {
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
  const handleRegister = () => navigation.navigate('RegistrarseCliente');

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          
          {/* Background with curved shapes */}
          <View style={styles.backgroundShapes}>
            <View style={styles.curvedShape1} />
            <View style={styles.curvedShape2} />
            <View style={styles.curvedShape3} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            
            {/* Header with title */}
            <View style={styles.headerSection}>
              <Text style={styles.welcomeTitle}>Bienvenido</Text>
              <Text style={styles.welcomeTitle2}>de vuelta</Text>
              
              {/* Lottie Animation */}
              <View style={styles.lottieContainer}>
                <LottieView
                  source={require('../assets/lottie/Man and Woman say Hi !.json')}
                  autoPlay
                  loop={false}
                  style={styles.lottieAnimation}
                />
              </View>
              
              <Text style={styles.subtitle}>Acceso exclusivo para clientes</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <CustomInput
                  placeholder="tu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  style={styles.modernInput}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <CustomInput
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  isPassword={true}
                  editable={!isLoading}
                  style={styles.modernInput}
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotContainer}
                onPress={handleForgotPassword}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

            </View>

            {/* Login Button with circular design */}
            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Login</Text>
                      <View style={styles.arrowContainer}>
                        <Text style={styles.arrow}>→</Text>
                      </View>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Loading State */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Verificando credenciales...</Text>
              </View>
            )}

            {/* Register Section */}
            <View style={styles.footerSection}>
              <TouchableOpacity 
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.7}
                style={styles.registerButton}
              >
                <Text style={styles.registerText}>Crear cuenta</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={isLoading}
                activeOpacity={0.7}
                style={styles.helpButton}
              >
                <Text style={styles.helpText}>¿Necesitas ayuda?</Text>
              </TouchableOpacity>
            </View>

          </View>

        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Background curved shapes
  backgroundShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  curvedShape1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#4CAF50',
    opacity: 0.1,
    transform: [{ rotate: '45deg' }],
  },
  curvedShape2: {
    position: 'absolute',
    top: 150,
    left: -120,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#007AFF',
    opacity: 0.08,
    transform: [{ rotate: '-30deg' }],
  },
  curvedShape3: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#4CAF50',
    opacity: 0.06,
    transform: [{ rotate: '60deg' }],
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    zIndex: 1,
  },

  // Header Section
  headerSection: {
    marginBottom: 60,
  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 48,
    letterSpacing: -1,
  },
  welcomeTitle2: {
    fontSize: 42,
    fontWeight: '300',
    color: '#6B7280',
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: 16,
  },
  
  // Lottie Animation
  lottieContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  lottieAnimation: {
    width: 120,
    height: 120,
  },
  
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '400',
    lineHeight: 24,
  },

  // Form Section
  formSection: {
    marginBottom: 50,
  },
  inputContainer: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  modernInput: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    borderRadius: 0,
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 0,
    fontSize: 16,
    color: '#1F2937',
  },

  // Forgot Password
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: 16,
    paddingVertical: 8,
  },
  forgotText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Button Section
  buttonSection: {
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#1F2937',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 140,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  arrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },

  // Footer Section
  footerSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  registerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  helpButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  helpText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default LoginScreen;