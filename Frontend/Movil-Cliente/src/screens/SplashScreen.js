import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();
  
  // Animaciones
  const letterScale = useRef(new Animated.Value(0.8)).current;
  const letterOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de la letra R
    const letterAnimation = Animated.sequence([
      // Fade in y scale up
      Animated.parallel([
        Animated.timing(letterOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(letterScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Pequeña animación de "pulso"
      Animated.loop(
        Animated.sequence([
          Animated.timing(letterScale, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(letterScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]);

    letterAnimation.start();

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
        }, 3000); // 3 segundos
        
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
        
        {/* Letra R animada */}
        <Animated.View 
          style={[
            styles.letterContainer,
            { 
              opacity: letterOpacity,
              transform: [{ scale: letterScale }]
            }
          ]}
        >
          <Text style={styles.letter}>R</Text>
        </Animated.View>
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fondo blanco como PedidosYa
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    // Opcional: agregar sombra
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  letter: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#E91E63', // Color rosa/magenta como en la imagen
    textAlign: 'center',
  },
});

export default SplashScreen;  