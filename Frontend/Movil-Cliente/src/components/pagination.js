// src/components/pagination.js - SOLUCIÓN FINAL
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export const CustomLottiePagination = ({ 
  currentStep, 
  totalSteps = 3, 
  onNext, 
  onBack, 
  nextText = "Siguiente",
  backText = "Atrás",
  showBack = false 
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    // Solo ejecutar si el step realmente cambió (evitar re-renders innecesarios)
    if (prevStepRef.current !== currentStep) {
      console.log(`🔄 Step cambió: ${prevStepRef.current} → ${currentStep}`);
      prevStepRef.current = currentStep;

      // Animación de entrada solo la primera vez
      if (currentStep === 1) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }

      // Calcular progreso (asegurar que nunca sea mayor a 1)
      const progress = Math.min(currentStep / totalSteps, 1);
      
      console.log(`📊 Animando progreso: ${progress * 100}%`);

      // Animar la barra de progreso
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start(() => {
        console.log(`✅ Animación completada para step ${currentStep}`);
      });
    }
  }, [currentStep, totalSteps]);

  return (
    <Animated.View 
      style={[
        styles.paginationContainer,
        { opacity: fadeAnim }
      ]}
    >
      {/* Contenedor de progreso principal */}
      <View style={styles.progressContainer}>
        
        {/* Barra de progreso animada */}
        <View style={styles.progressBackground}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                opacity: progressAnim.interpolate({
                  inputRange: [0, 0.1, 1],
                  outputRange: [0.3, 1, 1],
                })
              }
            ]}
          />
          
          {/* Efecto de brillo */}
          <Animated.View 
            style={[
              styles.progressGlow,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]}
          />
        </View>
        
        {/* Indicadores de pasos */}
        <View style={styles.stepIndicators}>
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep - 1;
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: isCompleted ? '#7ED321' : '#E0E0E0',
                    transform: [{
                      scale: isCurrent ? 1.1 : 1
                    }]
                  }
                ]}
              >
                <Text style={[
                  styles.stepNumber,
                  { 
                    color: isCompleted ? '#FFF' : '#999',
                    fontWeight: isCurrent ? 'bold' : '500'
                  }
                ]}>
                  {index + 1}
                </Text>
              </Animated.View>
            );
          })}
        </View>
        
        {/* Texto de progreso con porcentaje */}
        <Animated.View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>
            Paso {currentStep} de {totalSteps}
          </Text>
          <Animated.Text style={[
            styles.percentageText,
            {
              opacity: progressAnim.interpolate({
                inputRange: [0, 0.2, 1],
                outputRange: [0, 1, 1],
              })
            }
          ]}>
            {Math.round((currentStep / totalSteps) * 100)}%
          </Animated.Text>
        </Animated.View>
      </View>

      {/* Navegación */}
      <View style={styles.navigation}>
        {showBack ? (
          <TouchableOpacity 
            style={[styles.button, styles.backButton]} 
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>{backText}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <TouchableOpacity 
          style={[styles.button, styles.nextButton]} 
          onPress={onNext}
        >
          <Text style={styles.nextButtonText}>{nextText}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBackground: {
    width: '85%',
    height: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 25,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7ED321',
    borderRadius: 6,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressGlow: {
    height: '100%',
    backgroundColor: 'rgba(126, 211, 33, 0.3)',
    borderRadius: 6,
    position: 'absolute',
    left: 0,
    top: 0,
    shadowColor: '#7ED321',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    paddingHorizontal: 5,
    marginBottom: 15,
  },
  stepDot: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressTextContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 5,
  },
  percentageText: {
    fontSize: 14,
    color: '#7ED321',
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
  },
  nextButton: {
    backgroundColor: 'rgba(126, 211, 33, 0.1)',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7ED321',
  },
  placeholder: {
    width: 80,
  },
});