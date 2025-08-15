import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet 
} from 'react-native';

const Recuperacion5 = ({ navigation }) => {
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutos en segundos

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

  // Manejar cambio en campos OTP
  const handleOTPChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleResend = () => {
    setTimeLeft(120); // Reiniciar timer
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
          Codigo de verificacion
        </Text>

        {/* Subtítulo con número */}
        <Text style={styles.subtitle}>
          Ingrese el OTP enviado a • <Text style={styles.phoneNumber}>+91-8976500001</Text>
        </Text>

        {/* Campos OTP */}
        <View style={styles.otpContainer}>
          {otpValues.map((value, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              value={value}
              onChangeText={(text) => handleOTPChange(index, text)}
              maxLength={1}
              keyboardType="numeric"
              textAlign="center"
              placeholder="2"
              placeholderTextColor="#9ca3af"
            />
          ))}
        </View>

        {/* Timer */}
        <Text style={styles.timer}>
          {formatTime(timeLeft)}
        </Text>

        {/* Reenviar */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            No recibiste nada?{' '}
            <Text style={styles.resendLink} onPress={handleResend}>
              Reenviar
            </Text>
          </Text>
        </View>
      </View>

      {/* Navegación inferior */}
      <View style={styles.navigation}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.navButton}>Atrás</Text>
        </TouchableOpacity>
        
        {/* Indicadores de progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={[styles.progressBar, styles.progressActive]} />
        </View>
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
    backgroundColor: '#fff',
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
    width: 288,
    height: 256,
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
  phoneNumber: {
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginHorizontal: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  timer: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 24,
  },
  resendContainer: {
    marginBottom: 64,
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

export default Recuperacion5;