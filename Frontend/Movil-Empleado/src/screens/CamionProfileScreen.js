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
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import Header from "../components/Header";
import { useProfile } from "../hooks/useProfile";

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

// ✅ GRÁFICA DE PASTEL PARA GASOLINA
const GasolineChart = ({ percentage }) => {
  const numericPercentage = parseInt(percentage) || 0;
  const radius = 70;
  const strokeWidth = 15;
  const center = radius + strokeWidth;
  const circumference = 2 * Math.PI * radius;
  
  const dashOffset = circumference - (circumference * numericPercentage) / 100;

  let fillColor = '#10B981'; // Verde
  if (numericPercentage < 20) {
    fillColor = '#EF4444'; // Rojo
  } else if (numericPercentage < 50) {
    fillColor = '#F59E0B'; // Naranja
  }

  const size = (radius + strokeWidth) * 2;

  return (
    <View style={styles.chartContainer}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={fillColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        <SvgText
          x={center}
          y={center}
          textAnchor="middle"
          fontSize="32"
          fontWeight="bold"
          fill="#111827"
          dy="10"
        >
          {numericPercentage}%
        </SvgText>
      </Svg>
      
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: fillColor }]} />
          <Text style={styles.legendText}>Nivel actual</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E5E7EB' }]} />
          <Text style={styles.legendText}>Vacío</Text>
        </View>
      </View>
    </View>
  );
};

export default function CamionScreen() {
  const { profile, loading, fetchProfile } = useProfile();
  const insets = useSafeAreaInsets();
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estados del formulario
  const [galones, setGalones] = useState('');
  const [total, setTotal] = useState('');
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
        camionId: null,
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
      camionId: raw._id || raw.id || null,
    };
  }, [profile]);

  // ✅ LIMPIAR FORMULARIO
  const limpiarFormulario = () => {
    setGalones('');
    setTotal('');
    setComprobante(null);
  };

  // ✅ FUNCIÓN PARA SUBIR REGISTRO DE GAS
  const registrarGas = async () => {
    try {
      // Validaciones
      if (!galones || !total) {
        Alert.alert("Campos incompletos", "Por favor completa todos los campos");
        return;
      }

      if (!comprobante) {
        Alert.alert("Comprobante requerido", "Por favor agrega una foto del comprobante");
        return;
      }

      if (!camionData.camionId) {
        Alert.alert("Error", "No se encontró el ID del camión");
        return;
      }

      setUploading(true);

      // Obtener fecha actual
      const fechaActual = new Date();
      const mes = fechaActual.getMonth() + 1; // 1-12
      const ano = fechaActual.getFullYear();

      // Crear FormData
      const formData = new FormData();
      
      // Agregar imagen
      formData.append('comprobante', {
        uri: Platform.OS === 'ios' ? comprobante.uri.replace('file://', '') : comprobante.uri,
        type: comprobante.mimeType || 'image/jpeg',
        name: comprobante.fileName || `comprobante_${Date.now()}.jpg`,
      });

      // Agregar datos del formulario
      formData.append('CicurlationCard', camionData.camionId);
      formData.append('Galones', galones);
      formData.append('Total', total);
      formData.append('fecha', fechaActual.toISOString());
      formData.append('mes', mes.toString());
      formData.append('ano', ano.toString());
      formData.append('estado', 'pendiente'); // Estado por defecto

      console.log('📤 Registrando gas...');

      const response = await fetch(`${API_URL}/resumen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          "¡Registro exitoso! ⛽",
          `Has agregado ${galones} galones por $${total}`,
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

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setComprobante(result.assets[0]);
    }
  };

  // ✅ FUNCIÓN PARA SELECCIONAR ARCHIVO
  const seleccionarArchivo = async () => {
    const permitido = await pedirPermisosGaleria();
    if (!permitido) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setComprobante(result.assets[0]);
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

            {/* GRÁFICA DE GASOLINA */}
            {!!camionData.gasoline && (
              <View style={styles.gasolineCard}>
                <View style={styles.gasolineHeader}>
                  <View style={styles.gasolineTitleContainer}>
                    <Text style={styles.gasolineEmoji}>⛽</Text>
                    <Text style={styles.gasolineTitle}>Nivel de gasolina</Text>
                  </View>
                </View>

                <GasolineChart percentage={camionData.gasoline} />

                {/* BOTÓN PARA REGISTRAR GAS */}
                <TouchableOpacity 
                  style={[
                    styles.addGasButton,
                    uploading && styles.addGasButtonDisabled
                  ]}
                  disabled={uploading}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.addGasIcon}>⛽</Text>
                  <Text style={styles.addGasText}>¿Agregaste gas?</Text>
                  <Text style={styles.addGasSubtext}>Toca para registrar</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
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
                    Camión: {camionData.resumen}
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

  gasolineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
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

  gasolineHeader: {
    marginBottom: 20,
  },

  gasolineTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  gasolineEmoji: {
    fontSize: 28,
  },

  gasolineTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },

  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  legendText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },

  addGasButton: {
    marginTop: 20,
    backgroundColor: "#10B981",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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

  addGasButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },

  addGasIcon: {
    fontSize: 32,
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