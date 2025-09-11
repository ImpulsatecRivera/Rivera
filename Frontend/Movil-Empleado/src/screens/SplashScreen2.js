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

const SplashScreen2 = ({ onAnimationFinish }) => {
  const travelRef = useRef(null);
  
  // Valores animados
  const opacity = useSharedValue(0);
  const travelOpacity = useSharedValue(0);
  const travelScale = useSharedValue(0.5);

  useEffect(() => {
    startAnimationSequence();
  }, []);

  const startAnimationSequence = () => {
    // Fade in general
    opacity.value = withTiming(1, { duration: 600 });
    
    // Animación de Travel
    travelOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 800 })
    );
    travelScale.value = withDelay(
      200,
      withTiming(1, {
        duration: 1200,
        easing: Easing.out(Easing.back(1.1)),
      })
    );

    // Fade out después de 5 segundos
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
    }, 5000); 
  };

  // Estilos animados
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const travelStyle = useAnimatedStyle(() => ({
    opacity: travelOpacity.value,
    transform: [{ scale: travelScale.value }],
  }));

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View style={[styles.container, containerStyle]}>
        
        {/* Solo la Lottie de Travel */}
        <Animated.View style={travelStyle}>
          <LottieView
            ref={travelRef}
            source={require('../../assets/lottie/Travel.json')}
            style={styles.travelAnimation}
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
  travelAnimation: {
    width: SCREEN_WIDTH * 0.8,  // Más grande para ver mejor los detalles
    height: SCREEN_WIDTH * 0.8,
  },
});

export default SplashScreen2;