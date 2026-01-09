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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import Header from "../components/Header";
import { useProfile } from "../hooks/useProfile";

// ✅ CONFIGURAR TU API URL
const API_URL = "http://192.168.1.100:4000/api";

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

  // ✅ FUNCIÓN PARA SUBIR COMPROBANTE
  const subirComprobante = async (imageUri, imageType, imageName) => {
    try {
      if (!camionData.camionId) {
        Alert.alert("Error", "No se encontró el ID del camión");
        return;
      }

      setUploading(true);

      // Crear FormData
      const formData = new FormData();
      
      // Agregar imagen
      formData.append('comprobante', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        type: imageType || 'image/jpeg',
        name: imageName || `comprobante_${Date.now()}.jpg`,
      });

      // Agregar datos del resumen
      formData.append('CicurlationCard', camionData.camionId);
      formData.append('Galones', '0'); // Puedes pedir estos datos al usuario
      formData.append('Total', '0'); // Puedes pedir estos datos al usuario
      formData.append('fecha', new Date().toISOString());

      console.log('📤 Subiendo comprobante...');

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
          "¡Éxito!",
          "Comprobante subido correctamente",
          [
            {
              text: "OK",
              onPress: () => fetchProfile?.(),
            }
          ]
        );
      } else {
        throw new Error(data.message || 'Error al subir el comprobante');
      }

    } catch (error) {
      console.error('❌ Error subiendo comprobante:', error);
      Alert.alert(
        "Error",
        error.message || "No se pudo subir el comprobante"
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
  });

  if (!result.canceled) {
    const asset = result.assets[0];
    subirComprobante(asset.uri, asset.mimeType, 'foto.jpg');
  }
};


  // ✅ FUNCIÓN PARA SELECCIONAR ARCHIVO
const seleccionarArchivo = async () => {
  const permitido = await pedirPermisosGaleria();
  if (!permitido) return;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (!result.canceled) {
    const asset = result.assets[0];
    subirComprobante(asset.uri, asset.mimeType, 'galeria.jpg');
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

                {/* BOTÓN PARA AGREGAR COMPROBANTE */}
                <TouchableOpacity 
                  style={[
                    styles.addReceiptButton,
                    uploading && styles.addReceiptButtonDisabled
                  ]}
                  disabled={uploading}
                  onPress={() => {
                    Alert.alert(
                      "Agregar comprobante",
                      "¿Cómo deseas subir el comprobante?",
                      [
                        {
                          text: "Cancelar",
                          style: "cancel"
                        },
                        {
                          text: "Tomar foto",
                          onPress: tomarFoto
                        },
                        {
                          text: "Elegir archivo",
                          onPress: seleccionarArchivo
                        }
                      ]
                    );
                  }}
                >
                  {uploading ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.addReceiptText}>Subiendo...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.addReceiptIcon}>📸</Text>
                      <Text style={styles.addReceiptText}>Agregar comprobante</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
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

  addReceiptButton: {
    marginTop: 20,
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { 
        elevation: 4 
      },
    }),
  },

  addReceiptButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },

  addReceiptIcon: {
    fontSize: 20,
  },

  addReceiptText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
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