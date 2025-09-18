import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const elegirMetodoRecuperacionScreen = ({ navigation }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Reset del estado cuando la pantalla se enfoca (al regresar)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSelectedMethod(null);
    });

    return unsubscribe;
  }, [navigation]);

  const handleActualizarContrasena = () => {
    // Marcar como seleccionado y navegar inmediatamente
    setSelectedMethod('actualizar');
    console.log('Navegando a Actualizar contraseña');
    navigation.navigate('Recuperacion');
  };

  const handleCodigoVerificacion = () => {
    // Marcar como seleccionado y navegar inmediatamente
    setSelectedMethod('codigo');
    console.log('Navegando a Código de verificación');
    navigation.navigate('RecuperacionTelefono');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const { width, height } = Dimensions.get('window');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    header: {
      paddingHorizontal: width * 0.05,
      paddingVertical: height * 0.015,
      paddingTop: Platform.OS === 'ios' ? height * 0.04 : height * 0.02,
      minHeight: height * 0.08,
      justifyContent: 'center',
    },
    backButton: {
      width: width * 0.11,
      height: width * 0.11,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: width * 0.055,
    },
    content: {
      flex: 1,
      paddingHorizontal: width * 0.06,
      paddingTop: height * 0.01,
    },
    title: {
      fontSize: width * 0.07,
      fontWeight: 'bold',
      color: '#000000',
      lineHeight: width * 0.085,
      marginBottom: height * 0.02,
    },
    subtitle: {
      fontSize: width * 0.04,
      color: '#666666',
      lineHeight: width * 0.055,
      marginBottom: height * 0.04,
    },
    sectionTitle: {
      fontSize: width * 0.045,
      color: '#000000',
      marginBottom: height * 0.025,
      fontWeight: '500',
    },
    primaryOption: {
      backgroundColor: '#4285F4',
      borderRadius: 12,
      padding: width * 0.05,
      marginBottom: height * 0.018,
    },
    secondaryOption: {
      backgroundColor: '#F5F5F5',
      borderRadius: 12,
      padding: width * 0.05,
      marginBottom: height * 0.018,
    },
    optionContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionInfo: {
      flex: 1,
    },
    optionTitle: {
      fontSize: width * 0.04,
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: 8,
    },
    secondaryOptionTitle: {
      fontSize: width * 0.04,
      fontWeight: '600',
      color: '#000000',
      marginBottom: 8,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timeText: {
      fontSize: width * 0.035,
      color: '#FFFFFF',
      marginLeft: 6,
      opacity: 0.8,
    },
    secondaryTimeText: {
      fontSize: width * 0.035,
      color: '#999999',
      marginLeft: 6,
    },
    continueButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: width * 0.04,
      paddingVertical: height * 0.01,
      borderRadius: 20,
    },
    secondaryContinueButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#E0E0E0',
      paddingHorizontal: width * 0.04,
      paddingVertical: height * 0.01,
      borderRadius: 20,
    },
    continueText: {
      color: '#FFFFFF',
      fontSize: width * 0.035,
      fontWeight: '500',
      marginRight: 4,
    },
    secondaryContinueText: {
      color: '#666666',
      fontSize: width * 0.035,
      fontWeight: '500',
      marginRight: 4,
    },
    footer: {
      alignItems: 'center',
      paddingBottom: height * 0.05,
      paddingTop: height * 0.025,
    },
    footerText: {
      fontSize: width * 0.035,
      color: '#CCCCCC',
      textAlign: 'center',
      lineHeight: width * 0.045,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header con botón de regreso - Ajustado para mejor responsividad */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back-ios" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Bienvenido al{'\n'}recuperar{'\n'}contraseña
        </Text>

        <Text style={styles.subtitle}>
          No te preocupes, puede pasar. Introduce tu correo electronico o numero de telefono,y te enviaremos un codigo de verificacion con una seria de paso a seguir.
        </Text>

        <Text style={styles.sectionTitle}>
          Como quieres recuperar tu cuenta
        </Text>

        {/* Opción Actualizar contraseña */}
        <TouchableOpacity 
          style={selectedMethod === 'actualizar' ? styles.primaryOption : styles.secondaryOption} 
          onPress={handleActualizarContrasena}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionInfo}>
              <Text style={selectedMethod === 'actualizar' ? styles.optionTitle : styles.secondaryOptionTitle}>
                Enviar codigo de verificacion mediante correo electronico
              </Text>
              <View style={styles.timeContainer}>
                <Icon 
                  name="schedule" 
                  size={16} 
                  color={selectedMethod === 'actualizar' ? "#FFFFFF" : "#999999"} 
                />
                <Text style={selectedMethod === 'actualizar' ? styles.timeText : styles.secondaryTimeText}>
                  22h 55m 20s actualización
                </Text>
              </View>
            </View>
            <View style={selectedMethod === 'actualizar' ? styles.continueButton : styles.secondaryContinueButton}>
              <Text style={selectedMethod === 'actualizar' ? styles.continueText : styles.secondaryContinueText}>
                Continuar
              </Text>
              <Icon 
                name="arrow-forward" 
                size={16} 
                color={selectedMethod === 'actualizar' ? "#FFFFFF" : "#999999"} 
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Opción Código de verificación */}
        <TouchableOpacity 
          style={selectedMethod === 'codigo' ? styles.primaryOption : styles.secondaryOption} 
          onPress={handleCodigoVerificacion}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionInfo}>
              <Text style={selectedMethod === 'codigo' ? styles.optionTitle : styles.secondaryOptionTitle}>
                Enviar codigo de verificacion mediante tu numero de telefono
              </Text>
              <View style={styles.timeContainer}>
                <Icon 
                  name="schedule" 
                  size={16} 
                  color={selectedMethod === 'codigo' ? "#FFFFFF" : "#999999"} 
                />
                <Text style={selectedMethod === 'codigo' ? styles.timeText : styles.secondaryTimeText}>
                  21h 55m 20s actualización
                </Text>
              </View>
            </View>
            <View style={selectedMethod === 'codigo' ? styles.continueButton : styles.secondaryContinueButton}>
              <Text style={selectedMethod === 'codigo' ? styles.continueText : styles.secondaryContinueText}>
                Continuar
              </Text>
              <Icon 
                name="arrow-forward" 
                size={16} 
                color={selectedMethod === 'codigo' ? "#FFFFFF" : "#999999"} 
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Rivera distribuidora y{'\n'}transporte || 2025
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default elegirMetodoRecuperacionScreen;