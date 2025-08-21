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
      const res = await login(email, password);
      if (res?.success) {
        navigate("/dashboard", { replace: true });
      }
      return res;
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  return { handleLogin, loading };
};

export default useLogin;
