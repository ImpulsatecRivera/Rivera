import { useState, useCallback } from "react";
import { useAuth } from "../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const result = await login(email, password); // llama al AuthContext
      if (result?.success) {
        // replace para que el botón “atrás” no regrese al login
        navigate("/dashboard", { replace: true });
      }
      // Garantiza un objeto consistente al caller
      return result ?? { success: false };
    } catch {
      // Nunca propagues errores crudos al UI
      return { success: false, message: "Error inesperado al iniciar sesión" };
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  return { handleLogin, loading };
};

export default useLogin;
