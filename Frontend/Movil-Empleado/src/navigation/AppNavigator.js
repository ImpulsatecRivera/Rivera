// src/navigation/AppNavigator.js
import React, { useState, useEffect, useMemo } from "react";
import { Text, Platform, useWindowDimensions } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../Context/authContext";

import InicioScreen from "../screens/InicioScreen";
import ViajesScreen from "../screens/ViajesScreen";
import PerfilScreen from "../screens/PerfilScreen";
import InfoViajeScreen from "../screens/InfoViajeScreen";
import InicioSesionScreen from "../screens/InicioSesionScreen";

// ✅ NUEVA PANTALLA (apartado del menú)
import CamionProfileScreen from "../screens/CamionProfileScreen";

// Splash / loading
import PremiumLoadingScreen from "../screens/splashScreens";
import SplashScreen2 from "../screens/SplashScreen2";

// Recuperación
import elegirMetodoRecuperacionScreen from "../screens/elegirMetodoRecuperacionScreen";
import RecuperacionTelefonoScreen from "../screens/RecuperacionTelefonoScreens";
import RecuperacionScreen from "../screens/RecuperacionScreen";
import Recuperacion2Scereen from "../screens/Recuepracion2Screen";
import Recuperacion3 from "../screens/Recuperacion3";
import Recuperacion4 from "../screens/Recuperacion4";
import Recuperacion5 from "../screens/Recuperacion5";

// Onboarding
import OnboardingScreen1 from "../screens/pantallacarga1";
import OnboardingScreen2 from "../screens/pantallacarga2";
import OnboardingScreen3 from "../screens/pantallacarga3";

// Edit profile
import EditProfileScreen from "../screens/EditProfileScreen";

const nTab = createBottomTabNavigator();
const Stack = createStackNavigator();

/* =========================
   Tab Navigator RESPONSIVE CORREGIDO
========================= */
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const scale = useMemo(() => {
    if (width <= 340) return 0.9;
    if (width <= 380) return 0.95;
    if (width >= 430) return 1.05;
    return 1;
  }, [width]);

  const metrics = useMemo(() => {
    const paddingTop = Math.round(10 * scale);

    const paddingBottom =
      Platform.OS === "android"
        ? Math.round(8 * scale)
        : Math.max(insets.bottom || 0, Math.round(8 * scale));

    const baseHeight = Math.round(62 * scale);
    const height = baseHeight + paddingBottom;

    const icon = Math.round(24 * scale);
    const iconFocused = Math.round(28 * scale);
    const labelSize = Math.max(10, Math.round(12 * scale));

    const itemMarginX = Math.max(4, Math.round(6 * scale));
    const itemPaddingY = Math.max(4, Math.round(6 * scale));

    return {
      paddingTop,
      paddingBottom,
      height,
      icon,
      iconFocused,
      labelSize,
      itemMarginX,
      itemPaddingY,
    };
  }, [scale, insets.bottom]);

  const iconForRoute = (routeName) => {
    switch (routeName) {
      case "Inicio":
        return "🏠";
      case "Viajes":
        return "🚚";
      case "Camion":
        return "🚛";
      case "Perfil":
        return "👤";
      default:
        return "❓";
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      safeAreaInsets={{ bottom: 0 }}
      sceneContainerStyle={{ backgroundColor: "#f8f9fa" }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarIcon: ({ focused }) => {
          const size = focused ? metrics.iconFocused : metrics.icon;
          const glyph = iconForRoute(route.name);
          return <Text style={{ fontSize: size, lineHeight: size + 2 }}>{glyph}</Text>;
        },

        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#9E9E9E",

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,

          paddingTop: metrics.paddingTop,
          paddingBottom: metrics.paddingBottom,
          height: metrics.height,

          elevation: 25,
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          shadowColor: "#000000",

          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,

          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.05)",

          overflow: Platform.OS === "android" ? "hidden" : "visible",
        },

        tabBarLabelStyle: {
          fontSize: metrics.labelSize,
          fontWeight: "700",
          letterSpacing: 0.3,
          marginTop: 4,
        },

        tabBarItemStyle: {
          paddingVertical: metrics.itemPaddingY,
          borderRadius: 12,
          marginHorizontal: metrics.itemMarginX,
          backgroundColor: "transparent",
        },

        tabBarAllowFontScaling: false,
        tabBarAccessibilityLabel: route.name,
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen name="Viajes" component={ViajesScreen} />

      {/* ✅ NUEVO APARTADO DEL MENÚ */}
      <Tab.Screen
        name="Camion"
        component={CamionProfileScreen}
        options={{ tabBarLabel: "Camión" }}
      />

      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
};

/* =========================
   App Navigator (auth flow)
========================= */
const AppNavigator = () => {
  const {
    isAuthenticated,
    hasCompletedOnboarding,
    isLoading,
    showPostLoginSplash,
    setShowPostLoginSplash,
  } = useAuth();

  const [showInitialLoading, setShowInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowInitialLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showInitialLoading) {
    return (
      <PremiumLoadingScreen
        message="Carga patita"
        subtitle="Iniciando tu experiencia..."
      />
    );
  }

  if (isLoading) {
    return (
      <PremiumLoadingScreen
        message="Carga patita"
        subtitle="Verificando sesión..."
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: "#fff" } }}>
        <Stack.Screen name="InicioSesion" component={InicioSesionScreen} />

        <Stack.Screen name="elegirMetodoRecuperacion" component={elegirMetodoRecuperacionScreen} />
        <Stack.Screen name="Recuperacion" component={RecuperacionScreen} />
        <Stack.Screen name="RecuperacionTelefono" component={RecuperacionTelefonoScreen} />
        <Stack.Screen name="Recuperacion2" component={Recuperacion2Scereen} />
        <Stack.Screen name="Recuperacion3" component={Recuperacion3} />
        <Stack.Screen name="Recuperacion4" component={Recuperacion4} />
        <Stack.Screen name="Recuperacion5" component={Recuperacion5} />
      </Stack.Navigator>
    );
  }

  if (isAuthenticated && showPostLoginSplash) {
    return <SplashScreen2 onAnimationFinish={() => setShowPostLoginSplash(false)} />;
  }

  if (isAuthenticated && !hasCompletedOnboarding) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: "#fff" } }}>
        <Stack.Screen name="Onboarding1" component={OnboardingScreen1} />
        <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
        <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: "#fff" } }}>
      <Stack.Screen name="Main" component={TabNavigator} />

      <Stack.Screen
        name="EditarPerfil"
        component={EditProfileScreen}
        options={{ headerShown: true, title: "Editar perfil", presentation: "card" }}
      />

      <Stack.Screen
        name="InfoViaje"
        component={InfoViajeScreen}
        options={{ presentation: "modal", gestureEnabled: true }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;