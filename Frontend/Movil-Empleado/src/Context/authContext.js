// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const AuthContext = createContext();

// Provider del contexto
export const AuthProvider = ({ children }) => {
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
      
      console.log('🔍 Verificando estado inicial...');
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      setIsLoading(false);
      console.log('📊 Estado inicial: isAuthenticated=false, hasCompletedOnboarding=false');
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
      
      console.log('🔐 Login exitoso');
      setIsAuthenticated(true);
      // Para usuarios existentes que hacen login, asumimos onboarding completado
      setHasCompletedOnboarding(true);
      console.log('📊 Estado después del login: isAuthenticated=true, hasCompletedOnboarding=true');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      // Simular llamada a API
      console.log('✅ Registro exitoso - activando pantallas de carga');
      console.log('👤 Datos del usuario:', userData);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 🔥 CRÍTICO: Cambiar estados para activar onboarding
      setIsAuthenticated(true);
      setHasCompletedOnboarding(false);
      
      console.log('📊 Estado después del registro: isAuthenticated=true, hasCompletedOnboarding=false');
      console.log('🎯 Esto debería mostrar las pantallas de carga...');
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error };
    }
  };

  const completeOnboarding = async () => {
    try {
      // await AsyncStorage.setItem('onboardingCompleted', 'true');
      console.log('🎉 Completando onboarding - dirigiendo a InicioScreen');
      setHasCompletedOnboarding(true);
      console.log('📊 Estado final: isAuthenticated=true, hasCompletedOnboarding=true');
      console.log('🏠 Esto debería mostrar InicioScreen...');
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
      console.log('👋 Logout - volviendo al login');
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
  };

  const value = {
    isAuthenticated,
    hasCompletedOnboarding,
    isLoading,
    login,
    register,
    completeOnboarding,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;