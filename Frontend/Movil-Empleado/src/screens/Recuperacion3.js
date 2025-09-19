import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Recuperacion3 = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Recibir datos de la pantalla anterior
  const [email, setEmail] = useState(route?.params?.email || '');
  
  // ACTUALIZADO: Recibir verifiedToken en lugar de verifiedCode
  const [verifiedToken, setVerifiedToken] = useState(route?.params?.verifiedToken || '');

  // Validaciones de contraseña
  const hasMinLength = password.length >= 8 && password.length <= 20;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const isFormValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar && passwordsMatch;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleUpdate = async () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Por favor completa todos los requisitos de la contraseña');
      return;
    }

    // Verificar que tenemos el verified token
    if (!verifiedToken) {
      Alert.alert('Error', 'Token de verificación no encontrado. Por favor inicia el proceso de nuevo.');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Actualizando contraseña para:', email);
      console.log('🎫 Verified Token presente:', !!verifiedToken);
      
      const API_URL = 'https://riveraproject-production.up.railway.app/api/recovery/newPassword';
      
      console.log('🌐 Conectando a:', API_URL);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          newPassword: password,
          verifiedToken: verifiedToken  // Usar verifiedToken en lugar de email/verifiedCode
        }),
      });

      console.log('📡 Response status:', response.status);

      // Verificar el contenido antes de parsear JSON
      const responseText = await response.text();
      console.log('📄 Response text:', responseText);

      // Verificar si la respuesta es HTML (error del servidor)
      if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE')) {
        throw new Error('El servidor devolvió HTML en lugar de JSON. Verifica que la API esté funcionando correctamente.');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError);
        throw new Error('Respuesta inválida del servidor');
      }

      if (!response.ok) {
        console.error('❌ Error del servidor:', data);
        
        // Mensajes de error más específicos
        let errorMessage = 'No se pudo actualizar la contraseña';
        
        if (data.message) {
          if (data.message.includes('Token inválido') || data.message.includes('inválido')) {
            errorMessage = 'La sesión ha expirado. Por favor inicia el proceso de nuevo.';
          } else if (data.message.includes('expirado') || data.message.includes('expired')) {
            errorMessage = 'El token ha expirado. Por favor inicia el proceso de nuevo.';
          } else if (data.message.includes('no verificado')) {
            errorMessage = 'El código no fue verificado correctamente. Inicia el proceso de nuevo.';
          } else if (data.message.includes('contraseña')) {
            errorMessage = data.message;
          } else {
            errorMessage = data.message;
          }
        }
        
        Alert.alert('Error', errorMessage);
        return;
      }

      console.log('✅ Contraseña actualizada exitosamente:', data);
      
      Alert.alert(
        'Contraseña Actualizada', 
        '¡Tu contraseña ha sido actualizada exitosamente! Ahora puedes iniciar sesión con tu nueva contraseña.',
        [
          { 
            text: 'Ir al Login', 
            onPress: () => navigation.navigate('InicioSesion')
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error al actualizar contraseña:', error);
      
      // Manejo específico de errores
      let errorMessage = 'No se pudo actualizar la contraseña. Intenta de nuevo.';
      
      if (error.message.includes('HTML')) {
        errorMessage = 'Error del servidor. La API no está respondiendo correctamente.';
      } else if (error.message === 'Network request failed') {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet y que el servidor esté funcionando.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'La solicitud tardó demasiado. Intenta de nuevo.';
      } else if (error.name === 'TypeError') {
        errorMessage = 'Problema de conectividad. Verifica tu conexión a internet.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
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

        {/* Información del email */}
        {email && (
          <Text style={styles.emailInfo}>
            Actualizando contraseña para: <Text style={styles.emailText}>{email}</Text>
          </Text>
        )}

        {/* Campo Contraseña */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
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
              style={[
                styles.input,
                confirmPassword.length > 0 && !passwordsMatch && styles.inputError
              ]}
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              <Icon 
                name={showConfirmPassword ? "visibility-off" : "visibility"} 
                size={20} 
                color="#9ca3af" 
              />
            </TouchableOpacity>
          </View>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
          )}
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
            {renderValidationItem(passwordsMatch, "Las contraseñas coinciden")}
          </View>
        </View>

        {/* Botón Actualizar */}
        <TouchableOpacity 
          style={[styles.updateButton, (!isFormValid || loading) && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingText}>Actualizando...</Text>
            </View>
          ) : (
            <Text style={[styles.updateButtonText, (!isFormValid || loading) && styles.updateButtonTextDisabled]}>
              Actualizar Contraseña
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Navegación inferior */}
      <View style={styles.navigation}>
        <TouchableOpacity onPress={handleBack} disabled={loading}>
          <Text style={[styles.navButton, loading && styles.navButtonDisabled]}>Atrás</Text>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  emailInfo: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#111827',
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
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
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
    marginBottom: 24,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  checkboxValid: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  validationText: {
    fontSize: 15,
    color: '#6b7280',
    flex: 1,
    lineHeight: 20,
  },
  validationTextValid: {
    color: '#059669',
  },
  updateButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButtonTextDisabled: {
    color: '#9ca3af',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  navButton: {
    color: '#6b7280',
    fontWeight: '600',
  },
  navButtonDisabled: {
    color: '#d1d5db',
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