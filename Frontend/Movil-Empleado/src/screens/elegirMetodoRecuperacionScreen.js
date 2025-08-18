import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header con botón de regreso */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 34,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 24,
    fontWeight: '500',
  },
  primaryOption: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  secondaryOption: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  secondaryOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
    opacity: 0.8,
  },
  secondaryTimeText: {
    fontSize: 14,
    color: '#999999',
    marginLeft: 6,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  secondaryContinueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  secondaryContinueText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default elegirMetodoRecuperacionScreen;