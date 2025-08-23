import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../context/authContext'; // ✅ CORREGIDO: context en lugar de contenxt

const OnboardingScreen3 = ({ navigation }) => {
  const { completeOnboarding } = useAuth();

  // Función para completar onboarding y ir al dashboard
  const handleComplete = async () => {
    console.log('🎯 Completando onboarding desde pantalla 3/3...');
    
    try {
      // Si existe la función completeOnboarding en el contexto
      if (typeof completeOnboarding === 'function') {
        const result = await completeOnboarding();
        if (result.success) {
          console.log('✅ Onboarding completado, navegando a Dashboard');
        } else {
          console.error('❌ Error al completar onboarding:', result.error);
        }
      } else {
        console.log('✅ Onboarding completado (sin función en contexto)');
      }
      
      // ✅ NAVEGAR DIRECTAMENTE AL DASHBOARD A TRAVÉS DE MAIN
      console.log('🏠 Navegando a Main (Dashboard)...');
      navigation.navigate('Main');
      
    } catch (error) {
      console.error('💥 Error durante el onboarding:', error);
      // Aún así, navegar al dashboard
      navigation.navigate('Main');
    }
  };

  // Función para ir atrás a la pantalla 2/3
  const handleBack = () => {
    console.log('⬅️ Volviendo a pantalla anterior');
    navigation.goBack();
  };

  // Función para saltar directamente al dashboard
  const handleSkip = async () => {
    console.log('⏭️ Saltando onboarding...');
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
        {/* Contenedor para tu imagen */}
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

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Atrás</Text>
          </TouchableOpacity>
          
          <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activeDot]} />
          </View>
          
          <TouchableOpacity style={styles.nextButton} onPress={handleComplete}>
            <Text style={styles.nextButtonText}>Comenzar</Text>
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
  // Estilo para tu imagen
  characterImage: {
    width: 250,
    height: 250,
  },
  // Placeholder - puedes eliminar esto si ya tienes la imagen
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
  pagination: {
    flexDirection: 'row',
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
    // TouchableOpacity styles can be empty
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7ED321',
  },
});

export default OnboardingScreen3;