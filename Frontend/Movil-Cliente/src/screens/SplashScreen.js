import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        // Aquí puedes verificar si el usuario ya está logueado
        // const userToken = await AsyncStorage.getItem('userToken');
        // const isLoggedIn = userToken !== null;
        
        // Por ahora, simulamos que no está logueado
        const isLoggedIn = false;

        // Mostrar splash por 2-3 segundos
        setTimeout(() => {
          if (isLoggedIn) {
            // Si está logueado, ir directo al dashboard
            navigation.replace('Main');
          } else {
            // Si no está logueado, ir al login
            navigation.replace('Login');
          }
        }, 2500); // 2.5 segundos

      } catch (error) {
        console.error('Error checking auth status:', error);
        // En caso de error, ir al login
        setTimeout(() => {
          navigation.replace('Login');
        }, 2500);
      }
    };

    checkAuthAndNavigate();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo o imagen de splash */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>LOGO</Text>
          </View>
          {/* Si tienes un logo:
          <Image 
            source={require('../assets/splash-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          */}
        </View>

        {/* Nombre de la app */}
        <Text style={styles.appName}>Mi App</Text>
        
        {/* Indicador de carga */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoText: {
    color: '#4CAF50',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logo: {
    width: 150,
    height: 150,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 50,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    opacity: 0.7,
  },
});

export default SplashScreen;