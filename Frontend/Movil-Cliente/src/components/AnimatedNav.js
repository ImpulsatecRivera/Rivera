import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Componente para botones
const AnimatedButton = ({ children, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
};

// Componente para puntos de paginación
const AnimatedDot = ({ isActive }) => {
  return (
    <View
      style={[
        styles.dot,
        {
          backgroundColor: isActive ? '#333333' : '#E0E0E0',
          width: isActive ? 30 : 10,
        }
      ]}
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
  showHeader = false
}) => {
  const showBackButton = currentPage > 0;
  const isLastPage = currentPage === totalPages - 1;

  return (
    <View style={styles.container}>
      {/* Header opcional */}
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.pageIndicator}>
            {currentPage + 1}/{totalPages}
          </Text>
          
          <AnimatedButton 
            onPress={onSkip} 
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
              />
            ))}
          </View>
          
          {/* Botón Siguiente/Completar */}
          <View style={styles.navButton}>
            <AnimatedButton 
              onPress={onNext} 
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>
                {isLastPage ? "Comenzar" : nextText}
              </Text>
            </AnimatedButton>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
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
    width: 60,
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