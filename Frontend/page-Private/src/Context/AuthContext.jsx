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

  const checkAuth = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/login/check-auth", {
        withCredentials: true,
      });

      if (res.data?.user) {
        setUser(res.data.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Error inesperado en checkAuth:", err);
      }
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logOut, isLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
