import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/authContext";
import axios from "axios";
import Lottie from "lottie-react";
import verificationAnimation from "../assets/lotties/Two factor authentication.json"; // Asegúrate de tener este archivo
import Button from "../components/Login/Button";
import { config } from "../config";

const API_URL = config.api.API_URL;

const VerificationInput = () => {
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [counter, setCounter] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth, setUser, setIsLoggedIn } = useAuth();

  const { method, contactInfo, email, maskedInfo, flow, recoveryToken } = location.state || {};
  const displayEmail = email || contactInfo;

  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    console.log("🔍 VerificationInput - Datos recibidos:", {
      method,
      contactInfo,
      email,
      maskedInfo,
      flow,
      displayEmail,
      recoveryToken: recoveryToken ? "✅ Presente" : "❌ Faltante"
    });

    if (!displayEmail) {
      console.error("❌ Email/contactInfo faltante, redirigiendo...");
      navigate("/recuperar");
      return;
    }

    if (flow !== "quickLogin" && !recoveryToken) {
      console.error("❌ Recovery token faltante para flujo de recuperación");
      setError("Sesión expirada. Solicita un nuevo código.");
      setTimeout(() => {
        navigate("/recuperar");
      }, 2000);
    }
  }, [displayEmail, navigate, flow, recoveryToken]);

  useEffect(() => {
    const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  useEffect(() => {
    const isCodeComplete = code.every((digit) => digit !== "");
    setIsComplete(isCodeComplete);
  }, [code]);

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");
    if (value && index < 4) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === "ArrowRight" && index < 4) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedCode = pastedData.replace(/\D/g, "").slice(0, 5);
    const newCode = [...code];
    for (let i = 0; i < 5; i++) {
      newCode[i] = pastedCode[i] || "";
    }
    setCode(newCode);
    const lastFilledIndex = pastedCode.length - 1;
    if (lastFilledIndex >= 0 && lastFilledIndex < 4) {
      inputRefs[lastFilledIndex + 1]?.current?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 5) {
      setError("Por favor, ingresa el código completo de 5 dígitos");
      return;
    }

    console.log("🔍 DEBUG - State completo recibido:", location.state);
    console.log("🔍 DEBUG - recoveryToken:", recoveryToken);
    console.log("🔍 DEBUG - Tipo de recoveryToken:", typeof recoveryToken);

    if (flow !== "quickLogin" && !recoveryToken) {
      console.error("❌ Token faltante - State actual:", location.state);
      setError("Token de sesión faltante. Solicita un nuevo código.");
      setTimeout(() => navigate("/recuperar"), 2000);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint =
        flow === "quickLogin"
          ? `${API_URL}/recovery/loginCode`
          : `${API_URL}/recovery/verifyCode`;

      let requestPayload;
      
      if (flow === "quickLogin") {
        requestPayload = { 
          code: verificationCode,
          verifiedToken: recoveryToken || ""
        };
      } else {
        requestPayload = { 
          code: verificationCode, 
          recoveryToken: recoveryToken
        };
      }

      console.log("📤 DEBUG - Payload completo:", requestPayload);
      console.log("📤 DEBUG - Endpoint:", endpoint);
      console.log("📤 DEBUG - recoveryToken presente:", !!recoveryToken);
      console.log("📤 DEBUG - recoveryToken valor:", recoveryToken);

      const response = await axios.post(endpoint, requestPayload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Respuesta exitosa:", response.status);

      if (response.status === 200) {
        if (flow === "quickLogin") {
          console.log("🚀 Flujo quickLogin exitoso");
          const userFromServer = response.data?.user;
          if (userFromServer && setUser && setIsLoggedIn) {
            setUser(userFromServer);
            setIsLoggedIn(true);
          }
          navigate("/dashboard", { replace: true });
        } else {
          const verifiedToken = response.data.verifiedToken;
          navigate("/reset-password", {
            state: { 
              email: displayEmail, 
              method: method, 
              verified: true,
              verifiedToken: verifiedToken
            },
          });
        }
      }
    } catch (error) {
      console.error("❌ Error al verificar código:", error);
      
      if (error.response?.status === 401) {
        const errorMsg = error.response?.data?.message;
        if (errorMsg?.includes("expirado")) {
          setError("El código ha expirado. Solicita un nuevo código.");
        } else {
          setError("Token inválido. Solicita un nuevo código.");
        }
        setTimeout(() => navigate("/recuperar"), 3000);
        
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message;
        
        if (errorMessage?.includes("Token de recuperación requerido")) {
          setError("Sesión expirada. Solicita un nuevo código.");
          setTimeout(() => navigate("/recuperar"), 2000);
        } else if (errorMessage?.includes("Código inválido") || errorMessage?.includes("incorrecto")) {
          setError("Código incorrecto. Verifica e inténtalo de nuevo.");
        } else if (errorMessage?.includes("Faltan datos")) {
          setError("Sesión expirada. Solicita un nuevo código.");
          setTimeout(() => navigate("/recuperar"), 2000);
        } else {
          setError(errorMessage || "Código inválido");
        }
        
      } else if (error.response?.status === 404) {
        setError("Servicio no disponible");
      } else if (
        error.code === "ECONNREFUSED" ||
        error.code === "ERR_NETWORK"
      ) {
        setError(
          "No se puede conectar al servidor. Verifica que esté ejecutándose."
        );
      } else {
        setError("Error al verificar el código. Inténtalo de nuevo.");
      }
      
      setCode(["", "", "", "", ""]);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (counter > 0) return;
    setLoading(true);
    setError("");
    
    try {
      const resendPayload = {
        email: displayEmail,
        via: method === "sms" ? "sms" : "email"
      };

      console.log("📤 Reenviando código:", resendPayload);

      const response = await axios.post(
        `${API_URL}/recovery/requestCode`,
        resendPayload,
        { 
          withCredentials: true, 
          headers: { "Content-Type": "application/json" } 
        }
      );

      if (response.data.success) {
        const newRecoveryToken = response.data.recoveryToken;
        if (newRecoveryToken) {
          window.history.replaceState({
            ...location.state,
            recoveryToken: newRecoveryToken
          }, "");
        }
        
        setCounter(60);
        setCode(["", "", "", "", ""]);
        inputRefs[0].current?.focus();
        console.log("✅ Código reenviado exitosamente");
      }
    } catch (error) {
      console.error("❌ Error al reenviar código:", error);
      setError("Error al reenviar el código. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Sección de ilustración */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-10">
        <div className="w-full max-w-md">
          <Lottie 
            animationData={verificationAnimation} 
            loop={true}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* Sección de verificación */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-semibold text-gray-900">
              Verifica tu código
            </h1>
            
            <p className="text-sm text-gray-600">
              Ingresa el código de 5 dígitos que enviamos a{" "}
              <span className="font-medium text-blue-600">
                {maskedInfo || displayEmail}
              </span>
            </p>
          </div>

          {/* Alertas */}
          {flow === "quickLogin" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700 text-center">
                ⚡ Acceso instantáneo - Te logearás automáticamente
              </p>
            </div>
          )}

          {flow !== "quickLogin" && !recoveryToken && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 text-center">
                ⚠️ Sesión expirada - Serás redirigido
              </p>
            </div>
          )}

          {/* Inputs del código */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700 block text-center">
              Código de verificación
            </label>
            
            <div className="flex justify-center gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`
                    w-14 h-16 text-center text-2xl font-semibold rounded-lg
                    border-2 transition-all outline-none
                    ${error 
                      ? "border-red-300 bg-red-50 text-red-600" 
                      : digit 
                        ? "border-blue-600 bg-blue-50 text-blue-700" 
                        : "border-gray-200 bg-gray-50 text-gray-900"
                    }
                    ${!error && !digit ? "focus:border-blue-500 focus:bg-white" : ""}
                    ${loading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Botón de verificar */}
          <Button
            onClick={handleVerify}
            disabled={!isComplete || loading || (flow !== "quickLogin" && !recoveryToken)}
            className={`
              w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              ${loading ? 'opacity-75' : ''}
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verificando...</span>
              </div>
            ) : (
              flow === "quickLogin" ? "Iniciar sesión" : "Verificar código"
            )}
          </Button>

          {/* Reenviar código */}
          <div className="text-center space-y-2">
            {counter > 0 ? (
              <p className="text-sm text-gray-600">
                ¿No recibiste el código?{" "}
                <span className="font-medium text-gray-900">
                  Reenviar en {counter}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? "Enviando..." : "Reenviar código"}
              </button>
            )}
          </div>

          {/* Cambiar información */}
          <div className="text-center pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate("/recuperar")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ¿Información incorrecta? <span className="font-medium">Cambiar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationInput;