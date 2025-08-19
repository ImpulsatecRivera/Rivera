import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔄 Función mejorada para cargar datos desde localStorage
  const loadFromLocalStorage = () => {
    console.log("📂 [loadFromLocalStorage] Iniciando carga desde localStorage");
    try {
      const storedUser = localStorage.getItem('user');
      const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
      
      console.log("📂 [loadFromLocalStorage] Datos encontrados:", {
        user: storedUser ? "Presente" : "No encontrado",
        isLoggedIn: storedIsLoggedIn
      });
      
      if (storedUser && storedIsLoggedIn === 'true') {
        const parsedUser = JSON.parse(storedUser);
        console.log("✅ [loadFromLocalStorage] Restaurando usuario desde localStorage:", parsedUser);
        
        setUser(parsedUser);
        setIsLoggedIn(true);
        return true;
      }
      
      console.log("❌ [loadFromLocalStorage] No hay datos válidos en localStorage");
      return false;
    } catch (error) {
      console.error("💥 [loadFromLocalStorage] Error al cargar desde localStorage:", error);
      return false;
    }
  };

  // 🧹 Función para limpiar localStorage
  const clearLocalStorage = () => {
    console.log("🧹 [clearLocalStorage] Limpiando datos de localStorage");
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('isLoggedIn');
  };

  // 💾 Función para guardar en localStorage
  const saveToLocalStorage = (userData, userType) => {
    console.log("💾 [saveToLocalStorage] Guardando datos:", { userData, userType });
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userType', userType);
      localStorage.setItem('isLoggedIn', 'true');
      console.log("✅ [saveToLocalStorage] Datos guardados exitosamente");
    } catch (error) {
      console.error("💥 [saveToLocalStorage] Error al guardar en localStorage:", error);
    }
  };

  // ⚠️ DEPRECADO: Esta función ya no se usa para login principal
  // Solo mantenerla para compatibilidad si es necesaria
  const login = async (email, password) => {
    console.log("🔑 [login] Iniciando proceso de login con email:", email);
    try {
      const response = await axios.post(
        "https://riveraproject-5.onrender.com/api/login",
        { email, password },
        { withCredentials: true }
      );

      console.log("📨 [login] Respuesta del servidor:", response.data);

      if (response.data?.user) {
        // Guardar en localStorage usando función centralizada
        saveToLocalStorage(response.data.user, response.data.userType);
        
        setUser(response.data.user);
        setIsLoggedIn(true);
        console.log("✅ [login] Login exitoso, usuario establecido");
        toast.success("Inicio de sesión exitoso.");
        return { success: true, data: response.data };
      } else {
        console.log("❌ [login] Respuesta sin datos de usuario");
        toast.error("No se pudo iniciar sesión.");
        return { success: false };
      }
    } catch (error) {
      console.error("💥 [login] Error en login:", error.response?.data || error.message);
      
      if (error.response?.status === 429) {
        console.log("🔒 [login] Usuario bloqueado por demasiados intentos");
        toast.error(error.response.data.message || "Demasiados intentos fallidos");
        return { 
          success: false, 
          blocked: true, 
          timeRemaining: error.response.data.timeRemaining 
        };
      }
      
      if (error.response?.data?.attemptsRemaining !== undefined) {
        console.log("⚠️ [login] Intento fallido con intentos restantes:", error.response.data.attemptsRemaining);
        toast.error(error.response.data.message);
        return { 
          success: false, 
          attemptsRemaining: error.response.data.attemptsRemaining 
        };
      }
      
      console.log("❌ [login] Error genérico de credenciales");
      toast.error("Credenciales inválidas.");
      return { success: false };
    }
  };

  const logOut = async () => {
    console.log("🚪 [logOut] Iniciando proceso de logout");
    try {
      // Intentar logout en servidor
      await axios.post("https://riveraproject-5.onrender.com/api/logout", {}, { 
        withCredentials: true 
      });
      console.log("✅ [logOut] Logout exitoso en servidor");
      
      // Limpiar estado local
      clearLocalStorage();
      setUser(null);
      setIsLoggedIn(false);
      console.log("✅ [logOut] Estado local limpiado");
      toast.success("Sesión cerrada.");
    } catch (error) {
      console.error("💥 [logOut] Error al cerrar sesión:", error);
      
      // Incluso si hay error, limpiamos el estado local
      clearLocalStorage();
      setUser(null);
      setIsLoggedIn(false);
      console.log("🧹 [logOut] Estado local limpiado a pesar del error");
      toast.error("Error al cerrar sesión, pero se limpió la sesión local.");
    }
  };

  // 🔍 Verificar autenticación con el servidor MEJORADA
  const checkAuth = async () => {
    console.log("🔍 [checkAuth] Iniciando verificación de autenticación");
    try {
      // 1️⃣ Primero cargar desde localStorage para UI inmediata
      console.log("📂 [checkAuth] Paso 1: Cargando desde localStorage");
      const hasLocalData = loadFromLocalStorage();
      
      if (hasLocalData) {
        console.log("✅ [checkAuth] Datos encontrados en localStorage, UI restaurada");
        // No terminar aquí, continuar con verificación del servidor
      } else {
        console.log("❌ [checkAuth] No hay datos en localStorage");
      }

      // 2️⃣ Verificar con el servidor si hay cookie válida
      console.log("🌐 [checkAuth] Paso 2: Verificando con servidor");
      const res = await axios.get("https://riveraproject-5.onrender.com/api/login/check-auth", {
        withCredentials: true,
        timeout: 10000 // 10 segundos de timeout
      });

      console.log("📨 [checkAuth] Respuesta del servidor:", res.data);

      if (res.data?.user) {
        console.log("✅ [checkAuth] Usuario válido desde servidor");
        
        // Actualizar localStorage con datos del servidor (por si hay diferencias)
        saveToLocalStorage(res.data.user, res.data.user.userType);
        
        // Actualizar estado si hay diferencias
        setUser(res.data.user);
        setIsLoggedIn(true);
        console.log("✅ [checkAuth] Estado actualizado con datos del servidor");
      } else {
        console.log("❌ [checkAuth] Servidor no devolvió usuario válido");
        if (!hasLocalData) {
          // No hay datos ni en servidor ni en localStorage
          console.log("🧹 [checkAuth] Limpiando estado - no hay datos válidos");
          clearLocalStorage();
          setUser(null);
          setIsLoggedIn(false);
        } else {
          console.log("📂 [checkAuth] Manteniendo datos de localStorage a pesar de error del servidor");
          // Mantener la sesión local si existe
        }
      }
      
    } catch (err) {
      console.error("💥 [checkAuth] Error en verificación:", err);
      
      if (err.response?.status === 401) {
        console.log("🔒 [checkAuth] Token inválido (401)");
        // Token inválido en servidor
        const hasLocalData = loadFromLocalStorage();
        if (!hasLocalData) {
          console.log("🧹 [checkAuth] No hay datos locales, limpiando estado");
          setUser(null);
          setIsLoggedIn(false);
        } else {
          console.log("📂 [checkAuth] Manteniendo sesión local a pesar de token inválido");
          // Mantener localStorage para que el usuario no pierda la sesión por problemas de red
        }
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        console.log("⏰ [checkAuth] Timeout de conexión, usando datos locales");
        // Timeout o problemas de red - usar localStorage
        const hasLocalData = loadFromLocalStorage();
        if (!hasLocalData) {
          console.log("❌ [checkAuth] No hay datos locales para usar en caso de timeout");
          setUser(null);
          setIsLoggedIn(false);
        }
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        console.log("🌐 [checkAuth] Error de red, manteniendo sesión local");
        // Error de red - mantener sesión local si existe
        const hasLocalData = loadFromLocalStorage();
        if (!hasLocalData) {
          console.log("❌ [checkAuth] No hay datos locales para mantener");
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        console.error("💥 [checkAuth] Error inesperado:", err);
        // En caso de error inesperado, usar localStorage si existe
        const hasLocalData = loadFromLocalStorage();
        if (!hasLocalData) {
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    } finally {
      console.log("🏁 [checkAuth] Finalizando verificación, loading = false");
      setLoading(false);
    }
  };

  // 🔄 Función para sincronizar manualmente con el servidor
  const syncWithServer = async () => {
    console.log("🔄 [syncWithServer] Sincronizando manualmente con servidor");
    try {
      const res = await axios.get("https://riveraproject-5.onrender.com/api/login/check-auth", {
        withCredentials: true,
        timeout: 5000
      });

      if (res.data?.user) {
        console.log("✅ [syncWithServer] Sincronización exitosa");
        saveToLocalStorage(res.data.user, res.data.user.userType);
        setUser(res.data.user);
        setIsLoggedIn(true);
        return true;
      } else {
        console.log("❌ [syncWithServer] Servidor no devolvió usuario válido");
        return false;
      }
    } catch (error) {
      console.error("💥 [syncWithServer] Error en sincronización:", error);
      return false;
    }
  };

  useEffect(() => {
    console.log("🚀 [AuthProvider] Componente montado, iniciando checkAuth");
    checkAuth();
  }, []);

  // 🔄 Agregar listener para cambios de visibilidad (cuando el usuario vuelve a la pestaña)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isLoggedIn) {
        console.log("👁️ [AuthProvider] Pestaña visible de nuevo, sincronizando con servidor");
        syncWithServer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoggedIn]);

  const contextValue = {
    user, 
    login, 
    logOut, 
    isLoggedIn, 
    loading,
    setUser,
    setIsLoggedIn,
    syncWithServer, // Exponer función de sincronización manual
    checkAuth // Exponer función de verificación manual
  };

  console.log("🔄 [AuthProvider] Renderizando con estado:", {
    user: user ? user.email : "No user",
    isLoggedIn,
    loading
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);