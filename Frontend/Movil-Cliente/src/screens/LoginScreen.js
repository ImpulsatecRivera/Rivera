import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import SocialButton from '../components/SocialButton';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = () => {
    console.log('Login pressed');
    // Aquí iría la lógica de login
    // Si el login es exitoso, navegar a Main
    navigation.navigate('Main');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
    // Navegar a la primera pantalla de recuperación de contraseña
    navigation.navigate('InicioRecuperar');
  };

  const handleGoogleLogin = () => {
    console.log('Google login pressed');
    // Aquí iría la lógica de login con Google
    // Si el login es exitoso, navegar a Main
    // navigation.navigate('Main');
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login pressed');
    // Aquí iría la lógica de login con Facebook
    // Si el login es exitoso, navegar a Main
    // navigation.navigate('Main');
  };

  const handleRegister = () => {
    console.log('Register pressed');
    // Navegar a la primera pantalla de registro
    navigation.navigate('RegistrarseCliente');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>Bienvenido de vuelta!</Text>

          {/* Form */}
          <View style={styles.form}>
            <CustomInput
              placeholder="Nombre de usuario o correo"
              value={email}
              onChangeText={setEmail}
              iconName="person"
            />

            <CustomInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              iconName="lock"
            />

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <CustomButton
              title="Login"
              onPress={handleLogin}
              backgroundColor="#4CAF50"
            />
          </View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <Text style={styles.socialText}>O inicia sesión con</Text>
            
            <View style={styles.socialButtons}>
              <SocialButton 
                type="google" 
                onPress={handleGoogleLogin} 
              />
              <SocialButton 
                type="facebook" 
                onPress={handleFacebookLogin} 
              />
            </View>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    marginBottom: 30,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  socialContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  socialText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;