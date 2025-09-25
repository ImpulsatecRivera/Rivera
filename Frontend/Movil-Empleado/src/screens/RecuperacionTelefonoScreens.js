import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const RecuperacionTelefonoScreen = ({ navigation }) => {
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [telefonoError, setTelefonoError] = useState('');

  const handleNext = async () => {
    // Validación final
    if (!isValidSalvadoranNumber(telefono)) {
      setTelefonoError('Número de teléfono inválido');
      return;
    }

    setLoading(true);
    try {
      console.log('📱 Solicitando código SMS para:', telefono);
      
      // Construir número completo con prefijo +503
      const fullPhoneNumber = `+503${telefono.replace('-', '')}`;
      console.log('📞 Número completo:', fullPhoneNumber);
      
      // ✅ IP CONFIGURADA - Ajusta según tu configuración
      const API_URL = 'https://riveraproject-production-933e.up.railway.app/api/recovery/requestCode';
      
      console.log('🌐 Conectando a:', API_URL);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          phone: fullPhoneNumber,
          via: "sms" // Especificar que queremos SMS
        }),
      });

      console.log('📡 Response status:', response.status);

      // Verificar el contenido antes de parsear JSON
      const responseText = await response.text();
      console.log('📄 Response text:', responseText);

      // Verificar si la respuesta es HTML (error del servidor)
      if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE')) {
        throw new Error('El servidor devolvió HTML en lugar de JSON. Verifica que la API esté funcionando correctamente.');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError);
        throw new Error('Respuesta inválida del servidor');
      }

      if (!response.ok) {
        Alert.alert('Error', data.message || 'Error al enviar código SMS');
        return;
      }

      console.log('✅ Código SMS enviado exitosamente:', data);
      
      Alert.alert(
        'Código Enviado', 
        `Se ha enviado un código de verificación por SMS al número ${data.sentTo || fullPhoneNumber}. Revisa tus mensajes.`,
        [
          { 
            text: 'Continuar', 
            onPress: () => navigation.navigate('Recuperacion2', { 
              phone: fullPhoneNumber,
              via: 'sms'
            })
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error al solicitar código SMS:', error);
      
      // Manejo específico de errores
      if (error.message.includes('HTML')) {
        Alert.alert(
          'Error del Servidor', 
          '🔴 La API no está respondiendo correctamente.\n\n' +
          'Verifica que:\n' +
          '• El servidor esté corriendo\n' +
          '• La ruta /api/requestCode existe\n' +
          '• El endpoint esté configurado correctamente'
        );
      } else if (error.message === 'Network request failed') {
        Alert.alert(
          'Error de Conexión', 
          '🔴 No se pudo conectar al servidor.\n\n' +
          'Verifica tu conexión a internet y que el servidor esté funcionando.'
        );
      } else {
        Alert.alert('Error', error.message || 'No se pudo enviar el código SMS. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  // Validar que sea un número salvadoreño válido
  const isValidSalvadoranNumber = (number) => {
    // Remover guión para validación
    const cleanNumber = number.replace('-', '');
    
    // Debe tener exactamente 8 dígitos
    if (cleanNumber.length !== 8) return false;
    
    // Debe empezar con 2, 6, 7 (números válidos en El Salvador)
    const firstDigit = cleanNumber[0];
    if (!['2', '6', '7'].includes(firstDigit)) return false;
    
    // Solo dígitos
    return /^\d{8}$/.test(cleanNumber);
  };

  const formatTelefono = (text) => {
    // Remover todo excepto números
    const cleaned = text.replace(/\D/g, '');
    
    // Limitar a 8 dígitos (formato salvadoreño)
    const limited = cleaned.slice(0, 8);
    
    // Formatear con guiones (ej: 1234-5678)
    if (limited.length >= 5) {
      return limited.slice(0, 4) + '-' + limited.slice(4);
    }
    
    return limited;
  };

  const handleTelefonoChange = (text) => {
    const formatted = formatTelefono(text);
    setTelefono(formatted);
    setTelefonoError('');

    // Validación en tiempo real
    if (formatted.length > 0) {
      const cleanNumber = formatted.replace('-', '');
      
      if (cleanNumber.length >= 1) {
        const firstDigit = cleanNumber[0];
        if (!['2', '6', '7'].includes(firstDigit)) {
          setTelefonoError('Los números en El Salvador deben empezar con 2, 6 o 7');
        }
      }
      
      if (cleanNumber.length === 8 && !isValidSalvadoranNumber(formatted)) {
        setTelefonoError('Número de teléfono no válido para El Salvador');
      }
    }
  };

  const isButtonDisabled = !telefono || telefono.length < 9 || telefonoError || loading || !isValidSalvadoranNumber(telefono);

  return (
    <View style={styles.container}>
      {/* Header con X para cerrar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} disabled={loading}>
          <Icon name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Contenido principal centrado */}
      <View style={styles.mainContent}>
        {/* Ilustración */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../images/recuperarcontra.png')} // Ajusta la ruta según tu estructura
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Contenido de texto y formulario */}
        <View style={styles.content}>
          {/* Título */}
          <Text style={styles.title}>
            Verificación por SMS
          </Text>

          {/* Subtítulo */}
          <Text style={styles.subtitle}>
            No te preocupes, puede pasar. Introduce tu número de teléfono de El Salvador y te enviaremos un código de verificación por SMS.
          </Text>

          {/* Campo de entrada con prefijo */}
          <View style={styles.inputContainer}>
            <View style={styles.prefixContainer}>
              <Text style={styles.flagEmoji}>🇸🇻</Text>
              <Text style={styles.prefixText}>+503</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                telefonoError && styles.inputError
              ]}
              placeholder="2234-5678"
              value={telefono}
              onChangeText={handleTelefonoChange}
              keyboardType="phone-pad"
              maxLength={9} // 4 + 1 (guión) + 4
              autoCorrect={false}
              editable={!loading}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Mensaje de error */}
          {telefonoError ? (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{telefonoError}</Text>
            </View>
          ) : null}

          {/* Texto de ayuda */}
          <View style={styles.helpContainer}>
            <Icon name="info-outline" size={16} color="#6b7280" />
            <Text style={styles.helpText}>
              Números válidos empiezan con 2, 6 o 7 (ejemplo: 2234-5678, 6789-1234, 7456-7890)
            </Text>
          </View>
        </View>
      </View>

      {/* Sección inferior fija */}
      <View style={styles.bottomSection}>
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
                Enviar código SMS
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: screenWidth * 0.04, // 4% del ancho
    paddingTop: screenHeight * 0.06, // 6% de la altura
    paddingBottom: screenHeight * 0.02, // 2% de la altura
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.06, // 6% del ancho
    marginTop: -screenHeight * 0.05, // Ajuste para centrar mejor
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: screenHeight * 0.04, // 4% de la altura
    width: '100%',
  },
  image: {
    width: Math.min(screenWidth * 0.7, 256), // Máximo 70% del ancho o 256px
    height: Math.min(screenWidth * 0.7 * 0.75, 192), // Mantener proporción
  },
  content: {
    width: '100%',
    maxWidth: 400, // Ancho máximo para pantallas grandes
    alignItems: 'center',
  },
  title: {
    fontSize: Math.min(screenWidth * 0.06, 24), // Responsive font size
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: screenHeight * 0.02,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.min(screenWidth * 0.037, 14),
    color: '#6b7280',
    marginBottom: screenHeight * 0.04,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: screenWidth * 0.02,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: screenHeight * 0.015,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    width: '100%',
    maxWidth: 350,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  flagEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  prefixText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    paddingVertical: screenHeight * 0.02,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#374151',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: screenHeight * 0.015,
    paddingHorizontal: 4,
    width: '100%',
    maxWidth: 350,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: screenHeight * 0.025,
    paddingHorizontal: 4,
    width: '100%',
    maxWidth: 350,
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  bottomSection: {
    paddingBottom: screenHeight * 0.03,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: screenHeight * 0.03,
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
    paddingHorizontal: screenWidth * 0.06,
    marginBottom: screenHeight * 0.03,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: screenHeight * 0.02,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
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
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default RecuperacionTelefonoScreen;