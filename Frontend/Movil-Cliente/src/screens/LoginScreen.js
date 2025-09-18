import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/authContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('riveraproject-production.up.railway.app/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === "Inicio de sesión completado") {
        const result = await login({
          token: data.token,
          user: data.user,
          userType: data.userType,
        });

        if (!result?.success) {
          Alert.alert('Error', result?.error || 'No se pudo guardar la sesión');
          return;
        }

        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        if (data.blocked) {
          Alert.alert('Cuenta Bloqueada', data.message);
        } else if (data.attemptsRemaining !== undefined) {
          Alert.alert('Credenciales Incorrectas', data.message);
        } else {
          Alert.alert('Error de Login', data.message);
        }
      }
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert('Error', 'Error de conexión: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => navigation.navigate('InicioRecuperar');
  const handleRegister = () => navigation.navigate('RegistrarseCliente');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Bienvenido de vuelta!</Text>
          <Text style={styles.subtitle}>Acceso exclusivo para clientes</Text>

          <View style={styles.form}>
            <CustomInput
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              iconName="person"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <CustomInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              iconName="lock"
              editable={!isLoading}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <CustomButton
              title={isLoading ? "Iniciando sesión..." : "Login"}
              onPress={handleLogin}
              backgroundColor={isLoading ? "#A5D6A7" : "#4CAF50"}
              disabled={isLoading}
            />

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>Verificando credenciales...</Text>
              </View>
            )}
          </View>

          {!isLoading && (
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>Regístrate</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center' 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 24, 
    paddingVertical: 40, 
    justifyContent: 'center' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#333', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 40 
  },
  form: { 
    marginBottom: 30 
  },
  forgotPassword: { 
    alignSelf: 'flex-end', 
    marginBottom: 20 
  },
  forgotPasswordText: { 
    color: '#007AFF', 
    fontSize: 14 
  },
  loadingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 16 
  },
  loadingText: { 
    marginLeft: 8, 
    color: '#666', 
    fontSize: 14 
  },
  registerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  registerText: { 
    color: '#666', 
    fontSize: 14 
  },
  registerLink: { 
    color: '#007AFF', 
    fontSize: 14, 
    fontWeight: '600' 
  },
});

export default LoginScreen;