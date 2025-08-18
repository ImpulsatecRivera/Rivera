import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../Context/authContext';

const OnboardingScreen1 = ({ navigation }) => {
  const { completeOnboarding } = useAuth();

  // Función para ir a la siguiente pantalla
  const handleNext = () => {
    navigation.navigate('Onboarding2');
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
        {/* Contenedor para tu imagen manual */}
        <View style={styles.imageContainer}>
          {/* AQUÍ PONDRÁS TU IMAGEN - Por ahora solo placeholder */}
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}><Image 
               source={require('../images/navegando.png')} 
               style={styles.characterImage}
              resizeMode="contain"
            /></Text>
          </View>
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
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Placeholder temporal - eliminar cuando agregues tu imagen
  imagePlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: '#F0F0F0',
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
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