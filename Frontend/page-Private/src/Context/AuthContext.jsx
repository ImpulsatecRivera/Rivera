import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔄 Función para cargar datos desde localStorage
  const loadFromLocalStorage = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
      
      if (storedUser && storedIsLoggedIn === 'true') {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return false;
    }
  };

  // 🧹 Función para limpiar localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('isLoggedIn');
  };

  // ⚠️ DEPRECADO: Esta función ya no se usa para login principal
  // Solo mantenerla para compatibilidad si es necesaria
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "https://riveraproject-5.onrender.com/api/login",
        { email, password },
        { withCredentials: true }
      );

      if (response.data?.user) {
        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', response.data.userType);
        localStorage.setItem('isLoggedIn', 'true');
        
        setUser(response.data.user);
        setIsLoggedIn(true);
        toast.success("Inicio de sesión exitoso.");
        return { success: true, data: response.data };
      } else {
        toast.error("No se pudo iniciar sesión.");
        return { success: false };
      }
    } catch (error) {
      console.error("Error en login:", error.response?.data || error.message);
      
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

  const logOut = async () => {
    try {
      // Intentar logout en servidor
      await axios.post("https://riveraproject-5.onrender.com/api/logout", {}, { 
        withCredentials: true 
      });
      
      // Limpiar estado local
      clearLocalStorage();
      setUser(null);
      setIsLoggedIn(false);
      toast.success("Sesión cerrada.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      
      // Incluso si hay error, limpiamos el estado local
      clearLocalStorage();
      setUser(null);
      setIsLoggedIn(false);
      toast.error("Error al cerrar sesión, pero se limpió la sesión local.");
    }
  };

  // 🔍 Verificar autenticación con el servidor
  const checkAuth = async () => {
    try {
      // Primero verificar localStorage
      const hasLocalData = loadFromLocalStorage();
      
      // Luego verificar con el servidor si hay cookie válida
      const res = await axios.get("https://riveraproject-5.onrender.com/api/login/check-auth", {
        withCredentials: true,
      });

      if (res.data?.user) {
        // Actualizar localStorage con datos del servidor
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        setUser(res.data.user);
        setIsLoggedIn(true);
      } else if (!hasLocalData) {
        // No hay datos ni en servidor ni en localStorage
        clearLocalStorage();
        setUser(null);
        setIsLoggedIn(false);
      }
      // Si hasLocalData es true pero el servidor dice que no, 
      // mantener la sesión local (el usuario seguirá logueado)
      
    } catch (err) {
      if (err.response?.status === 401) {
        // Token inválido, pero mantener localStorage si existe
        const hasLocalData = loadFromLocalStorage();
        if (!hasLocalData) {
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        console.error("Error inesperado en checkAuth:", err);
        // En caso de error de red, usar localStorage
        loadFromLocalStorage();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logOut, 
      isLoggedIn, 
      loading,
      setUser,
      setIsLoggedIn 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);