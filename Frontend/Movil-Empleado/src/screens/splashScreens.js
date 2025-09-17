import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SplashScreen = ({ onAnimationFinish }) => {
  const forkliftRef = useRef(null);
  
  // Valores animados
  const opacity = useSharedValue(0);
  const forkliftOpacity = useSharedValue(0);
  const forkliftScale = useSharedValue(0.5);

  useEffect(() => {
    startAnimationSequence();
  }, []);

  const startAnimationSequence = () => {
    // Fade in general
    opacity.value = withTiming(1, { duration: 600 });
    
    // Animación del montacargas
    forkliftOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 800 })
    );
    forkliftScale.value = withDelay(
      200,
      withTiming(1, {
        duration: 1200,
        easing: Easing.out(Easing.back(1.1)),
      })
    );

    // Fade out después de 3 segundos
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
    }, 3000);
  };

  // Estilos animados
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const forkliftStyle = useAnimatedStyle(() => ({
    opacity: forkliftOpacity.value,
    transform: [{ scale: forkliftScale.value }],
  }));

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View style={[styles.container, containerStyle]}>
        
        {/* Solo la Lottie del montacargas */}
        <Animated.View style={forkliftStyle}>
          <LottieView
            ref={forkliftRef}
            source={require('../../assets/lottie/Forklift.json')}
            style={styles.forkliftAnimation}
            autoPlay
            loop
            speed={1.2}
          />
        </Animated.View>

      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forkliftAnimation: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
  },
});

export default SplashScreen;