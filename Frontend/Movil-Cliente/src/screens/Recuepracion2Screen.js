import React, { useState, useEffect, useRef } from 'react';
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
import { useAuth } from '../context/authContext';

const API_BASE_URL = 'https://riveraproject-production-933e.up.railway.app';

const Recuperacion2Screen = ({ navigation, route }) => {
  const { register } = useAuth();

  const [otpValues, setOtpValues] = useState(['', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState(route?.params?.email || '');
  const [phone, setPhone] = useState(route?.params?.phone || '');
  const [via, setVia] = useState(route?.params?.via || 'email');
  
  const [registrationData, setRegistrationData] = useState(route?.params?.registrationData || null);
  const isRegistrationMode = !!registrationData;
  
  const [recoveryToken, setRecoveryToken] = useState(() => {
    const token = route?.params?.recoveryToken;
    if (!token || token === 'null' || token === 'undefined' || typeof token !== 'string' || token.trim() === '') {
      console.warn('⚠️ Token de recuperación no válido recibido:', token);
      return null;
    }
    console.log('✅ Token de recuperación válido recibido:', token.substring(0, 20) + '...');
    return token;
  });

  const inputRefs = useRef([]);

  useEffect(() => {
    console.log('🔍 Recuperacion2Screen parámetros recibidos:', {
      mode: isRegistrationMode ? '🆕 REGISTRO' : '🔑 RECUPERACIÓN',
      email,
      phone: phone ? `***${phone.slice(-4)}` : 'N/A',
      via,
      hasRegistrationData: !!registrationData,
      recoveryToken: recoveryToken ? `${recoveryToken.substring(0, 20)}...` : 'NULL',
      hasValidToken: !!recoveryToken && recoveryToken !== 'null',
      fromScreen: route?.params?.fromScreen,
      allParams: Object.keys(route?.params || {})
    });
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      
      if (value && index < 4) {
        inputRefs.current[index + 1]?.focus();
      }
      
      if (value && index === 4) {
        const completeCode = [...newOtpValues];
        completeCode[index] = value;
        if (completeCode.every(digit => digit !== '')) {
          setTimeout(() => {
            handleVerifyCode(completeCode.join(''));
          }, 300);
        }
      }
    }
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && otpValues[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (code = null) => {
    const otpCode = code || otpValues.join('');
    
    if (otpCode.length !== 5) {
      Alert.alert('Error', 'Por favor ingresa el código completo de 5 dígitos');
      return;
    }

    if (!recoveryToken || recoveryToken === 'null' || recoveryToken.trim() === '') {
      console.error('❌ No hay token de recuperación válido disponible');
      Alert.alert(
        'Token No Disponible', 
        'No se encontró un token de recuperación válido. Es necesario solicitar un nuevo código para continuar.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Nuevo Código', 
            onPress: () => navigation.navigate(isRegistrationMode ? 'RegistrarseCliente2' : 'RecuperacionScreen')
          }
        ]
      );
      return;
    }

    setLoading(true);
    console.log('🔐 Iniciando verificación en modo:', isRegistrationMode ? 'REGISTRO' : 'RECUPERACIÓN');

    try {
      const verifyURL = isRegistrationMode 
        ? `${API_BASE_URL}/api/recovery/verifyCodeForRegistration`
        : `${API_BASE_URL}/api/recovery/verifyCode`;
      
      console.log('🌐 URL de verificación:', verifyURL);
      
      const payload = {
        code: otpCode,
        recoveryToken: recoveryToken
      };

      if (!isRegistrationMode) {
        if (email) payload.email = email;
        if (phone) payload.phone = phone;
        if (via) payload.via = via;
      }

      console.log('📤 Enviando verificación:', {
        mode: isRegistrationMode ? 'REGISTRO' : 'RECUPERACIÓN',
        url: verifyURL,
        code: otpCode,
        hasRecoveryToken: !!recoveryToken
      });
      
      const verifyResponse = await fetch(verifyURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Estado de respuesta verificación:', verifyResponse.status);

      const verifyText = await verifyResponse.text();
      console.log('📄 Respuesta (primeros 200 chars):', verifyText.substring(0, 200));
      
      if (verifyText.includes('<html>') || verifyText.includes('<!DOCTYPE')) {
        throw new Error('El servidor devolvió HTML en lugar de JSON. Verifica que la API esté funcionando correctamente.');
      }

      let verifyData;
      try {
        verifyData = JSON.parse(verifyText);
      } catch (parseError) {
        console.error('❌ Error al parsear JSON:', parseError);
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('📋 Datos verificación parseados:', verifyData);

      if (!verifyResponse.ok) {
        console.log('❌ Error en verificación:', verifyData);
        
        if (verifyResponse.status === 400) {
          const message = verifyData.message || '';
          
          if (message.includes('Token de recuperación requerido') || 
              message.includes('Token requerido')) {
            Alert.alert(
              'Token Requerido', 
              'El servidor requiere un token de recuperación válido.\n\n¿Deseas solicitar un nuevo código?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { 
                  text: 'Nuevo Código', 
                  onPress: () => navigation.navigate(isRegistrationMode ? 'RegistrarseCliente2' : 'RecuperacionScreen')
                }
              ]
            );
            return;
          }
          
          if (message.includes('expirado') || message.includes('expired')) {
            Alert.alert(
              'Código Expirado', 
              'El código ha expirado. Solicita un nuevo código.',
              [
                { 
                  text: 'Nuevo Código', 
                  onPress: () => navigation.navigate(isRegistrationMode ? 'RegistrarseCliente2' : 'RecuperacionScreen')
                }
              ]
            );
            return;
          }

          if (message.includes('inválido') || message.includes('invalid') || message.includes('incorrecto')) {
            Alert.alert('Error', 'Código de verificación incorrecto. Inténtalo de nuevo.');
            setOtpValues(['', '', '', '', '']);
            inputRefs.current[0]?.focus();
            setLoading(false);
            return;
          }
        }
        
        Alert.alert('Error', verifyData.message || 'Código de verificación incorrecto');
        setOtpValues(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      console.log('✅ Código verificado correctamente:', verifyData);

      if (isRegistrationMode) {
        console.log('🎯 Iniciando proceso de registro de usuario');
        await handleUserRegistration(verifyData);
      } else {
        console.log('🎯 Navegando a cambio de contraseña');
        await handlePasswordRecovery(verifyData, otpCode);
      }

    } catch (error) {
      console.error('❌ Error en verificación:', error);
      
      let errorMessage = 'No se pudo verificar el código. Intenta de nuevo.';
      
      if (error.message.includes('HTML')) {
        errorMessage = 'La API no está respondiendo correctamente.\n\nVerifica que el servidor esté funcionando.';
      } else if (error.message === 'Network request failed' || error.message.includes('network')) {
        errorMessage = 'No se pudo conectar al servidor.\n\nVerifica tu conexión a internet.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Error', errorMessage);
      setOtpValues(['', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setLoading(false);
    }
  };

  const handleUserRegistration = async (verifyData) => {
    try {
      console.log('👤 Creando cuenta de usuario...');
      console.log('📦 Datos de registro:', {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        phone: registrationData.phone,
        hasImage: !!registrationData.profileImage
      });
      
      const formData = new FormData();
      
      Object.keys(registrationData).forEach(key => {
        if (key !== 'profileImage' && key !== 'phoneNormalized') {
          formData.append(key, registrationData[key]);
        }
      });

      if (registrationData.profileImage) {
        formData.append('profileImage', {
          uri: registrationData.profileImage.uri,
          type: registrationData.profileImage.type,
          name: registrationData.profileImage.name,
        });
        console.log('📸 Imagen agregada al FormData');
      }

      const registerURL = `${API_BASE_URL}/api/register-cliente`;
      console.log('🌐 Enviando registro a:', registerURL);

      const registerResponse = await fetch(registerURL, {
        method: 'POST',
        body: formData,
      });

      console.log('📊 Status registro:', registerResponse.status);

      const registerText = await registerResponse.text();
      console.log('📄 Respuesta registro (raw):', registerText.substring(0, 200));

      if (registerText.includes('<html>') || registerText.includes('<!DOCTYPE')) {
        throw new Error('El servidor de registro devolvió HTML. Verifica el endpoint.');
      }

      let registerResult;
      try {
        registerResult = JSON.parse(registerText);
      } catch (parseError) {
        console.error('❌ Error parseando respuesta de registro');
        throw new Error('Respuesta inválida del servidor de registro');
      }

      console.log('📋 Respuesta registro (parsed):', registerResult);

      if (!registerResponse.ok) {
        console.error('❌ Error en registro:', registerResult);
        Alert.alert('Error', registerResult.Message || registerResult.message || 'Error al crear la cuenta');
        setLoading(false);
        return;
      }

      console.log('💾 Guardando en contexto de autenticación...');
      
      const authData = {
        user: {
          id: registerResult.user?.id || registerResult.user?._id,
          _id: registerResult.user?.id || registerResult.user?._id,
          email: registerResult.user?.email || registrationData.email,
          firstName: registerResult.user?.firstName || registrationData.firstName,
          lastName: registerResult.user?.lastName || registrationData.lastName,
          fullName: registerResult.user?.nombre || `${registrationData.firstName} ${registrationData.lastName}`,
          phone: registrationData.phone,
          phoneVerified: true,
          profileImage: registerResult.user?.profileImage || null
        },
        token: registerResult.token,
        userType: registerResult.userType || 'Cliente'
      };

      console.log('📦 Datos para contexto:', {
        userId: authData.user.id,
        email: authData.user.email,
        hasToken: !!authData.token,
        phoneVerified: authData.user.phoneVerified
      });

      const authResult = await register(authData);
      console.log('📋 Resultado de contexto:', authResult);

      if (!authResult.success) {
        console.error('❌ Error guardando en contexto:', authResult.error);
        Alert.alert('Error', 'Cuenta creada pero hubo un problema con la sesión. Intenta iniciar sesión.');
        setLoading(false);
        return;
      }

      setLoading(false);
      console.log('✅ Registro completado exitosamente');
      
      Alert.alert(
        '¡Bienvenido!',
        'Tu cuenta ha sido creada exitosamente',
        [
          {
            text: 'Continuar',
            onPress: () => {
              console.log('🎯 Navegando a pantallacarga1');
              navigation.navigate('pantallacarga1');
            }
          }
        ]
      );

    } catch (error) {
      console.error('💥 Error registrando usuario:', error);
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
      setLoading(false);
    }
  };

  const handlePasswordRecovery = async (verifyData, otpCode) => {
    setLoading(false);
    
    const verifiedToken = verifyData.verifiedToken || verifyData.token || verifyData.recoveryToken || recoveryToken;
    
    console.log('🔑 Código verificado para recuperación, navegando a cambiar contraseña');
    
    Alert.alert(
      'Código Verificado', 
      'El código es correcto. Ahora puedes crear tu nueva contraseña.',
      [
        { 
          text: 'Continuar', 
          onPress: () => {
            navigation.navigate('Recuperacion3', { 
              email: email,
              phone: phone,
              via: via,
              verifiedCode: otpCode,
              recoveryToken: verifiedToken,
              verifiedToken: verifiedToken,
              timestamp: Date.now()
            });
          }
        }
      ]
    );
  };

  const handleBack = () => {
    if (isRegistrationMode) {
      Alert.alert(
        'Cancelar registro',
        '¿Estás seguro de cancelar? Perderás los datos ingresados.',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Sí, cancelar', onPress: () => navigation.goBack(), style: 'destructive' }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleNext = () => {
    handleVerifyCode();
  };

  const handleResend = async () => {
    if (isRegistrationMode && !phone) {
      Alert.alert('Error', 'No se pudo reenviar el código. Número de teléfono no encontrado.');
      return;
    }

    const contactInfo = email || phone;
    if (!contactInfo) {
      Alert.alert('Error', 'No se pudo reenviar el código. Información de contacto no encontrada.');
      return;
    }

    setLoading(true);
    try {
      // ✅ USAR LA MISMA URL Y ESTRUCTURA QUE LA PRIMERA PANTALLA
      const requestURL = `${API_BASE_URL}/api/recovery/requestCode`;
      
      let payload = {};
      
      if (isRegistrationMode) {
        // Modo registro: usar teléfono con formato completo +503
        const fullPhone = phone.startsWith('+503') ? phone : `+503${phone.replace('-', '')}`;
        payload = {
          phone: fullPhone,
          via: 'sms'
        };
      } else {
        // Modo recuperación: usar según el método original
        if (via === 'sms' && phone) {
          // Asegurar formato completo con +503
          const fullPhone = phone.startsWith('+503') ? phone : `+503${phone.replace('-', '')}`;
          payload = {
            phone: fullPhone,
            via: 'sms'
          };
        } else if (via === 'email' && email) {
          payload = {
            email: email,
            via: 'email'
          };
        } else {
          // Fallback
          if (email) {
            payload = { email: email, via: 'email' };
          } else if (phone) {
            const fullPhone = phone.startsWith('+503') ? phone : `+503${phone.replace('-', '')}`;
            payload = { phone: fullPhone, via: 'sms' };
          }
        }
      }
      
      console.log('📤 Reenviando código a:', requestURL);
      console.log('📦 Via:', payload.via);
      console.log('📦 Destino:', payload.phone ? `***${payload.phone.slice(-4)}` : payload.email);
      
      const response = await fetch(requestURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Status reenvío:', response.status);

      // Verificar contenido antes de parsear
      const responseText = await response.text();
      console.log('📄 Respuesta (primeros 200 chars):', responseText.substring(0, 200));
      
      if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE')) {
        console.error('❌ El servidor devolvió HTML:', responseText.substring(0, 500));
        throw new Error('El servidor devolvió HTML en lugar de JSON. Verifica que la API esté funcionando correctamente.');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Error parseando JSON:', parseError);
        console.error('❌ Texto recibido:', responseText);
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('📋 Respuesta parseada:', data);

      if (!response.ok) {
        console.error('❌ Error del servidor:', data);
        Alert.alert('Error', data.message || 'No se pudo reenviar el código');
        return;
      }

      // ✅ Código reenviado exitosamente
      console.log('✅ Código reenviado exitosamente:', data);
      
      // Actualizar el token si viene en la respuesta
      const newToken = data.recoveryToken || data.token;
      
      if (newToken) {
        setRecoveryToken(newToken);
        console.log('🔑 Token actualizado:', newToken.substring(0, 20) + '...');
      } else {
        console.warn('⚠️ No se recibió nuevo token en la respuesta');
      }
      
      // Resetear el formulario
      setTimeLeft(120);
      setOtpValues(['', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      const method = via === 'sms' ? 'SMS' : 'email';
      const destination = data.sentTo || payload.phone || payload.email;
      
      Alert.alert(
        'Código Reenviado', 
        `Se ha enviado un nuevo código por ${method} a ${destination}`
      );
      
    } catch (error) {
      console.error('❌ Error al reenviar código:', error);
      
      let errorMessage = 'No se pudo reenviar el código. Intenta de nuevo.';
      
      if (error.message.includes('HTML')) {
        errorMessage = '🔴 La API no está respondiendo correctamente.\n\nVerifica que:\n• El servidor esté corriendo\n• La ruta /api/recovery/requestCode existe\n• El endpoint esté configurado correctamente';
      } else if (error.message === 'Network request failed' || error.message.includes('network')) {
        errorMessage = '🔴 No se pudo conectar al servidor.\n\nVerifica tu conexión a internet y que el servidor esté funcionando.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isComplete = otpValues.every(value => value !== '');

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
              source={require('../assets/lottie/password.json')}
              autoPlay
              loop={false}
              style={styles.lottieAnimation}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>
              {isRegistrationMode ? 'Verifica tu' : 'Código de'}
            </Text>
            <Text style={styles.titleLight}>
              {isRegistrationMode ? 'teléfono' : 'verificación'}
            </Text>

            <Text style={styles.subtitle}>
              Ingresa el código OTP enviado a{'\n'}
              <Text style={styles.contactText}>
                {isRegistrationMode 
                  ? `***${(phone || '').slice(-4)}` 
                  : (via === 'sms' ? `***${(phone || '').slice(-4)}` : email || 'tu email')
                }
              </Text>
            </Text>

            {/* OTP Inputs modernos */}
            <View style={styles.otpContainer}>
              {otpValues.map((value, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => inputRefs.current[index] = ref}
                  style={[
                    styles.otpInput,
                    value && styles.otpInputFilled,
                    loading && styles.otpInputDisabled
                  ]}
                  value={value}
                  onChangeText={(text) => handleOTPChange(index, text)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  maxLength={1}
                  keyboardType="numeric"
                  textAlign="center"
                  placeholder="0"
                  placeholderTextColor="#D1D5DB"
                  editable={!loading}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#4CAF50" size="small" />
                <Text style={styles.loadingText}>
                  {isRegistrationMode ? 'Creando tu cuenta...' : 'Verificando código...'}
                </Text>
              </View>
            )}

            {/* Timer */}
            <View style={styles.timerContainer}>
              <Icon name="schedule" size={16} color="#6B7280" />
              <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
            </View>

            {/* Resend */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>¿No recibiste el código?</Text>
              <TouchableOpacity 
                onPress={handleResend}
                disabled={timeLeft > 0 || loading}
                style={styles.resendButton}
              >
                <Text style={[
                  styles.resendLink, 
                  (timeLeft > 0 || loading) && styles.resendLinkDisabled
                ]}>
                  {timeLeft > 0 ? 'Espera...' : 'Reenviar código'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Footer fijo */}
        <View style={styles.footerContainer}>
          {/* Progress indicators */}
          <View style={styles.progressContainer}>
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.progressActive]} />
            <View style={styles.progressDot} />
          </View>

          {/* Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.button, 
                (!isComplete || loading) && styles.buttonDisabled
              ]}
              onPress={handleNext}
              disabled={!isComplete || loading}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>
                      {isRegistrationMode ? 'Crear cuenta' : 'Verificar'}
                    </Text>
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

  // OTP Inputs modernos
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 10,
  },
  otpInput: {
    width: 50,
    height: 56,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  otpInputFilled: {
    backgroundColor: '#F0FDF4',
    borderColor: '#4CAF50',
    color: '#1F2937',
  },
  otpInputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    color: '#9CA3AF',
  },

  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: '#4CAF50',
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '500',
  },

  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  timer: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },

  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendLink: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendLinkDisabled: {
    color: '#D1D5DB',
    textDecorationLine: 'none',
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

export default Recuperacion2Screen;