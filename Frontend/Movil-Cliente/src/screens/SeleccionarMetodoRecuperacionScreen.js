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
              <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                <Icon name="arrow-back" size={26} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {/* Header Section */}
            <View style={styles.headerSection}>
<Text style={styles.welcomeTitle}>🔥 NUEVO DISEÑO 🔥</Text>              <Text style={styles.welcomeTitle2}>contraseña</Text>
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
                <View style={styles.optionIconContainer}>
                  <Icon 
                    name="email" 
                    size={24} 
                    color={selectedMethod === 'actualizar' ? "#00B14F" : "#6B7280"} 
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
                <View style={styles.optionIconContainer}>
                  <Icon 
                    name="phone-android" 
                    size={24} 
                    color={selectedMethod === 'codigo' ? "#00B14F" : "#6B7280"} 
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

            {/* Botón de continuar */}
            {selectedMethod && (
              <View style={styles.buttonSection}>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={selectedMethod === 'actualizar' ? handleActualizarContrasena : handleCodigoVerificacion}
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
            )}

            {/* Footer Section */}
            <View style={styles.footerSection}>
              <Text style={styles.footerText}>Rivera distribuidora y transporte</Text>
              <Text style={styles.footerYear}>© 2025</Text>
            </View>

          </View>

        </ScrollView>
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
    backgroundColor: '#00B14F',
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
    backgroundColor: '#00B14F',
    opacity: 0.06,
    transform: [{ rotate: '60deg' }],
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
    zIndex: 1,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  // Header Section
  headerSection: {
    marginBottom: 60,
  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 48,
    letterSpacing: -1,
  },
  welcomeTitle2: {
    fontSize: 42,
    fontWeight: '300',
    color: '#6B7280',
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '400',
    lineHeight: 24,
  },

  // Form Section
  formSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 24,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    borderColor: '#00B14F',
    backgroundColor: '#F0FDF4',
    shadowColor: '#00B14F',
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
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  optionTitleSelected: {
    color: '#1F2937',
  },
  optionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 18,
    fontWeight: '400',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioButtonSelected: {
    borderColor: '#00B14F',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00B14F',
  },

  // Button Section
  buttonSection: {
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#1F2937',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
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
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  arrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Footer Section
  footerSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#D1D5DB',
    textAlign: 'center',
    fontWeight: '500',
  },
  footerYear: {
    fontSize: 12,
    color: '#E5E7EB',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '400',
  },
});

export default SeleccionarMetodoRecuperacionScreen;