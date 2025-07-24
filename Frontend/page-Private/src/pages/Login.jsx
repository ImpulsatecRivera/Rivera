import Avatar from "../components/Login/Avatar";
import Input from "../components/Login/Input";
import Button from "../components/Login/Button";
import SideImage from "../components/Login/SideImage";
import Title from "../components/RecoverPassword/Title";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';


import { useState, useEffect } from "react";
import useLogin from "../components/Login/hooks/useLogin";
import { useAuth } from "../Context/AuthContext"; //  Importamos useAuth

import { useState, useEffect } from "react";
import useLogin from "../components/Login/hooks/useLogin";
import { useAuth } from "../Context/AuthContext"; // 🔁 Importamos useAuth

const Login = () => {
  const { handleLogin, loading } = useLogin();
<<<<<<< HEAD
  const { isLoggedIn } = useAuth(); // 🔁 Leemos si ya está logueado
=======
  const { isLoggedIn } = useAuth(); //  Leemos si ya está logueado
>>>>>>> 32c94ab92a55539026f958b94589d7d3bf77a044
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

<<<<<<< HEAD
  // 🔁 Redirección si ya está logueado
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard"); // Cambia esto si tu ruta es diferente
    }
  }, [isLoggedIn, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
=======
  const showSuccessAlert = () => {
    Swal.fire({
      title: 'Inicio de session  con éxito!',
      text: 'Inicio de session correctamente',
      icon: 'success',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#22c55e',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated bounceIn'
      }
    }).then((result) => {
      // Cuando el usuario hace clic en "Continuar"
      if (result.isConfirmed) {
        handleBackToMenu(); // Volver a la pantalla anterior
      }
    });
>>>>>>> 32c94ab92a55539026f958b94589d7d3bf77a044
  };


  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Error al iniciar session',
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
      title: 'Comprovando datos...',
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
      text: 'Por favor, completa  los campos obligatorios',
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b',
      customClass: {
        popup: 'animated pulse'
      }
    });
  };

  //  Redirección si ya está logueado
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard"); // Cambia esto si tu ruta es diferente
    }
  }, [isLoggedIn, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
  
    if (!email || !password) {
      showValidationAlert();
      return;
    }
  
    showLoadingAlert(); // Mostrar alerta de carga
    await new Promise(resolve => setTimeout(resolve, 100)); // ⏱ Pequeño delay de 100ms
  
    try {
      const result = await handleLogin(email, password);
      Swal.close(); // Cierra el loading
  
      if (result?.success) {
        showSuccessAlert(); // Éxito
      } else {
        showErrorAlert(result?.message || "Credenciales incorrectas");
      }
    } catch (error) {
      Swal.close(); // Cierra el loading
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
