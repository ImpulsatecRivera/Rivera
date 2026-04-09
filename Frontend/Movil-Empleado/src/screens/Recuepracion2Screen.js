import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native'; // 👈 opcional

const { width, height } = Dimensions.get('window');

const Recuperacion2Screen = ({ navigation, route }) => {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);
  const [email] = useState(route?.params?.email || '');
  const [phone] = useState(route?.params?.phone || '');
  const [via] = useState(route?.params?.via || 'email');
  const [recoveryToken, setRecoveryToken] = useState(route?.params?.recoveryToken || '');

  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
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
      const newOtp = [...otpValues];
      newOtp[index] = value;
      setOtpValues(newOtp);

      if (value && index < 4) inputRefs.current[index + 1]?.focus();

      if (index === 4 && newOtp.every(v => v !== '')) {
        setTimeout(() => handleVerifyCode(newOtp.join('')), 300);
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
      Alert.alert('Error', 'Ingresa el código completo');
      return;
    }

    if (!recoveryToken) {
      Alert.alert('Error', 'Token no válido. Solicita otro código.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://rivera-test.onrender.com/api/recovery/verifyCode', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ code: otpCode, recoveryToken }),
      });

      const text = await response.text();
      const data = JSON.parse(text);

      if (!response.ok) throw new Error(data.message || 'Código inválido');

      if (!data.verifiedToken) throw new Error('Token no recibido');

      navigation.navigate('Recuperacion3', {
        email,
        phone,
        via,
        verifiedToken: data.verifiedToken,
      });
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo verificar');
      setOtpValues(['', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch('https://rivera-test.onrender.com/api/recovery/requestCode', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, via: 'email' }),
      });

      const text = await response.text();
      const data = JSON.parse(text);

      if (!response.ok) throw new Error(data.message);

      if (data.recoveryToken) setRecoveryToken(data.recoveryToken);

      setTimeLeft(120);
      setOtpValues(['', '', '', '', '']);
      inputRefs.current[0]?.focus();

      Alert.alert('Código reenviado', 'Revisa tu correo');
    } catch {
      Alert.alert('Error', 'No se pudo reenviar');
    }
  };

  const isComplete = otpValues.every(v => v !== '');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>

          {/* LOTTIE OPCIONAL */}
          {
          <LottieView
            source={require("../../assets/lottie/Two factor authentication.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
          }


          <Text style={styles.title}>Código de verificación</Text>

          <Text style={styles.subtitle}>
            Enviado a <Text style={styles.email}>{email}</Text>
          </Text>

          <View style={styles.otpContainer}>
            {otpValues.map((v, i) => (
              <TextInput
                key={i}
                ref={(r) => (inputRefs.current[i] = r)}
                style={[styles.otpInput, v && styles.otpFilled]}
                value={v}
                onChangeText={(t) => handleOTPChange(i, t)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                editable={!loading}
              />
            ))}
          </View>

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#10b981" />
              <Text style={styles.loadingText}>Verificando...</Text>
            </View>
          )}

          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

          <TouchableOpacity
            disabled={timeLeft > 0}
            onPress={handleResend}
          >
            <Text style={[styles.resend, timeLeft > 0 && styles.resendDisabled]}>
              {timeLeft > 0 ? 'Reenviar en breve' : 'Reenviar código'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.verifyButton, (!isComplete || loading) && styles.verifyDisabled]}
            onPress={() => handleVerifyCode()}
            disabled={!isComplete || loading}
          >
            <Text style={styles.verifyText}>Verificar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Rivera distribuidora y transporte © 2025</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  image: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 16,
  },
  lottie: {
    width: width * 0.6,
    height: width * 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  email: {
    fontWeight: '600',
    color: '#111827',
  },
  otpContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  otpInput: {
    width: 48,
    height: 48,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginHorizontal: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  otpFilled: {
    backgroundColor: '#10b981',
    color: '#fff',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: '#10b981',
  },
  timer: {
    color: '#6b7280',
    marginBottom: 12,
  },
  resend: {
    color: '#3b82f6',
    marginBottom: 24,
    fontWeight: '600',
  },
  resendDisabled: {
    color: '#9ca3af',
  },
  verifyButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  verifyDisabled: {
    backgroundColor: '#d1d5db',
  },
  verifyText: {
    color: '#fff',
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    color: '#9ca3af',
  },
});

export default Recuperacion2Screen;
