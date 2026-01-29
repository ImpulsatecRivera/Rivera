import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useProfile } from "../hooks/useProfile";
import InfoRow from "../components/InfoRow";
import perfilImg from "../images/perfil.png";

/* =======================
   BADGE DE ROL
======================= */
const RolBadge = ({ rol, type = "default" }) => {
  const badgeStyles = {
    motorista: { bg: "#E3F2FD", color: "#1565C0", icon: "🚛" },
    auxiliar: { bg: "#FFF3E0", color: "#E65100", icon: "👷" },
    default: { bg: "#F3F4F6", color: "#6B7280", icon: "👤" },
  };

  const style = badgeStyles[type] || badgeStyles.default;

  return (
    <View style={[styles.rolBadge, { backgroundColor: style.bg }]}>
      <Text style={styles.rolBadgeIcon}>{style.icon}</Text>
      <Text style={[styles.rolBadgeText, { color: style.color }]}>
        {rol}
      </Text>
    </View>
  );
};

/* =======================
   PERFIL SCREEN
======================= */
const PerfilScreen = () => {
  const { profile, loading, logout, fetchProfile } = useProfile();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch {}

  const isSmallScreen = width < 375;
  const isLargeScreen = width > 414;

  useFocusEffect(
    useCallback(() => {
      fetchProfile?.();
    }, [fetchProfile])
  );

  /* =======================
     PROCESAR ROL (FIX REAL)
  ======================= */
  const usuarioData = useMemo(() => {
    if (!profile) {
      return { rol: "Usuario", rolType: "default" };
    }

    const rolBackend = profile.cargo;

    if (!rolBackend) {
      return { rol: "Sin rol asignado", rolType: "default" };
    }

    const rolLower = String(rolBackend).toLowerCase().trim();

    console.log("🔍 CARGO BACKEND:", rolBackend);
    console.log("🔍 CARGO LOWER:", rolLower);

    // 🔥 AUXILIAR PRIMERO
    if (rolLower.includes("auxiliar")) {
      return { rol: "Auxiliar", rolType: "auxiliar" };
    }

    if (rolLower.includes("motorista")) {
      return { rol: "Motorista", rolType: "motorista" };
    }

    return { rol: rolBackend, rolType: "default" };
  }, [profile]);

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí", onPress: logout },
    ]);
  };

  const hasProfileId = !!(profile?.id || profile?._id);
  if (loading && !hasProfileId) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  const headerTop = (insets.top || 0) + (isSmallScreen ? 14 : 18);
  const bottomSpace = Math.max(insets.bottom || 0, 12) + tabBarHeight + 16;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomSpace }}
        refreshControl={
          <RefreshControl
            refreshing={!!loading}
            onRefresh={fetchProfile}
            colors={["#4CAF50"]}
            tintColor="#4CAF50"
          />
        }
      >
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: headerTop }]}>
          <Text
            style={[
              styles.title,
              { fontSize: isSmallScreen ? 18 : isLargeScreen ? 22 : 20 },
            ]}
          >
            Mi Perfil
          </Text>

          <View style={styles.imageContainer}>
            <Image
              source={profile?.img ? { uri: profile.img } : perfilImg}
              style={[
                styles.perfilImage,
                {
                  width: isSmallScreen ? 80 : isLargeScreen ? 120 : 100,
                  height: isSmallScreen ? 80 : isLargeScreen ? 120 : 100,
                  borderRadius: isSmallScreen ? 40 : isLargeScreen ? 60 : 50,
                },
              ]}
            />
            <View style={styles.rolBadgeContainer}>
              <RolBadge rol={usuarioData.rol} type={usuarioData.rolType} />
            </View>
          </View>

          <Text
            style={[
              styles.name,
              { fontSize: isSmallScreen ? 16 : isLargeScreen ? 20 : 18 },
            ]}
          >
            {profile?.nombre || "—"}
          </Text>

          <Text style={styles.cargo}>{usuarioData.rol}</Text>
        </View>

        {/* CONTENIDO */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Información personal</Text>

          <InfoRow icon="👤" label="Nombre completo" value={profile?.nombre || "—"} />
          <InfoRow icon="💼" label="Rol" value={usuarioData.rol} />
          <InfoRow icon="📧" label="Correo" value={profile?.email || "—"} />
          <InfoRow icon="📅" label="Nacimiento" value={profile?.fechaNacimiento || "—"} />
          <InfoRow icon="📱" label="Teléfono" value={profile?.telefono || "—"} />
          <InfoRow icon="📍" label="Dirección" value={profile?.direccion || "—"} />

          {profile?.camionInfo && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                Información laboral
              </Text>

              <InfoRow
                icon="🚛"
                label="Camión"
                value={profile.camionInfo.licensePlate || "—"}
              />

              {profile.camionInfo.brand && (
                <InfoRow
                  icon="🏷️"
                  label="Marca / Modelo"
                  value={`${profile.camionInfo.brand} ${profile.camionInfo.model || ""}`}
                />
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.btn, styles.btnRed]}
            onPress={handleLogout}
          >
            <Text style={styles.btnText}>🚪 Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF2F6" },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#666", fontWeight: "600" },

  header: {
    backgroundColor: "#43A047",
    paddingBottom: 70,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
  },

  title: { color: "#fff", fontWeight: "700", marginBottom: 18 },
  imageContainer: { position: "relative", marginTop: 10 },
  perfilImage: { borderWidth: 4, borderColor: "#fff", elevation: 10 },

  rolBadgeContainer: { position: "absolute", bottom: -8, right: -8 },
  rolBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 4,
  },
  rolBadgeIcon: { fontSize: 14, marginRight: 4 },
  rolBadgeText: { fontWeight: "800", fontSize: 12 },

  name: { color: "#fff", fontWeight: "700", marginTop: 18 },
  cargo: { color: "#E8F5E9", marginTop: 4, fontWeight: "600" },

  content: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -45,
    borderRadius: 22,
    padding: 22,
    elevation: 10,
  },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },

  btn: { paddingVertical: 15, borderRadius: 14, alignItems: "center", marginTop: 14 },
  btnRed: { backgroundColor: "#E53935" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

export default PerfilScreen;
