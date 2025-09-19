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
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/authContext';
import * as ImagePicker from 'expo-image-picker';

// CONFIGURACIÓN DE LA API
const API_BASE_URL = 'https://riveraproject-production.up.railway.app';

const RegistrarseCliente2 = ({ navigation, route }) => {
  // OBTENER DATOS DE LA PANTALLA ANTERIOR
  const { email, password } = route.params || {};
  
  // OBTENER FUNCIONES DEL CONTEXTO DE AUTENTICACIÓN
  const { register } = useAuth();

  // Estados del formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dui, setDui] = useState('');
  const [phone, setPhone] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para imagen de perfil
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // FUNCIÓN PARA TOMAR FOTO CON LA CÁMARA (EXPO VERSION)
  const takePhotoFromCamera = async () => {
    console.log('Intentando abrir cámara...');
    
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesita permiso de cámara para tomar fotos');
        return;
      }

      console.log('Permisos de cámara concedidos, lanzando cámara...');

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Resultado de cámara:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('Imagen de cámara seleccionada exitosamente');
        setSelectedImage(result.assets[0]);
        setShowImageModal(false);
      }
    } catch (error) {
      console.error('Error al usar cámara:', error);
      Alert.alert('Error', 'No se pudo acceder a la cámara');
    }
  };

  // FUNCIÓN PARA SELECCIONAR IMAGEN DE LA GALERÍA (EXPO VERSION)
  const selectImageFromGallery = async () => {
    console.log('Intentando abrir galería...');
    
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesita permiso para acceder a la galería');
        return;
      }

      console.log('Permisos de galería concedidos, lanzando galería...');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Resultado de galería:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('Imagen de galería seleccionada exitosamente');
        setSelectedImage(result.assets[0]);
        setShowImageModal(false);
      }
    } catch (error) {
      console.error('Error al acceder a galería:', error);
      Alert.alert('Error', 'No se pudo acceder a la galería');
    }
  };

  // FUNCIÓN PARA REMOVER IMAGEN SELECCIONADA
  const removeSelectedImage = () => {
    Alert.alert(
      'Remover imagen',
      '¿Estás seguro de que quieres remover esta imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => setSelectedImage(null)
        }
      ]
    );
  };

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

    // Validar formato de DUI
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

    // Validar formato de teléfono
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

    // Validar formato y rango de fecha
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

    // Validar que la fecha sea válida
    const birthDate = new Date(year, month - 1, day);
    if (birthDate.getDate() !== day || birthDate.getMonth() !== month - 1 || birthDate.getFullYear() !== year) {
      Alert.alert('Error', 'La fecha ingresada no es válida');
      return false;
    }

    // Validar edad mínima (ejemplo: 18 años)
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

  // FUNCIÓN PARA CONECTAR CON EL BACKEND CON IMAGEN
  const registerUser = async (userData) => {
    try {
      console.log('🚀 Enviando datos al backend:', userData);
      const url = `${API_BASE_URL}/api/register-cliente`;
      console.log('🌐 URL completa:', url);
      
      // Si hay imagen, usar FormData con el campo correcto
      if (selectedImage) {
        const formData = new FormData();
        
        // Agregar todos los campos de texto
        formData.append('firstName', userData.firstName);
        formData.append('lastName', userData.lastName);
        formData.append('email', userData.email);
        formData.append('idNumber', userData.idNumber);
        formData.append('birthDate', userData.birthDate);
        formData.append('password', userData.password);
        formData.append('phone', userData.phone);
        formData.append('address', userData.address);
        
        // FORMATO CORRECTO PARA LA IMAGEN - CAMPO DEBE SER 'profileImage'
        const imageData = {
          uri: selectedImage.uri,
          type: selectedImage.type || 'image/jpeg',
          name: selectedImage.fileName || `profile_${Date.now()}.jpg`,
        };
        
        formData.append('profileImage', imageData); // CAMBIAR 'img' por 'profileImage'

        console.log('📤 Enviando FormData con imagen...');
        console.log('🖼️ Datos de imagen:', imageData);

        const response = await fetch(url, {
          method: 'POST',
          // NO incluir Content-Type - React Native lo configura automáticamente
          body: formData,
        });

        console.log('📊 Status de respuesta:', response.status);

        // MEJORAR EL MANEJO DE ERRORES
        const responseText = await response.text();
        console.log('📄 Respuesta cruda (primeros 500 chars):', responseText.substring(0, 500));

        // Verificar si la respuesta es HTML (página de error)
        if (responseText.trim().startsWith('<')) {
          console.error('❌ El servidor devolvió HTML en lugar de JSON');
          console.error('📄 Status code:', response.status);
          return { 
            success: false, 
            error: `Error del servidor (${response.status}): ${response.status === 413 ? 'Imagen muy grande' : 'Error interno del servidor'}` 
          };
        }

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Error parseando JSON:', parseError);
          return { 
            success: false, 
            error: `Respuesta inválida del servidor. Status: ${response.status}` 
          };
        }

        console.log('📋 Respuesta del servidor:', result);

        if (response.ok) {
          return { success: true, data: result };
        } else {
          return { success: false, error: result.Message || result.message || `Error del servidor: ${response.status}` };
        }
      } else {
        // Sin imagen, usar JSON normal
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
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
      }
      
    } catch (error) {
      console.error('💥 Error de conexión:', error);
      return { 
        success: false, 
        error: `Error de conexión: ${error.message}` 
      };
    }
  };

  const handleCreateAccount = async () => {
    console.log('🚀 INICIANDO REGISTRO...');

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
      // CONVERTIR FECHA AL FORMATO QUE ESPERA EL BACKEND
      const convertDateFormat = (dateStr) => {
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/');
          const dayNum = parseInt(day, 10);
          const monthNum = parseInt(month, 10);
          const yearNum = parseInt(year, 10);
          
          if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
            throw new Error('Fecha inválida');
          }
          
          return `${yearNum}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
        }
        return dateStr;
      };

      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        idNumber: dui.trim(),
        birthDate: convertDateFormat(fechaNacimiento),
        password: password.trim(),
        phone: phone.trim(),
        address: direccion.trim()
      };
      
      console.log('📝 Datos a enviar:', userData);
      console.log('🖼️ Imagen seleccionada:', selectedImage ? 'Sí' : 'No');
      if (selectedImage) {
        console.log('📷 Detalles de imagen:', {
          uri: selectedImage.uri,
          type: selectedImage.type,
          fileName: selectedImage.fileName,
          fileSize: selectedImage.fileSize,
        });
      }
      
      const result = await registerUser(userData);
      
      if (result.success) {
        console.log('✅ Registro exitoso!');
        console.log('📋 RESPUESTA COMPLETA DEL BACKEND:', JSON.stringify(result.data, null, 2));
        
        // EXTRAER DATOS DE LA RESPUESTA PARA EL CONTEXTO
        const registrationData = {
          user: {
            id: result.data.user?.id || result.data.user?._id || null,
            _id: result.data.user?.id || result.data.user?._id || null,
            email: result.data.user?.email || email,
            firstName: result.data.user?.firstName || firstName,
            lastName: result.data.user?.lastName || lastName,
            fullName: result.data.user?.nombre || `${firstName} ${lastName}`,
            idNumber: dui,
            phone: phone,
            address: direccion,
            birthDate: fechaNacimiento,
            profileImage: result.data.user?.profileImage?.url || result.data.user?.profileImage || null
          },
          token: result.data.token || 'no-token-received',
          userType: result.data.userType || 'Cliente'
        };

        console.log('📦 DATOS PREPARADOS PARA CONTEXTO:', JSON.stringify(registrationData, null, 2));

        // GUARDAR EN EL CONTEXTO DE AUTENTICACIÓN
        console.log('💾 Guardando datos en el contexto...');
        const authResult = await register(registrationData);
        
        console.log('📋 RESULTADO DEL CONTEXTO:', authResult);
        
        if (authResult.success) {
          console.log('✅ Datos guardados en contexto exitosamente');
          Alert.alert(
            'Éxito', 
            '¡Cuenta creada exitosamente!', 
            [
              { 
                text: 'Continuar', 
                onPress: () => {
                  console.log('🎯 Navegando a pantalla de carga');
                  navigation.navigate('pantallacarga1');
                }
              }
            ]
          );
        } else {
          console.error('❌ Error guardando en contexto:', authResult.error);
          Alert.alert('Error', 'Cuenta creada pero hubo un problema con la sesión. Intenta iniciar sesión.');
        }
        
      } else {
        console.error('❌ Error en el registro:', result.error);
        Alert.alert('Error', result.error);
      }
      
    } catch (error) {
      console.error('💥 Exception durante el registro:', error);
      Alert.alert('Error', 'No se pudo crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const showImageOptions = () => {
    setShowImageModal(true);
  };

  const handleGoBack = () => {
    console.log('⬅️ Botón Atrás presionado');
    navigation.goBack();
  };

  const handleDUIChange = (text) => {
    const formatted = formatDUI(text);
    setDui(formatted);
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhone(text);
    setPhone(formatted);
  };

  const handleDateChange = (text) => {
    const formatted = formatDate(text);
    setFechaNacimiento(formatted);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authContainer}>
          <Text style={styles.title}>¡Ya casi{'\n'}terminamos!</Text>
          <Text style={styles.subtitle}>
            Solo necesitamos algunos datos más para completar tu perfil
          </Text>
          
          {/* DEBUG: Mostrar email recibido (remover en producción) */}
          {__DEV__ && (
            <View style={{ backgroundColor: '#f0f0f0', padding: 10, marginBottom: 10, borderRadius: 5 }}>
              <Text style={{ fontSize: 12, color: '#333' }}>
                DEBUG: Email recibido: {email}
              </Text>
              {selectedImage && (
                <Text style={{ fontSize: 12, color: '#333' }}>
                  DEBUG: Imagen: {selectedImage.fileName || 'Sin nombre'}
                </Text>
              )}
            </View>
          )}

          {/* SECCIÓN DE IMAGEN DE PERFIL */}
          <View style={styles.profileImageSection}>
            <Text style={styles.profileImageTitle}>Foto de perfil (opcional)</Text>
            
            <TouchableOpacity 
              style={styles.profileImageContainer}
              onPress={showImageOptions}
            >
              {selectedImage ? (
                <View style={styles.selectedImageContainer}>
                  <Image 
                    source={{ uri: selectedImage.uri }} 
                    style={styles.selectedImage}
                  />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={removeSelectedImage}
                  >
                    <Icon name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.placeholderImage}>
                  <Icon name="camera" size={40} color="#9ca3af" />
                  <Text style={styles.placeholderText}>Agregar foto</Text>
                  <Text style={styles.placeholderSubtext}>Toca para seleccionar</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Resto de los campos del formulario */}
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Primer nombre"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Apellido"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="card-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="DUI (12345678-9)"
              value={dui}
              onChangeText={handleDUIChange}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Teléfono (1234-5678)"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="numeric"
              maxLength={9}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Fecha de nacimiento (DD/MM/AAAA)"
              value={fechaNacimiento}
              onChangeText={handleDateChange}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#999"
            />
          </View>

          <View style={[styles.inputContainer, { marginBottom: 24 }]}>
            <Icon name="location-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Dirección completa"
              value={direccion}
              onChangeText={setDireccion}
              multiline={true}
              numberOfLines={2}
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.termsText}>
            Al hacer click en el botón{' '}
            <Text style={styles.termsHighlight}>Crear cuenta</Text>
            ,{'\n'}aceptas la oferta pública y nuestros términos.
          </Text>

          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleCreateAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <View style={styles.pageIndicatorContainer}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Icon name="arrow-back" size={20} color="#9ca3af" />
              <Text style={styles.backText}>Atrás</Text>
            </TouchableOpacity>
            
            <View style={styles.dotsContainer}>
              <View style={styles.dotInactive} />
              <View style={styles.dotActive} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODAL PARA SELECCIONAR IMAGEN */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showImageModal}
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar imagen</Text>
            <Text style={styles.modalSubtitle}>¿Cómo te gustaría agregar tu foto?</Text>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={takePhotoFromCamera}
            >
              <Icon name="camera" size={24} color="#4CAF50" />
              <Text style={styles.modalOptionText}>Tomar foto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={selectImageFromGallery}
            >
              <Icon name="images" size={24} color="#4CAF50" />
              <Text style={styles.modalOptionText}>Elegir de galería</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowImageModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  
  // Estilos para imagen de perfil
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  selectedImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  placeholderSubtext: {
    fontSize: 10,
    color: '#d1d5db',
    fontStyle: 'italic',
  },

  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 16,
    fontWeight: '500',
  },
  modalCancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 20,
  },
  termsText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  termsHighlight: {
    color: '#ef4444',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    color: '#9ca3af',
    fontSize: 16,
    marginLeft: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4,
  },
});

export default RegistrarseCliente2;