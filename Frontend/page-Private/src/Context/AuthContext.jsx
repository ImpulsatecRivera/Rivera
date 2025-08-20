import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

// ===================== Utils de Cookies =====================
const cookie = {
  set(name, value, options = {}) {
    const {
      days,          // preferido para expiración
      maxAge,        // alternativa en segundos
      path = "/",
      sameSite = "Lax", // Lax es seguro para la mayoría de SPA
      secure = (typeof window !== "undefined" ? window.location.protocol === "https:" : true),
      domain,        // opcional si quieres compartir subdominios
    } = options;

    let cookieStr = `${name}=${encodeURIComponent(value)}`;

    if (typeof days === "number") {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      cookieStr += `; Expires=${date.toUTCString()}`;
    } else if (typeof maxAge === "number") {
      cookieStr += `; Max-Age=${maxAge}`;
    }

    cookieStr += `; Path=${path}`;
    if (domain) cookieStr += `; Domain=${domain}`;
    if (sameSite) cookieStr += `; SameSite=${sameSite}`;
    if (secure) cookieStr += `; Secure`;

    document.cookie = cookieStr;
  },

  get(name) {
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];
    return value ? decodeURIComponent(value) : undefined;
  },

  remove(name, options = {}) {
    // Para borrar: Max-Age=0 y misma Path/Domain
    const { path = "/", domain, sameSite = "Lax", secure = (typeof window !== "undefined" ? window.location.protocol === "https:" : true) } = options;
    let cookieStr = `${name}=; Max-Age=0; Path=${path}`;
    if (domain) cookieStr += `; Domain=${domain}`;
    if (sameSite) cookieStr += `; SameSite=${sameSite}`;
    if (secure) cookieStr += `; Secure`;
    document.cookie = cookieStr;
  },
};

