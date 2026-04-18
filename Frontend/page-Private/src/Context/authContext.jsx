import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { config } from "../config";

const API_URL = config.api.API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// ✅ INTERCEPTOR REQUEST MEJORADO
api.interceptors.request.use(
  (config) => {
    const rawToken = localStorage.getItem("authToken");
    
    if (!rawToken) {
      return config; // No hay token, continuar sin header
    }
    
    try {
      // Intentar parsear como JSON
      const parsed = JSON.parse(rawToken);
      
      if (parsed && typeof parsed === 'object') {
        // Es un objeto - buscar la propiedad token
        if (parsed.token && typeof parsed.token === 'string') {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        } else {
          // Objeto sin token - datos corruptos
          console.error('❌ Token corrupto en localStorage');
          localStorage.clear();
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      } else if (typeof parsed === 'string') {
        // Es un string directo (token puro)
        config.headers.Authorization = `Bearer ${parsed}`;
      }
    } catch (error) {
      // No es JSON - usar directamente como string
      config.headers.Authorization = `Bearer ${rawToken}`;
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
    return ["Operativo", "Supervisor", "Coordinador"].includes(userRole);
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
    return ["Operativo", "Supervisor", "Coordinador"].includes(userRole);
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

      if (data?.user && data?.token) {
        // ✅ GUARDAR INMEDIATAMENTE antes de cualquier otra cosa
        const userDataWithToken = {
          ...data.user,
          token: data.token
        };
        
        // ⚡ PRIMERO: Guardar en localStorage
        saveToStorage(userDataWithToken);
        
        // ⚡ SEGUNDO: Actualizar estado
        setUser(data.user);
        setUserRole(data.user.rol || null);
        setIsLoggedIn(true);
        
        // ⚡ TERCERO: Mostrar mensaje
        toast.success("Inicio de sesión exitoso.");
        
        return { success: true, data };
      }
      
      toast.error("No se pudo iniciar sesión.");
      return { success: false, message: "No se pudo iniciar sesión." };
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Credenciales inválidas.";

      if (error.response?.status === 429) {
        toast.error(backendMessage || "Demasiados intentos fallidos");
        return { 
          success: false, 
          blocked: true, 
          timeRemaining: error.response.data.timeRemaining,
          message: backendMessage,
        };
      }

      if (error.response?.status === 403 && /desactivad/i.test(backendMessage)) {
        toast.error(backendMessage);
        return {
          success: false,
          accountDisabled: true,
          message: backendMessage,
        };
      }

      if (error.response?.data?.attemptsRemaining !== undefined) {
        toast.error(backendMessage);
        return { 
          success: false, 
          attemptsRemaining: error.response.data.attemptsRemaining,
          message: backendMessage,
        };
      }

      toast.error(backendMessage);
      return { success: false, message: backendMessage };
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
      
      if (data?.user && data?.token) {
        // ✅ Respuesta válida del servidor con token
        const userDataWithToken = {
          ...data.user,
          token: data.token
        };
        saveToStorage(userDataWithToken);
        setUser(data.user);
        setUserRole(data.user.rol || null);
        setIsLoggedIn(true);
      } else if (data?.user) {
        // ⚠️ Usuario sin token - usar datos guardados
        const savedUser = loadFromStorage();
        if (savedUser && savedUser.token) {
          setUser(savedUser);
          setUserRole(savedUser.rol || null);
          setIsLoggedIn(true);
        } else {
          // Sin token válido - limpiar
          console.log("⚠️ Usuario sin token - limpiando sesión");
          clearStorage();
          setUser(null);
          setUserRole(null);
          setIsLoggedIn(false);
        }
      } else {
        // No hay usuario - limpiar
        clearStorage();
        setUser(null);
        setUserRole(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.log("🔍 checkAuth error - verificando storage local...");
      const savedUser = loadFromStorage();
      
      if (savedUser && savedUser.token) {
        console.log("📱 Usando sesión guardada localmente");
        setUser(savedUser);
        setUserRole(savedUser.rol || null);
        setIsLoggedIn(true);
      } else {
        console.log("⚠️ No hay token válido - limpiando");
        clearStorage();
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
      if (data?.user && data?.token) {
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

  // ===================== Interceptor 401 MEJORADO =====================
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (r) => r,
      async (err) => {
        const originalRequest = err.config;
        
        // Si es 401 y NO es el endpoint de login o check-auth
        if (err?.response?.status === 401 && !originalRequest._retry) {
          const url = originalRequest?.url || '';
          
          // Ignorar 401 en check-auth (es esperado)
          if (url.includes('/check-auth')) {
            return Promise.reject(err);
          }
          
          // Ignorar 401 en login (credenciales incorrectas)
          if (url.includes('/login') && !url.includes('check-auth')) {
            return Promise.reject(err);
          }
          
          // Para otros endpoints, intentar una vez más con el token del localStorage
          originalRequest._retry = true;
          
          const rawToken = localStorage.getItem("authToken");
          if (rawToken) {
            try {
              const parsed = JSON.parse(rawToken);
              if (parsed?.token) {
                originalRequest.headers.Authorization = `Bearer ${parsed.token}`;
                return api(originalRequest);
              }
            } catch (e) {
              // Token no es JSON válido
            }
          }
          
          // Si llegamos aquí, el token es inválido - limpiar sesión
          console.log("🚫 401 - Token inválido - limpiando sesión");
          clearStorage();
          setUser(null);
          setUserRole(null);
          setIsLoggedIn(false);
          toast.error("Sesión expirada. Por favor inicia sesión nuevamente.");
          window.location.href = '/login';
        }
        
        // 403 - Sin permisos
        if (err?.response?.status === 403) {
          toast.error("No tienes permiso, contacta con un administrador");
        }

        return Promise.reject(err);
      }
    );
    
    return () => api.interceptors.response.eject(responseInterceptor);
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