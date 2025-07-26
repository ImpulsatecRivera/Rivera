import { useState } from "react";
import axios from "axios";
import Input from "../components/Login/Input";
import Button from "../components/Login/Button";
import candado from "../images/candado.png";
import ilustracion from "../images/recover.png";
import Title from "../components/RecoverPassword/Title";
import { useNavigate } from "react-router-dom";

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

      const requestPayload = {
        contactInfo: contactInfo,
        method: selectedMethod
      };

      const response = await axios.post(endpoint, requestPayload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

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
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setError("No se puede conectar al servidor. Verifica que esté ejecutándose.");
      } else if (error.response?.status === 404) {
        setError("Endpoint no encontrado. Verifica la URL del API.");
      } else if (error.response?.status === 400) {
        const backendMessage = error.response?.data?.message || "Error de validación en el servidor";
        setError(`Error 400: ${backendMessage}`);
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

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div className="space-y-3">
            <label className="block text-white text-sm font-medium">
              Método de recuperación
            </label>
            {recoveryMethods.map((method) => (
              <div key={method.id} className="relative">
                <input
                  type="radio"
                  id={method.id}
                  name="recoveryMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => {
                    setSelectedMethod(e.target.value);
                    setContactInfo("");
                    setError("");
                  }}
                  className="sr-only"
                />
                <label
                  htmlFor={method.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer border-2 transition-all ${
                    selectedMethod === method.id 
                      ? 'border-[#a100f2] bg-[#a100f2]/10' 
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                  }`}
                >
                  <span className="text-xl mr-3">{method.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-white">{method.label}</div>
                    <div className="text-xs text-gray-300">{method.description}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === method.id 
                      ? 'border-[#a100f2] bg-[#a100f2]' 
                      : 'border-gray-400'
                  }`}>
                    {selectedMethod === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>

          {selectedMethod && (
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
          )}

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading || !selectedMethod}
            className={`bg-[#a100f2] hover:bg-[#7d00c1] disabled:opacity-50 disabled:cursor-not-allowed ${
              loading ? 'opacity-50' : ''
            }`}
          >
            {loading ? "Enviando..." : "Enviar código"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RecoverPassword;