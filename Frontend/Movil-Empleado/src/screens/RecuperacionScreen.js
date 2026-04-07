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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import LottieView from 'lottie-react-native'; // 👉 Descomenta si usarás Lottie

const { width, height } = Dimensions.get('window');

const RecuperacionScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isOnlyNumbers = (text) => /^\d+$/.test(text.trim());

  const handleEmailChange = (text) => {
    setEmail(text);
    setEmailError('');

    if (text.length > 0) {
      if (isOnlyNumbers(text)) {
        setEmailError('Ingresa un email, no un número de teléfono');
      } else if (text.length > 3 && !validateEmail(text)) {
        setEmailError('Formato de email inválido');
      }
    }
  };

  const handleNext = async () => {
    if (!validateEmail(email)) return;

    setLoading(true);
    try {
      const API_URL = 'https://rivera-test.onrender.com/api/recovery/requestCode';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), via: 'email' }),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (!response.ok) throw new Error(data.message || 'Error al enviar código');

      if (!data.recoveryToken) throw new Error('Token no recibido');

      Alert.alert('Código enviado', 'Revisa tu correo electrónico', [
        {
          text: 'Continuar',
          onPress: () =>
            navigation.navigate('Recuperacion2', {
              email: email.trim(),
              recoveryToken: data.recoveryToken,
            }),
        },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = email && validateEmail(email) && !isOnlyNumbers(email);
  const isButtonDisabled = !isEmailValid || loading;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}> 
          <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {/* Ilustración o Lottie */}
          <View style={styles.imageContainer}>
            {/* OPCIÓN LOTTIE */}
            {/*
            <LottieView
              source={require('../lotties/forgot-password.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
            */}

            {/* OPCIÓN IMAGEN */}
            <Image
              source={require('../images/recuperarcontra.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>

          <Text style={styles.subtitle}>
            Ingresa tu correo electrónico y te enviaremos un código de recuperación.
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Icon name="email" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="ejemplo@correo.com"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {emailError && (
              <View style={styles.errorContainer}>
                <Icon name="error-outline" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{emailError}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={isButtonDisabled}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.loadingText}>Enviando...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Enviar código</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>Rivera distribuidora y transporte · 2025</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f3f4f6',
    paddingBottom: 30,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  card: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: width * 0.5,
    height: width * 0.4,
  },
  lottie: {
    width: width * 0.6,
    height: width * 0.6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorContainer: {
    flexDirection: 'row',
    marginTop: 6,
    alignItems: 'center',
  },
  errorText: {
    marginLeft: 6,
    color: '#ef4444',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#fff',
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 13,
  },
});

export default RecuperacionScreen;
