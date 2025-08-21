// src/components/Login/hooks/useLogin.jsx
import { useState, useCallback } from "react";
import { useAuth } from "../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // usa el login del AuthContext (maneja cookies & axios)
  const navigate = useNavigate();

  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await login(email, password); // ya hace withCredentials y guarda preview cookies
      if (res?.success) {
        navigate("/dashboard", { replace: true });
      }
      return res; // { success, blocked, attemptsRemaining, ... }
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  return { handleLogin, loading };
};

export default useLogin;
