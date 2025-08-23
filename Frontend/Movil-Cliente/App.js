import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/authContext'; // Ajusta la ruta según tu estructura
import AppNavigator from './src/navigation/AppNavigator'; // Ajusta la ruta según tu estructura

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;