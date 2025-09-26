// src/navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { Text } from 'react-native'; // 👈 Agrega esta línea
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../Context/authContext';

import InicioScreen from '../screens/InicioScreen';
import ViajesScreen from '../screens/ViajesScreen';
import PerfilScreen from '../screens/PerfilScreen';
import InfoViajeScreen from '../screens/InfoViajeScreen';
import InicioSesionScreen from '../screens/InicioSesionScreen';

// IMPORTAR PANTALLAS DE CARGA
import PremiumLoadingScreen from '../screens/splashScreens'; // Pantalla inicial
import SplashScreen2 from '../screens/SplashScreen2'; // 🆕 Tu nueva pantalla después del login

// Pantallas de recuperación
import elegirMetodoRecuperacionScreen from '../screens/elegirMetodoRecuperacionScreen';
import RecuperacionTelefonoScreen from '../screens/RecuperacionTelefonoScreens';
import RecuperacionScreen from '../screens/RecuperacionScreen';
import Recuperacion2Scereen from '../screens/Recuepracion2Screen';
import Recuperacion3 from '../screens/Recuperacion3';
import Recuperacion4 from '../screens/Recuperacion4';
import Recuperacion5 from '../screens/Recuperacion5';

// Pantallas de onboarding
import OnboardingScreen1 from '../screens/pantallacarga1';
import OnboardingScreen2 from '../screens/pantallacarga2';
import OnboardingScreen3 from '../screens/pantallacarga3';

// ✨ NUEVO: importar EditProfileScreen (único import añadido)
import EditProfileScreen from '../screens/EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Navegador de pestañas principal mejorado
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          switch (route.name) {
            case 'Inicio':
              return focused
                ? <Text style={{ fontSize: 28 }}>🏠</Text>
                : <Text style={{ fontSize: 24 }}>🏠</Text>;
            case 'Viajes':
              return focused
                ? <Text style={{ fontSize: 28 }}>🚚</Text>
                : <Text style={{ fontSize: 24 }}>🚚</Text>;
            case 'Perfil':
              return focused
                ? <Text style={{ fontSize: 28 }}>👤</Text>
                : <Text style={{ fontSize: 24 }}>👤</Text>;
            default:
              return <Text style={{ fontSize: 24 }}>❓</Text>;
          }
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#9E9E9E',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          paddingBottom: 20,
          paddingTop: 12,
          height: 85,
          elevation: 25,
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          shadowColor: '#000000',
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          position: 'absolute',
          bottom: 15,
          left: 10,
          right: 10,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.05)',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0.3,
          marginTop: 4,
          textShadowColor: 'rgba(0,0,0,0.1)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          borderRadius: 12,
          marginHorizontal: 8,
          backgroundColor: 'transparent',
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarAllowFontScaling: false,
        tabBarAccessibilityLabel: route.name,
      })}
      initialRouteName="Inicio"
    >
      <Tab.Screen 
        name="Inicio" 
        component={InicioScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarAccessibilityLabel: 'Pantalla de inicio',
        }}
      />
      <Tab.Screen 
        name="Viajes" 
        component={ViajesScreen}
        options={{
          tabBarLabel: 'Viajes',
          tabBarAccessibilityLabel: 'Historial de viajes',
          tabBarBadge: null,
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil de usuario',
        }}
      />
    </Tab.Navigator>
  );
};

