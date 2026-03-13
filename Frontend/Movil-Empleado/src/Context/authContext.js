// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from "react";






import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

// ⏰ CONFIGURACIÓN DE EXPIRACIÓN
const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutos

// Llaves centralizadas para evitar typos
const STORAGE_KEYS = {
  userToken: "userToken",
  authToken: "authToken",
  token: "token", // compat con otros hooks
  loginTime: "loginTime",
  onboardingCompleted: "onboardingCompleted",
  userData: "userData",
  userType: "userType",
  motoristaId: "motoristaId",
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);




  // 🆕 SPLASH posterior al login
  const [showPostLoginSplash, setShowPostLoginSplash] = useState(false);

  // ✅ Exponer token e id para otros hooks
  const [token, setToken] = useState(null);
  const [motoristaId, setMotoristaId] = useState(null);

  // ✅ Timer con useRef para evitar re-renders
  const sessionTimerRef = useRef(null);

  useEffect(() => {
    checkAuthStatus();
    return () => {
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeParse = (str, fallback = null) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch (error) {
      console.error("❌ Error parseando JSON:", error);
      return fallback;
    }
  };

  // 🔍 VERIFICAR SI HAY UNA SESIÓN GUARDADA
  const checkAuthStatus = async () => {
    try {
      console.log("🔍 Verificando sesión guardada...");

      const [
        tokenStr,
        loginTimeStr,
        onboardingCompletedStr,
        userDataStr,
        savedUserType,
        storedMotoristaId,
      ] = await AsyncStorage.multiGet([
        STORAGE_KEYS.userToken,
        STORAGE_KEYS.loginTime,
        STORAGE_KEYS.onboardingCompleted,
        STORAGE_KEYS.userData,
        STORAGE_KEYS.userType,
        STORAGE_KEYS.motoristaId,
      ]).then((pairs) => pairs.map(([, v]) => v));

      if (tokenStr && loginTimeStr) {
        const currentTime = Date.now();
        const timeSinceLogin = currentTime - parseInt(loginTimeStr, 10);

        console.log(`⏰ Tiempo desde login: ${Math.round(timeSinceLogin / 1000 / 60)} minutos`);

        if (timeSinceLogin < SESSION_TIMEOUT) {
          const remainingTime = SESSION_TIMEOUT - timeSinceLogin;
          console.log(
            `✅ Sesión válida. Expira en: ${Math.round(remainingTime / 1000 / 60)} minutos`
          );
          console.log(`📋 Motorista ID guardado: ${storedMotoristaId}`);


          setIsAuthenticated(true);
          setHasCompletedOnboarding(onboardingCompletedStr === "true");
          setUser(safeParse(userDataStr, null));
          setUserType(savedUserType);

          // ✅ token e id en estado
          setToken(tokenStr);
          setMotoristaId(storedMotoristaId || null);

          // 🆕 No mostrar splash post-login en restauración
          setShowPostLoginSplash(false);

          startSessionTimer(remainingTime);
        } else {
          console.log("❌ Sesión expirada - limpiando datos");
          await clearAuthData();
        }
      } else {
        console.log("📭 No hay sesión guardada");
      }
    } catch (error) {
      console.error("❌ Error verificando sesión:", error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  // ⏲️ INICIAR TIMER DE SESIÓN
  const startSessionTimer = (timeoutDuration = SESSION_TIMEOUT) => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    sessionTimerRef.current = setTimeout(async () => {
      console.log("⏰ Sesión expirada automáticamente - cerrando sesión");
      await autoLogout();
    }, timeoutDuration);
    console.log(`⏰ Timer de sesión iniciado: ${Math.round(timeoutDuration / 1000 / 60)} minutos`);
  };

  // 🚪 AUTO-LOGOUT
  const autoLogout = async () => {
    try {
      console.log("🔒 Cerrando sesión automáticamente por expiración");
      await clearAuthData();
    } catch (error) {
      console.error("❌ Error en auto-logout:", error);
    }
  };

  // 🗑️ LIMPIAR TODOS LOS DATOS DE AUTENTICACIÓN
  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.userToken,
        STORAGE_KEYS.authToken,
        STORAGE_KEYS.token, // ✅ limpiar compat
        STORAGE_KEYS.loginTime,
        STORAGE_KEYS.onboardingCompleted,
        STORAGE_KEYS.userData,
        STORAGE_KEYS.userType,
        STORAGE_KEYS.motoristaId,
      ]);

      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      setUserType(null);
      setUser(null);

      // ✅ limpiar estado in-memory
      setToken(null);
      setMotoristaId(null);

      // 🆕 reset splash
      setShowPostLoginSplash(false);

      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    } catch (error) {
      console.error("❌ Error limpiando datos:", error);
    }
  };

  // 🔐 LOGIN
  const login = async (loginData) => {
    try {
      console.log("🔐 Procesando login exitoso:", loginData);

      const currentTime = Date.now();
      const userId = loginData.user._id || loginData.user.id;
      if (!userId) throw new Error("ID de usuario no disponible");

      const tokenValue = loginData.token || "temp-token";

      // 💾 Guardar todo (incluye 'token' para compat)
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.userToken, tokenValue],
        [STORAGE_KEYS.authToken, tokenValue],
        [STORAGE_KEYS.token, tokenValue],
        [STORAGE_KEYS.loginTime, currentTime.toString()],
        [STORAGE_KEYS.userData, JSON.stringify(loginData.user)],
        [STORAGE_KEYS.userType, loginData.userType],
        [STORAGE_KEYS.motoristaId, userId.toString()],
        [STORAGE_KEYS.onboardingCompleted, "true"],
      ]);

      // 📱 Estado
      setUser(loginData.user);
      setUserType(loginData.userType);
      setIsAuthenticated(true);
      setHasCompletedOnboarding(true);

      setToken(tokenValue);
      setMotoristaId(userId.toString());

      setShowPostLoginSplash(true);
      startSessionTimer();

      console.log("✅ Login completado y guardado");
      console.log("📋 Motorista ID guardado:", userId);
      console.log("📊 Sesión expirará en 20 minutos");
      console.log("🎬 SplashScreen2 activado");

      return { success: true };
    } catch (error) {
      console.error("❌ Login error:", error);
      return { success: false, error };
    }
  };

  // 📝 REGISTRO
  const register = async (userData) => {
    try {
      console.log("✅ Registro exitoso - activando pantallas de carga");

      const currentTime = Date.now();
      const userId = userData._id || userData.id;
      if (!userId) throw new Error("ID de usuario no disponible");

      // Usamos token temporal (tu fetch lo ignora por la RegExp ^temp...)
      const tempToken = "temp-register-token";

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.userToken, tempToken],
        [STORAGE_KEYS.authToken, tempToken], // mejor que vacío, para consistencia
        [STORAGE_KEYS.token, tempToken],
        [STORAGE_KEYS.loginTime, currentTime.toString()],
        [STORAGE_KEYS.userData, JSON.stringify(userData)],
        [STORAGE_KEYS.userType, "Motorista"],
        [STORAGE_KEYS.motoristaId, userId.toString()],
        [STORAGE_KEYS.onboardingCompleted, "false"],
      ]);

      setUser(userData);
      setUserType("Motorista");


      setIsAuthenticated(true);
      setHasCompletedOnboarding(false);

      setToken(tempToken);
      setMotoristaId(userId.toString());

      setShowPostLoginSplash(false);
      startSessionTimer();

      console.log("📊 Registro completado - mostrando onboarding");
      console.log("📋 Motorista ID guardado:", userId);

      return { success: true };
    } catch (error) {
      console.error("❌ Register error:", error);
      return { success: false, error };
    }
  };

  // 🎉 COMPLETAR ONBOARDING
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true");
      setHasCompletedOnboarding(true);
      console.log("🎉 Onboarding completado");
      return { success: true };
    } catch (error) {
      console.error("❌ Complete onboarding error:", error);
      return { success: false, error };
    }
  };

  // 🚪 LOGOUT MANUAL
  const logout = async () => {
    try {
      console.log("👋 Logout manual - limpiando sesión");
      await clearAuthData();
      return { success: true };
    } catch (error) {
      console.error("❌ Logout error:", error);
      return { success: false, error };
    }
  };

  // 🔄 RENOVAR SESIÓN
  const refreshSession = async () => {
    try {
      const currentTime = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.loginTime, currentTime.toString());
      startSessionTimer(); // Reiniciar timer
      console.log("🔄 Sesión renovada por 20 minutos más");
    } catch (error) {
      console.error("❌ Error renovando sesión:", error);
    }
  };

  const value = {
    isAuthenticated,
    hasCompletedOnboarding,
    isLoading,
    userType,
    user,

    showPostLoginSplash,
    setShowPostLoginSplash,

    token,
    motoristaId,

    login,
    register,
    completeOnboarding,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};

