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
  const [dui, setDui] = useState('');
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

  // ✅ FORMATO AUTOMÁTICO DE DUI CON GUIÓN
  const formatDUI = (text) => {
    // Remover todo excepto números
    const numbers = text.replace(/[^0-9]/g, '');
    
    // Limitar a 9 dígitos máximo
    const limited = numbers.slice(0, 9);
    
    // Si tiene 8 o más dígitos, agregar el guión
    if (limited.length > 8) {
      return `${limited.slice(0, 8)}-${limited.slice(8)}`;
    }
    
    return limited;
  };

  const handleDuiChange = (text) => {
    const formatted = formatDUI(text);
    setDui(formatted);
  };

  const validateForm = () => {
    // Remover guión para validar
    const duiSinGuion = dui.replace(/-/g, '');
    
    if (!duiSinGuion.trim()) {
      Alert.alert('Error', 'Ingresa tu DUI');
      return false;
    }
    
    if (duiSinGuion.length !== 9) {
      Alert.alert('Error', 'El DUI debe tener 9 dígitos');
      return false;
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Ingresa tu contraseña');
      return false;
    }
    
    return true;
  };

@@ -96,17 +81,17 @@

    setLoading(true);
    try {
      const API_URL = 'https://rivera-test-629395560179.us-west1.run.app/api/login';


      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          dui: dui.trim(), // ✅ Enviar con guión tal como está
          password: password.trim(),
        }),
      });
@@ -118,15 +103,13 @@
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
@@ -141,7 +124,6 @@
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      {/* Lottie fondo */}
      <LottieView
        source={require('../../assets/lottie/Background Full Screen-Train.json')}
        autoPlay
@@ -161,31 +143,32 @@
          }}
        >
          <BlurView intensity={45} tint="light" style={styles.card}>
            <Image source={require('../images/logo.png')} style={styles.logo} />




            <Text style={styles.title}>Rivera distribuidora y transporte</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>





            {/* ✅ CAMPO DUI CON FORMATO AUTOMÁTICO */}
            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <Icon name="card-outline" size={16} color="#555" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="DUI (ej: 12345678-9)"
                placeholderTextColor="#777"
                value={dui}
                onChangeText={handleDuiChange}
                keyboardType="number-pad"
                maxLength={10} // ✅ 8 dígitos + guión + 1 dígito = 10 caracteres
                editable={!loading}
              />
              {dui.length > 0 && (
                <Text style={styles.duiCounter}>
                  {dui.replace(/-/g, '').length}/9
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
@@ -201,9 +184,15 @@
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>


                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}




                  size={18}
                  color="#555"
                />
@@ -212,14 +201,25 @@

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
@@ -239,20 +239,13 @@
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
@@ -271,7 +264,6 @@
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
@@ -291,26 +283,12 @@
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111',
  },
  duiCounter: {
    fontSize: 12,
    color: '#777',
    fontWeight: '600',
    marginLeft: 8,
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
@@ -331,4 +309,4 @@
  },
});

export default InicioSesionScreen;
