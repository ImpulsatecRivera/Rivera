import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Input from "../components/Login/Input";
import Button from "../components/Login/Button";
import Title from "../components/RecoverPassword/Title";
import resetImage from "../images/reset-password.png";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Extraer TODOS los datos del state, incluyendo verifiedToken
  const email = location.state?.email;
  const verified = location.state?.verified;
  const verifiedToken = location.state?.verifiedToken; // ✅ ESTO ES LO QUE FALTABA

  // Redireccionar si no viene del flujo correcto
  useEffect(() => {
    console.log("🔍 ResetPassword - Datos recibidos:", {
      email,
      verified,
      verifiedToken: verifiedToken ? "✅ Presente" : "❌ Faltante"
    });

    if (!email || !verified) {
      console.error("❌ Falta email o verificación, redirigiendo...");
      navigate("/recover-password");
      return;
    }

    // ✅ Validar que tenemos el verifiedToken
    if (!verifiedToken) {
      console.error("❌ verifiedToken faltante");
      setError("Token de verificación faltante. Solicita un nuevo código.");
      setTimeout(() => {
        navigate("/recuperar");
      }, 2000);
    }
  }, [email, verified, verifiedToken, navigate]);

  // Validaciones de contraseña
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
      errors: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones frontend
    if (!newPassword || !confirmPassword) {
      setError("Por favor, completa todos los campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError("La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números");
      return;
    }

    // ✅ Validar que tenemos el token antes de proceder
    if (!verifiedToken) {
      setError("Token de verificación faltante. Solicita un nuevo código.");
      setTimeout(() => navigate("/recuperar"), 2000);
      return;
    }

    setLoading(true);

    try {
      console.log("=== RESET PASSWORD DEBUG ===");
      console.log("Email:", email);
      console.log("Token presente:", !!verifiedToken);
      console.log("Enviando nueva contraseña...");

      // ✅ CRÍTICO: Incluir el verifiedToken en el payload
      const response = await axios.post("https://riveraproject-production.up.railway.app/api/recovery/newPassword", {
        newPassword: newPassword,
        verifiedToken: verifiedToken  // ✅ ENVIAR EL TOKEN EN EL BODY
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Respuesta exitosa:", response.data);
      
      setSuccess(true);
      
      // Mostrar mensaje de éxito y redireccionar después de 3 segundos
      setTimeout(() => {
        navigate("/", { 
          state: { 
            message: "Contraseña actualizada correctamente. Puedes iniciar sesión." 
          }
        });
      }, 3000);

    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      console.error("Status:", error.response?.status);
      console.error("Response data:", error.response?.data);

      if (error.response?.status === 401) {
        setError("Sesión expirada. Por favor, solicita un nuevo código.");
        setTimeout(() => {
          navigate("/recover-password");
        }, 2000);
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message;
        
        if (errorMessage?.includes("Token de verificación requerido")) {
          setError("Token de verificación faltante. Solicita un nuevo código.");
          setTimeout(() => navigate("/recuperar"), 2000);
        } else if (errorMessage?.includes("Token inválido") || errorMessage?.includes("expirado")) {
          setError("Token expirado. Solicita un nuevo código.");
          setTimeout(() => navigate("/recuperar"), 2000);
        } else if (errorMessage?.includes("Código no verificado")) {
          setError("Código no verificado previamente. Solicita un nuevo código.");
          setTimeout(() => navigate("/recuperar"), 2000);
        } else {
          setError(errorMessage || "Error en la validación");
        }
      } else {
        setError("Error al actualizar la contraseña. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Si ya fue exitoso, mostrar mensaje de confirmación
  if (success) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-10">
          <img src={resetImage} alt="Ilustración reset password" className="max-w-xs w-full" />
        </div>

        <div className="w-full lg:w-1/2 bg-[#2c2c34] text-white flex flex-col justify-center items-center p-10 space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">✅</div>
            <Title className="text-white">¡Contraseña Actualizada!</Title>
            <p className="text-center text-sm max-w-sm text-green-400">
              Tu contraseña ha sido actualizada correctamente.
            </p>
            <p className="text-center text-sm max-w-sm text-gray-300">
              Serás redirigido al inicio de sesión en unos segundos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Imagen lateral izquierda */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-10">
        <img src={resetImage} alt="Ilustración reset password" className="max-w-xs w-full" />
      </div>

      {/* Formulario */}
      <div className="w-full lg:w-1/2 bg-[#2c2c34] text-white flex flex-col justify-center items-center p-10 space-y-6">
        <Title className="text-white">Recuperación de contraseña</Title>
        <p className="text-sm text-center max-w-sm text-white">
          Ingresa tu nueva contraseña para la cuenta: <br />
          <span className="text-[#a100f2] font-semibold">{email}</span>
        </p>

        {/* ✅ Mostrar advertencia si falta el token */}
        {!verifiedToken && (
          <div className="bg-red-500/20 border border-red-400 rounded-lg p-3 text-center max-w-sm">
            <p className="text-red-400 text-xs">
              ⚠️ Token de verificación faltante. Serás redirigido...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {/* Campo Nueva Contraseña */}
          <div className="relative">
            <Input 
              label="Nueva Contraseña" 
              type={showNewPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-white transition-colors duration-200"
            >
              {showNewPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.122 3.122M12 12l6.878-6.878" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Campo Confirmar Contraseña */}
          <div className="relative">
            <Input 
              label="Confirma tu contraseña" 
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-white transition-colors duration-200"
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.122 3.122M12 12l6.878-6.878" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Indicador de fortaleza de contraseña */}
          {newPassword && (
            <div className="text-xs space-y-1">
              <p className="text-gray-300">Requisitos de contraseña:</p>
              <div className="space-y-1">
                <div className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-green-400' : 'text-red-400'}`}>
                  <span>{newPassword.length >= 8 ? '✅' : '❌'}</span>
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div className={`flex items-center gap-2 ${/[A-Z]/.test(newPassword) ? 'text-green-400' : 'text-red-400'}`}>
                  <span>{/[A-Z]/.test(newPassword) ? '✅' : '❌'}</span>
                  <span>Al menos una mayúscula</span>
                </div>
                <div className={`flex items-center gap-2 ${/[a-z]/.test(newPassword) ? 'text-green-400' : 'text-red-400'}`}>
                  <span>{/[a-z]/.test(newPassword) ? '✅' : '❌'}</span>
                  <span>Al menos una minúscula</span>
                </div>
                <div className={`flex items-center gap-2 ${/\d/.test(newPassword) ? 'text-green-400' : 'text-red-400'}`}>
                  <span>{/\d/.test(newPassword) ? '✅' : '❌'}</span>
                  <span>Al menos un número</span>
                </div>
              </div>
            </div>
          )}

          {/* Indicador de coincidencia */}
          {confirmPassword && (
            <div className={`text-xs flex items-center gap-2 ${
              newPassword === confirmPassword ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{newPassword === confirmPassword ? '✅' : '❌'}</span>
              <span>Las contraseñas coinciden</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-400 rounded-lg p-3 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button 
            type="submit"
            disabled={loading || !newPassword || !confirmPassword || !verifiedToken}
            className={`bg-[#a100f2] hover:bg-[#7d00c1] transition-all duration-200 ${
              (loading || !newPassword || !confirmPassword || !verifiedToken) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? "Actualizando..." : "Confirmar Nueva Contraseña"}
          </Button>
        </form>

        {/* Link para volver */}
        <button
          onClick={() => navigate("/recuperar")}
          className="text-sm text-gray-400 hover:text-white underline transition-colors duration-200"
        >
          ← Volver al inicio del proceso
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;