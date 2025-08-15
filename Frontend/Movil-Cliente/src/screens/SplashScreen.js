import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LOGO_WIDTH = Math.max(Math.min(width * 0.85, 460), 260); 

const SplashScreen = ({ navigation }) => {

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 900,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });

    anim.start(() => {
      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      }, 150);
    });

    return () => anim.stop && anim.stop();
  }, [navigation, progress]);

  // El panel “cubre” la pantalla y se desliza hacia arriba
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height], // de cubrir todo a salir por arriba
  });

  const overlayOpacity = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.35, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Logo fijo, grande, centrado */}
      <Image
        source={require('../images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Logo"
      />

      {/* Panel de fondo animado (la transición sucede aquí) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
            transform: [{ translateY }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_WIDTH,
    height: undefined,
    aspectRatio: 2.8, 
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#F2F4F7', 
    zIndex: 2,
  },
});

export default SplashScreen;
