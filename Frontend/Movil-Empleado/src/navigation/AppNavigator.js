// Frontend/Movil-Empleado/src/navigation/AppNavigator.js
import React, { useState, useEffect, useMemo } from "react";
import { Text, Platform, useWindowDimensions } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../Context/authContext";

import InicioScreen from "../screens/InicioScreen";
import ViajesScreen from "../screens/ViajesScreen";
import PerfilScreen from "../screens/PerfilScreen";
import InfoViajeScreen from "../screens/InfoViajeScreen";
import InicioSesionScreen from "../screens/InicioSesionScreen";

import CamionProfileScreen from "../screens/CamionProfileScreen";

import PremiumLoadingScreen from "../screens/splashScreens";
import SplashScreen2 from "../screens/SplashScreen2";

import elegirMetodoRecuperacionScreen from "../screens/elegirMetodoRecuperacionScreen";
import RecuperacionTelefonoScreen from "../screens/RecuperacionTelefonoScreens";
import RecuperacionScreen from "../screens/RecuperacionScreen";
import Recuperacion2Scereen from "../screens/Recuepracion2Screen";
import Recuperacion3 from "../screens/Recuperacion3";
import Recuperacion4 from "../screens/Recuperacion4";
import Recuperacion5 from "../screens/Recuperacion5";

import OnboardingScreen1 from "../screens/pantallacarga1";
import OnboardingScreen2 from "../screens/pantallacarga2";
import OnboardingScreen3 from "../screens/pantallacarga3";

import EditProfileScreen from "../screens/EditProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/* =========================
   ICONOS - FUNCIÓN SIMPLE
========================= */
const getIconForRoute = (routeName) => {
  const icons = {
    "Inicio": "🏠",
    "Viajes": "🚚",
    "Camion": "🚛",
    "Perfil": "👤"
  };
  return icons[routeName] || "❓";
};

/* =========================
   Tab Navigator - SIMPLIFICADO Y ROBUSTO
========================= */
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // ✅ Calcular escala de forma segura
  const scale = useMemo(() => {
    if (!width || width <= 0) return 1;
    if (width <= 340) return 0.9;
    if (width <= 380) return 0.95;
    if (width >= 430) return 1.05;
    return 1;
  }, [width]);

  // ✅ Calcular dimensiones del tab bar
  const tabBarDimensions = useMemo(() => {
    const safeBottom = Math.max(insets.bottom || 0, 0);
    const iconSize = Math.round(24 * scale);
    const iconFocusedSize = Math.round(28 * scale);
    const labelSize = Math.max(10, Math.round(12 * scale));
    
    const paddingTop = Math.round(10 * scale);
    const paddingBottom = Platform.OS === "android" 
      ? Math.round(8 * scale)
      : Math.max(safeBottom, Math.round(8 * scale));
    
    const baseHeight = Math.round(62 * scale);
    const totalHeight = baseHeight + paddingBottom;

    return {
      iconSize,
      iconFocusedSize,
      labelSize,
      paddingTop,
      paddingBottom,
      totalHeight,
    };
  }, [scale, insets.bottom]);

  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        
        // ✅ ICON RENDERER - Simple y seguro
        tabBarIcon: ({ focused }) => {
          const size = focused 
            ? tabBarDimensions.iconFocusedSize 
            : tabBarDimensions.iconSize;
          const emoji = getIconForRoute(route.name);
          
          return (
            <Text style={{ 
              fontSize: size, 
              lineHeight: size + 2 
            }}>
              {emoji}
            </Text>
          );
        },

        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#9E9E9E",

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          paddingTop: tabBarDimensions.paddingTop,
          paddingBottom: tabBarDimensions.paddingBottom,
          height: tabBarDimensions.totalHeight,
          
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
          fontSize: tabBarDimensions.labelSize,
          fontWeight: "700",
          letterSpacing: 0.3,
          marginTop: 4,
        },

        tabBarItemStyle: {
          paddingVertical: Math.max(4, Math.round(6 * scale)),
          borderRadius: 12,
          marginHorizontal: Math.max(4, Math.round(6 * scale)),
          backgroundColor: "transparent",
        },

        tabBarAllowFontScaling: false,
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen name="Viajes" component={ViajesScreen} />
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
   App Navigator
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

  // ✅ LOADING INICIAL
  if (showInitialLoading) {
    return (
      <PremiumLoadingScreen
        message="Carga patita"
        subtitle="Iniciando tu experiencia..."
      />
    );
  }

  // ✅ LOADING DE AUTENTICACIÓN
  if (isLoading) {
    return (
      <PremiumLoadingScreen
        message="Carga patita"
        subtitle="Verificando sesión..."
      />
    );
  }

  // ✅ NO AUTENTICADO
  if (!isAuthenticated) {
    return (
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false, 
          cardStyle: { backgroundColor: "#fff" } 
        }}
      >
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

  // ✅ SPLASH POST-LOGIN
  if (isAuthenticated && showPostLoginSplash) {
    return <SplashScreen2 onAnimationFinish={() => setShowPostLoginSplash(false)} />;
  }

  // ✅ ONBOARDING
  if (isAuthenticated && !hasCompletedOnboarding) {
    return (
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false, 
          cardStyle: { backgroundColor: "#fff" } 
        }}
      >
        <Stack.Screen name="Onboarding1" component={OnboardingScreen1} />
        <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
        <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />
      </Stack.Navigator>
    );
  }

  // ✅ APP PRINCIPAL
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false, 
        cardStyle: { backgroundColor: "#fff" } 
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="EditarPerfil"
        component={EditProfileScreen}
        options={{ 
          headerShown: true, 
          title: "Editar perfil", 
          presentation: "card" 
        }}
      />
      <Stack.Screen
        name="InfoViaje"
        component={InfoViajeScreen}
        options={{ 
          presentation: "modal", 
          gestureEnabled: true 
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;