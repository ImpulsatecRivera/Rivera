import { useState, useCallback } from "react";
import { useAuth } from "../../../Context/authContext";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const result = await login(email, password); // llama al AuthContext

      // Si el login fue exitoso, revisar role
      if (result?.success) {
        const userType = result?.data?.user?.userType;

        // Si es motorista, no permitir acceso a la app web
        if (userType === 'Motorista') {
          // Cerrar sesión para limpiar cookies/estado en caso de que el backend las haya establecido
          try { await logOut(); } catch (e) { /* ignore */ }
          return { success: false, isMotorista: true, message: 'El acceso web no está disponible para Motoristas. Usa la app móvil.' };
        }

        // Si no es motorista, acceder normalmente
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
  }, [login, logOut, navigate]);

  return { handleLogin, loading };
};

export default useLogin;
