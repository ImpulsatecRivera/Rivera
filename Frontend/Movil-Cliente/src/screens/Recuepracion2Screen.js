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

const Recuperacion2Screen = ({ navigation, route }) => {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState(route?.params?.email || '');
  const [phone, setPhone] = useState(route?.params?.phone || '');
  const [via, setVia] = useState(route?.params?.via || 'email');
  const [recoveryToken, setRecoveryToken] = useState(route?.params?.recoveryToken || '');

  const inputRefs = useRef([]);

  // Debug info
  useEffect(() => {
    console.log('🔍 Recuperacion2Screen params:', {
      email,
      phone,
      via,
      recoveryToken: recoveryToken ? `${recoveryToken.substring(0, 20)}...` : 'null',
      fromScreen: route?.params?.fromScreen
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} Sec`;
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

    // Verificación crítica del token
    if (!recoveryToken) {
      console.error('❌ No hay token de recuperación disponible');
      Alert.alert(
        'Token No Disponible', 
        'No se encontró el token de recuperación. Necesitas solicitar un nuevo código.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Nuevo Código', 
            onPress: () => navigation.navigate('RecuperacionScreen')
          }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const API_URL = 'https://riveraproject-production.up.railway.app/api/recovery/verifyCode';
      
      // PAYLOAD CORREGIDO - El backend espera estos campos exactos
      const payload = {
        code: otpCode,
        recoveryToken: recoveryToken  // Este es el campo principal que espera el backend
      };

      // Agregar email si está disponible (para compatibilidad con el backend)
      if (email) {
        payload.email = email;
      }

      // Agregar phone si está disponible
      if (phone) {
        payload.phone = phone;
      }
      
      console.log('📤 Enviando verificación:', {
        code: otpCode,
        hasToken: !!recoveryToken,
        tokenStart: recoveryToken ? recoveryToken.substring(0, 20) : 'null',
        email,
        phone,
        via
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
      console.log('📄 Response text:', responseText);

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
        console.log('❌ Error response:', data);
        
        if (response.status === 400) {
          const message = data.message || '';
          
          if (message.includes('Token de recuperación requerido') || 
              message.includes('Token requerido') ||
              message.includes('Recovery token required') ||
              message.includes('recoveryToken')) {
            
            Alert.alert(
              'Token Requerido', 
              'El servidor requiere un token de recuperación válido.\n\n¿Deseas solicitar un nuevo código?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { 
                  text: 'Nuevo Código', 
                  onPress: () => navigation.navigate('RecuperacionScreen')
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
                  onPress: () => navigation.navigate('RecuperacionScreen')
                }
              ]
            );
            return;
          }

          if (message.includes('inválido') || message.includes('invalid') || message.includes('incorrecto')) {
            Alert.alert('Error', 'Código de verificación incorrecto. Inténtalo de nuevo.');
            setOtpValues(['', '', '', '', '']);
            inputRefs.current[0]?.focus();
            return;
          }
        }
        
        Alert.alert('Error', data.message || 'Código de verificación incorrecto');
        setOtpValues(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      // Verificación exitosa
      console.log('✅ Código verificado exitosamente:', data);

      // Extraer el nuevo token si viene en la respuesta
      let verifiedToken = data.verifiedToken || data.token || recoveryToken;

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
                recoveryToken: verifiedToken,  // Usar el token verificado
                verifiedToken: verifiedToken,   // Mantener ambos nombres para compatibilidad
                timestamp: Date.now()
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error en verificación:', error);
      
      if (error.message.includes('HTML')) {
        Alert.alert(
          'Error del Servidor', 
          'La API no está respondiendo correctamente.\n\nVerifica que el servidor esté funcionando.'
        );
      } else if (error.message === 'Network request failed' || error.message.includes('network')) {
        Alert.alert(
          'Error de Conexión', 
          'No se pudo conectar al servidor.\n\nVerifica tu conexión a internet.'
        );
      } else {
        Alert.alert('Error', error.message || 'No se pudo verificar el código. Intenta de nuevo.');
      }
      
      setOtpValues(['', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    handleVerifyCode();
  };

  const handleResend = async () => {
    const contactInfo = email || phone;
    if (!contactInfo) {
      Alert.alert('Error', 'No se pudo reenviar el código. Información de contacto no encontrada.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = 'https://riveraproject-production.up.railway.app/api/recovery/requestCode';
      
      // Crear payload según el método original
      const payload = {};
      if (via === 'email' && email) {
        payload.email = email;
        payload.via = 'email';
      } else if (via === 'sms' && phone) {
        payload.phone = phone;
        payload.via = 'sms';
      } else {
        // Fallback a email si no está claro
        payload.email = email;
        payload.via = 'email';
      }
      
      console.log('📤 Reenviando código:', payload);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('📄 Respuesta reenvío:', responseText);
      
      if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE')) {
        throw new Error('El servidor devolvió HTML. La API no está funcionando correctamente.');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Respuesta inválida del servidor');
      }

      if (response.ok) {
        // Buscar y actualizar el token de recuperación
        const possibleTokenFields = [
          'recoveryToken', 'token', 'reset_token', 'resetToken', 
          'access_token', 'accessToken', 'verification_token',
          'verificationToken', 'temp_token', 'tempToken'
        ];
        
        let newToken = null;
        
        // Buscar en el objeto principal
        for (const field of possibleTokenFields) {
          if (data[field] && typeof data[field] === 'string') {
            newToken = data[field];
            console.log(`🔑 Nuevo token encontrado en '${field}'`);
            break;
          }
        }
        
        // Buscar en data.data si existe
        if (!newToken && data.data && typeof data.data === 'object') {
          for (const field of possibleTokenFields) {
            if (data.data[field] && typeof data.data[field] === 'string') {
              newToken = data.data[field];
              console.log(`🔑 Nuevo token encontrado en data.${field}`);
              break;
            }
          }
        }
        
        // Actualizar el token si se encontró uno nuevo
        if (newToken) {
          setRecoveryToken(newToken);
          console.log('✅ Token de recuperación actualizado');
        } else {
          console.warn('⚠️ No se recibió nuevo token en el reenvío, manteniendo el actual');
        }
        
        setTimeLeft(120);
        setOtpValues(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
        
        Alert.alert('Código Reenviado', `Se ha enviado un nuevo código a tu ${via === 'sms' ? 'teléfono' : 'email'}.`);
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
          Código de verificación
        </Text>

        <Text style={styles.subtitle}>
          Ingresa el código OTP enviado a • <Text style={styles.emailText}>
            {via === 'sms' ? `***${(phone || '').slice(-4)}` : email || 'tu email'}
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
            <Text style={styles.loadingText}>Verificando código...</Text>
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

        {/* Debug info en desarrollo */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              Via: {via} | Token: {recoveryToken ? '✓' : '❌'}
            </Text>
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
            {loading ? 'Verificando...' : 'Verificar'}
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