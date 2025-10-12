import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';

const RecuperacionScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState(null);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isOnlyNumbers = (text) => {
    return /^\d+$/.test(text.trim());
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setEmailError('');

    if (text.length > 0) {
      if (isOnlyNumbers(text)) {
        setEmailError('Ingresa un email, no un número');
      } else if (text.length > 3 && !validateEmail(text)) {
        setEmailError('Formato de email inválido');
      }
    }
  };

  const createTimeoutPromise = (ms) => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('TIMEOUT'));
      }, ms);
    });
  };

  const fetchWithTimeout = async (url, options, timeout = 10000) => {
    try {
      const fetchPromise = fetch(url, options);
      const timeoutPromise = createTimeoutPromise(timeout);
      
      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error) {
      if (error.message === 'TIMEOUT') {
        throw new Error('La conexión tardó demasiado. Verifica tu internet e intenta de nuevo.');
      }
      throw error;
    }
  };

  const attemptApiCall = async (retryCount = 0) => {
    const API_URL = 'https://riveraproject-production-933e.up.railway.app/api/recovery/requestCode';
    
    const requestPayload = {
      email: email.trim().toLowerCase(),
    };
    
    console.log(`Intento ${retryCount + 1} - Enviando petición a:`, API_URL);
    console.log('Payload:', requestPayload);

    const response = await fetchWithTimeout(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    }, 10000);

    return response;
  };

  const extractRecoveryToken = (data) => {
    console.log('Buscando token en respuesta:', data);
    
    const possibleTokenFields = [
      'token', 'recoveryToken', 'reset_token', 'resetToken', 
      'access_token', 'accessToken', 'verification_token',
      'verificationToken', 'temp_token', 'tempToken', 'code',
      'recovery_code', 'recoveryCode', 'session_token', 'sessionToken'
    ];
    
    for (const field of possibleTokenFields) {
      if (data[field] && typeof data[field] === 'string') {
        console.log(`Token encontrado en campo '${field}':`, data[field]);
        return data[field];
      }
    }
    
    if (data.data && typeof data.data === 'object') {
      for (const field of possibleTokenFields) {
        if (data.data[field] && typeof data.data[field] === 'string') {
          console.log(`Token encontrado en data.${field}:`, data.data[field]);
          return data.data[field];
        }
      }
    }
    
    if (data.result && typeof data.result === 'object') {
      for (const field of possibleTokenFields) {
        if (data.result[field] && typeof data.result[field] === 'string') {
          console.log(`Token encontrado en result.${field}:`, data.result[field]);
          return data.result[field];
        }
      }
    }
    
    console.warn('No se encontró token de recuperación en la respuesta');
    return null;
  };

  const handleNext = async () => {
    if (!email) {
      setEmailError('El email es requerido');
      return;
    }

    if (isOnlyNumbers(email)) {
      setEmailError('Ingresa un email válido, no un número');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Formato de email inválido');
      return;
    }

    setLoading(true);
    setEmailError('');
    setRecoveryToken(null);

    try {
      let response;
      let lastError;
      let maxRetries = 2;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          response = await attemptApiCall(attempt);
          break;
        } catch (error) {
          lastError = error;
          
          if (error.message.includes('tardó demasiado') && attempt < maxRetries) {
            console.log(`Intento ${attempt + 1} falló por timeout, reintentando...`);
            continue;
          }
          
          throw error;
        }
      }

      console.log('Status de respuesta:', response.status);

      const responseText = await response.text();
      console.log('Respuesta del servidor:', responseText);

      if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE')) {
        throw new Error('El servidor está teniendo problemas. Intenta de nuevo en unos minutos.');
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('El servidor no respondió correctamente. Intenta de nuevo.');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error al parsear JSON:', parseError);
        throw new Error('Respuesta inválida del servidor. Intenta de nuevo.');
      }

      console.log('Datos parseados:', data);

      if (!response.ok) {
        let errorMessage = 'Error al enviar código de recuperación';
        let alertTitle = 'Error';
        
        switch (response.status) {
          case 400:
            if (data.message && data.message.toLowerCase().includes('usuario no encontrado')) {
              errorMessage = 'No existe una cuenta registrada con este correo electrónico';
              alertTitle = 'Email no registrado';
            } else {
              errorMessage = data.message || 'Los datos enviados no son válidos';
            }
            break;
          case 404:
            errorMessage = 'No existe una cuenta con este correo electrónico';
            alertTitle = 'Email no registrado';
            break;
          case 422:
            errorMessage = 'El formato del correo no es válido';
            break;
          case 429:
            errorMessage = 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta de nuevo más tarde';
            break;
          case 503:
            errorMessage = 'El servicio no está disponible temporalmente';
            break;
          default:
            errorMessage = data.message || `Error ${response.status}: ${errorMessage}`;
        }

        Alert.alert(alertTitle, errorMessage);
        return;
      }

      if (data.success === false || data.error) {
        const errorMessage = data.message || data.error || 'No se encontró una cuenta con este correo';
        Alert.alert('Email no encontrado', errorMessage);
        return;
      }

      const wasCodeSent = data.success === true || 
                         data.message?.toLowerCase().includes('enviado') ||
                         data.message?.toLowerCase().includes('sent') ||
                         response.status === 200;

      if (!wasCodeSent) {
        throw new Error('No se pudo confirmar el envío del código. Intenta de nuevo.');
      }

      const token = extractRecoveryToken(data);
      if (token) {
        setRecoveryToken(token);
        console.log('Token de recuperación guardado:', token);
      }
      
      proceedToNextScreen(token);
      
    } catch (error) {
      console.error('Error en handleNext:', error);
      
      let userMessage = 'Error desconocido. Intenta de nuevo.';
      
      if (error.message.includes('tardó demasiado') || error.message === 'TIMEOUT') {
        userMessage = 'La conexión es muy lenta. Hemos intentado varias veces sin éxito. Verifica tu internet e intenta de nuevo.';
      } else if (error.message === 'Network request failed' || error.name === 'TypeError') {
        userMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else if (error.message.includes('servidor está teniendo problemas')) {
        userMessage = 'El servidor está teniendo problemas. Intenta de nuevo en unos minutos.';
      } else if (error.message.includes('no respondió correctamente')) {
        userMessage = 'El servidor no respondió correctamente. Intenta de nuevo.';
      } else if (error.message.includes('Respuesta inválida')) {
        userMessage = 'Respuesta inválida del servidor. Intenta de nuevo.';
      } else {
        userMessage = error.message || 'No se pudo enviar el código. Intenta de nuevo.';
      }
      
      Alert.alert('Error', userMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const proceedToNextScreen = (token) => {
    if (!token) {
      Alert.alert(
        'Código Enviado', 
        'Se ha enviado un código de recuperación a tu email. Revisa tu bandeja de entrada y carpeta de spam.\n\nNota: No se recibió un token de autenticación del servidor, pero puedes continuar.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Continuar', 
            onPress: () => navigation.navigate('Recuperacion2Screen', { 
              email: email.trim().toLowerCase(),
              via: 'email',
              recoveryToken: null,
              timestamp: Date.now(),
              fromScreen: 'RecuperacionScreen'
            })
          }
        ]
      );
      return;
    }

    Alert.alert(
      'Código Enviado', 
      'Se ha enviado un código de recuperación a tu email. Revisa tu bandeja de entrada y carpeta de spam.',
      [
        { 
          text: 'Continuar', 
          onPress: () => navigation.navigate('Recuperacion2Screen', { 
            email: email.trim().toLowerCase(),
            via: 'email',
            recoveryToken: token,
            timestamp: Date.now(),
            fromScreen: 'RecuperacionScreen'
          })
        }
      ]
    );
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const isEmailValid = email && validateEmail(email) && !isOnlyNumbers(email);
  const isButtonDisabled = !isEmailValid || loading;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Background curved shapes */}
        <View style={styles.backgroundShapes}>
          <View style={styles.curvedShape1} />
          <View style={styles.curvedShape2} />
          <View style={styles.curvedShape3} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Header con X para cerrar */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleClose} 
              disabled={loading}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Lottie Animation */}
          <View style={styles.lottieContainer}>
            <LottieView
              source={require('../assets/lottie/using mobile phone.json')}
              autoPlay
              loop={false}
              style={styles.lottieAnimation}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>¿Olvidaste tu</Text>
            <Text style={styles.titleLight}>contraseña?</Text>

            <Text style={styles.subtitle}>
              No te preocupes, puede pasar. Introduce tu correo electrónico y te enviaremos un código de recuperación.
            </Text>

            {/* Input de Email */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    emailError && styles.inputError
                  ]}
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#9CA3AF"
                  editable={!loading}
                />
              </View>
              
              {emailError ? (
                <View style={styles.errorContainer}>
                  <Icon name="error-outline" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              ) : null}
            </View>

            {/* Ayuda */}
            <View style={styles.helpContainer}>
              <Icon name="info-outline" size={14} color="#9CA3AF" />
              <Text style={styles.helpText}>
                Solo se aceptan direcciones de email válidas
              </Text>
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Footer fijo */}
        <View style={styles.footerContainer}>
          {/* Progress indicators */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>

          {/* Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.button, 
                isButtonDisabled && styles.buttonDisabled
              ]}
              onPress={handleNext}
              disabled={isButtonDisabled}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Enviar código</Text>
                    <View style={styles.arrowContainer}>
                      <Text style={styles.arrow}>→</Text>
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {loading && (
              <Text style={styles.loadingText}>Enviando código...</Text>
            )}
          </View>

          {/* Footer text */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Rivera distribuidora y transporte © 2025
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Background shapes
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
    opacity: 0.08,
    transform: [{ rotate: '45deg' }],
  },
  curvedShape2: {
    position: 'absolute',
    top: 200,
    left: -120,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1F2937',
    opacity: 0.05,
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

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    zIndex: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  // Lottie
  lottieContainer: {
    alignItems: 'center',
    marginVertical: 20,
    zIndex: 1,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },

  content: {
    paddingHorizontal: 28,
    zIndex: 1,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  titleLight: {
    fontSize: 32,
    fontWeight: '300',
    color: '#6B7280',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 32,
    lineHeight: 20,
    fontWeight: '400',
  },

  // Input section
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
  },
  input: {
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  inputError: {
    borderBottomColor: '#EF4444',
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },

  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
  },
  helpText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },

  spacer: {
    height: 40,
  },

  // Footer fijo
  footerContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    zIndex: 2,
  },

  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 28,
  },
  progressDot: {
    width: 8,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 5,
  },
  progressActive: {
    backgroundColor: '#1F2937',
    width: 28,
    borderRadius: 4,
  },

  buttonContainer: {
    paddingHorizontal: 28,
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  button: {
    backgroundColor: '#1F2937',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 170,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.05,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 10,
  },
  arrowContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  loadingText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'right',
  },

  footer: {
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '400',
  },
});

export default RecuperacionScreen;