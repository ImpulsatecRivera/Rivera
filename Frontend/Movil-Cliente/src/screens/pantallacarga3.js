import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../context/authContext';
import AnimatedBottomNavigation from '../components/AnimatedNav';

const OnboardingScreen3 = ({ navigation }) => {
  const { completeOnboarding } = useAuth();

  const handleComplete = async () => {
    try {
      if (typeof completeOnboarding === 'function') {
        await completeOnboarding();
      }
      navigation.navigate('Main');
    } catch (error) {
      console.error('Error durante el onboarding:', error);
      navigation.navigate('Main');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageIndicator}>3/3</Text>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Saltar</Text>
        </TouchableOpacity>
      </View>

      {/* Illustration Container */}
      <View style={styles.illustrationContainer}>
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Image 
              source={require('../images/billetin.png')} 
              style={styles.characterImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Realiza cotizaciones las veces que quieras</Text>
        <Text style={styles.subtitle}>
          Puedes realizar las cotizaciones que desees;{'\n'}
          estaremos listos para ayudarte.
        </Text>
      </View>

      {/* Navegación corregida */}
      <AnimatedBottomNavigation
        currentPage={2}
        totalPages={3}
        onNext={handleComplete}
        onBack={handleBack}
        showHeader={false}
      />
    </View>
  );
};

// Estilos similares a las otras pantallas
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
    marginBottom: 60,
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
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImage: {
    width: 250,
    height: 250,
  },
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
  content: {
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
    lineHeight: 28,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default OnboardingScreen3;