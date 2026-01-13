import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Recuperacion3 = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [email] = useState(route?.params?.email || '');
  const [verifiedToken] = useState(route?.params?.verifiedToken || '');

  const hasMinLength = password.length >= 8 && password.length <= 20;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar && passwordsMatch;

  const handleBack = () => navigation.goBack();

  const handleUpdate = async () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Por favor completa todos los requisitos de la contraseña');
      return;
    }
    if (!verifiedToken) {
      Alert.alert('Error', 'Token de verificación no encontrado. Por favor inicia el proceso de nuevo.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = 'https://rivera-test-629395560179.us-west1.run.app/api/recovery/newPassword';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ newPassword: password, verifiedToken }),
      });

      const text = await response.text();
      const data = JSON.parse(text);

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo actualizar la contraseña');
      }

      Alert.alert(
        'Contraseña Actualizada', 
        '¡Tu contraseña ha sido actualizada exitosamente! Ahora puedes iniciar sesión con tu nueva contraseña.',
        [{ text: 'Ir al Login', onPress: () => navigation.navigate('InicioSesion') }]
      );

    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo actualizar la contraseña. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const renderValidationItem = (isValid, text) => (
    <View style={styles.validationItem} key={text}>
      <View style={[styles.checkbox, isValid && styles.checkboxValid]}>
        {isValid && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.validationText, isValid && styles.validationTextValid]}>{text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Contenido principal */}
          <View style={styles.content}>
            {/* Ilustración */}
            <View style={styles.imageContainer}>
              <Image 
                source={require('../images/contra3.png')}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Escribe la nueva contraseña</Text>

            {email && (
              <Text style={styles.emailInfo}>
                Actualizando contraseña para: <Text style={styles.emailText}>{email}</Text>
              </Text>
            )}

            {/* Contraseña */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Nueva contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Icon name={showPassword ? "visibility-off" : "visibility"} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar contraseña */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, confirmPassword.length > 0 && !passwordsMatch && styles.inputError]}
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <Icon name={showConfirmPassword ? "visibility-off" : "visibility"} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
              )}
            </View>

            {/* Validaciones */}
            <View style={styles.validationContainer}>
              <Text style={styles.validationHeader}>SU CONTRASEÑA DEBE CONTENER</Text>
              <View style={styles.validationList}>
                {renderValidationItem(hasMinLength, "Entre 8 y 20 caracteres")}
                {renderValidationItem(hasUppercase, "1 letra mayúscula")}
                {renderValidationItem(hasNumber, "1 o más números")}
                {renderValidationItem(hasSpecialChar, "1 o más caracteres especiales")}
                {renderValidationItem(passwordsMatch, "Las contraseñas coinciden")}
              </View>
            </View>

            {/* Botón */}
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

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Rivera distribuidora y{'\n'}transporte || 2025</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  content: { flex: 1 },
  imageContainer: { alignItems: 'center', marginBottom: 24 },
  image: { width: 256, height: 192 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16, textAlign: 'center' },
  emailInfo: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  emailText: { fontWeight: '600', color: '#111827' },
  inputContainer: { marginBottom: 16 },
  inputWrapper: { position: 'relative' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingVertical: 16, paddingHorizontal: 16, paddingRight: 48, fontSize: 16, color: '#374151' },
  inputError: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  errorText: { color: '#ef4444', fontSize: 14, marginTop: 4, marginLeft: 4 },
  eyeButton: { position: 'absolute', right: 16, top: '50%', marginTop: -10 },
  validationContainer: { marginBottom: 32 },
  validationHeader: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 12 },
  validationList: { marginBottom: 24 },
  validationItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  checkbox: { width: 20, height: 20, borderRadius: 6, backgroundColor: '#e5e7eb', marginRight: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#d1d5db' },
  checkboxValid: { backgroundColor: '#10b981', borderColor: '#059669' },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  validationText: { fontSize: 15, color: '#6b7280', flex: 1, lineHeight: 20 },
  validationTextValid: { color: '#059669' },
  updateButton: { backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 18, alignItems: 'center', marginBottom: 16 },
  updateButtonDisabled: { backgroundColor: '#d1d5db' },
  updateButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  updateButtonTextDisabled: { color: '#9ca3af' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center' },
  loadingText: { color: '#fff', fontSize: 14, marginLeft: 8 },
  footer: { alignItems: 'center', paddingBottom: 24 },
  footerText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
});

export default Recuperacion3;
