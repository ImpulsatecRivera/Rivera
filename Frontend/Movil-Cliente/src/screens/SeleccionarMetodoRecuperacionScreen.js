import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';

const SeleccionarMetodoRecuperacionScreen = ({ navigation }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSelectedMethod(null);
    });

    return unsubscribe;
  }, [navigation]);

  const handleActualizarContrasena = () => {
    setSelectedMethod('actualizar');
    console.log('Navegando a Actualizar contraseña');
    navigation.navigate('Recuperacion');
  };

  const handleCodigoVerificacion = () => {
    setSelectedMethod('codigo');
    console.log('Navegando a Código de verificación');
    navigation.navigate('RecuperacionTelefono');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    if (selectedMethod === 'actualizar') {
      handleActualizarContrasena();
    } else if (selectedMethod === 'codigo') {
      handleCodigoVerificacion();
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          
          {/* Background with curved shapes */}
          <View style={styles.backgroundShapes}>
            <View style={styles.curvedShape1} />
            <View style={styles.curvedShape2} />
            <View style={styles.curvedShape3} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            
            {/* Header con botón de regreso */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={handleGoBack} 
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Icon name="arrow-back" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Lottie Animation */}
            <View style={styles.lottieContainer}>
              <LottieView
                source={require('../assets/lottie/password.json')}
                autoPlay
                loop={false}
                style={styles.lottieAnimation}
              />
            </View>

            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.welcomeTitle}>Recupera tu</Text>
              <Text style={styles.welcomeTitle2}>contraseña</Text>
              <Text style={styles.subtitle}>
                Selecciona cómo deseas recuperar tu cuenta. Te enviaremos un código de verificación para confirmar tu identidad.
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>MÉTODO DE RECUPERACIÓN</Text>

              {/* Opción Correo electrónico */}
              <TouchableOpacity 
                style={[
                  styles.option,
                  selectedMethod === 'actualizar' && styles.optionSelected
                ]} 
                onPress={handleActualizarContrasena}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.optionIconContainer,
                  selectedMethod === 'actualizar' && styles.optionIconContainerSelected
                ]}>
                  <Icon 
                    name="email" 
                    size={24} 
                    color={selectedMethod === 'actualizar' ? "#4CAF50" : "#6B7280"} 
                  />
                </View>
                
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionTitle,
                    selectedMethod === 'actualizar' && styles.optionTitleSelected
                  ]}>
                    Correo electrónico
                  </Text>
                  <Text style={styles.optionDescription}>
                    Código de verificación vía email
                  </Text>
                </View>

                <View style={[
                  styles.radioButton,
                  selectedMethod === 'actualizar' && styles.radioButtonSelected
                ]}>
                  {selectedMethod === 'actualizar' && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Opción Teléfono */}
              <TouchableOpacity 
                style={[
                  styles.option,
                  selectedMethod === 'codigo' && styles.optionSelected
                ]} 
                onPress={handleCodigoVerificacion}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.optionIconContainer,
                  selectedMethod === 'codigo' && styles.optionIconContainerSelected
                ]}>
                  <Icon 
                    name="phone-android" 
                    size={24} 
                    color={selectedMethod === 'codigo' ? "#4CAF50" : "#6B7280"} 
                  />
                </View>
                
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionTitle,
                    selectedMethod === 'codigo' && styles.optionTitleSelected
                  ]}>
                    Número de teléfono
                  </Text>
                  <Text style={styles.optionDescription}>
                    Código de verificación vía SMS
                  </Text>
                </View>

                <View style={[
                  styles.radioButton,
                  selectedMethod === 'codigo' && styles.radioButtonSelected
                ]}>
                  {selectedMethod === 'codigo' && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Espaciador */}
            <View style={styles.spacer} />

          </View>

        </ScrollView>

        {/* Footer fijo */}
        {selectedMethod && (
          <View style={styles.footerContainer}>
            {/* Botón de continuar */}
            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Continuar</Text>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Footer text */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Rivera distribuidora y transporte © 2025
              </Text>
            </View>
          </View>
        )}

        {/* Footer cuando no hay selección */}
        {!selectedMethod && (
          <View style={styles.footerContainerStatic}>
            <Text style={styles.footerText}>
              Rivera distribuidora y transporte © 2025
            </Text>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Background curved shapes
  backgroundShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  curvedShape1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#4CAF50',
    opacity: 0.08,
    transform: [{ rotate: '45deg' }],
  },
  curvedShape2: {
    position: 'absolute',
    top: 180,
    left: -120,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1F2937',
    opacity: 0.05,
    transform: [{ rotate: '-30deg' }],
  },
  curvedShape3: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#4CAF50',
    opacity: 0.06,
    transform: [{ rotate: '60deg' }],
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    zIndex: 1,
  },

  // Header
  header: {
    marginBottom: 16,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  // Lottie
  lottieContainer: {
    alignItems: 'center',
    marginVertical: 20,
    zIndex: 1,
  },
  lottieAnimation: {
    width: 120,
    height: 120,
  },

  // Header Section
  headerSection: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  welcomeTitle2: {
    fontSize: 32,
    fontWeight: '300',
    color: '#6B7280',
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
    lineHeight: 20,
  },

  // Form Section
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 20,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0FDF4',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionIconContainerSelected: {
    backgroundColor: '#E8F5E9',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  optionTitleSelected: {
    color: '#1F2937',
  },
  optionDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    fontWeight: '400',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },

  spacer: {
    height: 20,
  },

  // Footer Container (cuando hay selección)
  footerContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    zIndex: 2,
  },

  // Footer Container estático (sin selección)
  footerContainerStatic: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  // Button Section
  buttonSection: {
    alignItems: 'flex-end',
    paddingHorizontal: 28,
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#1F2937',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 160,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 10,
  },
  arrowContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Footer
  footer: {
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '400',
  },
});

export default SeleccionarMetodoRecuperacionScreen;