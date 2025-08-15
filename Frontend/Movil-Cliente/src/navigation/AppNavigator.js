import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistorialScreen from '../screens/HistorialScreen';
import CotizacionScreen from '../screens/CotizacionScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen'; 
import SplashScreen from '../screens/SplashScreen';
import CustomTabBar from '../components/CustomTabBar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

const AppNavigator = () => (
  <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen name="Cotizacion" component={CotizacionScreen} />
    {/* Si usas la pantalla de éxito */}
    <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
