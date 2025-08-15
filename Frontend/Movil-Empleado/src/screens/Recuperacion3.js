import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Recuperacion3 = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validaciones de contraseña
  const hasMinLength = password.length >= 8 && password.length <= 20;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isFormValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar && password === confirmPassword;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleUpdate = () => {
    if (isFormValid) {
      // Aquí puedes agregar lógica para actualizar la contraseña
      // Por ejemplo, navegar de vuelta al login o mostrar mensaje de éxito
      navigation.navigate('InicioSesion');
    }
  };

  const renderValidationItem = (isValid, text) => (
    <View style={styles.validationItem}>
      <View style={[styles.checkbox, isValid && styles.checkboxValid]}>
        {isValid && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.validationText, isValid && styles.validationTextValid]}>
        {text}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Contenido principal */}
      <View style={styles.content}>
        
        {/* Ilustración */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../images/contra3.png')} // Ajusta la ruta según tu estructura
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Título */}
        <Text style={styles.title}>
          Escribe la nueva contraseña
        </Text>

        {/* Campo Contraseña */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon 
                name={showPassword ? "visibility-off" : "visibility"} 
                size={20} 
                color="#9ca3af" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Campo Confirmar Contraseña */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon 
                name={showConfirmPassword ? "visibility-off" : "visibility"} 
                size={20} 
                color="#9ca3af" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Requisitos de contraseña */}
        <View style={styles.validationContainer}>
          <Text style={styles.validationHeader}>
            SU CONTRASEÑA DEBE CONTENER
          </Text>
          
          <View style={styles.validationList}>
            {renderValidationItem(hasMinLength, "Entre 8 y 20 caracteres")}
            {renderValidationItem(hasUppercase, "1 letra mayúscula")}
            {renderValidationItem(hasNumber, "1 o más números")}
            {renderValidationItem(hasSpecialChar, "1 o más caracteres especiales")}
          </View>
        </View>

        {/* Botón Actualizar */}
        <TouchableOpacity 
          style={[styles.updateButton, !isFormValid && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={!isFormValid}
        >
          <Text style={[styles.updateButtonText, !isFormValid && styles.updateButtonTextDisabled]}>
            Actualizar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navegación inferior */}
      <View style={styles.navigation}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.navButton}>Atrás</Text>
        </TouchableOpacity>
        
        {/* Indicadores de progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressBar, styles.progressActive]} />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Rivera distribuidora y{'\n'}
          transporte || 2025
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  image: {
    width: 256,
    height: 192,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 16,
    color: '#374151',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
  validationContainer: {
    marginBottom: 32,
  },
  validationHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  validationList: {
    gap: 8,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxValid: {
    backgroundColor: '#10b981',
  },
  checkmark: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  validationText: {
    fontSize: 14,
    color: '#6b7280',
  },
  validationTextValid: {
    color: '#059669',
  },
  updateButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  updateButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButtonTextDisabled: {
    color: '#9ca3af',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  navButton: {
    color: '#6b7280',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  progressBar: {
    width: 32,
    height: 8,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  progressActive: {
    backgroundColor: '#111827',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default Recuperacion3;