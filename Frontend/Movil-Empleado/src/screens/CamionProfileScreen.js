// src/screens/CamionScreen.js
import React, { useCallback, useMemo } from "react";
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
import Header from "../components/Header";
import { useProfile } from "../hooks/useProfile";

const textSafe = (v, fb = "—") => {
  if (v === null || v === undefined) return fb;
  const s = String(v).trim();
  return s ? s : fb;
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
const GasolineChart = ({ percentage, onAddReceipt }) => {
  const numericPercentage = parseInt(percentage) || 0;
  const radius = 70;
  const strokeWidth = 15;
  const center = radius + strokeWidth;
  const circumference = 2 * Math.PI * radius;
  
  // Calcular el dashoffset para el porcentaje
  const dashOffset = circumference - (circumference * numericPercentage) / 100;

  // Colores según el nivel
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
        {/* Círculo de fondo (gris) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Círculo de progreso */}
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
        
        {/* Texto del porcentaje */}
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

    return { has: true, resumen, brand, model, plate, color, state, gasoline };
  }, [profile]);

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
              {/* Resumen del camión */}
              {!!camionData.resumen && (
                <View style={styles.highlight}>
                  <Text style={styles.highlightText}>{camionData.resumen}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* ✅ GRID 2x2 + 1 - PRIMERAS 5 CARDS */}
        {camionData?.has && (
          <>
            {/* Primera fila: Marca y Modelo */}
            <View style={styles.gridRow}>
              <SmallInfoCard icon="🏷️" label="Marca" value={camionData.brand} />
              <SmallInfoCard icon="📌" label="Modelo" value={camionData.model} />
            </View>

            {/* Segunda fila: Placa y Color */}
            <View style={styles.gridRow}>
              <SmallInfoCard icon="🪪" label="Placa" value={camionData.plate} />
              <SmallInfoCard icon="🎨" label="Color" value={camionData.color} />
            </View>

            {/* Tercera fila: Estado (ocupa todo el ancho) */}
            <View style={styles.fullWidthCard}>
              <SmallInfoCard icon="✅" label="Estado" value={camionData.state} />
            </View>

            {/* ✅ GRÁFICA DE PASTEL - NIVEL DE GASOLINA */}
            {!!camionData.gasoline && (
              <View style={styles.gasolineCard}>
                {/* Header con emoji y título */}
                <View style={styles.gasolineHeader}>
                  <View style={styles.gasolineTitleContainer}>
                    <Text style={styles.gasolineEmoji}>⛽</Text>
                    <Text style={styles.gasolineTitle}>Nivel de gasolina</Text>
                  </View>
                </View>

                {/* Gráfica */}
                <GasolineChart percentage={camionData.gasoline} />

                {/* Botón para agregar comprobante */}
                <TouchableOpacity 
                  style={styles.addReceiptButton}
                  onPress={() => {
                    Alert.alert(
                      "Agregar comprobante",
                      "¿Deseas subir un comprobante de gasolina?",
                      [
                        {
                          text: "Cancelar",
                          style: "cancel"
                        },
                        {
                          text: "Tomar foto",
                          onPress: () => {
                            // TODO: Implementar tomar foto
                            console.log("Tomar foto");
                          }
                        },
                        {
                          text: "Elegir archivo",
                          onPress: () => {
                            // TODO: Implementar seleccionar archivo
                            console.log("Elegir archivo");
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.addReceiptIcon}>📸</Text>
                  <Text style={styles.addReceiptText}>Agregar comprobante</Text>
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

  // Card principal "Mi camión"
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

  // ✅ GRID LAYOUT - 2x2
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  fullWidthCard: {
    marginBottom: 12,
  },

  // ✅ CARD PEQUEÑA PARA GRID
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

  // ✅ CARD DE GASOLINA CON GRÁFICA
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

  // ✅ BOTÓN PARA AGREGAR COMPROBANTE
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

  addReceiptIcon: {
    fontSize: 20,
  },

  addReceiptText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // Estados de carga y vacío
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