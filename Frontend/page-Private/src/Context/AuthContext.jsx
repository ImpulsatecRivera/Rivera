import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;

const AuthContext = createContext();

// ===================== Utils de Cookies =====================
const cookie = {
  set(name, value, options = {}) {
    const {
      days,
      maxAge,
      path = "/",
      sameSite = "Lax",
      secure = (typeof window !== "undefined" ? window.location.protocol === "https:" : true),
      domain,
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
      .find(row => row.startsWith(`${name}=`))
      ?.split("=")[1];
    return value ? decodeURIComponent(value) : undefined;
  },

  remove(name, options = {}) {
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

// Mata todas las variantes comunes de una cookie en el dominio del FRONTEND
const nukeCookie = (name) => {
  const paths = ["/", "/api"];
  const attrs = ["", "; SameSite=Lax", "; SameSite=None; Secure"];
  const exp = "; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0";
  for (const p of paths) for (const a of attrs) {
    document.cookie = `${name}=${exp}; Path=${p}${a}`;
  }
};

// Solo guardamos lo mínimo del usuario
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

  // ===================== Carga desde cookies (solo preview) =====================
  const loadFromCookies = () => {
    try {
      const userPreviewRaw = cookie.get("userPreview");
      if (userPreviewRaw) {
        try { setUser(JSON.parse(userPreviewRaw)); } catch {}
      }
      return Boolean(userPreviewRaw);
    } catch {
      return false;
    }
  };

  // Borra cookies UI + authToken del FRONTEND
  const clearCookies = () => {
    try {
      nukeCookie("authToken");  // <-- IMPORTANTE
      nukeCookie("isLoggedIn");
      nukeCookie("userType");
      nukeCookie("userPreview");
    } catch {}
  };

  const saveToCookies = (userData, userType) => {
    const preview = toUserPreview(userData) || {};
    cookie.set("userPreview", JSON.stringify(preview), { days: 7 });
    if (userType) cookie.set("userType", String(userType), { days: 7 });
  };

  // ===================== Login =====================
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(
        "https://riveraproject-5.onrender.com/api/login",
        { email, password },
        { withCredentials: true }
      );

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

  // ===================== Logout =====================
  const logOut = async () => {
    try {
      await axios.post("https://riveraproject-5.onrender.com/api/logout", {}, { withCredentials: true });
    } finally {
      clearCookies();
      setUser(null);
      setIsLoggedIn(false);
      toast.success("Sesión cerrada.");
    }
  };

  // ===================== Verificar autenticación (solo server decide) =====================
  const checkAuth = async () => {
    setLoading(true);
    loadFromCookies(); // solo preview

    try {
      const res = await axios.get(
        "https://riveraproject-5.onrender.com/api/login/check-auth",
        { withCredentials: true, timeout: 10000 }
      );

      if (res.data?.user) {
        saveToCookies(res.data.user, res.data.user.userType);
        setUser(res.data.user);
        setIsLoggedIn(true);
      } else {
        clearCookies();
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch {
      clearCookies();
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // ===================== Sync manual =====================
  const syncWithServer = async () => {
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
    } catch {
      return false;
    }
  };

  // ===================== Efectos =====================
  useEffect(() => { checkAuth(); }, []);
  useEffect(() => {
    const onVis = () => { if (!document.hidden && isLoggedIn) syncWithServer(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
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

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
