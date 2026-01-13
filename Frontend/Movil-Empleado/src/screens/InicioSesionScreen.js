import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../Context/authContext';

const { width, height } = Dimensions.get('window');

const InicioSesionScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresa tu email');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Ingresa tu contraseña');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const API_URL = 'https://rivera-test-629395560179.us-west1.run.app/api/login';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message || 'Error al iniciar sesión');
        return;
      }

      if (data.userType !== 'Motorista') {
        Alert.alert('Acceso denegado', 'Solo motoristas pueden usar esta app');
        return;
      }

      await login({
        user: data.user,
        userType: data.userType,
        token: data.token || null,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      {/* Lottie fondo */}
      <LottieView
        source={require('../../assets/lottie/Background Full Screen-Train.json')}
        autoPlay
        loop
        resizeMode="cover"
        style={styles.lottie}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }],
          }}
        >
          <BlurView intensity={45} tint="light" style={styles.card}>
            <Image source={require('../images/logo.png')} style={styles.logo} />

            <Text style={styles.title}>Rivera distribuidora y transporte</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <Icon name="mail-outline" size={16} color="#555" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#777"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <Icon name="lock-closed-outline" size={16} color="#555" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#777"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPill}
              onPress={() => navigation.navigate('elegirMetodoRecuperacion')}
              disabled={loading}
            >
              <Icon name="help-circle-outline" size={14} color="#2ecc71" />
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogin} disabled={loading}>
              <LinearGradient
                colors={['#4CAF50', '#2ecc71']}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lottie: {
    position: 'absolute',
    width,
    height,
  },
  card: {
    width: '85%',
    alignSelf: 'center',
    padding: 24,
    borderRadius: 26,
    overflow: 'hidden',
  },
  logo: {
    width: 64,
    height: 64,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111',
  },
  forgotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  forgotText: {
    fontSize: 13,
    color: '#2ecc71',
    marginLeft: 6,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default InicioSesionScreen;
