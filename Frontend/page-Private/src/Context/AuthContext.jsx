import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Función mejorada para cargar datos desde localStorage
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

  // Función para limpiar localStorage
  const clearLocalStorage = () => {
    console.log("🧹 [clearLocalStorage] Limpiando datos de localStorage");
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('isLoggedIn');
    // También limpiar tokens de recovery si existen
    localStorage.removeItem('recoveryToken');
    localStorage.removeItem('verifiedToken');
  };

  // Función para limpiar solo tokens de recovery
  const clearRecoveryTokens = () => {
    console.log("🧹 [clearRecoveryTokens] Limpiando tokens de recuperación");
    localStorage.removeItem('recoveryToken');
    localStorage.removeItem('verifiedToken');
  };

  // Función para guardar en localStorage
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

  // 🔄 FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA

  // Solicitar código de recuperación
  const requestRecoveryCode = async (method, contact) => {
    console.log("🔑 [requestRecoveryCode] Solicitando código via:", method, "a:", contact);
    try {
      const payload = {
        via: method,
        ...(method === 'sms' ? { phone: contact } : { email: contact })
      };

      const response = await axios.post(
        'https://riveraproject-5.onrender.com/api/recovery/requestCode',
        payload,
        { withCredentials: true }
      );

      if (response.data.success && response.data.recoveryToken) {
        // Guardar token en localStorage
        localStorage.setItem('recoveryToken', response.data.recoveryToken);
        console.log("✅ [requestRecoveryCode] Token guardado en localStorage");
        
        toast.success(response.data.message);
        return { success: true, data: response.data };
      } else {
        console.log("❌ [requestRecoveryCode] Respuesta sin token");
        toast.error("Error en la respuesta del servidor");
        return { success: false, error: "No se recibió token de recuperación" };
      }
    } catch (error) {
      console.error("💥 [requestRecoveryCode] Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Error solicitando código de recuperación";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Verificar código de recuperación
  const verifyRecoveryCode = async (code) => {
    console.log("🔍 [verifyRecoveryCode] Verificando código:", code);
    try {
      const recoveryToken = localStorage.getItem('recoveryToken');
      
      if (!recoveryToken) {
        const error = 'No se encontró token de recuperación. Solicita un nuevo código.';
        console.log("❌ [verifyRecoveryCode]", error);
        toast.error(error);
        return { success: false, error };
      }

      const response = await axios.post(
        'https://riveraproject-5.onrender.com/api/recovery/verifyCode',
        {
          code: code,
          recoveryToken: recoveryToken
        },
        { withCredentials: true }
      );

      if (response.data.success && response.data.verifiedToken) {
        // Guardar token verificado y limpiar token anterior
        localStorage.setItem('verifiedToken', response.data.verifiedToken);
        localStorage.removeItem('recoveryToken');
        console.log("✅ [verifyRecoveryCode] Código verificado, token actualizado");
        
        toast.success(response.data.message);
        return { success: true, data: response.data };
      } else {
        console.log("❌ [verifyRecoveryCode] Respuesta sin token verificado");
        toast.error("Error en la verificación");
        return { success: false, error: "No se recibió token verificado" };
      }
    } catch (error) {
      console.error("💥 [verifyRecoveryCode] Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Error verificando código";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Cambiar contraseña
  const resetPassword = async (newPassword) => {
    console.log("🔐 [resetPassword] Cambiando contraseña");
    try {
      const verifiedToken = localStorage.getItem('verifiedToken');
      
      if (!verifiedToken) {
        const error = 'No se encontró token verificado. Verifica el código primero.';
        console.log("❌ [resetPassword]", error);
        toast.error(error);
        return { success: false, error };
      }

      const response = await axios.post(
        'https://riveraproject-5.onrender.com/api/recovery/newPassword',
        {
          newPassword: newPassword,
          verifiedToken: verifiedToken
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Limpiar todos los tokens de recovery
        clearRecoveryTokens();
        console.log("✅ [resetPassword] Contraseña cambiada exitosamente");
        
        toast.success(response.data.message);
        return { success: true, data: response.data };
      } else {
        console.log("❌ [resetPassword] Error en respuesta del servidor");
        toast.error("Error cambiando contraseña");
        return { success: false, error: "Error en el servidor" };
      }
    } catch (error) {
      console.error("💥 [resetPassword] Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Error cambiando contraseña";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Iniciar sesión con código de recuperación
  const loginWithRecoveryCode = async (code) => {
    console.log("🚀 [loginWithRecoveryCode] Iniciando sesión con código");
    try {
      const verifiedToken = localStorage.getItem('verifiedToken');
      
      if (!verifiedToken) {
        const error = 'No se encontró token verificado.';
        console.log("❌ [loginWithRecoveryCode]", error);
        toast.error(error);
        return { success: false, error };
      }

      const response = await axios.post(
        'https://riveraproject-5.onrender.com/api/recovery/IniciarSesionConCodigo',
        {
          code: code,
          verifiedToken: verifiedToken
        },
        { withCredentials: true }
      );

      if (response.data.success && response.data.user) {
        // Limpiar tokens de recovery
        clearRecoveryTokens();
        
        // Guardar sesión normal
        saveToLocalStorage(response.data.user, response.data.user.userType);
        setUser(response.data.user);
        setIsLoggedIn(true);
        
        console.log("✅ [loginWithRecoveryCode] Inicio de sesión exitoso");
        toast.success(response.data.message);
        return { success: true, data: response.data };
      } else {
        console.log("❌ [loginWithRecoveryCode] Respuesta sin datos de usuario");
        toast.error("Error en inicio de sesión");
        return { success: false, error: "No se recibieron datos de usuario" };
      }
    } catch (error) {
      console.error("💥 [loginWithRecoveryCode] Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Error en inicio de sesión";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login normal (existente)
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

  // Verificar autenticación con el servidor MEJORADA
  const checkAuth = async () => {
    console.log("🔍 [checkAuth] Iniciando verificación de autenticación");
    try {
      // Primero cargar desde localStorage para UI inmediata
      console.log("📂 [checkAuth] Paso 1: Cargando desde localStorage");
      const hasLocalData = loadFromLocalStorage();
      
      if (hasLocalData) {
        console.log("✅ [checkAuth] Datos encontrados en localStorage, UI restaurada");
      } else {
        console.log("❌ [checkAuth] No hay datos en localStorage");
      }

      // Verificar con el servidor si hay cookie válida
      console.log("🌐 [checkAuth] Paso 2: Verificando con servidor");
      const res = await axios.get("https://riveraproject-5.onrender.com/api/login/check-auth", {
        withCredentials: true,
        timeout: 10000
      });

      console.log("📨 [checkAuth] Respuesta del servidor:", res.data);

      if (res.data?.user) {
        console.log("✅ [checkAuth] Usuario válido desde servidor");
        
        // Actualizar localStorage con datos del servidor
        saveToLocalStorage(res.data.user, res.data.user.userType);
        
        // Actualizar estado si hay diferencias
        setUser(res.data.user);
        setIsLoggedIn(true);
        console.log("✅ [checkAuth] Estado actualizado con datos del servidor");
      } else {
        console.log("❌ [checkAuth] Servidor no devolvió usuario válido");
        if (!hasLocalData) {
          console.log("🧹 [checkAuth] Limpiando estado - no hay datos válidos");
          clearLocalStorage();
          setUser(null);
          setIsLoggedIn(false);
        } else {
          console.log("📂 [checkAuth] Manteniendo datos de localStorage a pesar de error del servidor");
        }
      }
      
    } catch (err) {
      console.error("💥 [checkAuth] Error en verificación:", err);
      
      if (err.response?.status === 401) {
        console.log("🔒 [checkAuth] Token inválido (401)");
        const hasLocalData = loadFromLocalStorage();
        if (!hasLocalData) {
          console.log("🧹 [checkAuth] No hay datos locales, limpiando estado");
          setUser(null);
          setIsLoggedIn(false);
        } else {
          console.log("📂 [checkAuth] Manteniendo sesión local a pesar de token inválido");
        }
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        console.log("⏰ [checkAuth] Timeout de conexión, usando datos locales");
        const hasLocalData = loadFromLocalStorage();
        if (!hasLocalData) {
          console.log("❌ [checkAuth] No hay datos locales para usar en caso de timeout");
          setUser(null);
          setIsLoggedIn(false);
        }
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        console.log("🌐 [checkAuth] Error de red, manteniendo sesión local");
        const hasLocalData = loadFromLocalStorage();
        if (!hasLocalData) {
          console.log("❌ [checkAuth] No hay datos locales para mantener");
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        console.error("💥 [checkAuth] Error inesperado:", err);
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

  // Función para sincronizar manualmente con el servidor
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

  // Agregar listener para cambios de visibilidad
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
    // Estados
    user, 
    isLoggedIn, 
    loading,
    
    // Funciones de autenticación normal
    login, 
    logOut, 
    checkAuth,
    syncWithServer,
    setUser,
    setIsLoggedIn,
    
    // Funciones de recuperación de contraseña
    requestRecoveryCode,
    verifyRecoveryCode,
    resetPassword,
    loginWithRecoveryCode,
    clearRecoveryTokens
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