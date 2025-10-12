import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  Modal,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import { useAuth } from '../context/authContext';
import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = 'https://riveraproject-production-933e.up.railway.app';

const RegistrarseCliente2 = ({ navigation, route }) => {
  const { email, password } = route.params || {};
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dui, setDui] = useState('');
  const [phone, setPhone] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return false;
    }
    
    if (!lastName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu apellido');
      return false;
    }
    
    if (!dui.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu DUI');
      return false;
    }

    if (dui.length !== 10) {
      Alert.alert('Error', 'El DUI debe tener exactamente 9 dígitos (formato: 12345678-9)');
      return false;
    }

    const duiPattern = /^\d{8}-\d$/;
    if (!duiPattern.test(dui)) {
      Alert.alert('Error', 'El DUI debe tener el formato correcto (12345678-9)');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu teléfono');
      return false;
    }

    if (phone.length !== 9) {
      Alert.alert('Error', 'El teléfono debe tener 8 dígitos (formato: 1234-5678)');
      return false;
    }

    const phonePattern = /^\d{4}-\d{4}$/;
    if (!phonePattern.test(phone)) {
      Alert.alert('Error', 'El teléfono debe tener el formato correcto (1234-5678)');
      return false;
    }

    if (!fechaNacimiento.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu fecha de nacimiento');
      return false;
    }

    if (fechaNacimiento.length !== 10) {
      Alert.alert('Error', 'La fecha debe tener el formato DD/MM/AAAA');
      return false;
    }

    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(fechaNacimiento)) {
      Alert.alert('Error', 'La fecha debe tener el formato DD/MM/AAAA');
      return false;
    }

    const [day, month, year] = fechaNacimiento.split('/').map(Number);
    if (day < 1 || day > 31) {
      Alert.alert('Error', 'El día debe estar entre 1 y 31');
      return false;
    }
    if (month < 1 || month > 12) {
      Alert.alert('Error', 'El mes debe estar entre 1 y 12');
      return false;
    }
    if (year < 1900 || year > new Date().getFullYear()) {
      Alert.alert('Error', 'El año debe ser válido');
      return false;
    }

    const birthDate = new Date(year, month - 1, day);
    if (birthDate.getDate() !== day || birthDate.getMonth() !== month - 1 || birthDate.getFullYear() !== year) {
      Alert.alert('Error', 'La fecha ingresada no es válida');
      return false;
    }

    const today = new Date();
    const age = today.getFullYear() - year;
    if (age < 18) {
      Alert.alert('Error', 'Debes ser mayor de 18 años para registrarte');
      return false;
    }

    if (!direccion.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu dirección');
      return false;
    }

    return true;
  };

  const formatDUI = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const truncated = cleaned.substring(0, 9);
    
    if (truncated.length >= 8) {
      return truncated.substring(0, 8) + '-' + truncated.substring(8);
    }
    return truncated;
  };

  const formatDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 4) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4) + '/' + cleaned.substring(4, 8);
    } else if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    return cleaned;
  };

  const formatPhone = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const truncated = cleaned.substring(0, 8);
    
    if (truncated.length >= 4) {
      return truncated.substring(0, 4) + '-' + truncated.substring(4);
    }
    return truncated;
  };

  const requestCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.log('Error solicitando permiso de cámara:', error);
      return false;
    }
  };

  const requestMediaLibraryPermission = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.log('Error solicitando permiso de galería:', error);
      return false;
    }
  };

  const takePhotoWithCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permiso denegado', 'Necesitas permitir el acceso a la cámara para tomar fotos.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `photo_${Date.now()}.jpg`,
        });
        setShowImageModal(false);
      }
    } catch (error) {
      console.log('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta de nuevo.');
    }
  };

  const selectFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      Alert.alert('Permiso denegado', 'Necesitas permitir el acceso a la galería para seleccionar fotos.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          type: 'image/jpeg',
          name: asset.fileName || `image_${Date.now()}.jpg`,
        });
        setShowImageModal(false);
      }
    } catch (error) {
      console.log('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Intenta de nuevo.');
    }
  };

  const registerUser = async (userData, imageFile) => {
    try {
      console.log('🚀 Enviando datos al backend:', userData);
      const url = `${API_BASE_URL}/api/register-cliente`;
      console.log('🌐 URL completa:', url);
      
      const formData = new FormData();
      
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });
      
      if (imageFile) {
        formData.append('profileImage', {
          uri: imageFile.uri,
          type: imageFile.type,
          name: imageFile.name,
        });
        console.log('📸 Imagen agregada al FormData:', imageFile.name);
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      console.log('📊 Status de respuesta:', response.status);

      const contentType = response.headers.get('content-type');
      console.log('📊 Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Respuesta no es JSON:', textResponse);
        return { 
          success: false, 
          error: `Servidor no respondió JSON. Respuesta: ${textResponse.substring(0, 100)}...` 
        };
      }

      const result = await response.json();
      console.log('📋 Respuesta del servidor:', result);

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.Message || result.message || 'Error desconocido' };
      }
      
    } catch (error) {
      console.error('💥 Error de conexión:', error);
      return { 
        success: false, 
        error: `Error de conexión: ${error.message}` 
      };
    }
  };

  // RegistrarseCliente2.js - Modificar esta función
