import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { config } from "../config";
const API_URL = config.api.API_URL;

const api = axios.create({
baseURL: import.meta.env.VITE_API_BASE_URL || `${API_URL}`,  withCredentials: true,
});

const AuthContext = createContext();

// ===================== Funciones de localStorage (más confiable) =====================
const saveToStorage = (userData, userType) => {
  try {
    localStorage.setItem("authToken", JSON.stringify(userData));
    if (userType) localStorage.setItem("userType", String(userType));
  } catch (error) {
    console.error("Error guardando en localStorage:", error);
  }
};

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem("authToken");
    if (raw) {
      const userData = JSON.parse(raw);
      return userData;
    }
    return null;
  } catch {
    return null;
  }
};

const clearStorage = () => {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    console.log("✅ Storage limpiado correctamente");
  } catch (error) {
    console.error("Error limpiando storage:", error);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // ===================== Login =====================
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/login", { email, password });
      if (data?.user) {
        // ✅ Guardar en storage para persistencia
        saveToStorage(data.user, data.userType || data.user.userType);
        setUser(data.user);
        setIsLoggedIn(true);
        toast.success("Inicio de sesión exitoso.");
        return { success: true, data };
      }
      toast.error("No se pudo iniciar sesión.");
      return { success: false };
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error(error.response.data.message || "Demasiados intentos fallidos");
        return { 
          success: false, 
          blocked: true, 
          timeRemaining: error.response.data.timeRemaining 
        };
      }
      if (error.response?.data?.attemptsRemaining !== undefined) {
        toast.error(error.response.data.message);
        return { 
          success: false, 
          attemptsRemaining: error.response.data.attemptsRemaining 
        };
      }
      toast.error("Credenciales inválidas.");
      return { success: false };
    }
  };

  // ===================== Logout =====================
  const logOut = async () => {
    try {
      console.log("🚪 Iniciando logout...");
      
      // 1. Llamar al backend para limpiar cookies httpOnly
      const response = await api.post("/logout", {}, {
        validateStatus: (status) => status < 500 // No fallar en 4xx
      });
      
      console.log("✅ Logout del servidor exitoso:", response.data);
      
    } catch (error) {
      console.log("⚠️ Error en logout del servidor:", error.message);
      // Continuar con limpieza local aunque falle el servidor
    } finally {
      // 2. Limpiar estado local inmediatamente
      setUser(null);
      setIsLoggedIn(false);
      clearStorage();
      
      // 3. Verificar que las cookies se eliminaron
      setTimeout(() => {
        console.log("🔍 Verificando cookies después del logout...");
        
        // Si estás en desarrollo, puedes hacer una verificación adicional
        if (process.env.NODE_ENV === "development") {
          // Intentar hacer una petición autenticada para verificar que el logout funcionó
          api.get("/login/check-auth", { timeout: 3000 })
            .then((res) => {
              if (res.data?.user) {
                console.warn("⚠️ Usuario aún autenticado después del logout");
              } else {
                console.log("✅ Logout verificado - no hay sesión activa");
              }
            })
            .catch(() => {
              console.log("✅ Logout verificado - token inválido");
            });
        }
      }, 500);
      
      toast.success("Sesión cerrada.");
    }
  };

  // ===================== Check Auth (Mejorado) =====================
  const checkAuth = async () => {
    setLoading(true);
    
    try {
      const { data } = await api.get("/login/check-auth", { 
        timeout: 10000,
        validateStatus: (status) => status < 500 // No lanzar error en 401
      });
      
      if (data?.user) {
        // ✅ Sesión válida - actualizar estado
        saveToStorage(data.user, data.user.userType);
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        // ❌ No hay sesión válida - limpiar silenciosamente
        const savedUser = loadFromStorage();
        if (savedUser) {
          console.log("🔄 Usando datos guardados localmente");
          setUser(savedUser);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    } catch (error) {
      console.log("🔍 checkAuth: Verificando storage local...");
      // Si falla la verificación, intentar cargar desde storage
      const savedUser = loadFromStorage();
      if (savedUser) {
        console.log("📱 Usando sesión guardada localmente");
        setUser(savedUser);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // ===================== Sync manual =====================
  const syncWithServer = async () => {
    try {
      const { data } = await api.get("/login/check-auth", { 
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      if (data?.user) {
        saveToStorage(data.user, data.user.userType);
        setUser(data.user);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch { 
      return false; 
    }
  };

  // ===================== Interceptor 401 (Mejorado) =====================
  useEffect(() => {
    const id = api.interceptors.response.use(
      (r) => r,
      (err) => {
        if (err?.response?.status === 401) {
          const url = err.config?.url;
          
          // No limpiar si es verificación inicial
          if (url?.includes('/check-auth')) {
            console.log("🔄 401 en verificación inicial - ignorando");
            return Promise.reject(err);
          }
          
          console.log("🚫 401 en acción autenticada - limpiando");
          clearStorage();
          setUser(null);
          setIsLoggedIn(false);
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, []);

  // ===================== Efectos =====================
  useEffect(() => { 
    checkAuth(); 
  }, []);
  
  useEffect(() => {
    const onVis = () => { 
      if (!document.hidden && isLoggedIn) {
        syncWithServer();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider value={{
      user, 
      login, 
      logOut, 
      isLoggedIn, 
      loading,
      setUser, 
      setIsLoggedIn, 
      syncWithServer, 
      checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);