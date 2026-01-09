// src/screens/PerfilScreen.js
import React, { useCallback } from "react";
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

const PerfilScreen = ({ navigation }) => {
  const { profile, loading, logout, fetchProfile } = useProfile();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // ✅ Evita crash si esta pantalla NO está dentro del BottomTabNavigator
  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch {
    tabBarHeight = 0;
  }

  const isSmallScreen = width < 375;
  const isLargeScreen = width > 414;

  useFocusEffect(
    useCallback(() => {
      fetchProfile?.();
    }, [fetchProfile])
  );

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

  // ✅ espacio para que el tab bar flotante no tape botones
  const bottomSpace = Math.max(insets.bottom || 0, 12) + tabBarHeight + 16;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ bottom: bottomSpace }}
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
        {/* Header Verde */}
        <View style={[styles.header, { paddingTop: headerTop }]}>
          <Text
            style={[
              styles.title,
              { fontSize: isSmallScreen ? 18 : isLargeScreen ? 22 : 20 },
            ]}
          >
            Perfil de motorista
          </Text>

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
            resizeMode="cover"
          />

          <Text
            style={[
              styles.name,
              { fontSize: isSmallScreen ? 16 : isLargeScreen ? 20 : 18 },
            ]}
          >
            {profile?.nombre || profile?.name || "—"}
          </Text>

          <Text style={[styles.cargo, { fontSize: isSmallScreen ? 12 : 14 }]}>
            {profile?.cargo || "Motorista"}
          </Text>
        </View>

        {/* Información Personal */}
        <View
          style={[
            styles.content,
            {
              borderTopLeftRadius: isLargeScreen ? 25 : 20,
              borderTopRightRadius: isLargeScreen ? 25 : 20,
              marginTop: isSmallScreen ? -15 : -20,
              padding: isSmallScreen ? 15 : 20,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { fontSize: isSmallScreen ? 16 : 18 },
            ]}
          >
            Información personal
          </Text>

          <InfoRow label="Email" value={profile?.email || "—"} />
          <InfoRow
            label="Fecha de nacimiento"
            value={profile?.fechaNacimiento || "—"}
          />
          <InfoRow label="Teléfono" value={profile?.telefono || "—"} />
          <InfoRow label="Dirección" value={profile?.direccion || "—"} />

          {/* Botón Editar perfil */}
          <TouchableOpacity
            style={[styles.btn, styles.btnGreen]}
            onPress={() => navigation.navigate("EditarPerfil")}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Editar perfil</Text>
          </TouchableOpacity>

          {/* Botón refrescar */}
          <TouchableOpacity
            style={[styles.btn, styles.btnBlue]}
            onPress={fetchProfile}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Actualizar datos</Text>
            )}
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={[styles.btn, styles.btnRed]}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centerContent: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },

  header: {
    backgroundColor: "#4CAF50",
    paddingBottom: 26,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: { fontWeight: "bold", color: "#fff", marginBottom: 16 },

  perfilImage: { borderWidth: 3, borderColor: "#fff" },
  name: {
    fontWeight: "bold",
    color: "#fff",
    marginTop: 12,
    textAlign: "center",
  },
  cargo: { color: "#fff", opacity: 0.9, textAlign: "center" },

  content: { backgroundColor: "#fff", flex: 1 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 18,
  },

  btn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  btnGreen: { backgroundColor: "#4CAF50", shadowColor: "#4CAF50" },
  btnBlue: { backgroundColor: "#2196F3", shadowColor: "#2196F3" },
  btnRed: { backgroundColor: "#F44336", shadowColor: "#F44336" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default PerfilScreen;
