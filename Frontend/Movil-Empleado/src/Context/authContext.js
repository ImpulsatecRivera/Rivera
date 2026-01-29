// src/context/AuthContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

// ⏰ CONFIGURACIÓN DE EXPIRACIÓN
const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutos

// 🔑 Llaves centralizadas
const STORAGE_KEYS = {
  token: "token",
  loginTime: "loginTime",
  onboardingCompleted: "onboardingCompleted",
  userData: "userData",
  userType: "userType", // ← aquí se guarda el CARGO
  userId: "userId",
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // Motorista | Auxiliar
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  const [showPostLoginSplash, setShowPostLoginSplash] = useState(false);

  const sessionTimerRef = useRef(null);

  useEffect(() => {
    checkAuthStatus();
    return () => {
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    };
  }, []);

  const safeParse = (str, fallback = null) => {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  };

  // 🔍 RESTAURAR SESIÓN
  const checkAuthStatus = async () => {
    try {
      const [
        tokenStr,
        loginTimeStr,
        onboardingStr,
        userDataStr,
        storedUserType,
        storedUserId,
      ] = await AsyncStorage.multiGet([
        STORAGE_KEYS.token,
        STORAGE_KEYS.loginTime,
        STORAGE_KEYS.onboardingCompleted,
        STORAGE_KEYS.userData,
        STORAGE_KEYS.userType,
        STORAGE_KEYS.userId,
      ]).then((pairs) => pairs.map(([, v]) => v));

      if (tokenStr && loginTimeStr) {
        const now = Date.now();
        const diff = now - parseInt(loginTimeStr, 10);

        if (diff < SESSION_TIMEOUT) {
          setIsAuthenticated(true);
          setHasCompletedOnboarding(onboardingStr === "true");
          setUser(safeParse(userDataStr));
          setUserType(storedUserType);
          setUserId(storedUserId);
          setToken(tokenStr);

          setShowPostLoginSplash(false);
          startSessionTimer(SESSION_TIMEOUT - diff);
        } else {
          await clearAuthData();
        }
      }
    } catch (e) {
      console.error("❌ Error restaurando sesión:", e);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  // ⏲️ TIMER
  const startSessionTimer = (duration = SESSION_TIMEOUT) => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    sessionTimerRef.current = setTimeout(autoLogout, duration);
  };

  // 🚪 AUTO LOGOUT
  const autoLogout = async () => {
    console.log("⏰ Sesión expirada");
    await clearAuthData();
  };

  // 🗑️ LIMPIAR TODO
  const clearAuthData = async () => {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));

    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    setUser(null);
    setUserType(null);
    setUserId(null);
    setToken(null);
    setShowPostLoginSplash(false);

    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  };

  // 🔐 LOGIN (🔥 AQUÍ ESTABA EL PROBLEMA)
  const login = async (loginData) => {
  try {
    const currentTime = Date.now();

    const user = loginData.user;
    const tokenValue = loginData.token;

    const id = user?.id || user?._id;

    if (!id) {
      throw new Error("ID de usuario no disponible");
    }

    // 👉 El cargo se guarda, pero NO bloquea
    const cargo = user?.cargo || null;

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.token, tokenValue],
      [STORAGE_KEYS.loginTime, currentTime.toString()],
      [STORAGE_KEYS.userData, JSON.stringify(user)],
      [STORAGE_KEYS.userType, cargo ?? ""],
      [STORAGE_KEYS.userId, id.toString()],
      [STORAGE_KEYS.onboardingCompleted, "true"],
    ]);

    setUser(user);
    setUserType(cargo);
    setUserId(id.toString());
    setToken(tokenValue);
    setIsAuthenticated(true);
    setHasCompletedOnboarding(true);

    setShowPostLoginSplash(true);
    startSessionTimer();

    console.log("✅ LOGIN OK");
    console.log("👤 Cargo:", cargo);

    return { success: true };
  } catch (error) {
    console.error("❌ Login error:", error);
    return { success: false, error };
  }
};


  // 📝 REGISTER (NO FORZAMOS MOTORISTA)
  const register = async (userData) => {
    try {
      const currentTime = Date.now();
      const id = userData?.id || userData?._id;
      const cargo = userData?.cargo || null;

      if (!id || !cargo) {
        throw new Error("Registro inválido");
      }

      const tempToken = "temp-register-token";

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.token, tempToken],
        [STORAGE_KEYS.loginTime, currentTime.toString()],
        [STORAGE_KEYS.userData, JSON.stringify(userData)],
        [STORAGE_KEYS.userType, cargo],
        [STORAGE_KEYS.userId, id.toString()],
        [STORAGE_KEYS.onboardingCompleted, "false"],
      ]);

      setUser(userData);
      setUserType(cargo);
      setUserId(id.toString());
      setToken(tempToken);
      setIsAuthenticated(true);
      setHasCompletedOnboarding(false);

      startSessionTimer();

      return { success: true };
    } catch (error) {
      console.error("❌ Register error:", error);
      return { success: false, error };
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true");
    setHasCompletedOnboarding(true);
  };

  const logout = async () => {
    await clearAuthData();
  };

  const refreshSession = async () => {
    const now = Date.now();
    await AsyncStorage.setItem(STORAGE_KEYS.loginTime, now.toString());
    startSessionTimer();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        hasCompletedOnboarding,
        isLoading,
        user,
        userType,
        userId,
        token,
        showPostLoginSplash,
        setShowPostLoginSplash,
        login,
        register,
        completeOnboarding,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fuera de AuthProvider");
  return ctx;
};

export default AuthContext;
