import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import resetAnimation from "../assets/lotties/Forgot Password Animation.json"; // Usa el mismo o descarga uno de password
import Button from "../components/Login/Button";
import { config } from "../config";

const API_URL = config.api.API_URL; 

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
  
  const email = location.state?.email;
  const verified = location.state?.verified;
  const verifiedToken = location.state?.verifiedToken;

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

    if (!verifiedToken) {
      console.error("❌ verifiedToken faltante");
      setError("Token de verificación faltante. Solicita un nuevo código.");
      setTimeout(() => {
        navigate("/recuperar");
      }, 2000);
    }
  }, [email, verified, verifiedToken, navigate]);

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

      const response = await axios.post(`${API_URL}/recovery/newPassword`, {
        newPassword: newPassword,
        verifiedToken: verifiedToken
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Respuesta exitosa:", response.data);
      
      setSuccess(true);
      
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

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-white">
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-10">
          <div className="w-full max-w-md">
            <Lottie 
              animationData={resetAnimation} 
              loop={false}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold text-gray-900">
                ¡Contraseña actualizada!
              </h1>
              <p className="text-gray-600">
                Tu contraseña ha sido cambiada correctamente.
              </p>
              <p className="text-sm text-gray-500">
                Redirigiendo al inicio de sesión...
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario principal
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Sección de ilustración */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-10">
        <div className="w-full max-w-lg">
          <Lottie 
            animationData={resetAnimation} 
            loop={true}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* Sección de formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-semibold text-gray-900">
              Nueva contraseña
            </h1>
            
            <p className="text-sm text-gray-600">
              Crea una contraseña segura para{" "}
              <span className="font-medium text-blue-600">
                {email}
              </span>
            </p>
          </div>

          {/* Alerta de token faltante */}
          {!verifiedToken && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 text-center">
                ⚠️ Token de verificación faltante
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Nueva Contraseña */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400 outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
            </div>

            {/* Campo Confirmar Contraseña */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400 outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
            </div>

            {/* Requisitos de contraseña */}
            {newPassword && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-gray-700">Requisitos de contraseña:</p>
                <div className="space-y-1.5">
                  <div className={`flex items-center gap-2 text-xs ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${newPassword.length >= 8 ? 'bg-green-100' : 'bg-gray-200'}`}>
                      {newPassword.length >= 8 ? '✓' : '○'}
                    </div>
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[A-Z]/.test(newPassword) ? 'bg-green-100' : 'bg-gray-200'}`}>
                      {/[A-Z]/.test(newPassword) ? '✓' : '○'}
                    </div>
                    <span>Al menos una mayúscula</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[a-z]/.test(newPassword) ? 'bg-green-100' : 'bg-gray-200'}`}>
                      {/[a-z]/.test(newPassword) ? '✓' : '○'}
                    </div>
                    <span>Al menos una minúscula</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/\d/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/\d/.test(newPassword) ? 'bg-green-100' : 'bg-gray-200'}`}>
                      {/\d/.test(newPassword) ? '✓' : '○'}
                    </div>
                    <span>Al menos un número</span>
                  </div>
                </div>
              </div>
            )}

            {/* Indicador de coincidencia */}
            {confirmPassword && (
              <div className={`flex items-center gap-2 text-sm ${
                newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  newPassword === confirmPassword ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {newPassword === confirmPassword ? '✓' : '✗'}
                </div>
                <span>{newPassword === confirmPassword ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <Button 
              type="submit"
              disabled={loading || !newPassword || !confirmPassword || !verifiedToken}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                loading ? 'opacity-75' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Actualizando...</span>
                </div>
              ) : (
                "Cambiar contraseña"
              )}
            </Button>
          </form>

          {/* Link para volver */}
          <div className="text-center pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate("/recuperar")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;