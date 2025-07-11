import Avatar from "../components/Login/Avatar";
import Input from "../components/Login/Input";
import Button from "../components/Login/Button";
import SideImage from "../components/Login/SideImage";
import Title from "../components/RecoverPassword/Title";
import { Link, useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import useLogin from "../components/Login/hooks/useLogin";
import { useAuth } from "../Context/AuthContext"; // 🔁 Importamos useAuth

const Login = () => {
  const { handleLogin, loading } = useLogin();
  const { isLoggedIn } = useAuth(); // 🔁 Leemos si ya está logueado
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔁 Redirección si ya está logueado
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard"); // Cambia esto si tu ruta es diferente
    }
  }, [isLoggedIn, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gray-100">
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-8">
        <Avatar />
        <Title className="text-gray-800">¡Bienvenido de vuelta!</Title>

        <form className="w-full max-w-md space-y-4" onSubmit={onSubmit}>
          <Input
            label="Correo"
            type="email"
            placeholder="ejemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Al menos 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-right text-sm">
            <Link to="/recuperar" className="text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
      </div>

      <div className="w-full lg:w-[30%] flex justify-center p-4">
        <SideImage />
      </div>
    </div>
  );
};

export default Login;
