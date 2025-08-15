import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import InicioScreen from '../screens/InicioScreen';
import ViajesScreen from '../screens/ViajesScreen';
import PerfilScreen from '../screens/PerfilScreen';
import InfoViajeScreen from '../screens/InfoViajeScreen';
import InicioSesionScreen from '../screens/InicioSesionScreen';
import RegistrarseScreen from '../screens/RegistrarseScrenn'; // Corregido el typo
import Registrarse2Screen from '../screens/Registrarse2';

// Pantallas existentes de recuperación
import RecuperacionScreen from '../screens/RecuperacionScreen';
import Recuperacion2Scereen from '../screens/Recuepracion2Screen';
import Recuperacion3 from '../screens/Recuperacion3';
import Recuperacion4 from '../screens/Recuperacion4';
import Recuperacion5 from '../screens/Recuperacion5';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

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
          elevation: 8, // Sombra en Android
          shadowOffset: { width: 0, height: -2 }, // Sombra en iOS
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
          tabBarBadge: null, // Puedes agregar badges aquí si necesitas
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

// Stack de autenticación LIMPIO (sin las pantallas problemáticas)
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
        gestureEnabled: true,
        presentation: 'card',
      }}
      initialRouteName="InicioSesion"
    >
      {/* Pantalla principal de inicio de sesión */}
      <AuthStack.Screen 
        name="InicioSesion" 
        component={InicioSesionScreen}
        options={{
          animationTypeForReplace: 'push',
        }}
      />

      {/* Pantallas de registro */}
      <AuthStack.Screen 
        name="Registrarse" 
        component={RegistrarseScreen}
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
      <AuthStack.Screen 
        name="Registrarse2" 
        component={Registrarse2Screen}
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* Pantallas existentes de recuperación */}
      <AuthStack.Screen 
        name="Recuperacion" 
        component={RecuperacionScreen}
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
      <AuthStack.Screen 
        name="Recuperacion2" 
        component={Recuperacion2Scereen}
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
      <AuthStack.Screen 
        name="Recuperacion3" 
        component={Recuperacion3}
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
      <AuthStack.Screen 
        name="Recuperacion4" 
        component={Recuperacion4}
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
      <AuthStack.Screen 
        name="Recuperacion5" 
        component={Recuperacion5}
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
    </AuthStack.Navigator>
  );
};

// Navegador principal de la aplicación
const AppNavigator = ({ isAuthenticated = false }) => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' }
      }}
    >
      {isAuthenticated ? (
        // Usuario autenticado - Mostrar pantallas principales
        <>
          <Stack.Screen 
            name="Main" 
            component={TabNavigator}
            options={{
              animationTypeForReplace: 'push',
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
        </>
      ) : (
        // Usuario no autenticado - Mostrar pantallas de autenticación
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
      )}
    </Stack.Navigator>
  );
};

// Hook personalizado para manejar la autenticación
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Aquí podrías verificar si el usuario ya está autenticado
    // Por ejemplo, verificando AsyncStorage o un token
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Simular verificación de autenticación
      // En una app real, aquí verificarías AsyncStorage o un token
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Lógica de login
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      // Lógica de logout
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};

export default AppNavigator;