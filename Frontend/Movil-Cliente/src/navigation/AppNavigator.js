import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistorialScreen from '../screens/HistorialScreen';
import CotizacionScreen from '../screens/CotizacionScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen'; 
import CustomTabBar from '../components/CustomTabBar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="Dashboard"
    >
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="Historial"
        component={HistorialScreen}
        options={{ tabBarLabel: 'Historial' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{ headerShown: false }}
    >
      {/* Tabs principales */}
      <Stack.Screen name="Main" component={TabNavigator} />

      {/* Flujo de cotizaciones */}
      <Stack.Screen name="Cotizacion" component={CotizacionScreen} />

      {/* Pantalla de éxito: registrada con ambos nombres */}
      <Stack.Screen
        name="PaymentSuccessScreen"
        component={PaymentSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PagoExitoso" // alias opcional
        component={PaymentSuccessScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
