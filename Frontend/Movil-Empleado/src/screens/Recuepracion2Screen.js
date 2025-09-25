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
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutos en segundos
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(route?.params?.email || '');
  const [phone, setPhone] = useState(route?.params?.phone || '');
  const [via, setVia] = useState(route?.params?.via || 'email');
  
  // NUEVO: Recibir el recovery token
  const [recoveryToken, setRecoveryToken] = useState(route?.params?.recoveryToken || '');

  // Referencias para los inputs (auto-focus)
  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Formatear tiempo mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} Sec`;
  };

  // Manejar cambio en campos OTP con auto-focus
  const handleOTPChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      
      // Auto-focus al siguiente campo
      if (value && index < 4) {
        inputRefs.current[index + 1]?.focus();
      }
      
      // Auto-verificar cuando se complete el código
      if (value && index === 4) {
        const completeCode = [...newOtpValues];
        completeCode[index] = value;
        if (completeCode.every(digit => digit !== '')) {
          // Pequeño delay para que se vea el último dígito
          setTimeout(() => {
            handleVerifyCode(completeCode.join(''));
          }, 300);
        }
      }
    }
  };

  // Manejar backspace para regresar al campo anterior
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

    // Verificar que tenemos el recovery token
    if (!recoveryToken) {
      Alert.alert('Error', 'Token de recuperación no encontrado. Solicita un nuevo código.');
      return;
    }

    setLoading(true);
    try {
      console.log('=== DEBUGGING VERIFICACION ===');
      console.log('🔐 Código a verificar:', otpCode);
      console.log('📧 Email:', email);
      console.log('🎫 Recovery Token presente:', !!recoveryToken);
      
      const API_URL = 'https://riveraproject-production-933e.up.railway.app/api/recovery/verifyCode';
      
      // PAYLOAD CORRECTO según el backend
      const payload = {
        code: otpCode,
        recoveryToken: recoveryToken
      };
      
      console.log('📤 Payload enviado:', payload);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
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
        console.error('❌ Error del servidor:', data);
        
        // Mensajes de error más específicos
        let errorMessage = 'Código de verificación incorrecto';
        
        if (data.message) {
          if (data.message.includes('expired') || data.message.includes('expirado')) {
            errorMessage = 'El código ha expirado. Solicita uno nuevo.';
          } else if (data.message.includes('invalid') || data.message.includes('inválido')) {
            errorMessage = 'Código inválido. Verifica que sea correcto.';
          } else if (data.message.includes('not found') || data.message.includes('no encontrado')) {
            errorMessage = 'No se encontró el código. Solicita uno nuevo.';
          } else if (data.message.includes('Token inválido')) {
            errorMessage = 'El código ha expirado. Solicita uno nuevo.';
          } else {
            errorMessage = data.message;
          }
        }
        
        Alert.alert('Error de Verificación', errorMessage);
        
        // Limpiar campos en caso de error
        setOtpValues(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      console.log('✅ Verificación exitosa:', data);
      
      // Extraer el verified token del response
      const verifiedToken = data.verifiedToken;
      
      if (!verifiedToken) {
        Alert.alert('Error', 'No se recibió el token de verificación del servidor');
        return;
      }
      
      Alert.alert(
        'Código Verificado', 
        'El código es correcto. Ahora puedes crear tu nueva contraseña.',
        [
          { 
            text: 'Continuar', 
            onPress: () => navigation.navigate('Recuperacion3', { 
              email: email,
              phone: phone,
              via: via,
              verifiedToken: verifiedToken  // Pasar el verified token
            })
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error al verificar código:', error);
      
      // Manejo específico de errores
      let errorMessage = 'No se pudo verificar el código. Intenta de nuevo.';
      
      if (error.message.includes('HTML')) {
        errorMessage = 'Error del servidor. La API no está respondiendo correctamente.';
      } else if (error.message === 'Network request failed') {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'La solicitud tardó demasiado. Intenta de nuevo.';
      }
      
      Alert.alert('Error', errorMessage);
      
      // Limpiar campos y enfocar el primero
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
    if (!email) {
      Alert.alert('Error', 'No se pudo reenviar el código. Email no encontrado.');
      return;
    }

    try {
      console.log('🔄 Reenviando código para:', email);
      
      const API_URL = 'https://riveraproject-production-933e.up.railway.app/api/recovery/requestCode';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          via: 'email'
        }),
      });

      const responseText = await response.text();
      
      if (!responseText.includes('<html>')) {
        const data = JSON.parse(responseText);

        if (response.ok) {
          // Actualizar el recovery token con el nuevo
          if (data.recoveryToken) {
            setRecoveryToken(data.recoveryToken);
          }
          
          setTimeLeft(120); // Reiniciar timer
          setOtpValues(['', '', '', '', '']); // Limpiar campos
          inputRefs.current[0]?.focus(); // Enfocar primer campo
          
          Alert.alert('Código Reenviado', 'Se ha enviado un nuevo código a tu email.');
        } else {
          Alert.alert('Error', data.message || 'No se pudo reenviar el código');
        }
      } else {
        throw new Error('Error del servidor');
      }
    } catch (error) {
      console.error('❌ Error al reenviar:', error);
      Alert.alert('Error', 'No se pudo reenviar el código. Intenta de nuevo.');
    }
  };

  const isComplete = otpValues.every(value => value !== '');

  return (
    <View style={styles.container}>
      {/* Contenido principal */}
      <View style={styles.content}>
        
        {/* Ilustración */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../images/contra2.png')} // Ajusta la ruta según tu estructura
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Título */}
        <Text style={styles.title}>
          Código de verificación
        </Text>

        {/* Subtítulo con email */}
        <Text style={styles.subtitle}>
          Ingresa el código OTP enviado a • <Text style={styles.emailText}>{email || 'tu email'}</Text>
        </Text>

        {/* Campos OTP */}
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

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#10b981" size="small" />
            <Text style={styles.loadingText}>Verificando código...</Text>
          </View>
        )}

        {/* Timer */}
        <Text style={styles.timer}>
          {formatTime(timeLeft)}
        </Text>

        {/* Reenviar */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            ¿No recibiste nada?{' '}
            <Text 
              style={[styles.resendLink, timeLeft > 0 && styles.resendLinkDisabled]} 
              onPress={timeLeft === 0 ? handleResend : null}
            >
              {timeLeft > 0 ? 'Reenviar en' : 'Reenviar'}
            </Text>
          </Text>
        </View>
      </View>

      {/* Navegación inferior */}
      <View style={styles.navigation}>
        <TouchableOpacity onPress={handleBack} disabled={loading}>
          <Text style={[styles.navButton, loading && styles.navButtonDisabled]}>Atrás</Text>
        </TouchableOpacity>
        
        {/* Indicadores de progreso */}
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