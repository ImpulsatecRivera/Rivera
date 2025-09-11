import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SplashScreen = ({ onAnimationFinish }) => {
  const lottieRef = useRef(null);
  
  // Valores animados
  const opacity = useSharedValue(0);
  const logoScale = useSharedValue(0.3);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const loadingOpacity = useSharedValue(0);

  useEffect(() => {
    // Iniciar secuencia de animaciones
    startAnimationSequence();
  }, []);

  const startAnimationSequence = () => {
    // Fade in general
    opacity.value = withTiming(1, { duration: 800 });
    
    // Animación del logo (escala)
    logoScale.value = withDelay(
      200,
      withTiming(1, {
        duration: 1200,
        easing: Easing.out(Easing.back(1.2)),
      })
    );

    // Animación del título
    titleOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 600 })
    );
    titleTranslateY.value = withDelay(
      800,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) })
    );

    // Animación del subtítulo
    subtitleOpacity.value = withDelay(
      1200,
      withTiming(1, { duration: 600 })
    );
    subtitleTranslateY.value = withDelay(
      1200,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) })
    );

    // Indicador de carga
    loadingOpacity.value = withDelay(
      1600,
      withTiming(1, { duration: 400 })
    );

    // Simular tiempo de carga y luego hacer fade out
    setTimeout(() => {
      opacity.value = withTiming(
        0,
        { duration: 600 },
        (finished) => {
          if (finished && onAnimationFinish) {
            runOnJS(onAnimationFinish)();
          }
        }
      );
    }, 4000);
  };

  // Estilos animados
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const loadingStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }));

  return (
    <>
      <StatusBar hidden />
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Fondo con gradiente simulado */}
        <View style={styles.backgroundGradient}>
          <View style={styles.gradientTop} />
          <View style={styles.gradientBottom} />
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          
          {/* Logo/Animación */}
          <Animated.View style={[styles.logoContainer, logoStyle]}>
            <LottieView
              ref={lottieRef}
              source={require('../../assets/lottie/Forklift.json')}
              style={styles.lottieAnimation}
              autoPlay
              loop
              speed={1.2}
            />
          </Animated.View>

          {/* Textos de marca */}
          <View style={styles.textContainer}>
            <Animated.Text style={[styles.title, titleStyle]}>
              LogiTech Pro
            </Animated.Text>
            
            <Animated.Text style={[styles.subtitle, subtitleStyle]}>
              Soluciones inteligentes para tu almacén
            </Animated.Text>
          </View>

          {/* Indicador de carga */}
          <Animated.View style={[styles.loadingContainer, loadingStyle]}>
            <View style={styles.loadingBar}>
              <Animated.View style={styles.loadingProgress} />
            </View>
            <Text style={styles.loadingText}>Cargando...</Text>
          </Animated.View>

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Innovation</Text>
          <View style={styles.footerDots}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </View>

      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientTop: {
    flex: 1,
    backgroundColor: '#16213e',
    opacity: 0.9,
  },
  gradientBottom: {
    flex: 1,
    backgroundColor: '#0f172a',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: (SCREEN_WIDTH * 0.6) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  lottieAnimation: {
    width: '80%',
    height: '80%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1.2,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  loadingContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 120,
    width: '100%',
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#3b82f6',
    width: '70%',
    borderRadius: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  footerDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#3b82f6',
    width: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

export default SplashScreen;