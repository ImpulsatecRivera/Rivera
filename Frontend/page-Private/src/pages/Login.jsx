import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from 'sweetalert2';
 
import Avatar from "../components/Login/Avatar";
import Input from "../components/Login/Input";
import Button from "../components/Login/Button";
import SideImage from "../components/Login/SideImage";
import Title from "../components/RecoverPassword/Title";
 
import useLogin from "../components/Login/hooks/useLogin";
import { useAuth } from "../Context/AuthContext";
 
const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, loading } = useLogin();
  const { isLoggedIn } = useAuth();
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(4);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
 
  // Redirección si ya está logueado
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn, navigate]);

  // Contador para tiempo de bloqueo
  useEffect(() => {
    let interval;
    if (isBlocked && blockTimeRemaining > 0) {
      interval = setInterval(() => {
        setBlockTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            setAttemptsRemaining(4);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBlocked, blockTimeRemaining]);

  const resetAttemptsState = () => {
    setIsBlocked(false);
    setAttemptsRemaining(4);
    setBlockTimeRemaining(0);
  };
 
  const showSuccessAlert = () => {
    resetAttemptsState();

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
    });
  };
 
  const showAttemptsErrorAlert = (message, remaining) => {
    Swal.fire({
      title: 'Credenciales incorrectas',
      html: `
        <p>${message}</p>
        <div class="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p class="text-yellow-800 font-semibold">⚠️ Intentos restantes: ${remaining}</p>
          <p class="text-yellow-600 text-sm mt-1">Después de 4 intentos fallidos serás bloqueado por 5 minutos</p>
        </div>
      `,
      icon: 'warning',
      confirmButtonText: 'Intentar de nuevo',
      confirmButtonColor: '#f59e0b',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated shakeX'
      }
    });
  };

  const showBlockedAlert = (message, timeRemaining) => {
    const minutes = Math.ceil(timeRemaining / 60);
    
    Swal.fire({
      title: '🔒 Cuenta temporalmente bloqueada',
      html: `
        <p class="mb-4">${message}</p>
        <div class="p-4 bg-red-50 rounded-lg border border-red-200">
          <p class="text-red-800 font-bold text-lg">⏰ Tiempo restante: ${minutes} minuto(s)</p>
          <p class="text-red-600 text-sm mt-2">Por seguridad, tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos</p>
        </div>
        <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-blue-800 text-sm">💡 <strong>Consejo:</strong> Verifica que estés usando el email y contraseña correctos</p>
        </div>
      `,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#dc2626',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated bounceIn'
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

  const handleLoginResponse = (result) => {
    if (result?.blocked) {
      setIsBlocked(true);
      setBlockTimeRemaining(result.timeRemaining || 300);
      showBlockedAlert(result.message, result.timeRemaining || 300);
    } else if (result?.attemptsRemaining !== undefined) {
      setAttemptsRemaining(result.attemptsRemaining);
      showAttemptsErrorAlert(result.message, result.attemptsRemaining);
    } else {
      showErrorAlert(result?.message || "Credenciales incorrectas");
    }
  };
 
  const onSubmit = async (e) => {
    e.preventDefault();
 
    if (!email || !password) {
      showValidationAlert();
      return;
    }

    if (isBlocked) {
      const minutes = Math.ceil(blockTimeRemaining / 60);
      showBlockedAlert(`Demasiados intentos fallidos. Intenta de nuevo en ${minutes} minuto(s).`, blockTimeRemaining);
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
        handleLoginResponse(result);
      }
    } catch (error) {
      Swal.close();
      console.error('Error inesperado en login:', error);
      showErrorAlert("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
    }
  };

  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getButtonText = () => {
    if (isBlocked) {
      return `Bloqueado (${formatTimeRemaining(blockTimeRemaining)})`;
    }
    if (loading) {
      return "Iniciando sesión...";
    }
    return "Iniciar sesión";
  };

  const shouldShowAttemptsWarning = () => {
    return !isBlocked && attemptsRemaining < 4 && attemptsRemaining > 0;
  };
 
  return (
    <div className="min-h-screen flex">
      {/* 🎨 LADO IZQUIERDO - Formulario (45% en desktop) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-8 bg-gradient-to-br from-gray-50 to-white relative">
        
        {/* ✨ Efecto de fondo sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-transparent"></div>
        
        <div className="relative z-10 w-full max-w-md">
          <Avatar />
          <Title className="text-gray-800 mb-8">¡Bienvenido de vuelta!</Title>

          {/* Indicador de estado de bloqueo */}
          {isBlocked && (
            <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
              <div className="text-center">
                <p className="text-red-800 font-semibold">🔒 Cuenta bloqueada</p>
                <p className="text-red-600 text-sm mt-1">
                  Tiempo restante: {formatTimeRemaining(blockTimeRemaining)}
                </p>
                <p className="text-red-500 text-xs mt-2">
                  La página se desbloqueará automáticamente cuando termine el tiempo
                </p>
              </div>
            </div>
          )}

          {/* Indicador de intentos restantes */}
          {shouldShowAttemptsWarning() && (
            <div className="w-full mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-center">
                <p className="text-yellow-800 font-semibold">⚠️ Intentos restantes: {attemptsRemaining}</p>
                <p className="text-yellow-600 text-xs mt-1">
                  Después de 4 intentos fallidos serás bloqueado por 5 minutos
                </p>
              </div>
            </div>
          )}
   
          <form className="w-full space-y-4" onSubmit={onSubmit}>
            <Input
              label="Correo"
              type="email"
              placeholder="ejemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isBlocked}
              className={isBlocked ? "opacity-50 cursor-not-allowed" : ""}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Al menos 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isBlocked}
              className={isBlocked ? "opacity-50 cursor-not-allowed" : ""}
            />
            <div className="text-right text-sm">
              <Link 
                to="/recuperar" 
                className={`text-blue-600 hover:underline ${isBlocked ? 'pointer-events-none opacity-50' : ''}`}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Button 
              type="submit" 
              disabled={loading || isBlocked}
              className={`w-full ${isBlocked ? 'bg-red-400 cursor-not-allowed' : ''}`}
            >
              {getButtonText()}
            </Button>
          </form>

          {/* Información adicional cuando está bloqueado */}
          {isBlocked && (
            <div className="w-full mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Mientras esperas:</strong> Verifica que tengas las credenciales correctas
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
 
      {/* 🚛 LADO DERECHO - Lottie Animation (55% en desktop) - ¡ÉPICO! */}
      <div className="hidden lg:block lg:w-[55%] relative">
        <SideImage />
        
        {/* 🌟 Efecto de transición entre los lados */}
        <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-white via-white/50 to-transparent z-30"></div>
      </div>

      {/* 📱 Versión móvil del Lottie */}
      <div className="lg:hidden w-full h-64 mt-8">
        <SideImage />
      </div>
    </div>
  );
};
 
export default Login;