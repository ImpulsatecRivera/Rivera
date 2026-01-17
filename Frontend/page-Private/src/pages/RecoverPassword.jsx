import { useState } from "react";
import axios from "axios";
import Button from "../components/Login/Button";
import ilustracion from "../assets/lotties/Login.json";
import Lottie from "lottie-react"
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { config } from "../config";

const API_URL = config.api.API_URL;

const RecoverPassword = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const recoveryMethods = [
    {
      id: "email",
      label: "Correo electrónico",
      placeholder: "ejemplo@email.com",
      description: "Recuperar y cambiar contraseña",
      flow: "reset"
    },
    {
      id: "sms",
      label: "SMS",
      placeholder: "7123-4567 o +503 7123-4567",
      description: "Recuperar y cambiar contraseña",
      flow: "reset"
    }
  ];

  const validateInput = (method, value) => {
    if (!value) return false;
    
    switch (method) {
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case "sms":
        const cleanPhone = value.replace(/[\s\-()]/g, '');
        return /^(\+?503)?[267]\d{7}$/.test(cleanPhone);
      default:
        return false;
    }
  };

  const normalizePhone = (phone) => {
    let cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('503')) {
        cleanPhone = '+' + cleanPhone;
      } else {
        cleanPhone = '+503' + cleanPhone;
      }
    }
    
    return cleanPhone;
  };

  const maskContactInfo = (method, info) => {
    if (method === "email") {
      const [username, domain] = info.split("@");
      return `${username.charAt(0)}${"*".repeat(username.length - 2)}${username.charAt(username.length - 1)}@${domain}`;
    } else {
      return `${info.substring(0, 4)}${"*".repeat(info.length - 7)}${info.substring(info.length - 3)}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMethod) {
      setError("Por favor, selecciona un método de recuperación");
      return;
    }

    if (!contactInfo) {
      setError("Por favor, introduce tu información de contacto");
      return;
    }

    if (!validateInput(selectedMethod, contactInfo)) {
      const methodLabel = recoveryMethods.find(m => m.id === selectedMethod)?.label;
      if (selectedMethod === "sms") {
        setError("Ingresa un número válido (ej: 7123-4567 o +503 7123-4567)");
      } else {
        setError(`Por favor, introduce un ${methodLabel.toLowerCase()} válido`);
      }
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = `${API_URL}/recovery/requestCode`;
      let requestPayload;

      if (selectedMethod === "email") {
        requestPayload = { 
          email: contactInfo.trim().toLowerCase(), 
          via: "email" 
        };
      } else {
        const normalizedPhone = normalizePhone(contactInfo.trim());
        requestPayload = { 
          phone: normalizedPhone, 
          via: "sms" 
        };
      }

      console.log("🚀 Método seleccionado:", selectedMethod);
      console.log("📝 Info original:", contactInfo);
      console.log("📤 Enviando payload:", requestPayload);

      const response = await axios.post(endpoint, requestPayload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ Respuesta del servidor:", response.data);

      const recoveryToken = response.data.recoveryToken;
      
      console.log("🔑 Token extraído:", recoveryToken);

      if (!recoveryToken) {
        console.error("❌ ERROR: No se recibió recoveryToken del servidor");
        setError("Error del servidor: no se generó el token de verificación");
        return;
      }

      navigate("/verification-input", {
        state: {
          method: selectedMethod,
          contactInfo: selectedMethod === "email" ? contactInfo : normalizePhone(contactInfo),
          email: selectedMethod === "email" ? contactInfo : null,
          phone: selectedMethod === "sms" ? normalizePhone(contactInfo) : null,
          maskedInfo: maskContactInfo(selectedMethod, contactInfo),
          flow: "reset",
          verificationEndpoint: "/recovery/verifyCode",
          recoveryToken: recoveryToken
        }
      });

      console.log("🎯 Navegando con token:", {
        method: selectedMethod,
        hasToken: !!recoveryToken,
        tokenLength: recoveryToken?.length
      });

    } catch (error) {
      console.error("❌ Error completo:", error);
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setError("No se puede conectar al servidor. Verifica que esté ejecutándose.");
      } else if (error.response?.status === 404) {
        setError("Endpoint no encontrado. Verifica la URL del API.");
      } else if (error.response?.status === 400) {
        const backendMessage = error.response?.data?.message || "Error de validación en el servidor";
        
        if (backendMessage.includes("Usuario no encontrado") || backendMessage.includes("Usuario no existente")) {
          if (selectedMethod === "email") {
            setError("No encontramos una cuenta con este email. Verifica que sea correcto.");
          } else {
            setError("No encontramos una cuenta con este número. Verifica que sea correcto.");
          }
        } else if (backendMessage === "Email es requerido") {
          setError("Por favor, ingresa tu email.");
        } else if (backendMessage === "Número de teléfono es requerido") {
          setError("Por favor, ingresa tu número de teléfono.");
        } else if (backendMessage.includes("no tiene número de teléfono registrado") || 
                   backendMessage.includes("no tiene un número de teléfono")) {
          setError("Tu cuenta no tiene teléfono registrado. Usa recuperación por email.");
          setSelectedMethod("email");
          setContactInfo("");
        } else {
          setError(backendMessage);
        }
        
        console.log("📋 Error 400 detalles:", error.response.data);
      } else if (error.response?.status === 500) {
        setError("Error interno del servidor. Inténtalo más tarde.");
      } else {
        setError(error.response?.data?.message || "Error al enviar el código");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedMethodData = recoveryMethods.find(method => method.id === selectedMethod);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Sección de ilustración */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-10">
        <div className="w-full max-w-lg">
          <Lottie 
            animationData={ilustracion} 
            loop={true}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* Sección de formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold text-gray-900">
              Recuperar acceso
            </h1>
            <p className="text-gray-600 text-sm">
              Selecciona cómo deseas recuperar tu cuenta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selector de método */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Método de recuperación
              </label>
              <div className="grid grid-cols-2 gap-3">
                {recoveryMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(method.id);
                      setContactInfo("");
                      setError("");
                    }}
                    className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                      selectedMethod === method.id
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input con animación */}
            <AnimatePresence mode="wait">
              {selectedMethod && (
                <motion.div
                  key={selectedMethod}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-gray-700">
                    {selectedMethod === "email" ? "Correo electrónico" : "Número de teléfono"}
                  </label>
                  <input
                    type={selectedMethod === "email" ? "email" : "tel"}
                    placeholder={selectedMethodData?.placeholder}
                    value={contactInfo}
                    onChange={(e) => {
                      setContactInfo(e.target.value);
                      setError("");
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400 outline-none"
                  />
                  <p className="text-xs text-gray-500">
                    {selectedMethod === "email" 
                      ? "Ingresa tu correo electrónico registrado" 
                      : "Ingresa tu número registrado (ej: 7123-4567)"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading || !selectedMethod || !contactInfo}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                loading ? 'opacity-75' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando código...</span>
                </div>
              ) : (
                "Continuar"
              )}
            </Button>
          </form>

          {/* Info adicional */}
          {selectedMethod && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                {selectedMethod === "email" 
                  ? "Recibirás un código de verificación en tu correo electrónico"
                  : "Recibirás un código de verificación vía SMS"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecoverPassword;