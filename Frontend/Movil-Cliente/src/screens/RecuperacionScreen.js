import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RecuperacionScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

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
        setEmailError('Ingresa un email, no un número de teléfono');
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
    const API_URL = 'https://riveraproject-production.up.railway.app/api/recovery/requestCode';
    
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
    }, 10000); // 10 segundos de timeout

    return response;
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
    setEmailError(''); // Limpiar errores previos

    try {
      let response;
      let lastError;
      let maxRetries = 2; // Máximo 2 reintentos (3 intentos total)
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          response = await attemptApiCall(attempt);
          break; // Si llegamos aquí, la petición fue exitosa
        } catch (error) {
          lastError = error;
          
          // Si es timeout y no es el último intento, continuar
          if (error.message.includes('tardó demasiado') && attempt < maxRetries) {
            console.log(`Intento ${attempt + 1} falló por timeout, reintentando...`);
            continue;
          }
          
          // Si no es timeout o es el último intento, lanzar el error
          throw error;
        }
      }

      console.log('Status de respuesta:', response.status);
      console.log('Headers de respuesta:', response.headers);

      const responseText = await response.text();
      console.log('Respuesta del servidor:', responseText);

      // Verificar si la respuesta es HTML (error del servidor)
      if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE')) {
        throw new Error('El servidor está teniendo problemas. Intenta de nuevo en unos minutos.');
      }

      // Verificar si la respuesta está vacía
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

      // Manejar diferentes códigos de estado HTTP
      if (!response.ok) {
        let errorMessage = 'Error al enviar código de recuperación';
        let alertTitle = 'Error';
        
        switch (response.status) {
          case 400:
            // Verificar si es específicamente "usuario no encontrado"
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

      // Verificar si la respuesta indica éxito pero sin email encontrado
      if (data.success === false || data.error) {
        const errorMessage = data.message || data.error || 'No se encontró una cuenta con este correo';
        Alert.alert('Email no encontrado', errorMessage);
        return;
      }

      // Buscar token de recuperación
      let recoveryToken = null;
      const possibleTokenFields = [
        'token', 'recoveryToken', 'reset_token', 'resetToken', 
        'access_token', 'accessToken', 'verification_token',
        'verificationToken', 'temp_token', 'tempToken', 'code'
      ];
      
      // Buscar en el objeto principal
      for (const field of possibleTokenFields) {
        if (data[field]) {
          recoveryToken = data[field];
          break;
        }
      }
      
      // Buscar en data.data si existe
      if (!recoveryToken && data.data && typeof data.data === 'object') {
        for (const field of possibleTokenFields) {
          if (data.data[field]) {
            recoveryToken = data.data[field];
            break;
          }
        }
      }

      // Verificar si se envió el código exitosamente
      const wasCodeSent = data.success === true || 
                         data.message?.toLowerCase().includes('enviado') ||
                         data.message?.toLowerCase().includes('sent') ||
                         response.status === 200;

      if (!wasCodeSent) {
        throw new Error('No se pudo confirmar el envío del código. Intenta de nuevo.');
      }
      
      if (!recoveryToken) {
        console.warn('No se recibió token de recuperación:', data);
        Alert.alert(
          'Código Enviado',
          'Se ha enviado un código a tu correo, pero no se recibió token del servidor. ¿Deseas continuar?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Continuar', 
              onPress: () => proceedToNextScreen(null)
            }
          ]
        );
        return;
      }
      
      proceedToNextScreen(recoveryToken);
      
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
      // Asegurar que siempre se resetee el loading
      setLoading(false);
    }
  };
  
  const proceedToNextScreen = (token) => {
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
            timestamp: Date.now()
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} disabled={loading}>
          <Icon name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image 
          source={require('../images/recuperarcontra.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          ¿Olvidaste tu contraseña?
        </Text>

        <Text style={styles.subtitle}>
          No te preocupes, puede pasar. Introduce tu correo electrónico y te enviaremos un código de recuperación.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            placeholder="ejemplo@correo.com"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9ca3af"
            editable={!loading}
          />
          
          {emailError ? (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{emailError}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.helpContainer}>
          <Icon name="info-outline" size={16} color="#6b7280" />
          <Text style={styles.helpText}>
            Solo se aceptan direcciones de email válidas
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, styles.progressActive]} />
        <View style={[styles.progressDot]} />
        <View style={[styles.progressDot]} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={isButtonDisabled}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingText}>Enviando código...</Text>
            </View>
          ) : (
            <Text style={[styles.buttonText, isButtonDisabled && styles.buttonTextDisabled]}>
              Enviar código
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Rivera distribuidora y{'\n'}
          transporte || 2025
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  image: {
    width: 256,
    height: 192,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 6,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  helpText: {
    color: '#6b7280',
    fontSize: 13,
    marginLeft: 6,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  progressBar: {
    width: 32,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    marginRight: 8,
  },
  progressActive: {
    backgroundColor: '#111827',
  },
  progressDot: {
    width: 8,
    height: 8,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#9ca3af',
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
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default RecuperacionScreen;