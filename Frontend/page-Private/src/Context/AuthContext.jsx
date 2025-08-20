import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;

const AuthContext = createContext();

// ===================== Utils de Cookies =====================
const cookie = {
  set(name, value, options = {}) {
    const {
      days,             // preferido para expiración
      maxAge,           // alternativa en segundos
      path = "/",
      sameSite = "Lax", // Lax es seguro para la mayoría de SPA
      secure = (typeof window !== "undefined" ? window.location.protocol === "https:" : true),
      domain,           // opcional si quieres compartir subdominios
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
    const {
      path = "/",
      domain,
      sameSite = "Lax",
      secure = (typeof window !== "undefined" ? window.location.protocol === "https:" : true),
    } = options;
    let cookieStr = `${name}=; Max-Age=0; Path=${path}`;
    if (domain) cookieStr += `; Domain=${domain}`;
    if (sameSite) cookieStr += `; SameSite=${sameSite}`;
    if (secure) cookieStr += `; Secure`;
    document.cookie = cookieStr;
  },
};

// util para “matar” todas las variantes comunes (evita que quede alguna rezagada)
const nukeCookie = (name) => {
  const paths = ["/", "/api"];
  const attrs = ["", "; SameSite=Lax", "; SameSite=None; Secure"];
  const exp = "; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0";
  for (const p of paths) for (const a of attrs) {
    document.cookie = `${name}=${exp}; Path=${p}${a}`;
  }
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
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // ===================== Carga desde cookies (UI inmediata) =====================
  const loadFromCookies = () => {
    console.log("🍪 [loadFromCookies] Leyendo estado desde cookies");
    try {
      const isLogged = cookie.get("isLoggedIn") === "true"; // solo para logging
      const userPreviewRaw = cookie.get("userPreview");
      const userType = cookie.get("userType");

      console.log("🍪 [loadFromCookies] Cookies encontradas:", {
        isLogged,
        hasUserPreview: Boolean(userPreviewRaw),
        userType,
      });

      // cargar “preview” para la UI, pero NO activar sesión aquí
      if (userPreviewRaw) {
        try {
          const preview = JSON.parse(userPreviewRaw);
          setUser(preview);
          console.log("✅ [loadFromCookies] Preview cargado para UI:", preview);
        } catch {
          console.warn("⚠️ [loadFromCookies] userPreview inválido, ignorando");
        }
      }
      return Boolean(userPreviewRaw);
    } catch (e) {
      console.error("💥 [loadFromCookies] Error leyendo cookies:", e);
      return false;
    }
  };

  // borrar todas las variantes de cookies de UI + authToken del FRONTEND
  const clearCookies = () => {
    console.log("🧹 [clearCookies] Borrando cookies de estado (todas las variantes)");
    try {
      nukeCookie("authToken");   // ⬅️ NUEVO: elimina el token del dominio del FRONTEND
      nukeCookie("isLoggedIn");
      nukeCookie("userType");
      nukeCookie("userPreview");
    } catch (e) {
      console.warn("⚠️ [clearCookies] error al borrar variantes:", e?.message || e);
    }
  };

  const saveToCookies = (userData, userType) => {
    console.log("💾 [saveToCookies] Guardando estado mínimo en cookies");
    const preview = toUserPreview(userData) || {};
    // NO guardamos isLoggedIn (evita sesión fantasma al refrescar)
    cookie.set("userPreview", JSON.stringify(preview), { days: 7 });
    if (userType) cookie.set("userType", String(userType), { days: 7 });
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

        console.log("✅ [login] Login OK -> estado activado");
        toast.success("Inicio de sesión exitoso.");
        return { success: true, data: response.data };
      } else {
        console.log("❌ [login] No se recibió usuario");
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
    } catch (error) {
      console.error("💥 [logOut] Error al llamar al backend:", error?.message || error);
    } finally {
      // limpiar SIEMPRE cookies UI y estado (aunque el server falle)
      clearCookies();
      setUser(null);
      setIsLoggedIn(false);
      console.log("🧹 [logOut] Estado local limpiado");
      toast.success("Sesión cerrada.");
    }
  };

  // ===================== Verificar autenticación =====================
  const checkAuth = async () => {
    console.log("🔍 [checkAuth] Verificando autenticación");

    // 1) Cargar preview para que la UI no parpadee (NO activa sesión)
    loadFromCookies();

    try {
      // 2) Validar contra servidor (usa cookie httpOnly de tu backend)
      const res = await axios.get(
        "https://riveraproject-5.onrender.com/api/login/check-auth",
        { withCredentials: true, timeout: 10000 }
      );

      console.log("📨 [checkAuth] Respuesta servidor:", res.data);

      if (res.data?.user) {
        // Sincroniza cookies UI (informativas)
        saveToCookies(res.data.user, res.data.user.userType);

        // Activar sesión REAL (solo si el server confirma)
        setUser(res.data.user);
        setIsLoggedIn(true);
        console.log("✅ [checkAuth] Usuario válido -> sesión activa");
      } else {
        console.log("❌ [checkAuth] Servidor no devolvió usuario");
        clearCookies();
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("💥 [checkAuth] Error:", err?.message || err);

      // ante 401 / timeout / red / lo que sea -> sesión OFF
      clearCookies();
      setUser(null);
      setIsLoggedIn(false);
      console.log("🛑 [checkAuth] Sesión desactivada por error/401");
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
        console.log("✅ [syncWithServer] Sincronización OK");
        return true;
      } else {
        console.log("❌ [syncWithServer] Server no devolvió usuario");
        return false;
      }
    } catch (error) {
      console.error("💥 [syncWithServer] Error:", error?.message || error);
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

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
