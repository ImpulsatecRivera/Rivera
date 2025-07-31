import Avatar from "../components/Login/Avatar";
import Input from "../components/Login/Input";
import Button from "../components/Login/Button";
import SideImage from "../components/Login/SideImage";
import Title from "../components/RecoverPassword/Title";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

import { useState, useEffect } from "react";
import useLogin from "../components/Login/hooks/useLogin";
import { useAuth } from "../Context/AuthContext";

const Login = () => {
  const { handleLogin, loading } = useLogin();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirección si ya está logueado
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn, navigate]);

  const showSuccessAlert = () => {
    Swal.fire({
      title: 'Inicio de sesión con éxito!',
      text: 'Inicio de sesión correctamente',
      icon: 'success',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#22c55e',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated bounceIn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/dashboard"); // Navegar directamente en lugar de usar función inexistente
      }
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Error al iniciar sesión',
      text: message || 'Hubo un error al procesar la solicitud',
      icon: 'error',
      confirmButtonText: 'Intentar de nuevo',
      confirmButtonColor: '#ef4444',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated shakeX'
      }
    });
  };

  const showLoadingAlert = () => {
    Swal.fire({
      title: 'Comprobando datos...',
      text: 'Por favor espera mientras procesamos la información',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  const showValidationAlert = () => {
    Swal.fire({
      title: 'Formulario incompleto',
      text: 'Por favor, completa los campos obligatorios',
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b',
      customClass: {
        popup: 'animated pulse'
      }
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showValidationAlert();
      return;
    }

    showLoadingAlert();
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const result = await handleLogin(email, password);
      Swal.close();

      if (result?.success) {
        showSuccessAlert();
      } else {
        showErrorAlert(result?.message || "Credenciales incorrectas");
      }
    } catch (error) {
      Swal.close();
      showErrorAlert(error?.message || "Ocurrió un error inesperado");
    }
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
