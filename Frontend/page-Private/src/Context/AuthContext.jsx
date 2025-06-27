import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // NUEVO

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        toast.error("Por favor, complete los campos.");
        return false;
      }

      if (email === "correo@correo.com" && password === "123456") {
        const userData = { email };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsLoggedIn(true);
        toast.success("Inicio de sesión exitoso.");
        return true;
      } else {
        toast.error("Credenciales incorrectas. Por favor, intenta de nuevo.");
        return false;
      }
    } catch (error) {
      console.error("Error en login:", error);
      toast.error("Error al iniciar sesión.");
      return false;
    }
  };

  const logOut = () => {
    try {
      localStorage.removeItem("user");
      setUser(null);
      setIsLoggedIn(false);
      toast.success("Sesión cerrada.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión.");
    }
  };

  useEffect(() => {
    const loadUserFromStorage = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      }
      setLoading(false); // MARCAR como cargado
    };
    loadUserFromStorage();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logOut, isLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
