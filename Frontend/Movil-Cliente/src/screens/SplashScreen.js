import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const animationRef = useRef(null);

  useEffect(() => {
    // Inicia la animación automáticamente
    if (animationRef.current) {
      animationRef.current.play();
    }

    // Navegación después de la animación
    const checkAuthAndNavigate = async () => {
      try {
        // Aquí puedes verificar si el usuario ya está logueado
        // const userToken = await AsyncStorage.getItem('userToken');
        // const isLoggedIn = userToken !== null;
        
        const isLoggedIn = false;
        
        setTimeout(() => {
          if (isLoggedIn) {
            navigation.replace('Main');
          } else {
            navigation.replace('Login');
          }
        }, 4000); // 3 segundos
        
      } catch (error) {
        console.error('Error checking auth status:', error);
        setTimeout(() => {
          navigation.replace('Login');
        }, 3000);
      }
    };

    checkAuthAndNavigate();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Animación Lottie */}
        <LottieView
          ref={animationRef}
          source={require('../assets/lottie/smoove - hero animation.json')} // Tu archivo Lottie
          autoPlay
          loop={true}
          style={styles.lottie}
          speed={1}
          // Opcional: si quieres que la animación se reproduzca solo una vez
          // loop={false}
        />
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: width, // Ancho completo de la pantalla
    height: height * 0.8, // 80% del alto de la pantalla
    // Si quieres que ocupe toda la pantalla:
    // width: width,
    // height: height,
  },
});

export default SplashScreen;