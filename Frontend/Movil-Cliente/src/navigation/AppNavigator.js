import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistorialScreen from '../screens/HistorialScreen';
import CotizacionScreen from '../screens/CotizacionScreen';
import QuoteDetailsScreen from '../screens/quoteDetailScreen'; // Nueva pantalla
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen'; 
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegistrarseCliente from "../screens/RegistrarseCliente";
import RegistrarseCliente2 from "../screens/RegistrarseCliente2";
import CustomTabBar from '../components/CustomTabBar';

// Pantallas de recuperación de contraseña
import InicioRecuperar from "../screens/InicioRecuperarScren"; // inicio de recuperación
import SeleccionarMetodoRecuperacionScreen from '../screens/SeleccionarMetodoRecuperacionScreen';
import RecuperacionScreen from "../screens/RecuperacionScreen"; // Recuperación por email
import Recuperacion2Screen from "../screens/Recuepracion2Screen"; // Segundo paso 
import Recuperacion3 from "../screens/Recuperacion3"; // Nueva contraseña
import RecuperacionTelefono from "../screens/RecuperacionTelefonoScreens"; // Recuperación por teléfono

// Pantallas de carga/onboarding
import pantallacarga1 from "../screens/pantallacarga1";
import pantallacarga2 from "../screens/pantallacarga2";
import pantallacarga3 from "../screens/pantallacarga3";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegador de pestañas principal
const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
    initialRouteName="Dashboard"
  >
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Inicio' }} />
    <Tab.Screen name="Historial" component={HistorialScreen} options={{ tabBarLabel: 'Historial' }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Splash" 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' }
      }}
    >
      {/* ===== PANTALLA INICIAL ===== */}
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen}
        options={{
          gestureEnabled: false,
        }}
      />

      {/* ===== PANTALLAS DE AUTENTICACIÓN ===== */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          gestureEnabled: false,
          animationTypeForReplace: 'push',
        }}
      />

      {/* ===== FLUJO DE RECUPERACIÓN DE CONTRASEÑA ===== */}
      {/* 1. Pantalla inicial "Olvidé mi contraseña" */}
      <Stack.Screen 
        name="InicioRecuperar" 
        component={InicioRecuperar}
        options={{
          headerShown: true,
          title: 'Recuperar Contraseña',
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* 2. Seleccionar método de recuperación (Email o Teléfono) */}
      <Stack.Screen 
        name="seleccionarMetodoRecuperacion" 
        component={SeleccionarMetodoRecuperacionScreen}
        options={{
          headerShown: true,
          title: 'Método de Recuperación',
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
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

      {/* === FLUJO POR EMAIL === */}
      {/* 3a. Recuperación por Email - Paso 1 */}
      <Stack.Screen 
        name="Recuperacion" 
        component={RecuperacionScreen}
        options={{
          headerShown: true,
          title: 'Verificar Email',
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* === FLUJO POR TELÉFONO === */}
      {/* 3b. Recuperación por Teléfono - Paso 1 */}
      <Stack.Screen 
        name="RecuperacionTelefono" 
        component={RecuperacionTelefono}
        options={{
          headerShown: true,
          title: 'Verificar Teléfono',
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* === PASOS COMUNES PARA AMBOS MÉTODOS === */}
      {/* 4. Código de verificación (Email o SMS) */}
      <Stack.Screen 
        name="Recuperacion2Screen" 
        component={Recuperacion2Screen}
        options={{
          headerShown: true,
          title: 'Código de Verificación',
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* 5. Nueva contraseña */}
      <Stack.Screen 
        name="Recuperacion3" 
        component={Recuperacion3}
        options={{
          headerShown: true,
          title: 'Nueva Contraseña',
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* ===== PANTALLAS DE REGISTRO ===== */}
      <Stack.Screen 
        name="RegistrarseCliente" 
        component={RegistrarseCliente}
        options={{
          headerShown: true,
          title: 'Registro - Paso 1',
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      <Stack.Screen 
        name="RegistrarseCliente2" 
        component={RegistrarseCliente2}
        options={{
          headerShown: true,
          title: 'Registro - Paso 2',
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* ===== PANTALLAS DE CARGA (después del registro) ===== */}
      <Stack.Screen 
        name="pantallacarga1" 
        component={pantallacarga1}
        options={{
          gestureEnabled: false, // No permitir regresar durante la carga
          presentation: 'card',
        }}
      />

      <Stack.Screen 
        name="pantallacarga2" 
        component={pantallacarga2}
        options={{
          gestureEnabled: true,
          presentation: 'card',
        }}
      />

      <Stack.Screen 
        name="pantallacarga3" 
        component={pantallacarga3}
        options={{
          gestureEnabled: true,
          presentation: 'card',
        }}
      />

      {/* ===== PANTALLAS PRINCIPALES DE LA APP ===== */}
      <Stack.Screen 
        name="Main" 
        component={TabNavigator}
        options={{
          gestureEnabled: false,
        }}
      />

      <Stack.Screen 
        name="Cotizacion" 
        component={CotizacionScreen}
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* ===== NUEVA PANTALLA DE DETALLES DE COTIZACIÓN ===== */}
      <Stack.Screen 
        name="QuoteDetails" 
        component={QuoteDetailsScreen}
        options={{
          presentation: 'card',
          gestureEnabled: true,
          headerShown: false, // La pantalla maneja su propio header
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

      <Stack.Screen 
        name="PaymentSuccessScreen" 
        component={PaymentSuccessScreen}
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