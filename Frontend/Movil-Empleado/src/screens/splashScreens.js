import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  StatusBar,
  Dimensions,
  Easing
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LoadingWithEmojiTruck = ({ 
  message = "viajando por cada parte de ti",
  subtitle = "Conectando con tu ruta..."
}) => {
  // Animaciones
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const truckMove = useRef(new Animated.Value(-150)).current;
  const truckBounce = useRef(new Animated.Value(0)).current;
  const wheelSpin = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const roadProgress = useRef(new Animated.Value(0)).current;
  const smokeOpacity = useRef(new Animated.Value(0)).current;
  const smokeDrift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Secuencia de animaciones de entrada
    Animated.sequence([
      // 1. Logo aparece
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      
      // 2. Texto aparece
      Animated.delay(500),
      Animated.timing(textFade, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Animaciones continuas MUY LENTAS Y SUAVES
    
    // Camión moviéndose SÚPER LENTO
    const truckAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(truckMove, {
          toValue: width + 150,
          duration: 15000, // 15 segundos! Aún más lento
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(truckMove, {
          toValue: -150,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ])
    );

    // Rebote suave y lento
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(truckBounce, {
          toValue: -8,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(truckBounce, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Carretera súper lenta
    const roadAnimation = Animated.loop(
      Animated.timing(roadProgress, {
        toValue: 1,
        duration: 5000, // Más lento
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Humo más realista y lento
    const smokeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(smokeOpacity, {
          toValue: 0.8,
          duration: 2500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(smokeOpacity, {
          toValue: 0.1,
          duration: 2500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Humo desplazándose
    const smokeDriftAnimation = Animated.loop(
      Animated.timing(smokeDrift, {
        toValue: 1,
        duration: 4000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );

    // Iniciar animaciones después del logo
    setTimeout(() => {
      truckAnimation.start();
      bounceAnimation.start();
      roadAnimation.start();
      smokeAnimation.start();
      smokeDriftAnimation.start();
    }, 1500);

    return () => {
      truckAnimation.stop();
      bounceAnimation.stop();
      roadAnimation.stop();
      smokeAnimation.stop();
      smokeDriftAnimation.stop();
    };
  }, []);

  const roadDashOffset = roadProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  const smokeXOffset = smokeDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });

  const smokeYOffset = smokeDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      
      {/* Logo Section */}
      <Animated.View 
        style={[
          styles.logoSection,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }]
          }
        ]}
      >
        <Image 
          source={require('../images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          onError={() => console.log('Error cargando logo')}
        />
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Texto */}
        <Animated.View 
          style={[
            styles.textContainer,
            { opacity: textFade }
          ]}
        >
          <Text style={styles.title}>{message}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </Animated.View>

        {/* Área de animación del camión */}
        <View style={styles.animationArea}>
          {/* Múltiples nubes de humo */}
          <Animated.View 
            style={[
              styles.smoke,
              { 
                opacity: smokeOpacity,
                transform: [
                  { translateX: Animated.add(truckMove, smokeXOffset) },
                  { translateY: smokeYOffset }
                ]
              }
            ]}
          >
            <Text style={styles.smokeText}>💨</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.smoke2,
              { 
                opacity: smokeOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
                transform: [
                  { 
                    translateX: Animated.add(
                      truckMove, 
                      smokeXOffset.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 30],
                      })
                    ) 
                  },
                  { translateY: smokeYOffset }
                ]
              }
            ]}
          >
            <Text style={[styles.smokeText, { fontSize: 16 }]}>💨</Text>
          </Animated.View>

          {/* Camión con Emoji (funciona siempre) */}
          <Animated.View 
            style={[
              styles.truckContainer,
              {
                transform: [
                  { translateX: truckMove },
                  { translateY: truckBounce }
                ]
              }
            ]}
          >
            <View style={styles.truck}>
              {/* Sombra del camión */}
              <View style={styles.truckShadow} />
              
              {/* Camión Emoji */}
              <Text style={styles.truckEmoji}>🚚</Text>
              
              {/* Puedes también intentar cargar tu imagen así: */}
              {/* 
              <Image 
                source={require('../images/camionchito.png')}
                style={styles.truckImage}
                resizeMode="contain"
                onError={() => console.log('Error cargando imagen del camión')}
              />
              */}
            </View>
          </Animated.View>
        </View>

        {/* Carretera mejorada */}
        <View style={styles.roadContainer}>
          <Animated.View 
            style={[
              styles.roadDashes,
              { transform: [{ translateX: roadDashOffset }] }
            ]}
          >
            {[...Array(20)].map((_, i) => (
              <View key={i} style={styles.dash} />
            ))}
          </Animated.View>
        </View>

        {/* Loading indicator mejorado */}
        <View style={styles.loadingContainer}>
          <SlowProgressDots />
        </View>
      </View>
    </View>
  );
};

// Componente de puntos más lentos
const SlowProgressDots = () => {
  const dots = Array.from({ length: 5 }, () => useRef(new Animated.Value(0.2)).current);

  useEffect(() => {
    const animations = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 400), // Aún más separación
          Animated.timing(dot, {
            toValue: 1,
            duration: 1000, // Más lento
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.2,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay((dots.length - index - 1) * 400),
        ])
      )
    );

    animations.forEach(anim => anim.start());
    return () => animations.forEach(anim => anim.stop());
  }, []);

  return (
    <View style={styles.dotsContainer}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            { opacity: dot }
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: 20,
  },
  logo: {
    width: 160,
    height: 80,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  animationArea: {
    height: 120,
    width: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  smoke: {
    position: 'absolute',
    top: 20,
    left: -60,
  },
  smoke2: {
    position: 'absolute',
    top: 30,
    left: -50,
  },
  smokeText: {
    fontSize: 24,
  },
  truckContainer: {
    position: 'absolute',
    left: -150,
    top: 40,
  },
  truck: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  truckShadow: {
    position: 'absolute',
    bottom: -5,
    width: 80,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    zIndex: 0,
  },
  truckEmoji: {
    fontSize: 70, // Camión emoji grande
    textAlign: 'center',
    zIndex: 1,
  },
  truckImage: {
    width: 120,
    height: 70,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  roadContainer: {
    height: 6,
    width: '85%',
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  roadDashes: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  dash: {
    width: 30,
    height: 3,
    backgroundColor: '#4CAF50',
    marginRight: 30,
    borderRadius: 1.5,
  },
  loadingContainer: {
    paddingBottom: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginHorizontal: 8,
  },
});

export default LoadingWithEmojiTruck;