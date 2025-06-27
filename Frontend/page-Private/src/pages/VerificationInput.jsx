import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import illustration from "../images/verification-box.png";
import Title from "../components/RecoverPassword/Title";
import Button from "../components/Login/Button";

const VerificationInput = () => {
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [counter, setCounter] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  // Referencias para cada input (5 inputs ahora)
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];

  // Timer para reenvío
  useEffect(() => {
    const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  // Verificar si el código está completo
  useEffect(() => {
    const isCodeComplete = code.every(digit => digit !== "");
    setIsComplete(isCodeComplete);
    
    // OPCIONAL: Si quieres validación automática, descomenta la siguiente línea
    // Pero es mejor que el usuario haga clic en "Confirmar" para una mejor UX
    /*
    if (isCodeComplete && !loading) {
      handleVerify();
    }
    */
  }, [code]);

  // Manejar cambios en los inputs
  const handleInputChange = (index, value) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(""); // Limpiar errores

    // Auto-focus al siguiente input
    if (value && index < 4) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Manejar teclas especiales
  const handleKeyDown = (index, e) => {
    // Backspace - ir al input anterior si está vacío
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    
    // Arrow keys para navegación
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === "ArrowRight" && index < 4) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Manejar paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedCode = pastedData.replace(/\D/g, "").slice(0, 5);
    
    const newCode = [...code];
    for (let i = 0; i < 5; i++) {
      newCode[i] = pastedCode[i] || "";
    }
    setCode(newCode);

    // Focus en el último input lleno o el siguiente vacío
    const lastFilledIndex = pastedCode.length - 1;
    if (lastFilledIndex >= 0 && lastFilledIndex < 4) {
      inputRefs[lastFilledIndex + 1]?.current?.focus();
    }
  };

  // Verificar código con el backend
  const handleVerify = async () => {
    const verificationCode = code.join("");
    
    if (verificationCode.length !== 5) {
      setError("Por favor, ingresa el código completo de 5 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Verificando código:", verificationCode);
      
      const response = await axios.post("http://localhost:4000/api/recovery/verifyCode", {
        code: verificationCode
      }, {
        withCredentials: true, // Para enviar cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Respuesta del servidor:", response.data);
      
      // Solo navegar si la verificación fue exitosa
      if (response.status === 200) {
        console.log("Código verificado exitosamente");
        navigate("/reset-password", { 
          state: { 
            email: email,
            verified: true
          } 
        });
      }
      
    } catch (error) {
      console.error("Error al verificar código:", error);
      console.error("Status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 401) {
        setError("Sesión expirada. Solicita un nuevo código.");
        setTimeout(() => {
          navigate("/recover-password");
        }, 3000);
      } else if (error.response?.status === 400) {
        setError(error.response?.data?.message || "Código inválido");
      } else if (error.response?.status === 404) {
        setError("Servicio no disponible");
      } else {
        setError("Error al verificar el código. Inténtalo de nuevo.");
      }
      
      // Limpiar el código si hay error
      setCode(["", "", "", "", ""]);
      inputRefs[0].current?.focus();
      
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código - CORREGIDO para usar requestCode
  const handleResendCode = async () => {
    if (counter > 0) return;

    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:4000/api/recovery/requestCode", { 
        email: email 
      }, {
        withCredentials: true, // Para manejar cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setCounter(60); // Reiniciar timer
      setCode(["", "", "", "", ""]); // Limpiar código
      inputRefs[0].current?.focus();
      
      // Mensaje de éxito opcional
      console.log("Código reenviado exitosamente");
      
    } catch (error) {
      setError("Error al reenviar el código");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Redireccionar si no hay email
  useEffect(() => {
    if (!email) {
      navigate("/recuperar");
    }
  }, [email, navigate]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Ilustración */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-10">
        <img 
          src={illustration} 
          alt="Ilustración de verificación" 
          className="max-w-xs w-full" 
        />
      </div>

      {/* Formulario */}
      <div className="w-full lg:w-1/2 bg-[#2c2c34] text-white flex flex-col justify-center items-center p-10 space-y-6">
        <Title className="text-white">CÓDIGO DE VERIFICACIÓN</Title>
        <p className="text-center text-sm max-w-sm">
          Ingresa el código de 5 dígitos que enviamos a <br />
          <span className="text-[#a100f2] font-semibold">{email}</span>
        </p>

        {/* Códigos - 5 inputs */}
        <div className="flex space-x-3 mt-6">
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
                w-12 h-14 rounded-lg border-2 text-center text-xl font-semibold
                bg-white text-[#2c2c34] outline-none transition-all duration-200
                ${error ? 'border-red-400 animate-shake' : 'border-gray-300 focus:border-[#a100f2]'}
                ${digit ? 'bg-[#a100f2] text-white border-[#a100f2]' : ''}
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={loading}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center animate-fadeIn">
            {error}
          </p>
        )}

        {/* Timer */}
        <div className="text-center">
          {counter > 0 ? (
            <p className="text-xs text-white">
              Reenviar código en 00:{counter.toString().padStart(2, "0")}
            </p>
          ) : (
            <button
              onClick={handleResendCode}
              disabled={loading}
              className="text-xs text-[#a100f2] hover:text-[#7d00c1] underline disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? "Enviando..." : "Reenviar código"}
            </button>
          )}
        </div>

        {/* Botón de confirmar (solo si no es automático) */}
        <Button 
          onClick={handleVerify}
          disabled={!isComplete || loading}
          className={`
            bg-[#a100f2] hover:bg-[#7d00c1] transition-all duration-200
            ${(!isComplete || loading) ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {loading ? "Verificando..." : "Confirmar"}
        </Button>

        {/* Link para volver */}
        <button
          onClick={() => navigate("/recover-password")}
          className="text-sm text-gray-400 hover:text-white underline transition-colors duration-200"
        >
          ¿Email incorrecto? Cambiar email
        </button>
      </div>

      {/* Estilos CSS personalizados */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default VerificationInput;