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
      console.log("🍪 [CLEAR] Iniciando limpieza de cookies...");
      console.log("🍪 [CLEAR] Cookies antes:", document.cookie);
      
      // 1. Eliminar con nukeCookie (múltiples variantes)
      nukeCookie("authToken");
      nukeCookie("isLoggedIn");
      nukeCookie("userType");
      nukeCookie("userPreview");
      
      // 2. Eliminar explícitamente con cookie.remove (diferentes variaciones)
      const removeOptions = [
        {},
        { path: "/" },
        { path: "/", domain: window.location.hostname },
        { path: "/", domain: `.${window.location.hostname}` },
        { path: "/", sameSite: "Lax" },
        { path: "/", sameSite: "None", secure: true },
        { path: "/", sameSite: "Strict" },
      ];
      
      removeOptions.forEach(options => {
        try {
          cookie.remove("userPreview", options);
          cookie.remove("userType", options);
          cookie.remove("isLoggedIn", options);
        } catch {}
      });
      
      // 3. CLAVE: Eliminar con document.cookie directamente (método más agresivo)
      const cookiesToClear = ["userPreview", "userType", "isLoggedIn", "authToken"];
      const paths = ["/", "/api", "/dashboard", "/login"];
      const domains = [
        "", 
        window.location.hostname, 
        `.${window.location.hostname}`,
        window.location.hostname.includes('.') ? `.${window.location.hostname.split('.').slice(-2).join('.')}` : null
      ].filter(Boolean);
      
      // Para cada cookie, probar TODAS las combinaciones posibles
      cookiesToClear.forEach(name => {
        // Básico sin atributos
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${name}=; Max-Age=0`;
        
        paths.forEach(path => {
          domains.forEach(domain => {
            // Múltiples variantes de eliminación
            const deleteStrings = [
              `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`,
              `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`,
              `${name}=; Max-Age=0; path=${path}`,
              `${name}=; Max-Age=0; path=${path}; domain=${domain}`,
              `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; SameSite=Lax`,
              `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; SameSite=None; Secure`,
              `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; SameSite=Strict`,
              `${name}=; Max-Age=0; path=${path}; domain=${domain}; SameSite=Lax`,
              `${name}=; Max-Age=0; path=${path}; domain=${domain}; SameSite=None; Secure`,
              `${name}=; Max-Age=0; path=${path}; domain=${domain}; SameSite=Strict`,
            ];
            
            deleteStrings.forEach(deleteStr => {
              try {
                document.cookie = deleteStr;
              } catch {}
            });
          });
        });
      });
      
      // 4. NUEVO: Forzar eliminación leyendo y reescribiendo todas las cookies
      const allCookies = document.cookie.split(';');
      allCookies.forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();
        if (cookiesToClear.includes(cookieName)) {
          console.log(`🚨 [CLEAR] Forzando eliminación de: ${cookieName}`);
          // Múltiples intentos de eliminación forzada
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
          document.cookie = `${cookieName}=; Max-Age=0; path=/`;
          document.cookie = `${cookieName}=; Max-Age=0; path=/; domain=${window.location.hostname}`;
        }
      });
      
      // 5. Verificación final con más detalle
      setTimeout(() => {
        const remainingCookies = document.cookie;
        console.log("🍪 [CLEAR] Cookies después de limpieza:", remainingCookies);
        
        const problemCookies = [];
        if (remainingCookies.includes('userPreview')) problemCookies.push('userPreview');
        if (remainingCookies.includes('userType')) problemCookies.push('userType');
        if (remainingCookies.includes('authToken')) problemCookies.push('authToken');
        
        if (problemCookies.length > 0) {
          console.warn(`🚨 [CLEAR] Cookies problemáticas restantes: ${problemCookies.join(', ')}`);
          
          // Último intento: eliminación nuclear
          problemCookies.forEach(cookieName => {
            for (let i = 0; i < 10; i++) {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
              document.cookie = `${cookieName}=; Max-Age=0; path=/`;
            }
          });
        } else {
          console.log("✅ [CLEAR] Todas las cookies eliminadas correctamente");
        }
      }, 100);
      
    } catch (error) {
      console.error("❌ [CLEAR] Error limpiando cookies:", error);
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
        // ❌ NO guardar en cookies del frontend - el servidor ya maneja authToken
        // saveToCookies(data.user, data.userType);
        
        // ✅ Solo actualizar estado en memoria
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
      // 1. PRIMERO: Limpiar estado inmediatamente
      setUser(null);
      setIsLoggedIn(false);
      
      // 2. SEGUNDO: Limpiar cookies (primera vez)
      clearCookies();
      
      // 3. TERCERO: Verificación adicional después de un momento
      setTimeout(() => {
        const remainingCookies = document.cookie;
        console.log("🍪 [LOGOUT] Verificación post-limpieza:", remainingCookies);
        
        // Si TODAVÍA quedan cookies, eliminarlas de nuevo más agresivamente
        if (remainingCookies.includes('userPreview') || remainingCookies.includes('userType')) {
          console.log("🚨 [LOGOUT] Cookies persistentes detectadas - eliminación agresiva");
          
          // Eliminación nuclear específica para estas cookies problemáticas
          ['userPreview', 'userType', 'authToken'].forEach(cookieName => {
            // Múltiples intentos con diferentes métodos
            for (let i = 0; i < 5; i++) {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
              document.cookie = `${cookieName}=; Max-Age=0; path=/`;
              document.cookie = `${cookieName}=; Max-Age=0; path=/; domain=${window.location.hostname}`;
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
              document.cookie = `${cookieName}=; Max-Age=0; path=/; SameSite=Lax`;
            }
          });
          
          // Verificación final
          setTimeout(() => {
            const finalCheck = document.cookie;
            console.log("🍪 [LOGOUT] Estado final de cookies:", finalCheck);
          }, 100);
        }
      }, 150);
      
      // 4. CUARTO: Mostrar mensaje
      toast.success("Sesión cerrada.");
    }
  };

  // ===================== Check Auth SIMPLIFICADO =====================
  const checkAuth = async () => {
    setLoading(true);
    
    // ❌ NO cargar desde cookies del frontend
    // let hasLocalState = false;
    // if (isLoggedIn !== false) {
    //   hasLocalState = loadFromCookies();
    // }
    
    try {
      const { data } = await api.get("/api/login/check-auth", { timeout: 10000 });
      if (data?.user) {
        // ✅ Solo actualizar estado - no cookies
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        // ❌ Servidor dice que NO hay sesión válida
        console.log("🔒 Servidor confirma: sin sesión válida");
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("❌ Error verificando auth:", error);
      // Sin estado local, simplemente desloguear
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // ===================== Sync manual SIMPLIFICADO =====================
  const syncWithServer = async () => {
    try {
      const { data } = await api.get("/api/login/check-auth", { timeout: 5000 });
      if (data?.user) {
        setUser(data.user);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch { 
      return false; 
    }
  };

  // ===================== Interceptor 401 SIMPLIFICADO =====================
  useEffect(() => {
    const id = api.interceptors.response.use(
      (r) => r,
      (err) => {
        if (err?.response?.status === 401) {
          console.log("🚫 401 detectado - limpiando estado");
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