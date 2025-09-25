import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAuth } from '../context/authContext';
import AnimatedBottomNavigation from '../components/AnimatedNav';

const OnboardingScreen2 = ({ navigation }) => {
  const { completeOnboarding } = useAuth();

  const handleNext = () => {
    navigation.navigate('pantallacarga3');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageIndicator}>2/3</Text>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Saltar</Text>
        </TouchableOpacity>
      </View>

      {/* Illustration Container */}
      <View style={styles.illustrationContainer}>
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('../assets/lottie/Make payment.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Elige tu forma de pago</Text>
        <Text style={styles.subtitle}>
          Elige tu forma de pago deseado.
        </Text>
      </View>

      {/* Navegación corregida */}
      <AnimatedBottomNavigation
        currentPage={1}
        totalPages={3}
        onNext={handleNext}
        onBack={handleBack}
        showHeader={false}
      />
    </View>
  );
};

// Usar los mismos estilos de la pantalla 1
const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 80,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  skipButton: {},
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
    marginTop: 40,
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
    color: '#999999',
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default OnboardingScreen2;