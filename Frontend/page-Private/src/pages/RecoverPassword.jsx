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

  // Métodos de recuperación disponibles
  const recoveryMethods = [
    {
      id: "email",
      label: "Correo electrónico",
      placeholder: "ejemplo@email.com",
      icon: "📧",
      description: "Recuperar y cambiar contraseña",
      flow: "reset" // Flujo tradicional: código → nueva contraseña
    },
    {
      id: "sms",
      label: "SMS",
      placeholder: "+1234567890",
      icon: "📱",
      description: "Acceso rápido con código",
      flow: "quickLogin" // Flujo rápido: código → login directo
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      placeholder: "+1234567890",
      icon: "💬",
      description: "Acceso rápido con código",
      flow: "quickLogin" // Flujo rápido: código → login directo
    }
  ];

  // Validaciones según el método seleccionado
  const validateInput = (method, value) => {
    if (!value) return false;
    
    switch (method) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      case "sms":
      case "whatsapp":
        const phoneRegex = /^\+?[\d\s-()]{10,}$/;
        return phoneRegex.test(value);
      default:
        return false;
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
      console.log("Enviando solicitud:", { method: selectedMethod, contactInfo });
      
      const response = await axios.post("http://localhost:4000/api/recovery/requestCode",
        { 
          method: selectedMethod,
          contactInfo: contactInfo
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Respuesta exitosa:", response.data);
      // Navegar a la página de verificación con la información del método y flujo seleccionado
      const selectedMethodData = recoveryMethods.find(m => m.id === selectedMethod);
      navigate("/verification-input", { 
        state: { 
          method: selectedMethod, 
          contactInfo: contactInfo,
          maskedInfo: maskContactInfo(selectedMethod, contactInfo),
          flow: selectedMethodData.flow // 'reset' para email, 'quickLogin' para SMS/WhatsApp
        } 
      });
      
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Respuesta del servidor:", error.response?.data);
      console.error("Status code:", error.response?.status);
      
      setError(error.response?.data?.message || "Error al enviar el código");
    } finally {
      setLoading(false);
    }
  };

  // Función para enmascarar la información de contacto
  const maskContactInfo = (method, info) => {
    if (method === "email") {
      const [username, domain] = info.split("@");
      return `${username.charAt(0)}${"*".repeat(username.length - 2)}${username.charAt(username.length - 1)}@${domain}`;
    } else {
      return `${info.substring(0, 3)}${"*".repeat(info.length - 6)}${info.substring(info.length - 3)}`;
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
          Elige cómo quieres recuperar tu acceso. Con email cambiarás tu contraseña, con SMS/WhatsApp tendrás acceso inmediato.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {/* Selector de métodos de recuperación */}
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
                  className={`
                    flex items-center p-3 rounded-lg cursor-pointer border-2 transition-all
                    ${selectedMethod === method.id 
                      ? 'border-[#a100f2] bg-[#a100f2]/10' 
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }
                  `}
                >
                  <span className="text-xl mr-3">{method.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-white">{method.label}</div>
                    <div className="text-xs text-gray-300">{method.description}</div>
                    {method.flow === "quickLogin" && (
                      <div className="text-xs text-[#a100f2] mt-1">✨ Acceso instantáneo</div>
                    )}
                  </div>
                  <div className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${selectedMethod === method.id 
                      ? 'border-[#a100f2] bg-[#a100f2]' 
                      : 'border-gray-400'
                    }
                  `}>
                    {selectedMethod === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>

          {/* Input para información de contacto */}
          {selectedMethod && selectedMethodData && (
            <Input
              label={selectedMethodData.label}
              type={selectedMethod === "email" ? "email" : "tel"}
              placeholder={selectedMethodData.placeholder}
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
            />
          )}

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading || !selectedMethod}
            className={`
              bg-[#a100f2] hover:bg-[#7d00c1] disabled:opacity-50 disabled:cursor-not-allowed 
              ${loading ? 'opacity-50' : ''}
            `}
          >
            {loading ? "Enviando..." : 
             selectedMethodData?.flow === "quickLogin" ? "Enviar código de acceso" : "Enviar código"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RecoverPassword;