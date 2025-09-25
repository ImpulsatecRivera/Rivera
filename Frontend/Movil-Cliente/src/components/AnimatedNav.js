import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Componente para botones animados
const AnimatedButton = ({ children, onPress, delay = 0, style }) => {
  return (
    <AnimatedTouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      entering={FadeInDown.delay(delay).springify()}
      exiting={FadeOutDown}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
};

// Componente para puntos de paginación animados
const AnimatedDot = ({ isActive, delay = 0 }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        isActive ? '#333333' : '#E0E0E0',
        { duration: 300 }
      ),
      width: withSpring(isActive ? 30 : 10, {
        damping: 15,
        stiffness: 150,
      }),
      transform: [
        {
          scale: withSpring(isActive ? 1.1 : 1, {
            damping: 15,
            stiffness: 150,
          })
        }
      ],
    };
  });

  return (
    <Animated.View
      style={[styles.dot, animatedStyle]}
      entering={FadeInDown.delay(delay).springify()}
      exiting={FadeOutDown}
    />
  );
};

// Componente principal de navegación
const AnimatedBottomNavigation = ({ 
  currentPage, 
  totalPages = 3, 
  onNext, 
  onBack, 
  onSkip,
  nextText = "Siguiente",
  backText = "Atrás",
  skipText = "Saltar",
  showHeader = false  // ✅ Nuevo prop para controlar el header
}) => {
  const showBackButton = currentPage > 0;
  const isLastPage = currentPage === totalPages - 1;

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeInDown.delay(600)}
    >
      {/* Header opcional */}
      {showHeader && (
        <View style={styles.header}>
          <Animated.Text 
            style={styles.pageIndicator}
            entering={FadeInDown.delay(100)}
          >
            {currentPage + 1}/{totalPages}
          </Animated.Text>
          
          <AnimatedButton 
            onPress={onSkip} 
            delay={200}
            style={styles.skipButton}
          >
            <Text style={styles.skipButtonText}>{skipText}</Text>
          </AnimatedButton>
        </View>
      )}

      {/* Navegación inferior */}
      <View style={styles.bottomContainer}>
        <View style={styles.navigation}>
          {/* Botón Atrás */}
          <View style={styles.navButton}>
            {showBackButton ? (
              <AnimatedButton 
                onPress={onBack} 
                delay={300}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>{backText}</Text>
              </AnimatedButton>
            ) : (
              <View style={styles.buttonPlaceholder} />
            )}
          </View>
          
          {/* Paginación (puntos) */}
          <View style={styles.pagination}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <AnimatedDot 
                key={index}
                isActive={index === currentPage}
                delay={400 + (index * 50)}
              />
            ))}
          </View>
          
          {/* Botón Siguiente/Completar */}
          <View style={styles.navButton}>
            <AnimatedButton 
              onPress={onNext} 
              delay={500}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>
                {isLastPage ? "Comenzar" : nextText}
              </Text>
            </AnimatedButton>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end', // ✅ Solo mostrar navegación en la parte inferior
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 40,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  skipButton: {
    padding: 8,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
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
  navButton: {
    flex: 1,
    alignItems: 'center',
  },
  button: {
    padding: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  nextButton: {
    alignSelf: 'flex-end',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7ED321',
  },
  buttonPlaceholder: {
    width: 60, // Espacio reservado cuando no hay botón atrás
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
});

export default AnimatedBottomNavigation;