// Componente principal del navegador
const AppNavigator = () => {
  const { isAuthenticated, hasCompletedOnboarding, isLoading, showPostLoginSplash, setShowPostLoginSplash } = useAuth();
  
  // ESTADO PARA CONTROLAR LA PANTALLA DE CARGA INICIAL
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  
  console.log('🔄 AppNavigator render:', { 
    isAuthenticated, 
    hasCompletedOnboarding, 
    isLoading,
    showInitialLoading,
    showPostLoginSplash
  });

  // EFECTO PARA OCULTAR LA PANTALLA DE CARGA INICIAL
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoading(false);
    }, 3000); // 3 segundos

    return () => clearTimeout(timer);
  }, []);

  // 1️⃣ MOSTRAR PANTALLA DE CARGA INICIAL PRIMERO
  if (showInitialLoading) {
    console.log('🚚 Mostrando pantalla de carga inicial...');
    return (
      <PremiumLoadingScreen 
        message="Carga patita"
        subtitle="Iniciando tu experiencia..."
      />
    );
  }
  
  // 2️⃣ MOSTRAR LOADING DEL CONTEXTO SI ESTÁ CARGANDO
  if (isLoading) {
    console.log('⏳ Mostrando loading del contexto...');
    return (
      <PremiumLoadingScreen 
        message="Carga patita"
        subtitle="Verificando sesión..."
      />
    );
  }
  
  // 3️⃣ SI NO ESTÁ AUTENTICADO: Mostrar pantallas de login
  if (!isAuthenticated) {
    console.log('🔐 Mostrando navegador de autenticación');
    return (
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' }
        }}
        initialRouteName="InicioSesion"
      >
        <Stack.Screen 
          name="InicioSesion" 
          component={InicioSesionScreen}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
        
        <Stack.Screen 
          name="elegirMetodoRecuperacion" 
          component={elegirMetodoRecuperacionScreen}
          options={{
            presentation: 'card',
            gestureEnabled: true,
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        />
        
        <Stack.Screen name="Recuperacion" component={RecuperacionScreen} options={{ presentation: 'card', gestureEnabled: true }} />
        <Stack.Screen name="RecuperacionTelefono" component={RecuperacionTelefonoScreen} options={{ presentation: 'card', gestureEnabled: true }} />
        <Stack.Screen name="Recuperacion2" component={Recuperacion2Scereen} options={{ presentation: 'card', gestureEnabled: true }} />
        <Stack.Screen name="Recuperacion3" component={Recuperacion3} options={{ presentation: 'card', gestureEnabled: true }} />
        <Stack.Screen name="Recuperacion4" component={Recuperacion4} options={{ presentation: 'card', gestureEnabled: true }} />
        <Stack.Screen name="Recuperacion5" component={Recuperacion5} options={{ presentation: 'card', gestureEnabled: true }} />
      </Stack.Navigator>
    );
  }

  // 4️⃣ 🆕 SI ESTÁ AUTENTICADO Y DEBE MOSTRAR SPLASH POST-LOGIN
  if (isAuthenticated && showPostLoginSplash) {
    console.log('✨ Mostrando SplashScreen2 después del login...');
    return (
      <SplashScreen2 
        onAnimationFinish={() => {
          console.log('✅ SplashScreen2 terminado, ocultando...');
          setShowPostLoginSplash(false);
        }}
      />
    );
  }

  // 5️⃣ SI ESTÁ AUTENTICADO PERO NO HA COMPLETADO ONBOARDING: Mostrar pantallas de carga
  if (isAuthenticated && !hasCompletedOnboarding) {
    console.log('🎬 Mostrando navegador de onboarding (pantallas de carga)');
    return (
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' }
        }}
        initialRouteName="Onboarding1"
      >
        <Stack.Screen 
          name="Onboarding1" 
          component={OnboardingScreen1}
          options={{
            presentation: 'card',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Onboarding2" 
          component={OnboardingScreen2}
          options={{
            presentation: 'card',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="Onboarding3" 
          component={OnboardingScreen3}
          options={{
            presentation: 'card',
            gestureEnabled: true,
          }}
        />
      </Stack.Navigator>
    );
  }

  // 6️⃣ SI ESTÁ AUTENTICADO Y HA COMPLETADO ONBOARDING: Mostrar app principal
  console.log('🏠 Mostrando navegador principal (TabNavigator con InicioScreen)');
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' }
      }}
      initialRouteName="Main"
    >
      <Stack.Screen 
        name="Main" 
        component={TabNavigator}
        options={{
          gestureEnabled: false,
        }}
      />

      {/* ✨ NUEVO: EditarPerfil (única ruta añadida) */}
      <Stack.Screen
        name="EditarPerfil"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: 'Editar perfil',
          presentation: 'card',
        }}
      />

      <Stack.Screen 
        name="InfoViaje" 
        component={InfoViajeScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          cardStyle: { backgroundColor: 'rgba(0,0,0,0.5)' },
          cardStyleInterpolator: ({ current: { progress } }) => {
            return {
              cardStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 0.5, 0.9, 1],
                  outputRange: [0, 0.25, 0.7, 1],
                }),
              },
              overlayStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                  extrapolate: 'clamp',
                }),
              },
            };
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
