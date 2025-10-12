import React, { useState, useEffect } from 'react';
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

const Recuperacion3 = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [email] = useState(route?.params?.email || '');
  const [phone] = useState(route?.params?.phone || '');
  const [via] = useState(route?.params?.via || 'email');
  const [verifiedCode] = useState(route?.params?.verifiedCode || '');
  const [recoveryToken] = useState(route?.params?.recoveryToken || '');
  const [verifiedToken] = useState(route?.params?.verifiedToken || '');

  useEffect(() => {
    console.log('🔍 Recuperacion3 - Parámetros recibidos:', {
      email: email ? `***@${email.split('@')[1]}` : 'N/A',
      phone: phone ? `***${phone.slice(-4)}` : 'N/A',
      via,
      hasVerifiedCode: !!verifiedCode,
      hasRecoveryToken: !!recoveryToken,
      hasVerifiedToken: !!verifiedToken,
      allParams: Object.keys(route?.params || {})
    });

    if (!email && !phone) {
      console.error('❌ CRÍTICO: No se recibió ni email ni phone');
      Alert.alert(
        'Error de Navegación',
        'No se encontró información de contacto. Por favor inicia el proceso de nuevo.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('RecuperacionScreen')
          }
        ]
      );
    }
  }, []);

  const hasMinLength = password.length >= 8 && password.length <= 20;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const isFormValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar && passwordsMatch;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleUpdate = async () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Por favor completa todos los requisitos de la contraseña');
      return;
    }

    const contactInfo = email || phone;
    if (!contactInfo) {
      Alert.alert('Error', 'Información de contacto no encontrada. Por favor inicia el proceso de nuevo.');
      return;
    }

    const tokenToUse = verifiedToken || recoveryToken;
    
    if (!tokenToUse) {
      console.error('❌ No hay token disponible');
      Alert.alert(
        'Token No Encontrado',
        'No se encontró el token de verificación. Es necesario verificar el código primero.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Verificar Código', 
            onPress: () => {
              const params = via === 'sms' 
                ? { phone, via: 'sms', recoveryToken }
                : { email, via: 'email', recoveryToken };
              
              navigation.navigate('Recuperacion2Screen', params);
            }
          }
        ]
      );
      return;
    }

    setLoading(true);
    console.log('🔐 Iniciando cambio de contraseña...');

    try {
      const API_URL = 'https://riveraproject-production-933e.up.railway.app/api/recovery/newPassword';
      
      const payload = {
        newPassword: password,
        verifiedToken: tokenToUse
      };
      
      if (email) payload.email = email;
      if (phone) payload.phone = phone;
      if (via) payload.via = via;
      
      console.log('📤 Enviando cambio de contraseña:', {
        hasEmail: !!email,
        hasPhone: !!phone,
        via,
        hasToken: !!tokenToUse,
        tokenPreview: tokenToUse.substring(0, 20) + '...'
      });
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
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
        console.error('❌ Error parseando JSON:', parseError);
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('📦 Data parseada:', data);

      if (!response.ok) {
        console.error('❌ Error del servidor:', data);
        
        if (response.status === 400) {
          const message = data.message || '';
          
          if (message.includes('Token') || message.includes('token')) {
            Alert.alert(
              'Error de Verificación', 
              'El token de verificación no es válido o ha expirado. Solicita un nuevo código.',
              [
                { 
                  text: 'Solicitar Nuevo Código', 
                  onPress: () => navigation.navigate('RecuperacionScreen')
                }
              ]
            );
            return;
          }
          
          if (message.includes('verificado')) {
            Alert.alert(
              'Código No Verificado', 
              'El código no ha sido verificado. Verifica el código primero.',
              [
                { 
                  text: 'Verificar Código', 
                  onPress: () => {
                    const params = via === 'sms' 
                      ? { phone, via: 'sms', recoveryToken }
                      : { email, via: 'email', recoveryToken };
                    
                    navigation.navigate('Recuperacion2Screen', params);
                  }
                }
              ]
            );
            return;
          }
        }
        
        if (response.status === 401) {
          Alert.alert(
            'Sesión Expirada',
            'Tu sesión ha expirado. Por favor solicita un nuevo código.',
            [
              { 
                text: 'Solicitar Nuevo Código', 
                onPress: () => navigation.navigate('RecuperacionScreen')
              }
            ]
          );
          return;
        }
        
        if (response.status === 404) {
          Alert.alert('Error', 'Usuario no encontrado. Verifica tu información.');
          return;
        }
        
        Alert.alert('Error', data.message || 'No se pudo actualizar la contraseña');
        return;
      }

      console.log('✅ Contraseña actualizada exitosamente');
      
      setLoading(false);
      
      Alert.alert(
        '¡Contraseña Actualizada!', 
        'Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
        [
          { 
            text: 'Ir al Login', 
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error en cambio de contraseña:', error);
      
      let errorMessage = 'No se pudo actualizar la contraseña. Intenta de nuevo.';
      
      if (error.message.includes('HTML')) {
        errorMessage = 'La API no está respondiendo correctamente.\n\nVerifica que el servidor esté funcionando.';
      } else if (error.message === 'Network request failed' || error.message.includes('network')) {
        errorMessage = 'No se pudo conectar al servidor.\n\nVerifica tu conexión a internet.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderValidationItem = (isValid, text) => (
    <View style={styles.validationItem}>
      <View style={[styles.checkbox, isValid && styles.checkboxValid]}>
        {isValid && <Icon name="check" size={14} color="#FFFFFF" />}
      </View>
      <Text style={[styles.validationText, isValid && styles.validationTextValid]}>
        {text}
      </Text>
    </View>
  );

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
          {/* Header con botón atrás */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleBack} 
              disabled={loading}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Lottie Animation */}
          <View style={styles.lottieContainer}>
            <LottieView
              source={require('../assets/lottie/Lock.json')}
              autoPlay
              loop={false}
              style={styles.lottieAnimation}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Nueva</Text>
            <Text style={styles.titleLight}>contraseña</Text>

            {(email || phone) && (
              <Text style={styles.subtitle}>
                Actualizando contraseña para{'\n'}
                <Text style={styles.contactText}>
                  {via === 'sms' && phone 
                    ? `***${phone.slice(-4)}` 
                    : email 
                      ? `***@${email.split('@')[1]}` 
                      : 'usuario'}
                </Text>
              </Text>
            )}

            {/* Campo Nueva Contraseña */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Nueva contraseña</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name={showPassword ? "visibility-off" : "visibility"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo Confirmar Contraseña */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Confirmar contraseña</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    confirmPassword.length > 0 && !passwordsMatch && styles.inputError
                  ]}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name={showConfirmPassword ? "visibility-off" : "visibility"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <View style={styles.errorContainer}>
                  <Icon name="error-outline" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
                </View>
              )}
            </View>

            {/* Validaciones */}
            <View style={styles.validationContainer}>
              <Text style={styles.validationHeader}>
                Tu contraseña debe contener:
              </Text>
              
              <View style={styles.validationList}>
                {renderValidationItem(hasMinLength, "Entre 8 y 20 caracteres")}
                {renderValidationItem(hasUppercase, "1 letra mayúscula")}
                {renderValidationItem(hasNumber, "1 o más números")}
                {renderValidationItem(hasSpecialChar, "1 carácter especial")}
                {renderValidationItem(passwordsMatch, "Las contraseñas coinciden")}
              </View>
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Footer fijo */}
        <View style={styles.footerContainer}>
          {/* Progress indicators */}
          <View style={styles.progressContainer}>
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.progressActive]} />
          </View>

          {/* Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.button, 
                (!isFormValid || loading) && styles.buttonDisabled
              ]}
              onPress={handleUpdate}
              disabled={!isFormValid || loading}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Actualizar</Text>
                    <View style={styles.arrowContainer}>
                      <Text style={styles.arrow}>→</Text>
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>
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
  backButton: {
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
    width: 140,
    height: 140,
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
    textAlign: 'center',
    lineHeight: 20,
  },
  contactText: {
    fontWeight: '600',
    color: '#1F2937',
  },

  // Input sections
  inputSection: {
    marginBottom: 24,
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
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  inputError: {
    borderBottomColor: '#EF4444',
  },
  eyeButton: {
    padding: 8,
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

  // Validations
  validationContainer: {
    marginBottom: 20,
  },
  validationHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  validationList: {
    gap: 12,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  checkboxValid: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  validationText: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  validationTextValid: {
    color: '#4CAF50',
    fontWeight: '500',
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

export default Recuperacion3;