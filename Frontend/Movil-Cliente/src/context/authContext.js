// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// 🧠 Contexto
const AuthContext = createContext();

// ⏰ Configuración de expiración (20 minutos)
const SESSION_TIMEOUT = 20 * 60 * 1000;

// 🔤 Utilidades - ✅ ACTUALIZADO PARA GOOGLE OAUTH
const norm = (v) => (v ?? '').toString().trim().toLowerCase();
const ALLOWED_USER_TYPES = new Set(['cliente', 'client', 'customer']); // ✅ Más flexible

// 🧩 Provider
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(null);

  useEffect(() => {
    checkAuthStatus();

    return () => {
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔍 Verificar si hay una sesión guardada
  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Verificando sesión de cliente guardada...');

      const [
        token,
        loginTime,
        onboardingCompleted,
        userData,
        savedUserType,
        clientId,
      ] = await AsyncStorage.multiGet([
        'clientToken',
        'clientLoginTime',
        'onboardingCompleted',
        'clientData',
        'clientUserType',
        'clientId',
      ]).then((pairs) => pairs.map(([, v]) => v));

      if (token && loginTime) {
        const currentTime = Date.now();
        const timeSinceLogin = currentTime - parseInt(loginTime, 10);
        console.log(`⏰ Tiempo desde login: ${Math.round(timeSinceLogin / 60000)} min`);

        if (timeSinceLogin < SESSION_TIMEOUT) {
          const remainingTime = SESSION_TIMEOUT - timeSinceLogin;

          // ✅ VALIDACIÓN ACTUALIZADA PARA GOOGLE OAUTH
          const normalizedType = norm(savedUserType);
          if (!ALLOWED_USER_TYPES.has(normalizedType)) {
            console.log('🚫 Usuario no permitido - cerrando sesión', { savedUserType });
            await clearAuthData();
            setIsLoading(false);
            return;
          }

          // ✅ VERIFICAR TOKEN CON EL BACKEND
          const isValidToken = await verifyTokenWithBackend(token);
          if (!isValidToken) {
            console.log('❌ Token inválido - cerrando sesión');
            await clearAuthData();
            setIsLoading(false);
            return;
          }

          // Restaurar estado
          setIsAuthenticated(true);
          setHasCompletedOnboarding(onboardingCompleted === 'true');
          setUser(userData ? JSON.parse(userData) : null);
          setUserType('Cliente'); // forzamos etiqueta estándar en memoria
          console.log(`✅ Sesión válida. Expira en: ${Math.round(remainingTime / 60000)} min`);
          console.log(`📋 Cliente ID guardado: ${clientId}`);

          // Programar auto-logout
          startSessionTimer(remainingTime);
        } else {
          console.log('❌ Sesión expirada - limpiando datos');
          await clearAuthData();
          Alert.alert(
            '⏰ Sesión Expirada',
            'Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente.',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.log('📭 No hay sesión de cliente guardada');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error verificando sesión:', error);
      await clearAuthData();
      setIsLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Verificar token con el backend
  const verifyTokenWithBackend = async (token) => {
    try {
      const response = await fetch('https://rivera-test-629395560179.us-west1.run.app/api/login/checkAuth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Para cookies si las usas
      });

      const data = await response.json();
      
      if (response.ok && data.user) {
        // ✅ Actualizar datos del usuario si han cambiado
        const currentUser = JSON.parse(await AsyncStorage.getItem('clientData') || '{}');
        if (JSON.stringify(currentUser) !== JSON.stringify(data.user)) {
          await AsyncStorage.setItem('clientData', JSON.stringify(data.user));
          setUser(data.user);
          console.log('🔄 Datos de usuario actualizados desde el servidor');
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error verificando token con backend:', error);
      return false;
    }
  };

  // ⏲️ Iniciar timer de sesión
  const startSessionTimer = (timeoutDuration = SESSION_TIMEOUT) => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }

    const timer = setTimeout(async () => {
      console.log('⏰ Sesión de cliente expirada automáticamente');
      await autoLogout();
    }, timeoutDuration);

    setSessionTimer(timer);
    console.log(`⏰ Timer de cliente iniciado: ${Math.round(timeoutDuration / 60000)} min`);
  };

  // 🚪 Auto-logout por expiración
  const autoLogout = async () => {
    try {
      console.log('🔒 Cerrando sesión automáticamente por expiración');
      await clearAuthData();
      Alert.alert(
        '⏰ Sesión Expirada',
        'Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Error en auto-logout:', error);
    }
  };

  // 🧹 Limpiar todos los datos de autenticación
  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove([
        'clientToken',
        'clientLoginTime',
        'onboardingCompleted',
        'clientData',
        'clientUserType',
        'clientId',
        'authToken', // compatibilidad
        'googleUserData', // ✅ NUEVO: datos específicos de Google
      ]);

      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      setUserType(null);
      setUser(null);

      if (sessionTimer) {
        clearTimeout(sessionTimer);
        setSessionTimer(null);
      }

      console.log('🧹 Datos de cliente limpiados');
    } catch (error) {
      console.error('❌ Error limpiando datos:', error);
    }
  };

  // ✅ LOGIN ACTUALIZADO PARA GOOGLE OAUTH
  const login = async (loginData) => {
    try {
      console.log('🔐 Procesando login de cliente:', loginData);

      // ✅ VALIDACIÓN MEJORADA PARA GOOGLE OAUTH
      const incomingUserType = loginData?.userType || loginData?.user?.userType || 'Cliente';
      const normalizedType = norm(incomingUserType);
      
      if (!ALLOWED_USER_TYPES.has(normalizedType)) {
        return {
          success: false,
          error: `Acceso denegado. Esta app es solo para clientes. Tu tipo: ${incomingUserType}`,
        };
      }

      // Exigir token real
      if (!loginData?.token) {
        return { success: false, error: 'No se recibió token del backend' };
      }

      const currentTime = Date.now();
      const userId = loginData?.user?._id || loginData?.user?.id;
      if (!userId) {
        throw new Error('ID de cliente no disponible');
      }

      // ✅ ALMACENAR DATOS ESPECÍFICOS DE GOOGLE OAUTH
      const storageData = [
        ['clientToken', loginData.token],
        ['authToken', loginData.token], // compatibilidad
        ['clientLoginTime', String(currentTime)],
        ['clientData', JSON.stringify(loginData.user)],
        ['clientUserType', 'Cliente'], // estándar interno
        ['clientId', String(userId)],
      ];

      // ✅ MANEJO ESPECIAL PARA USUARIOS DE GOOGLE
      if (loginData.user?.isGoogleUser) {
        console.log('🔍 Usuario de Google detectado');
        
        // Guardar datos específicos de Google
        storageData.push(['googleUserData', JSON.stringify({
          isGoogleUser: true,
          profileCompleted: loginData.user.profileCompleted || false,
          needsProfileCompletion: loginData.user.needsProfileCompletion || false,
        })]);

        // ✅ ONBOARDING BASADO EN SI EL PERFIL ESTÁ COMPLETO
        const profileCompleted = loginData.user.profileCompleted !== false;
        storageData.push(['onboardingCompleted', String(profileCompleted)]);
        setHasCompletedOnboarding(profileCompleted);
        
        console.log(`📋 Perfil de Google ${profileCompleted ? 'completo' : 'incompleto'}`);
      } else {
        // Usuario regular
        storageData.push(['onboardingCompleted', 'true']);
        setHasCompletedOnboarding(true);
      }

      await AsyncStorage.multiSet(storageData);

      setUser(loginData.user);
      setUserType('Cliente');
      setIsAuthenticated(true);
      startSessionTimer();

      console.log('✅ Login de cliente completado y guardado');
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error?.message ?? String(error) };
    }
  };

  // 📝 Registro (usuarios nuevos - solo clientes)
  const register = async (registrationData) => {
    try {
      console.log('📝 Registrando nuevo cliente:', registrationData);

      const incomingType = norm(registrationData?.userType ?? 'cliente');
      if (!ALLOWED_USER_TYPES.has(incomingType)) {
        return { success: false, error: 'Solo se pueden registrar clientes en esta aplicación' };
      }

      const currentTime = Date.now();
      const userId = registrationData?.user?._id || registrationData?.user?.id;
      const realToken = registrationData?.token;

      if (!userId) throw new Error('ID de cliente no disponible');
      if (!realToken) throw new Error('No se recibió token del backend');

      await AsyncStorage.multiSet([
        ['clientToken', realToken],
        ['authToken', realToken],
        ['clientLoginTime', String(currentTime)],
        ['clientData', JSON.stringify(registrationData.user)],
        ['clientUserType', 'Cliente'],
        ['clientId', String(userId)],
        ['onboardingCompleted', 'false'], // ⇦ si quieres saltar onboarding cámbialo a 'true'
      ]);

      setUser(registrationData.user);
      setUserType('Cliente');
      setIsAuthenticated(true);
      setHasCompletedOnboarding(false); // ⇦ o true si saltas onboarding
      startSessionTimer();

      console.log('📊 Registro de cliente completado');
      return { success: true };
    } catch (error) {
      console.error('❌ Register error:', error);
      return { success: false, error: error?.message ?? String(error) };
    }
  };

  // ✅ NUEVA FUNCIÓN: Completar perfil de Google
  const completeGoogleProfile = async (profileData) => {
    try {
      console.log('📝 Completando perfil de Google...');
      
      if (!user?.isGoogleUser) {
        return { success: false, error: 'Esta función es solo para usuarios de Google' };
      }

      const response = await fetch('https://rivera-test-629395560179.us-west1.run.app/api/login/complete-profile', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('clientToken')}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar datos locales
        const updatedUser = { ...user, ...data.user, profileCompleted: true };
        await AsyncStorage.multiSet([
          ['clientData', JSON.stringify(updatedUser)],
          ['onboardingCompleted', 'true'],
          ['googleUserData', JSON.stringify({
            isGoogleUser: true,
            profileCompleted: true,
            needsProfileCompletion: false,
          })],
        ]);

        setUser(updatedUser);
        setHasCompletedOnboarding(true);
        
        console.log('✅ Perfil de Google completado');
        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: data.message || 'Error completando perfil' };
      }
    } catch (error) {
      console.error('❌ Error completando perfil de Google:', error);
      return { success: false, error: error.message };
    }
  };

  // 🎉 Completar onboarding
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      setHasCompletedOnboarding(true);
      console.log('🎉 Onboarding de cliente completado');
      return { success: true };
    } catch (error) {
      console.error('❌ Complete onboarding error:', error);
      return { success: false, error: error?.message ?? String(error) };
    }
  };

  // 🚪 Logout manual
  const logout = async () => {
    try {
      console.log('👋 Logout manual de cliente');
      await clearAuthData();
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error: error?.message ?? String(error) };
    }
  };

  // 🔄 Renovar sesión (extender tiempo)
  const refreshSession = async () => {
    try {
      const currentTime = Date.now();
      await AsyncStorage.setItem('clientLoginTime', String(currentTime));
      startSessionTimer(); // reiniciar timer
      console.log('🔄 Sesión de cliente renovada por 20 minutos más');
      return { success: true };
    } catch (error) {
      console.error('❌ Error renovando sesión:', error);
      return { success: false, error: error?.message ?? String(error) };
    }
  };

  // ⏰ Obtener tiempo restante de sesión (minutos)
  const getRemainingTime = async () => {
    try {
      const loginTime = await AsyncStorage.getItem('clientLoginTime');
      if (loginTime) {
        const currentTime = Date.now();
        const timeSinceLogin = currentTime - parseInt(loginTime, 10);
        const remainingTime = Math.max(0, SESSION_TIMEOUT - timeSinceLogin);
        return Math.round(remainingTime / 60000);
      }
      return 0;
    } catch (error) {
      console.error('❌ Error obteniendo tiempo restante:', error);
      return 0;
    }
  };

  // ✅ NUEVA FUNCIÓN: Verificar si necesita completar perfil de Google
  const needsGoogleProfileCompletion = () => {
    return user?.isGoogleUser && user?.profileCompleted === false;
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
    refreshSession,
    getRemainingTime,
    completeGoogleProfile, // ✅ NUEVO
    needsGoogleProfileCompletion, // ✅ NUEVO
    verifyTokenWithBackend, // ✅ NUEVO
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 🔗 Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;