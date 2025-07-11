import { useState } from "react";
import { useAuth } from "../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate("/dashboard");
    }
  };

  return { handleLogin, loading };
};

export default useLogin;