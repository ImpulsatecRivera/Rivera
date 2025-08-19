import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../Context/authContext';

import InicioScreen from '../screens/InicioScreen';
import ViajesScreen from '../screens/ViajesScreen';
import PerfilScreen from '../screens/PerfilScreen';
import InfoViajeScreen from '../screens/InfoViajeScreen';
import InicioSesionScreen from '../screens/InicioSesionScreen';

// 🆕 IMPORTAR TU PANTALLA DE CARGA AQUÍ
import PremiumLoadingScreen from '../screens/splashScreens'; // O CreativeTruckLoading

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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Navegador de pestañas principal
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Inicio':
              iconName = 'home';
              break;
            case 'Viajes':
              iconName = 'local-shipping';
              break;
            case 'Perfil':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: 5,
          height: 60,
          elevation: 8,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
      initialRouteName="Inicio"
    >
      <Tab.Screen 
        name="Inicio" 
        component={InicioScreen}
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen 
        name="Viajes" 
        component={ViajesScreen}
        options={{
          tabBarLabel: 'Viajes',
          tabBarBadge: null,
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

// Componente principal del navegador
const AppNavigator = () => {
  const { isAuthenticated, hasCompletedOnboarding, isLoading } = useAuth();
  
  // 🆕 ESTADO PARA CONTROLAR LA PANTALLA DE CARGA INICIAL
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  
  console.log('🔄 AppNavigator render:', { 
    isAuthenticated, 
    hasCompletedOnboarding, 
    isLoading,
    showInitialLoading
  });

  // 🆕 EFECTO PARA OCULTAR LA PANTALLA DE CARGA DESPUÉS DE UN TIEMPO
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoading(false);
    }, 3000); // 3 segundos - ajusta según necesites

    return () => clearTimeout(timer);
  }, []);

  // 🆕 MOSTRAR PANTALLA DE CARGA INICIAL PRIMERO
  if (showInitialLoading) {
    console.log('🚚 Mostrando pantalla de carga inicial...');
    return (
      <PremiumLoadingScreen 
        message="Carga patita"
        subtitle="Iniciando tu experiencia..."
      />
    );
  }
  
  // Mostrar loading del contexto si está cargando
  if (isLoading) {
    console.log('⏳ Mostrando loading del contexto...');
    return (
      <PremiumLoadingScreen 
        message="Carga patita"
        subtitle="Verificando sesión..."
      />
    );
  }
  
  // 1️⃣ SI NO ESTÁ AUTENTICADO: Mostrar pantallas de login
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

  // 2️⃣ SI ESTÁ AUTENTICADO PERO NO HA COMPLETADO ONBOARDING: Mostrar pantallas de carga
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

  // 3️⃣ SI ESTÁ AUTENTICADO Y HA COMPLETADO ONBOARDING: Mostrar app principal
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