import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useAuth } from '../Context/authContext';
import AnimatedPagination from '../components/AnimatedPagination';

const { height } = Dimensions.get('window');

const OnboardingScreen2 = ({ navigation }) => {
  const { completeOnboarding } = useAuth();

  // Función para ir a la siguiente pantalla
  const handleNext = () => {
    navigation.navigate('Onboarding3');
  };

  // Función para regresar a la pantalla anterior
  const handleBack = () => {
    navigation.goBack();
  };

  // Función para saltar el onboarding
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
        {/* Credit Card */}
        <View style={styles.cardContainer}>
          <View style={styles.creditCard}>
            {/* Card chip */}
            <View style={styles.chip} />
            
            {/* Card lines (representing card number and text) */}
            <View style={styles.cardLines}>
              <View style={styles.cardLine1} />
              <View style={styles.cardLine2} />
            </View>
            
            {/* Card stripe */}
            <View style={styles.cardStripe} />
          </View>
          
          {/* Green checkmark circle */}
          <View style={styles.checkmarkContainer}>
            <View style={styles.checkmarkCircle}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Elige tu forma de pago</Text>
        <Text style={styles.subtitle}>
          Elige tu forma de pago deseado.
        </Text>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Atrás</Text>
          </TouchableOpacity>
          
          {/* Paginación animada */}
          <AnimatedPagination currentIndex={1} />
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Siguiente</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 80,
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
  cardContainer: {
    alignItems: 'center',
  },
  creditCard: {
    width: 280,
    height: 180,
    backgroundColor: '#4A90E2',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8, // for Android
    overflow: 'hidden',
  },
  chip: {
    width: 45,
    height: 35,
    backgroundColor: '#F0C851',
    borderRadius: 6,
    position: 'absolute',
    top: 30,
    left: 25,
  },
  cardLines: {
    position: 'absolute',
    top: 30,
    right: 25,
  },
  cardLine1: {
    width: 120,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    marginBottom: 8,
  },
  cardLine2: {
    width: 80,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  cardStripe: {
    width: '100%',
    height: 50,
    backgroundColor: '#2C3E50',
    position: 'absolute',
    bottom: 0,
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: -25,
    right: -25,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#4CAF50',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 7.5,
    elevation: 6, // for Android
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    transform: [{ rotate: '-10deg' }],
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
  bottomContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    // TouchableOpacity styles can be empty
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  nextButton: {
    // TouchableOpacity styles can be empty
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7ED321',
  },
});

export default OnboardingScreen2;