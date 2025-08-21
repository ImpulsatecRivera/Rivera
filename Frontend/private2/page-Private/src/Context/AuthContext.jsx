import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://riveraproject-5.onrender.com",
  withCredentials: true,
});

const AuthContext = createContext();

// ===================== Utils de Cookies (solo UI) =====================
const cookie = {
  set(name, value, options = {}) {
    const {
      days,
      maxAge,
      path = "/",
      sameSite = "Lax",
      secure = typeof window !== "undefined" ? window.location.protocol === "https:" : true,
      domain,
    } = options;
    let s = `${name}=${encodeURIComponent(value)}`;
    if (typeof days === "number") {
      const d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      s += `; Expires=${d.toUTCString()}`;
    } else if (typeof maxAge === "number") {
      s += `; Max-Age=${maxAge}`;
    }
    s += `; Path=${path}`;
    if (domain) s += `; Domain=${domain}`;
    if (sameSite) s += `; SameSite=${sameSite}`;
    if (secure) s += `; Secure`;
    document.cookie = s;
  },
  get(name) {
    const v = document.cookie.split("; ").find(r => r.startsWith(`${name}=`))?.split("=")[1];
    return v ? decodeURIComponent(v) : undefined;
  },
  remove(name, options = {}) {
    const {
      path = "/",
      domain,
      sameSite = "Lax",
      secure = typeof window !== "undefined" ? window.location.protocol === "https:" : true,
    } = options;
    let s = `${name}=; Max-Age=0; Path=${path}`;
    if (domain) s += `; Domain=${domain}`;
    if (sameSite) s += `; SameSite=${sameSite}`;
    if (secure) s += `; Secure`;
    document.cookie = s;
  },
};

// "Mata" variantes locales (no afecta la httpOnly del backend)
const nukeCookie = (name) => {
  const paths = ["/", "/api"];
  const domains = ["", window.location.hostname, `.${window.location.hostname}`];
  const attrs = ["", "; SameSite=Lax", "; SameSite=None; Secure"];
  const exp = "; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0";
  
  for (const p of paths) {
    for (const d of domains) {
      for (const a of attrs) {
        const domainPart = d ? `; Domain=${d}` : "";
        document.cookie = `${name}=${exp}; Path=${p}${domainPart}${a}`;
      }
    }
  }
};

const toUserPreview = (user) => {
  if (!user) return null;
  return {
    id: user.id || user._id || undefined,
    email: user.email || undefined,
    name: user.name || user.nombre || user.username || undefined,
    userType: user.userType || user.role || undefined,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFromCookies = () => {
    try {
      const raw = cookie.get("userPreview");
      if (raw) {
        try { 
          const userData = JSON.parse(raw);
          setUser(userData);
          setIsLoggedIn(true);
          return true;
        } catch {}
      }
      return false;
    } catch { 
      return false; 
    }
  };

  const clearCookies = () => {
    try {
      // Eliminar con nukeCookie (múltiples variantes)
      nukeCookie("authToken");
      nukeCookie("isLoggedIn");
      nukeCookie("userType");
      nukeCookie("userPreview");
      
      // ADEMÁS: Eliminar explícitamente con cookie.remove
      cookie.remove("userPreview");
      cookie.remove("userType");
      cookie.remove("isLoggedIn");
      
      // También intentar eliminar con diferentes paths y dominios
      const cookiesToClear = ["userPreview", "userType", "isLoggedIn", "authToken"];
      const paths = ["/", "/api", "/dashboard"];
      
      cookiesToClear.forEach(name => {
        paths.forEach(path => {
          // Sin dominio
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
          // Con dominio actual
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${window.location.hostname}`;
          // Con dominio wildcard
          if (window.location.hostname.includes('.')) {
            const rootDomain = window.location.hostname.split('.').slice(-2).join('.');
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=.${rootDomain}`;
          }
        });
      });
      
      console.log("🍪 Todas las cookies eliminadas");
    } catch (error) {
      console.error("Error limpiando cookies:", error);
    }
  };

  const saveToCookies = (userData, userType) => {
    const preview = toUserPreview(userData) || {};
    cookie.set("userPreview", JSON.stringify(preview), { days: 7 });
    if (userType) cookie.set("userType", String(userType), { days: 7 });
  };

  // ===================== DEBUG: Verificar cookies =====================
  const debugCookies = () => {
    console.log("🍪 [DEBUG] Todas las cookies:", document.cookie);
    console.log("🍪 [DEBUG] userPreview:", cookie.get("userPreview"));
    console.log("🍪 [DEBUG] userType:", cookie.get("userType"));
    console.log("🍪 [DEBUG] Estado actual:", { user, isLoggedIn, loading });
  };

  // Exponer para debugging en consola
  if (typeof window !== "undefined") {
    window.debugAuth = debugCookies;
  }

  // ===================== Login =====================
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/login", { email, password });
      if (data?.user) {
        saveToCookies(data.user, data.userType);
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
        return { success: false, blocked: true, timeRemaining: error.response.data.timeRemaining };
      }
      if (error.response?.data?.attemptsRemaining !== undefined) {
        toast.error(error.response.data.message);
        return { success: false, attemptsRemaining: error.response.data.attemptsRemaining };
      }
      toast.error("Credenciales inválidas.");
      return { success: false };
    }
  };

  // ===================== Logout MEJORADO =====================
  const logOut = async () => {
    try {
      await api.post("/api/logout");
    } catch (error) {
      console.log("Error en logout del servidor:", error);
    } finally {
      clearCookies();
      setUser(null);
      setIsLoggedIn(false);
      toast.success("Sesión cerrada.");
      
      // FORZAR verificación después de 100ms para asegurar limpieza
      setTimeout(() => {
        checkAuth();
      }, 100);
    }
  };

  // ===================== Check Auth MEJORADO =====================
  const checkAuth = async () => {
    setLoading(true);
    
    // Cargar estado desde cookies para UI rápida
    const hasLocalState = loadFromCookies();
    
    try {
      const { data } = await api.get("/api/login/check-auth", { timeout: 10000 });
      if (data?.user) {
        // ✅ Servidor confirma autenticación
        saveToCookies(data.user, data.user.userType);
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        // ❌ Servidor dice que NO hay sesión válida
        console.log("🔒 Servidor confirma: sin sesión válida");
        clearCookies(); // Limpiar TODO
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("❌ Error verificando auth:", error);
      
      // Si hay estado local pero servidor no responde, mantener temporalmente
      if (hasLocalState) {
        console.log("📱 Manteniendo estado local por error de red");
        setIsLoggedIn(true); // Mantener estado local
      } else {
        // No hay estado local y servidor no responde
        clearCookies();
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
      const { data } = await api.get("/api/login/check-auth", { timeout: 5000 });
      if (data?.user) {
        saveToCookies(data.user, data.user.userType);
        setUser(data.user);
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
    const id = api.interceptors.response.use(
      (r) => r,
      (err) => {
        if (err?.response?.status === 401) {
          console.log("🚫 401 detectado - limpiando TODO el estado");
          clearCookies(); // Usar la función mejorada
          setUser(null);
          setIsLoggedIn(false);
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, []);

  useEffect(() => { checkAuth(); }, []);
  
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
      user, login, logOut, isLoggedIn, loading,
      setUser, setIsLoggedIn, syncWithServer, checkAuth,
      debugCookies, // Para debugging
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);