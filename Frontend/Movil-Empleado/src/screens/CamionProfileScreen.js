// src/screens/CamionScreen.js
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import LottieView from 'lottie-react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from "../components/Header";
import { useProfile } from "../hooks/useProfile";
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ CONFIGURAR TU API URL
const API_URL = "https://rivera-test-629395560179.us-west1.run.app/api";

const textSafe = (v, fb = "—") => {
  if (v === null || v === undefined) return fb;
  const s = String(v).trim();
  return s ? s : fb;
};

const pedirPermisosCamara = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara');
    return false;
  }
  return true;
};

const pedirPermisosGaleria = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso requerido', 'Se necesita acceso a la galería');
    return false;
  }
  return true;
};

const pick = (...vals) => {
  for (const v of vals) {
    const s = v === null || v === undefined ? "" : String(v).trim();
    if (s) return s;
  }
  return "";
};

const Badge = ({ text }) => (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{text}</Text>
  </View>
);

// ✅ CARD PEQUEÑA PARA GRID 2x2
const SmallInfoCard = ({ icon, label, value }) => (
  <View style={styles.smallCard}>
    <Text style={styles.smallCardIcon}>{icon}</Text>
    <Text style={styles.smallCardLabel}>{label}</Text>
    <Text style={styles.smallCardValue} numberOfLines={1}>
      {textSafe(value)}
    </Text>
  </View>
);

