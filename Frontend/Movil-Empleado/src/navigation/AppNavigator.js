import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../Context/authContext'; // 🔥 USAR EL CONTEXTO CORRECTO

import InicioScreen from '../screens/InicioScreen';
import ViajesScreen from '../screens/ViajesScreen';
import PerfilScreen from '../screens/PerfilScreen';
import InfoViajeScreen from '../screens/InfoViajeScreen';
import InicioSesionScreen from '../screens/InicioSesionScreen';

// Pantallas existentes de recuperación
import RecuperacionScreen from '../screens/RecuperacionScreen';
import Recuperacion2Scereen from '../screens/Recuepracion2Screen';
import Recuperacion3 from '../screens/Recuperacion3';
import Recuperacion4 from '../screens/Recuperacion4';
import Recuperacion5 from '../screens/Recuperacion5';

// IMPORTAR LAS 3 PANTALLAS DE ONBOARDING/CARGA
import OnboardingScreen1 from '../screens/pantallacarga1'; // 1/3 - Cotiza Viajes
import OnboardingScreen2 from '../screens/pantallacarga2'; // 2/3 - Elige tu forma de pago
import OnboardingScreen3 from '../screens/pantallacarga3'; // 3/3 - Realiza cotizaciones

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

// Componente principal del navegador - USANDO EL CONTEXTO CORRECTO
const AppNavigator = () => {
  // 🔥 USAR EL CONTEXTO REAL, NO EL LOCAL
  const { isAuthenticated, hasCompletedOnboarding, isLoading } = useAuth();
  
  console.log('🔄 AppNavigator render:', { 
    isAuthenticated, 
    hasCompletedOnboarding, 
    isLoading 
  });
  
  // Mostrar loading si está cargando
  if (isLoading) {
    console.log('⏳ Mostrando loading...');
    return null; // O una pantalla de loading
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
        
        {/* PANTALLAS DE RECUPERACIÓN */}
        <Stack.Screen 
          name="Recuperacion" 
          component={RecuperacionScreen}
          options={{
            presentation: 'card',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="Recuperacion2" 
          component={Recuperacion2Scereen}
          options={{
            presentation: 'card',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="Recuperacion3" 
          component={Recuperacion3}
          options={{
            presentation: 'card',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="Recuperacion4" 
          component={Recuperacion4}
          options={{
            presentation: 'card',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="Recuperacion5" 
          component={Recuperacion5}
          options={{
            presentation: 'card',
            gestureEnabled: true,
          }}
        />
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
            gestureEnabled: false, // No permitir retroceder
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