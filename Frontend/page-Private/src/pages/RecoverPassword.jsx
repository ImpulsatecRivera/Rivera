import { useState } from "react";
import axios from "axios";
import Input from "../components/RecoverPassword/input";
import Button from "../components/Login/Button";
import candado from "../images/candado.png";
import ilustracion from "../images/recover.png";
import Title from "../components/RecoverPassword/Title";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
      icon: "📧",
      description: "Recuperar y cambiar contraseña",
      flow: "reset"
    },
    {
      id: "sms",
      label: "SMS",
      placeholder: "+1234567890",
      icon: "📱",
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
        return /^\+?[\d\s-()]{10,}$/.test(value);
      default:
        return false;
    }
  };

  const maskContactInfo = (method, info) => {
    if (method === "email") {
      const [username, domain] = info.split("@");
      return `${username.charAt(0)}${"*".repeat(username.length - 2)}${username.charAt(username.length - 1)}@${domain}`;
    } else {
      return `${info.substring(0, 3)}${"*".repeat(info.length - 6)}${info.substring(info.length - 3)}`;
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
      setError(`Por favor, introduce un ${methodLabel.toLowerCase()} válido`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = "http://localhost:4000/api/recovery/requestCode";

      // ✅ Corregido: enviar datos según el método seleccionado
      const requestPayload = selectedMethod === "email" 
        ? { email: contactInfo, via: "email" }        // Para email: enviar email
        : { phone: contactInfo, via: "sms" };         // Para SMS: enviar phone

      console.log("Enviando payload:", requestPayload); // Para debugging

      const response = await axios.post(endpoint, requestPayload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Respuesta del servidor:", response.data);

      navigate("/verification-input", {
        state: {
          method: selectedMethod,
          contactInfo: contactInfo,
          email: contactInfo,
          maskedInfo: maskContactInfo(selectedMethod, contactInfo),
          flow: "reset",
          verificationEndpoint: "/api/recovery/verifyCode"
        }
      });

    } catch (error) {
      console.error("Error completo:", error);
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setError("No se puede conectar al servidor. Verifica que esté ejecutándose.");
      } else if (error.response?.status === 404) {
        setError("Endpoint no encontrado. Verifica la URL del API.");
      } else if (error.response?.status === 400) {
        const backendMessage = error.response?.data?.message || "Error de validación en el servidor";
        
        // Mensajes más amigables para el usuario
        if (backendMessage === "Usuario no existente") {
          setError("No encontramos una cuenta asociada a este email. Verifica que sea correcto o contacta al administrador.");
        } else if (backendMessage === "Email es requerido") {
          setError("Por favor, ingresa tu email.");
        } else if (backendMessage === "Tu cuenta no tiene un número de teléfono registrado. Usa email como método de envío.") {
          setError("Tu cuenta no tiene teléfono registrado. Cambia a recuperación por email.");
          setSelectedMethod("email"); // Cambiar automáticamente a email
        } else {
          setError(backendMessage);
        }
        
        console.log("Error 400 detalles:", error.response.data);
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-10">
        <img src={ilustracion} alt="Ilustración de recuperación" className="max-w-xs w-full" />
      </div>

      <div className="w-full lg:w-1/2 bg-[#2c2c34] text-white flex flex-col justify-center items-center p-10 space-y-6">
        <img src={candado} alt="Icono de candado" className="w-24 h-24 mb-4" />
        <Title className="text-white">RECUPERAR ACCESO</Title>
        <p className="text-center text-white text-sm max-w-sm">
          Elige cómo quieres recuperar tu acceso. Te enviaremos un código para cambiar tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
          {/* Selector de método estilo tabs */}
          <div className="flex bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm border border-gray-700/50">
            {recoveryMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => {
                  setSelectedMethod(method.id);
                  setContactInfo("");
                  setError("");
                }}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                  selectedMethod === method.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {method.id === "email" ? (
                  <span className="material-icons">mail</span>
                ) : (
                  <span className="material-icons">phone</span>
                )}
                <span>{method.label}</span>
              </button>
            ))}
          </div>

          {/* Input con animación */}
          <AnimatePresence mode="wait">
            {selectedMethod && (
              <motion.div
                key={selectedMethod}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Input
                  type={selectedMethod === "email" ? "email" : "tel"}
                  placeholder={selectedMethodData?.placeholder}
                  value={contactInfo}
                  onChange={(e) => {
                    setContactInfo(e.target.value);
                    setError("");
                  }}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#a100f2]"
                />
                {/* Mostrar qué tipo de dato se espera */}
                <p className="text-xs text-gray-400 mt-1">
                  {selectedMethod === "email" 
                    ? "Ingresa tu email registrado" 
                    : "Ingresa tu número de teléfono (se enviará código por medio de sms)"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !selectedMethod || !contactInfo}
            className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
              loading ? 'opacity-50' : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Enviando...</span>
              </div>
            ) : (
              "Enviar código"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RecoverPassword;