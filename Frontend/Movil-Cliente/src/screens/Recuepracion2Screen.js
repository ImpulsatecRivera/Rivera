import React, { useState, useEffect, useRef } from 'react';
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
  
  // ⭐ NUEVO: Detectar si es registro o recuperación
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

  // Debug mejorado
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} Seg`;
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

  // ⭐ MODIFICADO: Manejar verificación según el modo
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
      // 1️⃣ VERIFICAR CÓDIGO
      const verifyURL = `${API_BASE_URL}/api/auth/verifyCode`;
      
      const payload = {
        code: otpCode,
        recoveryToken: recoveryToken,
        isPhoneVerification: isRegistrationMode // ⭐ Flag para el backend
      };

      if (email) payload.email = email;
      if (phone) payload.phone = phone;
      if (via) payload.via = via;

      console.log('📤 Enviando verificación:', {
        code: otpCode,
        isPhoneVerification: isRegistrationMode,
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

      // 2️⃣ FLUJO SEGÚN EL MODO
      if (isRegistrationMode) {
        // 🆕 MODO REGISTRO: Completar registro
        await handleUserRegistration(verifyData);
      } else {
        // 🔑 MODO RECUPERACIÓN: Ir a cambiar contraseña
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

  // ⭐ NUEVO: Completar registro de usuario
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
      
      // Agregar todos los campos
      Object.keys(registrationData).forEach(key => {
        if (key !== 'profileImage' && key !== 'phoneNormalized') {
          formData.append(key, registrationData[key]);
        }
      });

      // Agregar imagen si existe
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

      // 3️⃣ GUARDAR EN CONTEXTO
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
          phoneVerified: true, // ⭐ Ya verificado
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

      // 4️⃣ ÉXITO
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

  // ⭐ RECUPERACIÓN: Navegar a cambiar contraseña
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
      const requestURL = `${API_BASE_URL}/api/auth/requestCode`;
      
      const payload = {};
      if (isRegistrationMode) {
        // En modo registro, siempre por SMS
        payload.phone = registrationData.phoneNormalized || phone;
        payload.via = 'sms';
      } else {
        // En modo recuperación, según el método original
        if (via === 'email' && email) {
          payload.email = email;
          payload.via = 'email';
        } else if (via === 'sms' && phone) {
          payload.phone = phone;
          payload.via = 'sms';
        } else {
          payload.email = email;
          payload.via = 'email';
        }
      }
      
      console.log('📤 Reenviando código:', payload);
      
      const response = await fetch(requestURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('📄 Respuesta reenvío:', responseText.substring(0, 200));
      
      if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE')) {
        throw new Error('El servidor devolvió HTML. La API no está funcionando correctamente.');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Respuesta inválida del servidor');
      }

      if (response.ok && data.success) {
        // Buscar y actualizar el token
        const newToken = data.recoveryToken || data.token;
        
        if (newToken) {
          setRecoveryToken(newToken);
          console.log('✅ Token de recuperación actualizado');
        }
        
        setTimeLeft(120);
        setOtpValues(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
        
        const method = isRegistrationMode ? 'SMS' : (via === 'sms' ? 'teléfono' : 'email');
        Alert.alert('Código Reenviado', `Se ha enviado un nuevo código a tu ${method}.`);
      } else {
        Alert.alert('Error', data.message || 'No se pudo reenviar el código');
      }
    } catch (error) {
      console.error('❌ Error al reenviar código:', error);
      Alert.alert('Error', error.message || 'No se pudo reenviar el código. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const isComplete = otpValues.every(value => value !== '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../images/contra2.png')} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>
          {isRegistrationMode ? 'Verifica tu teléfono' : 'Código de verificación'}
        </Text>

        <Text style={styles.subtitle}>
          Ingresa el código OTP enviado a • <Text style={styles.emailText}>
            {isRegistrationMode 
              ? `***${(phone || '').slice(-4)}` 
              : (via === 'sms' ? `***${(phone || '').slice(-4)}` : email || 'tu email')
            }
          </Text>
        </Text>

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
              placeholderTextColor="#9ca3af"
              editable={!loading}
              autoFocus={index === 0}
            />
          ))}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#10b981" size="small" />
            <Text style={styles.loadingText}>
              {isRegistrationMode ? 'Creando tu cuenta...' : 'Verificando código...'}
            </Text>
          </View>
        )}

        <Text style={styles.timer}>
          {formatTime(timeLeft)}
        </Text>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            ¿No recibiste nada?{' '}
            <Text 
              style={[styles.resendLink, (timeLeft > 0 || loading) && styles.resendLinkDisabled]} 
              onPress={(timeLeft === 0 && !loading) ? handleResend : null}
            >
              {timeLeft > 0 ? 'Reenviar en' : 'Reenviar'}
            </Text>
          </Text>
        </View>

        {/* Información de debug */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              Modo: {isRegistrationMode ? '🆕 REGISTRO' : '🔑 RECUPERACIÓN'} | Token: {recoveryToken ? '✅' : '❌'}
            </Text>
            {!recoveryToken && (
              <Text style={styles.debugTextError}>
                ⚠️ Sin token - Verifica el flujo anterior
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.navigation}>
        <TouchableOpacity onPress={handleBack} disabled={loading}>
          <Text style={[styles.navButton, loading && styles.navButtonDisabled]}>Atrás</Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={styles.progressDot} />
        </View>
        
        <TouchableOpacity 
          onPress={handleNext} 
          disabled={!isComplete || loading}
        >
          <Text style={[
            styles.navButton, 
            styles.nextButton,
            (!isComplete || loading) && styles.navButtonDisabled
          ]}>
            {loading ? 'Verificando...' : (isRegistrationMode ? 'Crear cuenta' : 'Verificar')}
          </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  image: {
    width: 256,
    height: 320,
  },
  title: {
    fontSize: 20,
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
  },
  emailText: {
    fontWeight: '600',
    color: '#111827',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 48,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginHorizontal: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  otpInputFilled: {
    backgroundColor: '#10b981',
    color: '#fff',
    borderColor: '#059669',
  },
  otpInputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: '#10b981',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  timer: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 24,
  },
  resendContainer: {
    marginBottom: 32,
  },
  resendText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
  resendLink: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#9ca3af',
  },
  debugContainer: {
    backgroundColor: '#f0f9ff',
    padding: 8,
    borderRadius: 4,
    marginTop: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#0369a1',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  debugTextError: {
    fontSize: 12,
    color: '#dc2626',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 4,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  navButton: {
    color: '#6b7280',
    fontWeight: '600',
  },
  navButtonDisabled: {
    color: '#d1d5db',
  },
  nextButton: {
    color: '#10b981',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  progressBar: {
    width: 32,
    height: 8,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  progressActive: {
    backgroundColor: '#111827',
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

export default Recuperacion2Screen;