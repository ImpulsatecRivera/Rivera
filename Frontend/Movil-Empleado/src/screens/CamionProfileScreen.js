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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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

const Row = ({ icon, label, value }) => (
  <View style={styles.row}>
    <View style={styles.rowIcon}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
    </View>
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={3}>
        {textSafe(value)}
      </Text>
    </View>
  </View>
);

export default function CamionScreen() {
  const { profile, loading, fetchProfile } = useProfile();
  const insets = useSafeAreaInsets();

  // ✅ Evita crash si por alguna razón esta pantalla se renderiza fuera de Tabs
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
    // Variantes comunes según backend / tu hook
    const raw =
      profile?.camionInfo ||
      profile?.truckInfo ||
      profile?.truck ||
      profile?.camion ||
      null;

    if (!raw) return { has: false };

    // Si viene como string: "Kia Soul (P123...)"
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
        {/* Card principal */}
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
              {/* Si viene como string, lo mostramos como resumen */}
              {!!camionData.resumen && (
                <View style={styles.highlight}>
                  <Text style={styles.highlightText}>{camionData.resumen}</Text>
                </View>
              )}

              <View style={styles.infoCard}>
                <Row icon="🏷️" label="Marca" value={camionData.brand} />
                <View style={styles.divider} />
                <Row icon="📌" label="Modelo" value={camionData.model} />
                <View style={styles.divider} />
                <Row icon="🪪" label="Placa" value={camionData.plate} />
                <View style={styles.divider} />
                <Row icon="🎨" label="Color" value={camionData.color} />
                <View style={styles.divider} />
                <Row icon="✅" label="Estado" value={camionData.state} />
                {!!camionData.gasoline && (
                  <>
                    <View style={styles.divider} />
                    <Row
                      icon="⛽"
                      label="Nivel de gasolina"
                      value={camionData.gasoline}
                    />
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },

  cardTop: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },

  cardTopHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardTopTitle: { fontSize: 18, fontWeight: "800", color: "#111" },
  cardTopSubtitle: { marginTop: 6, color: "#6B7280", fontSize: 13 },

  badge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: "#2E7D32", fontWeight: "800", fontSize: 12 },

  highlight: {
    marginTop: 14,
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
  },
  highlightText: { color: "#14532D", fontWeight: "700" },

  infoCard: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },

  row: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10 },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowLabel: { fontSize: 12, color: "#6B7280", fontWeight: "700" },
  rowValue: { fontSize: 15, color: "#111827", fontWeight: "600" },

  divider: { height: 1, backgroundColor: "#EEF2F7" },

  loadingText: { marginTop: 10, color: "#6B7280", textAlign: "center" },

  emptyBox: {
    marginTop: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  emptyTitle: { marginTop: 8, fontWeight: "800", color: "#111" },
  emptySub: { marginTop: 6, color: "#6B7280", textAlign: "center" },
});
