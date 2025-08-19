import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
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
  const { checkAuth, setUser, setIsLoggedIn } = useAuth(); // usamos setters aquí

  const { method, contactInfo, email, maskedInfo, flow } = location.state || {};
  const displayEmail = email || contactInfo;

  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    console.log("🔍 VerificationInput - Datos recibidos:", {
      method,
      contactInfo,
      email,
      maskedInfo,
      flow,
      displayEmail
    });
  }, []);

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

    setLoading(true);
    setError("");

    try {
      const endpoint =
        flow === "quickLogin"
          ? "https://riveraproject-5.onrender.com/api/recovery/loginCode"
          : "https://riveraproject-5.onrender.com/api/recovery/verifyCode";

      const requestPayload =
        flow === "quickLogin"
          ? { code: verificationCode }
          : { code: verificationCode, method: method, contactInfo: displayEmail };

      const response = await axios.post(endpoint, requestPayload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        if (flow === "quickLogin") {
          console.log("🚀 Flujo quickLogin exitoso");
          const userFromServer = response.data?.user;
          // actualizamos el contexto directamente
          if (userFromServer && setUser && setIsLoggedIn) {
            setUser(userFromServer);
            setIsLoggedIn(true);
          }
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/reset-password", {
            state: { email: displayEmail, method: method, verified: true },
          });
        }
      }
    } catch (error) {
      console.error("❌ Error al verificar código:", error);
      if (error.response?.status === 401) {
        setError("Sesión expirada. Solicita un nuevo código.");
        setTimeout(() => {
          navigate("/recuperar");
        }, 3000);
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message;
        if (errorMessage === "Codigo incorrecto") {
          setError("Código incorrecto. Verifica e inténtalo de nuevo.");
        } else if (errorMessage === "Faltan datos o token no encontrado") {
          setError("Sesión expirada. Solicita un nuevo código.");
          setTimeout(() => {
            navigate("/recuperar");
          }, 2000);
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
      await axios.post(
        "https://riveraproject-5.onrender.com/api/recovery/requestCode",
        { method: method, contactInfo: displayEmail },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      setCounter(60);
      setCode(["", "", "", "", ""]);
      inputRefs[0].current?.focus();
    } catch (error) {
      console.error("❌ Error al reenviar código:", error);
      setError("Error al reenviar el código");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!displayEmail) {
      navigate("/recuperar");
    }
  }, [displayEmail, navigate]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-10">
        <img src={illustration} alt="Ilustración" className="max-w-xs w-full" />
      </div>

      <div className="w-full lg:w-1/2 bg-[#2c2c34] text-white flex flex-col justify-center items-center p-10 space-y-6">
        <Title className="text-white">CÓDIGO DE VERIFICACIÓN</Title>
        <p className="text-center text-sm max-w-sm">
          Ingresa el código de 5 dígitos que enviamos a{" "}
          <span className="text-[#a100f2] font-semibold">
            {maskedInfo || displayEmail}
          </span>
        </p>

        {flow === "quickLogin" && (
          <div className="bg-[#a100f2]/20 border border-[#a100f2] rounded-lg p-2 text-center">
            <p className="text-xs text-[#a100f2]">
              ⚡ Acceso instantáneo - Te logearás automáticamente
            </p>
          </div>
        )}

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
                bg-white text-[#2c2c34]
                ${error ? "border-red-400 animate-shake" : "border-gray-300 focus:border-[#a100f2]"}
                ${digit ? "bg-[#a100f2] text-white border-[#a100f2]" : ""}
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
              `}
              disabled={loading}
            />
          ))}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="text-center">
          {counter > 0 ? (
            <p className="text-xs text-white">
              Reenviar código en 00:{counter.toString().padStart(2, "0")}
            </p>
          ) : (
            <button
              onClick={handleResendCode}
              disabled={loading}
              className="text-xs text-[#a100f2] hover:text-[#7d00c1] underline"
            >
              {loading ? "Enviando..." : "Reenviar código"}
            </button>
          )}
        </div>

        <Button
          onClick={handleVerify}
          disabled={!isComplete || loading}
          className={`
            bg-[#a100f2] hover:bg-[#7d00c1]
            ${(!isComplete || loading) ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {loading ? "Verificando..." : flow === "quickLogin" ? "Iniciar sesión" : "Confirmar"}
        </Button>

        <button
          onClick={() => navigate("/recuperar")}
          className="text-sm text-gray-400 hover:text-white underline"
        >
          ¿Información incorrecta? Cambiar
        </button>
      </div>
    </div>
  );
};

export default VerificationInput;
