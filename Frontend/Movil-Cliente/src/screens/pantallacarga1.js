import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAuth } from '../context/authContext';

const OnboardingScreen1 = ({ navigation }) => {
  const { completeOnboarding } = useAuth();

  // Función para ir a la siguiente pantalla
  const handleNext = () => {
    navigation.navigate('pantallacarga2');
  };

  // Función para saltar el onboarding
  const handleSkip = async () => {
    await completeOnboarding();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageIndicator}>1/3</Text>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Saltar</Text>
        </TouchableOpacity>
      </View>

      {/* Illustration Container */}
      <View style={styles.illustrationContainer}>
        {/* Contenedor para la animación Lottie */}
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('../assets/lottie/Blue Truck.json')} // Asegúrate de que la ruta sea correcta
            autoPlay
            loop
            style={styles.lottieAnimation}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Cotiza Viajes</Text>
        <Text style={styles.subtitle}>
          Cotiza tus viajes para que podamos{'\n'}
          encargarnos de tus pedidos deseados.
        </Text>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <View style={styles.pagination}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 60,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  skipButton: {
    // TouchableOpacity styles can be empty
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    minHeight: 400,
  },
  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 300,
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#333333',
    width: 30,
  },
  nextButton: {
    alignSelf: 'flex-end',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7ED321',
  },
});

export default OnboardingScreen1;