export default function CamionProfileScreen() {
  const { profile, loading, fetchProfile } = useProfile();
  const insets = useSafeAreaInsets();
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estados del formulario
  const [placaCamion, setPlacaCamion] = useState('');
  const [galones, setGalones] = useState('');
  const [total, setTotal] = useState('');
  const [numeroMarchamo, setNumeroMarchamo] = useState('');
  const [comprobante, setComprobante] = useState(null);

  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch {
    tabBarHeight = 0;
  }

  useFocusEffect(
    useCallback(() => {
      fetchProfile?.();
    }, [fetchProfile])
  );

  const camionData = useMemo(() => {
    const raw =
      profile?.camionInfo ||
      profile?.truckInfo ||
      profile?.truck ||
      profile?.camion ||
      null;

    if (!raw) return { has: false };

    if (typeof raw === "string") {
      return {
        has: true,
        resumen: raw,
        brand: "",
        model: "",
        plate: "",
        color: "",
        state: "",
        gasoline: "",
      };
    }

    const brand = pick(raw.brand, raw.marca);
    const model = pick(raw.model, raw.modelo);
    const plate = pick(raw.licensePlate, raw.placa, raw.plate);
    const color = pick(raw.color, raw.colorName);
    const state = pick(raw.state, raw.estado);
    const gasoline =
      typeof raw.gasolineLevel === "number"
        ? `${raw.gasolineLevel}%`
        : pick(raw.gasolineLevel, raw.nivelGasolina);

    const resumen = pick(
      raw.name,
      raw.nombre,
      brand || model ? `${brand} ${model}`.trim() : "",
      plate ? `Placa: ${plate}` : ""
    );

    return { 
      has: true, 
      resumen, 
      brand, 
      model, 
      plate, 
      color, 
      state, 
      gasoline,
    };
  }, [profile]);

  // ✅ LIMPIAR FORMULARIO
  const limpiarFormulario = () => {
    setPlacaCamion('');
    setGalones('');
    setTotal('');
    setNumeroMarchamo('');
    setComprobante(null);
  };

  // ✅ FUNCIÓN PARA SUBIR REGISTRO DE GAS
  // ✅ FUNCIÓN PARA SUBIR REGISTRO DE GAS
// ✅ FUNCIÓN PARA SUBIR REGISTRO DE GAS
// ✅ FUNCIÓN PARA SUBIR REGISTRO DE GAS
// ✅ FUNCIÓN PARA SUBIR REGISTRO DE GAS
// ✅ FUNCIÓN PARA SUBIR REGISTRO DE GAS
const registrarGas = async () => {
  try {
    // Validaciones
    if (!placaCamion.trim()) {
      Alert.alert("Campo requerido", "Por favor escribe la placa del camión");
      return;
    }

    if (!galones || !total) {
      Alert.alert("Campos incompletos", "Por favor completa galones y total");
      return;
    }

    if (!comprobante) {
      Alert.alert("Comprobante requerido", "Por favor agrega una foto del comprobante");
      return;
    }

    setUploading(true);

    // ✅ PASO 1: OBTENER EL TOKEN DE AUTENTICACIÓN
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('No se encontró el token de autenticación. Por favor inicia sesión nuevamente.');
    }

    // ✅ PASO 2: OBTENER TODOS LOS CAMIONES CON AUTENTICACIÓN
    console.log('🔍 Buscando camión con placa:', placaCamion.trim().toUpperCase());
    
    const camionesResponse = await fetch(`${API_URL}/camiones`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!camionesResponse.ok) {
      const errorText = await camionesResponse.text();
      console.error('❌ Error respuesta camiones:', errorText);
      throw new Error('Error al obtener la lista de camiones');
    }

    const camionesData = await camionesResponse.json();
    
    console.log('📦 Respuesta del servidor:', camionesData);
    
    // ✅ MANEJAR ESTRUCTURA DE RESPUESTA
    let listaCamiones = [];
    
    if (camionesData.data && Array.isArray(camionesData.data)) {
      listaCamiones = camionesData.data;
    } else if (Array.isArray(camionesData)) {
      listaCamiones = camionesData;
    }

    if (!listaCamiones || listaCamiones.length === 0) {
      throw new Error('No hay camiones registrados en el sistema');
    }

    console.log('📋 Total de camiones:', listaCamiones.length);

    // Buscar el camión por placa (case-insensitive)
    const placaBuscada = placaCamion.trim().toUpperCase();
    const camionEncontrado = listaCamiones.find(camion => {
      const placaCamionActual = (camion.licensePlate || camion.placa || '').toUpperCase();
      return placaCamionActual === placaBuscada;
    });

    if (!camionEncontrado) {
      // Mostrar las primeras 5 placas disponibles
      const placasDisponibles = listaCamiones
        .slice(0, 5)
        .map(c => c.licensePlate || c.placa)
        .filter(Boolean)
        .join(', ');
      
      throw new Error(
        `No se encontró el camión con placa: ${placaBuscada}\n\n` +
        `Verifica que la placa esté correctamente escrita.\n\n` +
        `Ejemplos de placas registradas:\n${placasDisponibles}`
      );
    }

    const camionId = camionEncontrado._id || camionEncontrado.id;
    console.log('✅ Camión encontrado:', {
      id: camionId,
      placa: camionEncontrado.licensePlate || camionEncontrado.placa,
      nombre: camionEncontrado.name || camionEncontrado.nombre
    });

    // ✅ PASO 3: PREPARAR FECHA LOCAL (EL SALVADOR UTC-6)
    const fechaActual = new Date();
    
    // Ajustar a zona horaria de El Salvador (UTC-6)
    const offsetElSalvador = -6 * 60; // -6 horas en minutos
    const offsetLocal = fechaActual.getTimezoneOffset(); // offset del dispositivo
    const diferenciaMinutos = offsetElSalvador - offsetLocal;
    
    const fechaElSalvador = new Date(fechaActual.getTime() + (diferenciaMinutos * 60 * 1000));
    
    const mes = fechaElSalvador.getMonth() + 1;
    const ano = fechaElSalvador.getFullYear();
    
    // Crear fecha ISO en zona horaria de El Salvador
    const pad = (n) => String(n).padStart(2, '0');
    const fechaISO = `${ano}-${pad(mes)}-${pad(fechaElSalvador.getDate())}T${pad(fechaElSalvador.getHours())}:${pad(fechaElSalvador.getMinutes())}:${pad(fechaElSalvador.getSeconds())}.000-06:00`;
    
    console.log('📅 Fecha local del dispositivo:', fechaActual.toISOString());
    console.log('📅 Fecha ajustada El Salvador:', fechaISO);

    const formData = new FormData();
    
    // Agregar imagen
    formData.append('comprobante', {
      uri: Platform.OS === 'ios' ? comprobante.uri.replace('file://', '') : comprobante.uri,
      type: comprobante.mimeType || 'image/jpeg',
      name: comprobante.fileName || `comprobante_${Date.now()}.jpg`,
    });

    // Agregar datos del formulario
    formData.append('CicurlationCard', camionId);
    formData.append('Galones', galones);
    formData.append('Total', total);
    formData.append('fecha', fechaISO); // ✅ Fecha con zona horaria de El Salvador
    formData.append('mes', mes.toString());
    formData.append('ano', ano.toString());
    formData.append('estado', 'pendiente');
    if (numeroMarchamo.trim()) {
      formData.append('numeroMarchamo', numeroMarchamo.trim());
    }

    console.log('📤 Registrando gas para camión ID:', camionId);

    const response = await fetch(`${API_URL}/resumen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();
    
    console.log('📥 Respuesta del registro:', data);

    if (response.ok && data.success) {
      Alert.alert(
        "¡Registro exitoso! ⛽",
        `Has agregado ${galones} galones por $${total} al camión ${placaBuscada}`,
        [
          {
            text: "OK",
            onPress: () => {
              setModalVisible(false);
              limpiarFormulario();
              fetchProfile?.();
            }
          }
        ]
      );
    } else {
      throw new Error(data.message || 'Error al registrar el gas');
    }

  } catch (error) {
    console.error('❌ Error registrando gas:', error);
    Alert.alert(
      "Error",
      error.message || "No se pudo registrar el gas"
    );
  } finally {
    setUploading(false);
  }
};

  // ✅ FUNCIÓN PARA TOMAR FOTO
  const tomarFoto = async () => {
    const permitido = await pedirPermisosCamara();
    if (!permitido) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      console.log('📷 Resultado cámara:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setComprobante(result.assets[0]);
        console.log('✅ Comprobante guardado:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  // ✅ FUNCIÓN PARA SELECCIONAR ARCHIVO
  const seleccionarArchivo = async () => {
    const permitido = await pedirPermisosGaleria();
    if (!permitido) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      console.log('🖼️ Resultado galería:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setComprobante(result.assets[0]);
        console.log('✅ Comprobante guardado:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  const bottomSpace = Math.max(insets.bottom || 0, 12) + tabBarHeight + 16;

  return (
    <View style={styles.container}>
      <Header title="Datos del camión" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomSpace }}
        refreshControl={
          <RefreshControl
            refreshing={!!loading}
            onRefresh={fetchProfile}
            colors={["#4CAF50"]}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Card principal - Mi camión */}
        <View style={styles.cardTop}>
          <View style={styles.cardTopHeader}>
            <Text style={styles.cardTopTitle}>Mi camión</Text>
            <Badge text="Vista" />
          </View>

          <Text style={styles.cardTopSubtitle}>
            Información asignada al motorista
          </Text>

          {loading && !camionData?.has ? (
            <View style={{ marginTop: 14 }}>
              <ActivityIndicator color="#4CAF50" />
              <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
          ) : !camionData?.has ? (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 26 }}>🚚</Text>
              <Text style={styles.emptyTitle}>Sin camión asignado</Text>
              <Text style={styles.emptySub}>
                Cuando te asignen un camión, aparecerá aquí.
              </Text>
            </View>
          ) : (
            <>
              {!!camionData.resumen && (
                <View style={styles.highlight}>
                  <Text style={styles.highlightText}>{camionData.resumen}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* GRID 2x2 + 1 */}
        {camionData?.has && (
          <>
            <View style={styles.gridRow}>
              <SmallInfoCard icon="🏷️" label="Marca" value={camionData.brand} />
              <SmallInfoCard icon="📌" label="Modelo" value={camionData.model} />
            </View>

            <View style={styles.gridRow}>
              <SmallInfoCard icon="🪪" label="Placa" value={camionData.plate} />
              <SmallInfoCard icon="🎨" label="Color" value={camionData.color} />
            </View>

            <View style={styles.fullWidthCard}>
              <SmallInfoCard icon="✅" label="Estado" value={camionData.state} />
            </View>
          </>
        )}

        {/* BOTÓN PARA REGISTRAR GAS - Siempre visible */}
        <TouchableOpacity 
          style={[
            styles.addGasButton,
            uploading && styles.addGasButtonDisabled
          ]}
          disabled={uploading}
          onPress={() => setModalVisible(true)}
        >
          <LottieView
            source={require('../../assets/lottie/gasoline.json')}
            autoPlay
            loop
            style={styles.addGasLottie}
          />
          <Text style={styles.addGasText}>¿Agregaste gas?</Text>
          <Text style={styles.addGasSubtext}>Toca para registrar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL FORMULARIO */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          limpiarFormulario();
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
              {/* Header del Modal */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Registrar carga de gas ⛽</Text>
                  <Text style={styles.modalSubtitle}>
                    Completa los datos del registro
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    setModalVisible(false);
                    limpiarFormulario();
                  }}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Formulario */}
              <View style={styles.formContainer}>
                
                {/* Campo Placa del Camión */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>🚛 Placa del camión</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: P-123456"
                    value={placaCamion}
                    onChangeText={setPlacaCamion}
                    autoCapitalize="characters"
                  />
                </View>

                {/* Campo Galones */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>⛽ Galones cargados</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 15.5"
                    keyboardType="decimal-pad"
                    value={galones}
                    onChangeText={setGalones}
                  />
                </View>

                {/* Campo Total */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>💵 Total pagado (USD)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 50.00"
                    keyboardType="decimal-pad"
                    value={total}
                    onChangeText={setTotal}
                  />
                </View>

                {/* Campo Número de Marchamo */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>🏷️ Número de marchamo (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: M-12345"
                    value={numeroMarchamo}
                    onChangeText={setNumeroMarchamo}
                    autoCapitalize="characters"
                  />
                </View>

                {/* Vista previa del comprobante */}
                {comprobante && (
                  <View style={styles.comprobantePreview}>
                    <Text style={styles.comprobanteText}>
                      ✓ Comprobante agregado
                    </Text>
                    <TouchableOpacity 
                      onPress={() => setComprobante(null)}
                      style={styles.removeComprobanteButton}
                    >
                      <Text style={styles.removeComprobanteText}>Cambiar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Botón Subir Comprobante */}
                {!comprobante && (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => {
                      Alert.alert(
                        "Subir comprobante",
                        "¿Cómo deseas agregar el comprobante?",
                        [
                          { text: "Cancelar", style: "cancel" },
                          { text: "Tomar foto", onPress: tomarFoto },
                          { text: "Elegir archivo", onPress: seleccionarArchivo }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.uploadButtonIcon}>📸</Text>
                    <Text style={styles.uploadButtonText}>Subir comprobante</Text>
                  </TouchableOpacity>
                )}

                {/* Botón Registrar */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    uploading && styles.submitButtonDisabled
                  ]}
                  disabled={uploading}
                  onPress={registrarGas}
                >
                  {uploading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>
                        Registrar carga
                      </Text>
                      <Text style={styles.submitButtonIcon}>✓</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Nota informativa */}
                <View style={styles.infoBox}>
                  <Text style={styles.infoIcon}>ℹ️</Text>
                  <Text style={styles.infoText}>
                    El registro quedará como "Pendiente" hasta que sea aprobado por administración.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F7FA" 
  },

  cardTop: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { 
        elevation: 3 
      },
    }),
  },

  cardTopHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardTopTitle: { 
    fontSize: 22, 
    fontWeight: "800", 
    color: "#111" 
  },

  cardTopSubtitle: { 
    marginTop: 6, 
    color: "#6B7280", 
    fontSize: 13 
  },

  badge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: { 
    color: "#2E7D32", 
    fontWeight: "700", 
    fontSize: 13 
  },

  highlight: {
    marginTop: 16,
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
  },

  highlightText: { 
    color: "#14532D", 
    fontWeight: "700",
    fontSize: 16,
  },

  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  fullWidthCard: {
    marginBottom: 12,
  },

  smallCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { 
        elevation: 2 
      },
    }),
  },

  smallCardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  smallCardLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 4,
    textAlign: 'center',
  },

  smallCardValue: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "700",
    textAlign: 'center',
  },

  addGasButton: {
    marginTop: 20,
    backgroundColor: "#1F2937",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { 
        elevation: 4 
      },
    }),
  },

  addGasButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },

  addGasLottie: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },

  addGasText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },

  addGasSubtext: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.9,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { 
        elevation: 8 
      },
    }),
  },

  modalContent: {
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },

  formContainer: {
    gap: 16,
  },

  inputGroup: {
    gap: 8,
  },

  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
  },

  comprobantePreview: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  comprobanteText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
  },

  removeComprobanteButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  removeComprobanteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  uploadButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },

  uploadButtonIcon: {
    fontSize: 32,
  },

  uploadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },

  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { 
        elevation: 4 
      },
    }),
  },

  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  submitButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },

  infoBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },

  infoIcon: {
    fontSize: 18,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '600',
    lineHeight: 18,
  },

  loadingText: { 
    marginTop: 10, 
    color: "#6B7280", 
    textAlign: "center" 
  },

  emptyBox: {
    marginTop: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  emptyTitle: { 
    marginTop: 8, 
    fontWeight: "800", 
    color: "#111",
    fontSize: 16,
  },

  emptySub: { 
    marginTop: 6, 
    color: "#6B7280", 
    textAlign: "center",
    fontSize: 14,
  },
});