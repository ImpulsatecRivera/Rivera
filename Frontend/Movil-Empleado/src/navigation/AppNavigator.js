import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import InicioScreen from '../screens/InicioScreen';
import ViajesScreen from '../screens/ViajesScreen';
import PerfilScreen from '../screens/PerfilScreen';
import InfoViajeScreen from '../screens/InfoViajeScreen';
import InicioSesionScreen from '../screens/InicioSesionScreen';
import RegistrarseScreen from '../screens/RegistrarseScrenn';
import Registrarse2Screen from '../screens/Registrarse2';

// Pantallas existentes de recuperación
import RecuperacionScreen from '../screens/RecuperacionScreen';
import Recuperacion2Scereen from '../screens/Recuepracion2Screen';
import Recuperacion3 from '../screens/Recuperacion3';
import Recuperacion4 from '../screens/Recuperacion4';
import Recuperacion5 from '../screens/Recuperacion5';

// IMPORTAR LAS 3 PANTALLAS DE ONBOARDING/CARGA
import OnboardingScreen1 from '../screens/pantallacarga1'; // 1/3 - Cotiza Viajes
import OnboardingScreen2 from '../screens/pantalla carga2'; // 2/3 - Elige tu forma de pago
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

// FUNCIÓN PARA DETERMINAR LA RUTA INICIAL
const getInitialRouteName = (isAuthenticated, hasCompletedOnboarding) => {
  if (!isAuthenticated) {
    return "InicioSesion";
  }
  
  // Si está autenticado pero NO ha completado onboarding → mostrar pantallas de carga
  if (isAuthenticated && !hasCompletedOnboarding) {
    return "Onboarding1";
  }
  
  // Si está autenticado Y ya completó onboarding → ir directo al dashboard
  return "Main";
};

// Navegador principal de la aplicación - CON ONBOARDING CORREGIDO
const AppNavigator = ({ isAuthenticated = false, hasCompletedOnboarding = false }) => {
  const [currentRoute, setCurrentRoute] = useState(
    getInitialRouteName(isAuthenticated, hasCompletedOnboarding)
  );

  // Efecto para actualizar la ruta cuando cambian los estados de auth
  useEffect(() => {
    const newRoute = getInitialRouteName(isAuthenticated, hasCompletedOnboarding);
    setCurrentRoute(newRoute);
  }, [isAuthenticated, hasCompletedOnboarding]);

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' }
      }}
      initialRouteName={currentRoute}
      // IMPORTANTE: Usar key para forzar re-render cuando cambia la ruta
      key={`${isAuthenticated}-${hasCompletedOnboarding}`}
    >
      {/* PANTALLAS DE AUTENTICACIÓN */}
      <Stack.Screen 
        name="InicioSesion" 
        component={InicioSesionScreen}
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="Registrarse" 
        component={RegistrarseScreen}
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="Registrarse2" 
        component={Registrarse2Screen}
        options={{
          presentation: 'card',
          gestureEnabled: true,
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

      {/* PANTALLAS DE ONBOARDING (Las 3 pantallas de carga) */}
      <Stack.Screen 
        name="Onboarding1" 
        component={OnboardingScreen1}
        options={{
          presentation: 'card',
          gestureEnabled: false, // Evitar que puedan retroceder
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="Onboarding2" 
        component={OnboardingScreen2}
        options={{
          presentation: 'card',
          gestureEnabled: true,
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="Onboarding3" 
        component={OnboardingScreen3}
        options={{
          presentation: 'card',
          gestureEnabled: true,
          animationTypeForReplace: 'push',
        }}
      />

      {/* PANTALLAS PRINCIPALES DE LA APP */}
      <Stack.Screen 
        name="Main" 
        component={TabNavigator}
        options={{
          animationTypeForReplace: 'push',
          gestureEnabled: false, // Evitar que puedan retroceder al onboarding
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

// Hook personalizado para manejar la autenticación y onboarding - CORREGIDO
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Aquí verificarías AsyncStorage para ambos estados
      // const token = await AsyncStorage.getItem('userToken');
      // const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      
      // setIsAuthenticated(!!token);
      // setHasCompletedOnboarding(onboardingCompleted === 'true');
      
      // Por ahora, simulamos que no está autenticado
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Lógica de login aquí
      // const response = await loginAPI(credentials);
      // await AsyncStorage.setItem('userToken', response.token);
      
      setIsAuthenticated(true);
      // Al hacer login, verificamos si ya completó el onboarding antes
      // Si es un usuario existente, probablemente ya lo completó
      // const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      // setHasCompletedOnboarding(onboardingCompleted === 'true');
      
      // Para usuarios que ya tienen cuenta, asumimos onboarding completado
      setHasCompletedOnboarding(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      // Lógica de registro aquí
      // const response = await registerAPI(userData);
      // await AsyncStorage.setItem('userToken', response.token);
      
      setIsAuthenticated(true);
      // IMPORTANTE: Al registrarse, el onboarding NO está completado
      // Esto hará que se muestren las 3 pantallas de carga ANTES del dashboard
      setHasCompletedOnboarding(false);
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error };
    }
  };

  const completeOnboarding = async () => {
    try {
      // await AsyncStorage.setItem('onboardingCompleted', 'true');
      setHasCompletedOnboarding(true);
      return { success: true };
    } catch (error) {
      console.error('Complete onboarding error:', error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      // await AsyncStorage.removeItem('userToken');
      // await AsyncStorage.removeItem('onboardingCompleted');
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
  };

  return {
    isAuthenticated,
    hasCompletedOnboarding,
    isLoading,
    login,
    register,
    completeOnboarding,
    logout,
  };
};

export default AppNavigator;