const handleCreateAccount = async () => {
  console.log('🚀 INICIANDO PROCESO DE REGISTRO...');

  if (!validateForm()) {
    console.log('❌ Validación fallida');
    return;
  }

  if (!email || !password) {
    Alert.alert('Error', 'Faltan datos del email o contraseña. Regresa a la pantalla anterior.');
    return;
  }

  setLoading(true);
  
  try {
    // Normalizar teléfono para envío (agregar +503)
    let normalizedPhone = phone.replace(/\D/g, ''); // quitar guiones
    if (!normalizedPhone.startsWith('503')) {
      normalizedPhone = '503' + normalizedPhone;
    }
    normalizedPhone = '+' + normalizedPhone;

    console.log('📱 Enviando código SMS a:', normalizedPhone);

    // 🔥 ENVIAR CÓDIGO DE VERIFICACIÓN SMS
    const smsResponse = await fetch(`${API_BASE_URL}/api/auth/requestCode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: normalizedPhone,
        via: 'sms'
      })
    });

    const smsData = await smsResponse.json();
    console.log('📋 Respuesta SMS:', smsData);

    if (!smsData.success) {
      Alert.alert('Error', smsData.message || 'No se pudo enviar el código SMS');
      setLoading(false);
      return;
    }

    // ✅ SMS enviado exitosamente
    console.log('✅ Código SMS enviado');
    
    // Preparar datos para la pantalla de verificación
    const convertDateFormat = (dateStr) => {
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return dateStr;
    };

    const registrationData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      idNumber: dui.trim(),
      birthDate: convertDateFormat(fechaNacimiento),
      password: password.trim(),
      phone: phone.trim(),
      phoneNormalized: normalizedPhone,
      address: direccion.trim(),
      profileImage: selectedImage
    };

    setLoading(false);

    // 🎯 NAVEGAR A PANTALLA DE VERIFICACIÓN
    navigation.navigate('Recuperacion2Screen', {
      recoveryToken: smsData.recoveryToken,
      registrationData: registrationData,
      phoneNumber: normalizedPhone
    });

  } catch (error) {
    console.error('💥 Error enviando SMS:', error);
    Alert.alert('Error', 'No se pudo enviar el código. Verifica tu conexión.');
    setLoading(false);
  }
};

  const showImageOptions = () => {
    setShowImageModal(true);
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container}>
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Registro</Text>
            <Text style={styles.headerStep}>Paso 2 de 2</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

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
            
            {/* Header Section with Lottie */}
            <View style={styles.headerSection}>
              <View style={styles.titleWithLottieContainer}>
                <View style={styles.titleColumn}>
                  <Text style={styles.welcomeTitle}>¡Ya casi</Text>
                  <Text style={styles.welcomeTitle2}>terminamos!</Text>
                </View>
                <View style={styles.lottieContainer}>
                  <LottieView
                    source={require('../assets/lottie/Man and Woman say Hi !.json')}
                    autoPlay
                    loop={false}
                    style={styles.lottieAnimation}
                  />
                </View>
              </View>
              <Text style={styles.subtitle}>Completa tu perfil con algunos datos más</Text>
            </View>

            {/* Profile Image Section */}
            <View style={styles.profileImageSection}>
              <Text style={styles.profileImageLabel}>Foto de perfil</Text>
              <TouchableOpacity 
                style={styles.profileImageContainer}
                onPress={showImageOptions}
                activeOpacity={0.7}
              >
                {selectedImage ? (
                  <View style={styles.selectedImageContainer}>
                    <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                    <View style={styles.imageOverlay}>
                      <Icon name="camera" size={24} color="#FFFFFF" />
                    </View>
                    <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                      <Icon name="close" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.placeholderImage}>
                    <View style={styles.cameraIconContainer}>
                      <Icon name="camera-outline" size={28} color="#6B7280" />
                    </View>
                    <Text style={styles.placeholderText}>Agregar foto</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.optionalText}>Opcional</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              
              {/* First Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombre</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Tu primer nombre"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Last Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Apellido</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Tu apellido"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* DUI */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>DUI</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="card-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="12345678-9"
                    value={dui}
                    onChangeText={(text) => setDui(formatDUI(text))}
                    keyboardType="numeric"
                    maxLength={10}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Phone */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="1234-5678"
                    value={phone}
                    onChangeText={(text) => setPhone(formatPhone(text))}
                    keyboardType="numeric"
                    maxLength={9}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Birth Date */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Fecha de nacimiento</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="calendar-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="DD/MM/AAAA"
                    value={fechaNacimiento}
                    onChangeText={(text) => setFechaNacimiento(formatDate(text))}
                    keyboardType="numeric"
                    maxLength={10}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Address */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Dirección</Text>
                <View style={[styles.inputWrapper, { alignItems: 'flex-start' }]}>
                  <Icon name="location-outline" size={20} color="#6B7280" style={[styles.inputIcon, { marginTop: 2 }]} />
                  <TextInput
                    style={[styles.textInput, { minHeight: 60 }]}
                    placeholder="Tu dirección completa"
                    value={direccion}
                    onChangeText={setDireccion}
                    multiline={true}
                    numberOfLines={3}
                    placeholderTextColor="#9CA3AF"
                    textAlignVertical="top"
                  />
                </View>
              </View>

            </View>

            {/* Terms */}
            <Text style={styles.termsText}>
              Al crear tu cuenta, aceptas nuestros términos y condiciones
            </Text>

            {/* Create Account Button */}
            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  loading && styles.buttonDisabled
                ]}
                onPress={handleCreateAccount}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Crear cuenta</Text>
                      <View style={styles.arrowContainer}>
                        <Icon name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footerSection}>
              <View style={styles.pageIndicator}>
                <View style={styles.dotInactive} />
                <View style={styles.dotActive} />
              </View>
            </View>

          </View>

        </ScrollView>

        {/* Image Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showImageModal}
          onRequestClose={() => setShowImageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar foto</Text>
                <TouchableOpacity onPress={() => setShowImageModal(false)} style={styles.modalCloseButton}>
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.modalOption} onPress={takePhotoWithCamera} activeOpacity={0.7}>
                <View style={styles.modalIconContainer}>
                  <Icon name="camera-outline" size={24} color="#1F2937" />
                </View>
                <View style={styles.modalOptionTextContainer}>
                  <Text style={styles.modalOptionText}>Tomar foto</Text>
                  <Text style={styles.modalOptionSubtext}>Usa tu cámara</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalOption} onPress={selectFromGallery} activeOpacity={0.7}>
                <View style={styles.modalIconContainer}>
                  <Icon name="images-outline" size={24} color="#1F2937" />
                </View>
                <View style={styles.modalOptionTextContainer}>
                  <Text style={styles.modalOptionText}>Galería</Text>
                  <Text style={styles.modalOptionSubtext}>Selecciona una foto</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Modern Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: -0.3,
  },
  headerStep: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
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
    opacity: 0.1,
    transform: [{ rotate: '45deg' }],
  },
  curvedShape2: {
    position: 'absolute',
    top: 200,
    left: -120,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#007AFF',
    opacity: 0.08,
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
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 40,
    zIndex: 1,
  },

  // Header Section with Lottie
  headerSection: {
    marginBottom: 32,
  },
  titleWithLottieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleColumn: {
    flex: 1,
    maxWidth: '65%',
  },
  welcomeTitle: {
    fontSize: 38,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 44,
    letterSpacing: -1,
  },
  welcomeTitle2: {
    fontSize: 38,
    fontWeight: '300',
    color: '#6B7280',
    lineHeight: 44,
    letterSpacing: -1,
  },
  lottieContainer: {
    width: 90,
    height: 90,
    marginLeft: 8,
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '400',
    lineHeight: 24,
  },

  // Profile Image
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedImageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  optionalText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

  // Form Section
  formSection: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0,
  },

  // Terms
  termsText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },

  // Button Section
  buttonSection: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: '#1F2937',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 180,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
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

  // Footer Section
  footerSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  pageIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  dotActive: {
    width: 24,
    height: 8,
    backgroundColor: '#1F2937',
    borderRadius: 4,
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 2,
  },
  modalOptionSubtext: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default RegistrarseCliente2;