// Restringimos lo que guardamos del usuario para no llenar la cookie
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
  const [user, setUser] = useState(null);         // objeto completo desde servidor
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // ===================== Carga desde cookies (UI inmediata) =====================
  const loadFromCookies = () => {
    console.log("🍪 [loadFromCookies] Leyendo estado desde cookies");
    try {
      const isLogged = cookie.get("isLoggedIn") === "true";
      const userPreviewRaw = cookie.get("userPreview");
      const userType = cookie.get("userType");

      console.log("🍪 [loadFromCookies] Cookies encontradas:", {
        isLogged,
        hasUserPreview: Boolean(userPreviewRaw),
        userType,
      });

      if (isLogged) {
        let preview = null;
        if (userPreviewRaw) {
          try {
            preview = JSON.parse(userPreviewRaw);
          } catch {
            console.warn("⚠️ [loadFromCookies] userPreview inválido, ignorando");
          }
        }
        // Restauramos un "usuario ligero" solo para UI inicial;
        // luego checkAuth lo actualizará con el usuario real del servidor.
        setUser(preview);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (e) {
      console.error("💥 [loadFromCookies] Error leyendo cookies:", e);
      return false;
    }
  };

  const clearCookies = () => {
    console.log("🧹 [clearCookies] Borrando cookies de estado");
    cookie.remove("isLoggedIn");
    cookie.remove("userType");
    cookie.remove("userPreview");
  };

  const saveToCookies = (userData, userType) => {
    console.log("💾 [saveToCookies] Guardando estado mínimo en cookies");
    const preview = toUserPreview(userData);
    cookie.set("isLoggedIn", "true", { days: 7 });
    if (userType) cookie.set("userType", String(userType), { days: 7 });
    cookie.set("userPreview", JSON.stringify(preview || {}), { days: 7 });
  };

  // ===================== Login =====================
  const login = async (email, password) => {
    console.log("🔑 [login] Iniciando login", email);
    try {
      const response = await axios.post(
        "https://riveraproject-5.onrender.com/api/login",
        { email, password },
        { withCredentials: true }
      );

      console.log("📨 [login] Respuesta:", response.data);

      if (response.data?.user) {
        // Guardamos estado en cookies (no el token)
        saveToCookies(response.data.user, response.data.userType);

        // Estado completo en memoria
        setUser(response.data.user);
        setIsLoggedIn(true);

        toast.success("Inicio de sesión exitoso.");
        return { success: true, data: response.data };
      } else {
        toast.error("No se pudo iniciar sesión.");
        return { success: false };
      }
    } catch (error) {
      console.error("💥 [login] Error:", error.response?.data || error.message);

      if (error.response?.status === 429) {
        toast.error(error.response.data.message || "Demasiados intentos fallidos");
        return {
          success: false,
          blocked: true,
          timeRemaining: error.response.data.timeRemaining,
        };
      }

      if (error.response?.data?.attemptsRemaining !== undefined) {
        toast.error(error.response.data.message);
        return {
          success: false,
          attemptsRemaining: error.response.data.attemptsRemaining,
        };
      }

      toast.error("Credenciales inválidas.");
      return { success: false };
    }
  };

  // ===================== Logout =====================
  const logOut = async () => {
    console.log("🚪 [logOut] Cerrando sesión");
    try {
      await axios.post(
        "https://riveraproject-5.onrender.com/api/logout",
        {},
        { withCredentials: true }
      );
      console.log("✅ [logOut] Logout en servidor ok");

      clearCookies();
      setUser(null);
      setIsLoggedIn(false);
      toast.success("Sesión cerrada.");
    } catch (error) {
      console.error("💥 [logOut] Error:", error);
      // Aunque falle, limpiamos estado local
      clearCookies();
      setUser(null);
      setIsLoggedIn(false);
      toast.error("Error al cerrar sesión, pero se limpió la sesión local.");
    }
  };

  // ===================== Verificar autenticación =====================
  const checkAuth = async () => {
    console.log("🔍 [checkAuth] Verificando autenticación");

    // 1) Restaurar desde cookies para UI inmediata
    const hasCookieData = loadFromCookies();

    try {
      // 2) Validar contra servidor (usa cookie httpOnly de tu backend)
      const res = await axios.get(
        "https://riveraproject-5.onrender.com/api/login/check-auth",
        { withCredentials: true, timeout: 10000 }
      );

      console.log("📨 [checkAuth] Respuesta servidor:", res.data);

      if (res.data?.user) {
        // Sincronizamos cookies por si cambiaron
        saveToCookies(res.data.user, res.data.user.userType);

        setUser(res.data.user);
        setIsLoggedIn(true);
        console.log("✅ [checkAuth] Usuario válido");
      } else {
        console.log("❌ [checkAuth] Servidor no devolvió usuario");
        if (!hasCookieData) {
          clearCookies();
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    } catch (err) {
      console.error("💥 [checkAuth] Error:", err);

      if (err.response?.status === 401) {
        console.log("🔒 [checkAuth] 401 - sesión inválida");
        // Si las cookies locales no dicen nada, limpiamos todo
        if (!hasCookieData) {
          clearCookies();
          setUser(null);
          setIsLoggedIn(false);
        } else {
          console.log("📂 [checkAuth] Manteniendo UI por cookies (posible error temporal)");
        }
      } else if (err.code === "ECONNABORTED" || String(err.message || "").includes("timeout")) {
        console.log("⏰ [checkAuth] Timeout - usando cookies locales");
        if (!hasCookieData) {
          setUser(null);
          setIsLoggedIn(false);
        }
      } else if (err.code === "ERR_NETWORK" || !err.response) {
        console.log("🌐 [checkAuth] Error de red - mantener estado de cookies si existe");
        if (!hasCookieData) {
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        console.log("⚠️ [checkAuth] Error inesperado - fallback cookies");
        if (!hasCookieData) {
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    } finally {
      setLoading(false);
      console.log("🏁 [checkAuth] Fin verificación. loading=false");
    }
  };

  // ===================== Sync manual =====================
  const syncWithServer = async () => {
    console.log("🔄 [syncWithServer] Forzando sincronización");
    try {
      const res = await axios.get(
        "https://riveraproject-5.onrender.com/api/login/check-auth",
        { withCredentials: true, timeout: 5000 }
      );

      if (res.data?.user) {
        saveToCookies(res.data.user, res.data.user.userType);
        setUser(res.data.user);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("💥 [syncWithServer] Error:", error);
      return false;
    }
  };

  // ===================== Efectos =====================
  useEffect(() => {
    console.log("🚀 [AuthProvider] Montado -> checkAuth");
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isLoggedIn) {
        console.log("👁️ [AuthProvider] Tab visible -> sync");
        syncWithServer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isLoggedIn]);

  const contextValue = {
    user,
    login,
    logOut,
    isLoggedIn,
    loading,
    setUser,
    setIsLoggedIn,
    syncWithServer,
    checkAuth,
  };

  console.log("🔄 [AuthProvider] Render:", {
    user: user ? (user.email || user.name || "user") : "No user",
    isLoggedIn,
    loading,
  });

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
