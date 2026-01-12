import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from 'sweetalert2';
import Lottie from 'lottie-react'
import Avatar from "../components/Login/Avatar";
import Button from "../components/Login/Button";
import SideImage from "../components/Login/SideImage";
import Title from "../components/RecoverPassword/Title";
 import animationData from '../assets/lotties/Winter Snow.json';
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
 
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/SeleccionarProceso");
    }
  }, [isLoggedIn, navigate]);

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
      customClass: { popup: 'animated bounceIn' }
    });
  };
 
  const showAttemptsErrorAlert = (message, remaining) => {
    Swal.fire({
      title: 'Credenciales incorrectas',
      html: `<p>${message}</p><div class="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200"><p class="text-yellow-800 font-semibold">⚠️ Intentos restantes: ${remaining}</p><p class="text-yellow-600 text-sm mt-1">Después de 4 intentos fallidos serás bloqueado por 5 minutos</p></div>`,
      icon: 'warning',
      confirmButtonText: 'Intentar de nuevo',
      confirmButtonColor: '#f59e0b',
      allowOutsideClick: false,
      customClass: { popup: 'animated shakeX' }
    });
  };

  const showBlockedAlert = (message, timeRemaining) => {
    const minutes = Math.ceil(timeRemaining / 60);
    Swal.fire({
      title: '🔒 Cuenta temporalmente bloqueada',
      html: `<p class="mb-4">${message}</p><div class="p-4 bg-red-50 rounded-lg border border-red-200"><p class="text-red-800 font-bold text-lg">⏰ Tiempo restante: ${minutes} minuto(s)</p><p class="text-red-600 text-sm mt-2">Por seguridad, tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos</p></div><div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"><p class="text-blue-800 text-sm">💡 <strong>Consejo:</strong> Verifica que estés usando el email y contraseña correctos</p></div>`,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#dc2626',
      allowOutsideClick: false,
      customClass: { popup: 'animated bounceIn' }
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
      customClass: { popup: 'animated shakeX' }
    });
  };
 
  const showLoadingAlert = () => {
    Swal.fire({
      title: 'Comprobando datos...',
      text: 'Por favor espera mientras procesamos la información',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => { Swal.showLoading(); }
    });
  };
 
  const showValidationAlert = () => {
    Swal.fire({
      title: 'Formulario incompleto',
      text: 'Por favor, completa los campos obligatorios',
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b',
      customClass: { popup: 'animated pulse' }
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
    if (isBlocked) return `Bloqueado (${formatTimeRemaining(blockTimeRemaining)})`;
    if (loading) return "Iniciando sesión...";
    return "Iniciar sesión";
  };

  const shouldShowAttemptsWarning = () => {
    return !isBlocked && attemptsRemaining < 4 && attemptsRemaining > 0;
  };
 
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      
      {/* 🎬 Lottie Background de pantalla completa */}
      <div className="absolute inset-0 z-0">
      <Lottie 
  animationData={animationData} 
  loop={true}
  style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
/>
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      
      {/* 🎨 LADO IZQUIERDO - Formulario */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center items-center px-6 lg:px-12 relative z-20">
        
        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-10 border border-gray-200">
          <Avatar />
          <Title className="text-gray-800 mb-6">¡Bienvenido de vuelta!</Title>

          {isBlocked && (
            <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
              <div className="text-center">
                <p className="text-red-800 font-semibold">🔒 Cuenta bloqueada</p>
                <p className="text-red-600 text-sm mt-1">Tiempo restante: {formatTimeRemaining(blockTimeRemaining)}</p>
                <p className="text-red-500 text-xs mt-2">La página se desbloqueará automáticamente cuando termine el tiempo</p>
              </div>
            </div>
          )}

          {shouldShowAttemptsWarning() && (
            <div className="w-full mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-center">
                <p className="text-yellow-800 font-semibold">⚠️ Intentos restantes: {attemptsRemaining}</p>
                <p className="text-yellow-600 text-xs mt-1">Después de 4 intentos fallidos serás bloqueado por 5 minutos</p>
              </div>
            </div>
          )}
   
          <form className="w-full space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo</label>
              <input
                type="email"
                placeholder="ejemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isBlocked}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${isBlocked ? "opacity-50 cursor-not-allowed bg-gray-100" : "bg-white hover:border-blue-400"}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                placeholder="Al menos 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isBlocked}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${isBlocked ? "opacity-50 cursor-not-allowed bg-gray-100" : "bg-white hover:border-blue-400"}`}
              />
            </div>

            <div className="text-right text-sm">
              <Link 
                to="/recuperar" 
                className={`text-blue-600 hover:text-blue-700 hover:underline transition-colors ${isBlocked ? 'pointer-events-none opacity-50' : ''}`}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button 
              type="submit" 
              disabled={loading || isBlocked}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${isBlocked ? 'bg-red-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:scale-[1.02]'}`}
            >
              {getButtonText()}
            </Button>
          </form>

          {isBlocked && (
            <div className="w-full mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <p className="text-blue-800 text-sm">💡 <strong>Mientras esperas:</strong> Verifica que tengas las credenciales correctas</p>
              </div>
            </div>
          )}
        </div>
      </div>
 
      {/* 🚛 LADO DERECHO - Imagen del camión */}
      <div className="hidden lg:flex lg:w-[50%] relative items-center justify-center z-10">
        <SideImage />
      </div>

      {/* 📱 Versión móvil */}
      <div className="lg:hidden w-full h-48 mt-8 relative z-10">
        <SideImage />
      </div>
    </div>
  );
};
 
export default Login;