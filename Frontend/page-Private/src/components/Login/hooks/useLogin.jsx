import { useState } from "react";
import { useAuth } from "../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    setLoading(true);
    
    try {
      // 🔄 Llamar directamente al API en lugar de usar solo el contexto
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Para incluir cookies
      });

      const data = await response.json();
      
      setLoading(false);

      // ✅ LOGIN EXITOSO (200)
      if (response.ok && response.status === 200) {
        // Usar la función login del contexto para actualizar el estado global
        await login(email, password);
        navigate("/dashboard");
        
        return {
          success: true,
          message: data.message,
          user: data.user,
          userType: data.userType
        };
      }

      // 🔒 USUARIO BLOQUEADO (429 - Too Many Requests)
      if (response.status === 429) {
        console.log('🔒 Usuario bloqueado:', data);
        return {
          success: false,
          blocked: true,
          message: data.message || 'Demasiados intentos fallidos',
          timeRemaining: data.timeRemaining || 300
        };
      }

      // ❌ CREDENCIALES INCORRECTAS CON INTENTOS RESTANTES (400)
      if (response.status === 400) {
        console.log('❌ Intento fallido:', data);
        return {
          success: false,
          blocked: false,
          message: data.message || 'Credenciales incorrectas',
          attemptsRemaining: data.attemptsRemaining
        };
      }

      // 🚨 OTROS ERRORES
      console.log('🚨 Error del servidor:', response.status, data);
      return {
        success: false,
        message: data.message || `Error del servidor (${response.status})`
      };

    } catch (error) {
      console.error('🌐 Error de red:', error);
      setLoading(false);
      
      // Si el error tiene información de respuesta (axios style)
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (error.response.status === 429) {
          return {
            success: false,
            blocked: true,
            message: errorData.message || 'Demasiados intentos fallidos',
            timeRemaining: errorData.timeRemaining || 300
          };
        }
        
        if (error.response.status === 400) {
          return {
            success: false,
            blocked: false,
            message: errorData.message || 'Credenciales incorrectas',
            attemptsRemaining: errorData.attemptsRemaining
          };
        }
      }
      
      // Error genérico de red
      return {
        success: false,
        message: error.message || "Error de conexión con el servidor"
      };
    }
  };

  return { handleLogin, loading };
};

export default useLogin;