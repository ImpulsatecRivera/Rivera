// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Crear el contexto
const AuthContext = createContext();

// ⏰ CONFIGURACIÓN DE EXPIRACIÓN
const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutos en milisegundos

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(null);

  useEffect(() => {
    checkAuthStatus();
    
    // Cleanup del timer cuando se desmonta el componente
    return () => {
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
  }, []);

  // 🔍 VERIFICAR SI HAY UNA SESIÓN GUARDADA
  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Verificando sesión guardada...');
      
      const token = await AsyncStorage.getItem('userToken');
      const loginTime = await AsyncStorage.getItem('loginTime');
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      const userData = await AsyncStorage.getItem('userData');
      const savedUserType = await AsyncStorage.getItem('userType');
      const motoristaId = await AsyncStorage.getItem('motoristaId'); // ✅ Verificar ID

      if (token && loginTime) {
        const currentTime = Date.now();
        const timeSinceLogin = currentTime - parseInt(loginTime);
        
        console.log(`⏰ Tiempo desde login: ${Math.round(timeSinceLogin / 1000 / 60)} minutos`);
        
        // ✅ SI EL TOKEN NO HA EXPIRADO
        if (timeSinceLogin < SESSION_TIMEOUT) {
          const remainingTime = SESSION_TIMEOUT - timeSinceLogin;
          console.log(`✅ Sesión válida. Expira en: ${Math.round(remainingTime / 1000 / 60)} minutos`);
          console.log(`📋 Motorista ID guardado: ${motoristaId}`);
          
          // Restaurar estado
          setIsAuthenticated(true);
          setHasCompletedOnboarding(onboardingCompleted === 'true');
          setUser(userData ? JSON.parse(userData) : null);
          setUserType(savedUserType);
          
          // Programar auto-logout
          startSessionTimer(remainingTime);
        } else {
          // ❌ TOKEN EXPIRADO
          console.log('❌ Sesión expirada - limpiando datos');
          await clearAuthData();
        }
      } else {
        console.log('📭 No hay sesión guardada');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error verificando sesión:', error);
      await clearAuthData();
      setIsLoading(false);
    }
  };

  // ⏲️ INICIAR TIMER DE SESIÓN
  const startSessionTimer = (timeoutDuration = SESSION_TIMEOUT) => {
    // Limpiar timer anterior si existe
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }

    const timer = setTimeout(async () => {
      console.log('⏰ Sesión expirada automáticamente - cerrando sesión');
      await autoLogout();
    }, timeoutDuration);

    setSessionTimer(timer);
    console.log(`⏰ Timer de sesión iniciado: ${Math.round(timeoutDuration / 1000 / 60)} minutos`);
  };

  // 🚪 AUTO-LOGOUT POR EXPIRACIÓN
  const autoLogout = async () => {
    try {
      console.log('🔒 Cerrando sesión automáticamente por expiración');
      await clearAuthData();
      
      // Aquí podrías mostrar una alerta al usuario
      // Alert.alert(
      //   'Sesión Expirada', 
      //   'Tu sesión ha expirado por seguridad. Por favor inicia sesión nuevamente.'
      // );
    } catch (error) {
      console.error('❌ Error en auto-logout:', error);
    }
  };

  // 🗑️ LIMPIAR TODOS LOS DATOS DE AUTENTICACIÓN
  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove([
        'userToken',
        'loginTime', 
        'onboardingCompleted',
        'userData',
        'userType',
        'motoristaId', // ✅ Limpiar también el ID
        'authToken'    // ✅ Limpiar token adicional
      ]);
      
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      setUserType(null);
      setUser(null);
      
      if (sessionTimer) {
        clearTimeout(sessionTimer);
        setSessionTimer(null);
      }
    } catch (error) {
      console.error('❌ Error limpiando datos:', error);
    }
  };

  // 🔐 LOGIN CON PERSISTENCIA
  const login = async (loginData) => {
    try {
      console.log('🔐 Procesando login exitoso:', loginData);
      
      const currentTime = Date.now();
      const userId = loginData.user._id || loginData.user.id;
      
      if (!userId) {
        console.error('❌ No se encontró ID del usuario en loginData');
        throw new Error('ID de usuario no disponible');
      }
      
      // 💾 GUARDAR EN ASYNCSTORAGE
      await AsyncStorage.multiSet([
        ['userToken', loginData.token || 'temp-token'],
        ['authToken', loginData.token || ''], // ✅ Para compatibilidad
        ['loginTime', currentTime.toString()],
        ['userData', JSON.stringify(loginData.user)],
        ['userType', loginData.userType],
        ['motoristaId', userId.toString()], // ✅ CRÍTICO: Guardar ID para useProfile
        ['onboardingCompleted', 'true'] // Los motoristas que hacen login ya pasaron onboarding
      ]);
      
      // 📱 ACTUALIZAR ESTADO
      setUser(loginData.user);
      setUserType(loginData.userType);
      setIsAuthenticated(true);
      setHasCompletedOnboarding(true); // Motoristas existentes no necesitan onboarding
      
      // ⏰ INICIAR TIMER DE EXPIRACIÓN
      startSessionTimer();
      
      console.log('✅ Login completado y guardado');
      console.log('📋 Motorista ID guardado:', userId);
      console.log('📊 Sesión expirará en 20 minutos');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error };
    }
  };

  // 📝 REGISTRO (USUARIOS NUEVOS)
  const register = async (userData) => {
    try {
      console.log('✅ Registro exitoso - activando pantallas de carga');
      
      const currentTime = Date.now();
      const userId = userData._id || userData.id;
      
      if (!userId) {
        console.error('❌ No se encontró ID del usuario en userData');
        throw new Error('ID de usuario no disponible');
      }
      
      // 💾 GUARDAR EN ASYNCSTORAGE
      await AsyncStorage.multiSet([
        ['userToken', 'temp-register-token'],
        ['authToken', ''], // ✅ Para compatibilidad
        ['loginTime', currentTime.toString()],
        ['userData', JSON.stringify(userData)],
        ['userType', 'Motorista'],
        ['motoristaId', userId.toString()], // ✅ CRÍTICO: Guardar ID para useProfile
        ['onboardingCompleted', 'false'] // Usuarios nuevos SÍ necesitan onboarding
      ]);
      
      // 📱 ACTUALIZAR ESTADO
      setUser(userData);
      setUserType('Motorista');
      setIsAuthenticated(true);
      setHasCompletedOnboarding(false); // ❌ Mostrar onboarding para nuevos usuarios
      
      // ⏰ INICIAR TIMER DE EXPIRACIÓN
      startSessionTimer();
      
      console.log('📊 Registro completado - mostrando onboarding');
      console.log('📋 Motorista ID guardado:', userId);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Register error:', error);
      return { success: false, error };
    }
  };

  // 🎉 COMPLETAR ONBOARDING
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      setHasCompletedOnboarding(true);
      console.log('🎉 Onboarding completado');
      return { success: true };
    } catch (error) {
      console.error('❌ Complete onboarding error:', error);
      return { success: false, error };
    }
  };

  // 🚪 LOGOUT MANUAL
  const logout = async () => {
    try {
      console.log('👋 Logout manual - limpiando sesión');
      await clearAuthData();
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error };
    }
  };

  // 🔄 RENOVAR SESIÓN (opcional - para extender tiempo)
  const refreshSession = async () => {
    try {
      const currentTime = Date.now();
      await AsyncStorage.setItem('loginTime', currentTime.toString());
      startSessionTimer(); // Reiniciar timer
      console.log('🔄 Sesión renovada por 20 minutos más');
    } catch (error) {
      console.error('❌ Error renovando sesión:', error);
    }
  };

  const value = {
    isAuthenticated,
    hasCompletedOnboarding,
    isLoading,
    userType,
    user,
    login,
    register,
    completeOnboarding,
    logout,
    refreshSession, // Por si quieres renovar la sesión
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