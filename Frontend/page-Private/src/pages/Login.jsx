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
  // 🆕 Estado para controlar intentos y bloqueos
  const [isBlocked, setIsBlocked] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(4);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
 
  // Redirección si ya está logueado
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn, navigate]);

  // 🕐 Contador para tiempo de bloqueo
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
 
  const showSuccessAlert = () => {
    // ✅ Resetear estado de intentos al login exitoso
    setIsBlocked(false);
    setAttemptsRemaining(4);
    setBlockTimeRemaining(0);

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
        // Opcional: hacer algo como volver a menú
      }
    });
  };
 
  // 🆕 Alerta para intentos fallidos con contador
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

  // 🔒 Alerta para usuario bloqueado
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
 
  const onSubmit = async (e) => {
    e.preventDefault();
 
    if (!email || !password) {
      showValidationAlert();
      return;
    }

    // 🔒 Verificar si está bloqueado antes de enviar
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
        // 🆕 Manejar diferentes tipos de errores del backend
        if (result?.blocked) {
          // Usuario bloqueado
          setIsBlocked(true);
          setBlockTimeRemaining(result.timeRemaining || 300);
          showBlockedAlert(result.message, result.timeRemaining || 300);
        } else if (result?.attemptsRemaining !== undefined) {
          // Intento fallido con contador
          setAttemptsRemaining(result.attemptsRemaining);
          showAttemptsErrorAlert(result.message, result.attemptsRemaining);
        } else {
          // Error genérico
          showErrorAlert(result?.message || "Credenciales incorrectas");
        }
      }
    } catch (error) {
      Swal.close();
      
      // 🆕 Manejar errores de red/servidor que podrían incluir info de intentos
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.blocked) {
          setIsBlocked(true);
          setBlockTimeRemaining(errorData.timeRemaining || 300);
          showBlockedAlert(errorData.message, errorData.timeRemaining || 300);
        } else if (errorData.attemptsRemaining !== undefined) {
          setAttemptsRemaining(errorData.attemptsRemaining);
          showAttemptsErrorAlert(errorData.message, errorData.attemptsRemaining);
        } else {
          showErrorAlert(errorData.message || "Ocurrió un error inesperado");
        }
      } else {
        showErrorAlert(error?.message || "Ocurrió un error inesperado");
      }
    }
  };

  // 🕐 Función para formatear tiempo restante
  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
 
  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gray-100">
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-8">
        <Avatar />
        <Title className="text-gray-800">¡Bienvenido de vuelta!</Title>

        {/* 🆕 Indicador de estado de bloqueo */}
        {isBlocked && (
          <div className="w-full max-w-md mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-center">
              <p className="text-red-800 font-semibold">🔒 Cuenta bloqueada</p>
              <p className="text-red-600 text-sm mt-1">
                Tiempo restante: {formatTimeRemaining(blockTimeRemaining)}
              </p>
            </div>
          </div>
        )}

        {/* 🆕 Indicador de intentos restantes */}
        {!isBlocked && attemptsRemaining < 4 && (
          <div className="w-full max-w-md mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-center">
              <p className="text-yellow-800 font-semibold">⚠️ Intentos restantes: {attemptsRemaining}</p>
              <p className="text-yellow-600 text-xs mt-1">
                Después de 4 intentos fallidos serás bloqueado por 5 minutos
              </p>
            </div>
          </div>
        )}
 
        <form className="w-full max-w-md space-y-4" onSubmit={onSubmit}>
          <Input
            label="Correo"
            type="email"
            placeholder="ejemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isBlocked} // 🔒 Deshabilitar cuando esté bloqueado
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Al menos 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isBlocked} // 🔒 Deshabilitar cuando esté bloqueado
          />
          <div className="text-right text-sm">
            <Link to="/recuperar" className="text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Button 
            type="submit" 
            disabled={loading || isBlocked} // 🔒 Deshabilitar cuando esté bloqueado
          >
            {isBlocked 
              ? `Bloqueado (${formatTimeRemaining(blockTimeRemaining)})` 
              : loading 
                ? "Iniciando sesión..." 
                : "Iniciar sesión"
            }
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