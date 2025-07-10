import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/login",
        { email, password },
        { withCredentials: true }
      );

      if (response.data?.user) {
        setUser(response.data.user);
        setIsLoggedIn(true);
        toast.success("Inicio de sesión exitoso.");
        return true;
      } else {
        toast.error("No se pudo iniciar sesión.");
        return false;
      }
    } catch (error) {
      console.error("Error en login:", error.response?.data || error.message);
      toast.error("Credenciales inválidas.");
      return false;
    }
  };

  const logOut = async () => {
    try {
      await axios.post("http://localhost:4000/api/logout", {}, { withCredentials: true });
      setUser(null);
      setIsLoggedIn(false);
      toast.success("Sesión cerrada.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión.");
    }
  };

  useEffect(() => {
    setLoading(false); // Solo quita el loading; no hay checkAuth aún
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logOut, isLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
