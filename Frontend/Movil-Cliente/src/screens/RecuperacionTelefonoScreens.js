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
  Platform,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';

const { height } = Dimensions.get('window');

const RecuperacionTelefonoScreen = ({ navigation }) => {
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [telefonoError, setTelefonoError] = useState('');

  const handleNext = async () => {
    if (!isValidSalvadoranNumber(telefono)) {
      setTelefonoError('Número de teléfono inválido');
      return;
    }

    setLoading(true);
    try {
      console.log('📱 Solicitando código SMS para:', telefono);
      
      const fullPhoneNumber = `+503${telefono.replace('-', '')}`;
      console.log('📞 Número completo:', fullPhoneNumber);
      
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
          via: "sms"
        }),
      });

      console.log('📡 Response status:', response.status);

      const responseText = await response.text();
      console.log('📄 Response text (primeros 200 chars):', responseText.substring(0, 200));

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

      console.log('📦 Data parseada:', data);

      if (!response.ok) {
        console.error('❌ Error del servidor:', data);
        Alert.alert('Error', data.message || 'Error al enviar código SMS');
        return;
      }

      console.log('✅ Código SMS enviado exitosamente:', data);
      
      const recoveryToken = data.recoveryToken || data.token;
      
      if (!recoveryToken) {
        console.error('❌ El servidor no devolvió un token de recuperación');
        Alert.alert('Error', 'El servidor no proporcionó un token válido. Intenta de nuevo.');
        return;
      }
      
      console.log('🔑 Token recibido:', recoveryToken.substring(0, 20) + '...');
      
      Alert.alert(
        'Código Enviado', 
        `Se ha enviado un código de verificación por SMS al número ${data.sentTo || fullPhoneNumber}. Revisa tus mensajes.`,
        [
          { 
            text: 'Continuar', 
            onPress: () => {
              console.log('🎯 Navegando a Recuperacion2Screen con token');
              navigation.navigate('Recuperacion2Screen', { 
                phone: fullPhoneNumber,
                via: 'sms',
                recoveryToken: recoveryToken,
                fromScreen: 'RecuperacionTelefonoScreen',
                timestamp: Date.now()
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error al solicitar código SMS:', error);
      
      if (error.message.includes('HTML')) {
        Alert.alert(
          'Error del Servidor', 
          '🔴 La API no está respondiendo correctamente.\n\n' +
          'Verifica que:\n' +
          '• El servidor esté corriendo\n' +
          '• La ruta /api/recovery/requestCode existe\n' +
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

  const isValidSalvadoranNumber = (number) => {
    const cleanNumber = number.replace('-', '');
    if (cleanNumber.length !== 8) return false;
    const firstDigit = cleanNumber[0];
    if (!['2', '6', '7'].includes(firstDigit)) return false;
    return /^\d{8}$/.test(cleanNumber);
  };

  const formatTelefono = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 8);
    
    if (limited.length >= 5) {
      return limited.slice(0, 4) + '-' + limited.slice(4);
    }
    
    return limited;
  };

  const handleTelefonoChange = (text) => {
    const formatted = formatTelefono(text);
    setTelefono(formatted);
    setTelefonoError('');

    if (formatted.length > 0) {
      const cleanNumber = formatted.replace('-', '');
      
      if (cleanNumber.length >= 1) {
        const firstDigit = cleanNumber[0];
        if (!['2', '6', '7'].includes(firstDigit)) {
          setTelefonoError('Los números deben empezar con 2, 6 o 7');
        }
      }
      
      if (cleanNumber.length === 8 && !isValidSalvadoranNumber(formatted)) {
        setTelefonoError('Número de teléfono no válido');
      }
    }
  };

  const isButtonDisabled = !telefono || telefono.length < 9 || telefonoError || loading || !isValidSalvadoranNumber(telefono);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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

          {/* Lottie Animation - SIN FONDOS */}
          <View style={styles.lottieContainer}>
            <LottieView
              source={require('../assets/lottie/using mobile phone.json')}
              autoPlay
              loop={false}
              style={styles.lottieAnimation}
            />
          </View>

          {/* Contenido principal */}
          <View style={styles.content}>
            {/* Título con estilo moderno */}
            <Text style={styles.title}>Recuperar</Text>
            <Text style={styles.titleLight}>contraseña</Text>
            
            <Text style={styles.subtitle}>
              Introduce tu número de teléfono de El Salvador y te enviaremos un código de verificación.
            </Text>

            {/* Campo de entrada moderno */}
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Número de teléfono</Text>
              
              <View style={styles.inputWrapper}>
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
                  maxLength={9}
                  autoCorrect={false}
                  editable={!loading}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Mensaje de error */}
              {telefonoError ? (
                <View style={styles.errorContainer}>
                  <Icon name="error-outline" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{telefonoError}</Text>
                </View>
              ) : null}

              {/* Texto de ayuda */}
              <View style={styles.helpContainer}>
                <Icon name="info-outline" size={14} color="#9CA3AF" />
                <Text style={styles.helpText}>
                  Números válidos: 2234-5678, 6789-1234, 7456-7890
                </Text>
              </View>
            </View>
          </View>

          {/* Espacio adicional para scroll */}
          <View style={styles.spacer} />

        </ScrollView>

        {/* Footer fijo en la parte inferior */}
        <View style={styles.footerContainer}>
          {/* Indicadores de progreso */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>

          {/* Botón */}
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

  // Lottie Animation - SOLO LA ANIMACIÓN, SIN FONDOS NI CÍRCULOS
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

  // Título con estilo del LoginScreen (más compacto)
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

  // Form section
  formSection: {
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    marginRight: 10,
  },
  flagEmoji: {
    fontSize: 18,
    marginRight: 4,
  },
  prefixText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 17,
    color: '#1F2937',
    fontWeight: '500',
  },
  inputError: {
    borderBottomColor: '#EF4444',
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
    flex: 1,
  },

  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
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

  // Footer container fijo
  footerContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    zIndex: 2,
  },

  // Progress indicators
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

  // Button
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

export default RecuperacionTelefonoScreen;