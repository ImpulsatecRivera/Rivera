// src/screens/PerfilScreen.js
import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
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
      fetchProfile();
    }, [fetchProfile])
  );

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: logout },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#43A047" />
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
            refreshing={loading}
            onRefresh={fetchProfile}
            colors={["#43A047"]}
            tintColor="#43A047"
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
  container: {
    flex: 1,
    backgroundColor: "#EEF2F6",
  },

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
  },

  header: {
    backgroundColor: "#43A047",
    paddingBottom: 60,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  title: {
    fontWeight: "700",
    color: "#fff",
    marginBottom: 18,
    letterSpacing: 0.4,
  },

  perfilImage: {
    borderWidth: 4,
    borderColor: "#fff",
    marginTop: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  name: {
    fontWeight: "700",
    color: "#fff",
    marginTop: 14,
    textAlign: "center",
    letterSpacing: 0.3,
  },

  cargo: {
    color: "#E8F5E9",
    marginTop: 4,
    fontWeight: "500",
  },

  content: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -45,
    borderRadius: 22,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#263238",
    marginBottom: 20,
  },

  btn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    flexDirection: "row",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },

  btnGreen: {
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
  },

  btnBlue: {
    backgroundColor: "#1E88E5",
    shadowColor: "#1E88E5",
  },

  btnRed: {
    backgroundColor: "#E53935",
    shadowColor: "#E53935",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});

export default PerfilScreen;
