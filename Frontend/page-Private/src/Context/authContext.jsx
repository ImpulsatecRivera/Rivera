import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { config } from "../config";

const API_URL = config.api.API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// ✅ INTERCEPTOR CORREGIDO
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    
    if (token) {
      try {
        // Intenta parsear como JSON
        const parsed = JSON.parse(token);
        
        // Si tiene propiedad 'token', úsala
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        } 
        // Si no tiene 'token' pero es un string directo después del parse
        else if (typeof parsed === 'string') {
          config.headers.Authorization = `Bearer ${parsed}`;
        }
        // Si llegó hasta aquí y no encontró el token, loguea el problema
        else {
          console.error('❌ Token en formato incorrecto:', parsed);
        }
      } catch (error) {
        // Si no es JSON, úsalo directamente como string
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor request:', error);
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

// ===================== Funciones de localStorage =====================
const saveToStorage = (userData, userType) => {
  try {
    // ✅ Guardar objeto completo con token incluido
    localStorage.setItem("authToken", JSON.stringify(userData));
    if (userType) localStorage.setItem("userType", String(userType));
    if (userData?.rol) {
      localStorage.setItem("userRole", String(userData.rol));
    }
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

const loadRoleFromStorage = () => {
  try {
    return localStorage.getItem("userRole") || null;
  } catch {
    return null;
  }
};

const clearStorage = () => {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("userRole");
    console.log("✅ Storage limpiado correctamente");
  } catch (error) {
    console.error("Error limpiando storage:", error);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // ===================== Funciones de permisos =====================
  const hasRole = (requiredRoles) => {
    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }
    if (user?.userType === "Administrador") return true;
    return requiredRoles.includes(userRole);
  };

  const canCreate = () => {
    if (user?.userType === "Administrador") return true;
    return ["Operativo", "Supervisor"].includes(userRole);
  };

  const canEdit = () => {
    if (user?.userType === "Administrador") return true;
    return userRole === "Supervisor";
  };

  const canDelete = () => {
    return user?.userType === "Administrador";
  };

  const canViewReports = () => {
    if (user?.userType === "Administrador") return true;
    return ["Operativo", "Supervisor"].includes(userRole);
  };

  // ===================== Login =====================
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/login", { email, password });

      if (data?.userType === 'Cliente') {
        return { 
          success: false, 
          isCliente: true, 
          message: 'El acceso web no está disponible para usuarios con role Cliente. Por favor utiliza la plataforma de clientes.' 
        };
      }

      if (data?.user) {
        // ✅ Guardar usuario completo + token
        const userDataWithToken = {
          ...data.user,
          token: data.token
        };
        
        saveToStorage(userDataWithToken);
        setUser(data.user);
        setUserRole(data.user.rol || null);
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
      await api.post("/logout");
    } catch (error) {
      console.log("⚠️ Error en logout del servidor:", error.message);
    } finally {
      setUser(null);
      setUserRole(null);
      setIsLoggedIn(false);
      clearStorage();
      toast.success("Sesión cerrada.");
    }
  };

  // ===================== Check Auth =====================
  const checkAuth = async () => {
    setLoading(true);
    
    try {
      const { data } = await api.get("/login/check-auth", { 
        timeout: 10000,
        validateStatus: (status) => status < 500
      });
      
      if (data?.user) {
        const userDataWithToken = {
          ...data.user,
          token: data.token
        };
        saveToStorage(userDataWithToken);
        setUser(data.user);
        setUserRole(data.user.rol || null);
        setIsLoggedIn(true);
      } else {
        const savedUser = loadFromStorage();
        const savedRole = loadRoleFromStorage();
        if (savedUser) {
          console.log("🔄 Usando datos guardados localmente");
          setUser(savedUser);
          setUserRole(savedRole);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setUserRole(null);
          setIsLoggedIn(false);
        }
      }
    } catch (error) {
      console.log("🔍 checkAuth: Verificando storage local...");
      const savedUser = loadFromStorage();
      const savedRole = loadRoleFromStorage();
      if (savedUser) {
        console.log("📱 Usando sesión guardada localmente");
        setUser(savedUser);
        setUserRole(savedRole);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setUserRole(null);
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
        const userDataWithToken = {
          ...data.user,
          token: data.token
        };
        saveToStorage(userDataWithToken);
        setUser(data.user);
        setUserRole(data.user.rol || null);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch { 
      return false; 
    }
  };

  // ===================== Interceptor 401 =====================
  useEffect(() => {
    const id = api.interceptors.response.use(
      (r) => r,
      (err) => {
        if (err?.response?.status === 401) {
          const url = err.config?.url;
          
          if (url?.includes('/check-auth')) {
            console.log("🔄 401 en verificación inicial - ignorando");
            return Promise.reject(err);
          }
          
          console.log("🚫 401 en acción autenticada - limpiando");
          clearStorage();
          setUser(null);
          setUserRole(null);
          setIsLoggedIn(false);
          toast.error("Sesión expirada. Por favor inicia sesión nuevamente.");
          window.location.href = '/login';
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
      userRole,
      setUser, 
      setIsLoggedIn, 
      setUserRole,
      syncWithServer, 
      checkAuth,
      hasRole,
      canCreate,
      canEdit,
      canDelete,
      canViewReports,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);