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

  // Validar formato de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Verificar si contiene solo números
  const isOnlyNumbers = (text) => {
    return /^\d+$/.test(text.trim());
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setEmailError('');

    // Validación en tiempo real
    if (text.length > 0) {
      if (isOnlyNumbers(text)) {
        setEmailError('Ingresa un email, no un número de teléfono');
      } else if (text.length > 3 && !validateEmail(text)) {
        setEmailError('Formato de email inválido');
      }
    }
  };

  // En RecuperacionScreen - Modificar el handleNext:

const handleNext = async () => {
  // ... validaciones existentes ...

  setLoading(true);
  try {
    console.log('🔐 Solicitando código de recuperación para:', email);
    
    const API_URL = 'riveraproject-production.up.railway.app/api/recovery/requestCode';
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        via: 'email' // Agregar esto también
      }),
    });

    const responseText = await response.text();
    console.log('📄 Response text:', responseText);

    if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE')) {
      throw new Error('El servidor devolvió HTML en lugar de JSON.');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Error parsing JSON:', parseError);
      throw new Error('Respuesta inválida del servidor');
    }

    if (!response.ok) {
      Alert.alert('Error', data.message || 'Error al enviar código de recuperación');
      return;
    }

    console.log('✅ Código enviado exitosamente:', data);
    
    // ✅ GUARDAR EL RECOVERY TOKEN QUE DEVUELVE EL BACKEND
    const recoveryToken = data.recoveryToken;
    
    if (!recoveryToken) {
      Alert.alert('Error', 'No se recibió el token de recuperación');
      return;
    }
    
    Alert.alert(
      'Código Enviado', 
      'Se ha enviado un código de recuperación a tu email. Revisa tu bandeja de entrada.',
      [
        { 
          text: 'Continuar', 
          onPress: () => navigation.navigate('Recuperacion2', { 
            email: email.trim(),
            recoveryToken: recoveryToken  // ✅ PASAR EL TOKEN
          })
        }
      ]
    );

  } catch (error) {
    console.error('❌ Error al solicitar código:', error);
    // ... manejo de errores existente ...
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    navigation.goBack();
  };

  const isEmailValid = email && validateEmail(email) && !isOnlyNumbers(email);
  const isButtonDisabled = !isEmailValid || loading;

  return (
    <View style={styles.container}>
      {/* Header con X para cerrar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} disabled={loading}>
          <Icon name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Ilustración */}
      <View style={styles.imageContainer}>
        <Image 
          source={require('../images/recuperarcontra.png')} // Ajusta la ruta según tu estructura
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Título */}
        <Text style={styles.title}>
          ¿Olvidaste tu contraseña?
        </Text>

        {/* Subtítulo */}
        <Text style={styles.subtitle}>
          No te preocupes, puede pasar. Introduce tu correo electrónico y te enviaremos un código de recuperación.
        </Text>

        {/* Campo de entrada */}
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
          
          {/* Mensaje de error */}
          {emailError ? (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{emailError}</Text>
            </View>
          ) : null}
        </View>

        {/* Ayuda adicional */}
        <View style={styles.helpContainer}>
          <Icon name="info-outline" size={16} color="#6b7280" />
          <Text style={styles.helpText}>
            Solo se aceptan direcciones de email válidas
          </Text>
        </View>
      </View>

      {/* Indicadores de progreso */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, styles.progressActive]} />
        <View style={[styles.progressDot]} />
        <View style={[styles.progressDot]} />
      </View>

      {/* Botón Siguiente */}
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

      {/* Footer */}
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