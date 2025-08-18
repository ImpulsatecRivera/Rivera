import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
        {/* Person illustration */}
        <View style={styles.personContainer}>
          {/* Head */}
          <View style={styles.head}>
            <View style={styles.hair} />
          </View>
          
          {/* Body */}
          <View style={styles.body} />
          
          {/* Laptop */}
          <View style={styles.laptop}>
            <View style={styles.laptopScreen}>
              <View style={styles.appleLogo} />
            </View>
          </View>
        </View>

        {/* Earth illustration */}
        <View style={styles.earthContainer}>
          <View style={styles.earth}>
            <View style={styles.continent1} />
            <View style={styles.continent2} />
            <View style={styles.continent3} />
          </View>
        </View>

        {/* Desk */}
        <View style={styles.desk}>
          <View style={styles.deskTop} />
          <View style={styles.deskLegs}>
            <View style={styles.leftLeg} />
            <View style={styles.rightLeg} />
          </View>
          <View style={styles.deskDrawer} />
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
  personContainer: {
    alignItems: 'center',
    zIndex: 2,
  },
  head: {
    width: 60,
    height: 60,
    backgroundColor: '#F5C6A0',
    borderRadius: 30,
    marginBottom: 5,
  },
  hair: {
    width: 50,
    height: 30,
    backgroundColor: '#B8860B',
    borderRadius: 25,
    position: 'absolute',
    top: -5,
    left: 5,
  },
  body: {
    width: 80,
    height: 60,
    backgroundColor: '#FF8C42',
    borderRadius: 15,
    marginBottom: 10,
  },
  laptop: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 8,
  },
  laptopScreen: {
    width: 100,
    height: 70,
    backgroundColor: '#333333',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleLogo: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  earthContainer: {
    position: 'absolute',
    right: 40,
    top: 50,
  },
  earth: {
    width: 80,
    height: 80,
    backgroundColor: '#4A90E2',
    borderRadius: 40,
    overflow: 'hidden',
  },
  continent1: {
    width: 35,
    height: 25,
    backgroundColor: '#7ED321',
    borderRadius: 15,
    position: 'absolute',
    top: 15,
    left: 10,
  },
  continent2: {
    width: 25,
    height: 20,
    backgroundColor: '#7ED321',
    borderRadius: 12,
    position: 'absolute',
    bottom: 20,
    right: 15,
  },
  continent3: {
    width: 20,
    height: 15,
    backgroundColor: '#7ED321',
    borderRadius: 8,
    position: 'absolute',
    top: 45,
    left: 45,
  },
  desk: {
    position: 'absolute',
    bottom: -20,
    width: 200,
    alignItems: 'center',
  },
  deskTop: {
    width: 200,
    height: 20,
    backgroundColor: '#D2B48C',
    borderRadius: 10,
  },
  deskLegs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 180,
    marginTop: 5,
  },
  leftLeg: {
    width: 15,
    height: 40,
    backgroundColor: '#D2B48C',
  },
  rightLeg: {
    width: 15,
    height: 40,
    backgroundColor: '#D2B48C',
  },
  deskDrawer: {
    width: 100,
    height: 15,
    backgroundColor: '#F0E68C',
    position: 'absolute',
    bottom: 20,
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