// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/Context/authContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  console.log('🚀 App iniciando...');
  
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}