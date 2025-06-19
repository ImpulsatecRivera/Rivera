// src/pages/VerificationInput.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import illustration from "../images/verification-box.png";
import Title from "../components/RecoverPassword/Title";
import Button from "../components/Login/Button";

const VerificationInput = () => {
  const [counter, setCounter] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  const handleVerify = () => {
    // Aquí puedes validar el código si fuera necesario
    navigate("/reset-password");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Ilustración */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-10">
        <img src={illustration} alt="Ilustración de verificación" className="max-w-xs w-full" />
      </div>

      {/* Formulario */}
      <div className="w-full lg:w-1/2 bg-[#2c2c34] text-white flex flex-col justify-center items-center p-10 space-y-6">
        <Title className="text-white">CÓDIGO DE VERIFICACIÓN</Title>
        <p className="text-center text-sm max-w-sm">
          Ingrese su correo electrónico para enviarle el código de verificación.
        </p>

        {/* Códigos */}
        <div className="flex space-x-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-10 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center text-xl font-semibold bg-white text-[#a100f2]"
            >
              {i + 3}
            </div>
          ))}
        </div>

        {/* Timer */}
        <p className="text-xs text-white mt-4">
          Espera 00:{counter.toString().padStart(2, "0")}{" "}
          <span className="text-purple-400 cursor-pointer hover:underline">
            Enviar nuevo código
          </span>
        </p>

        {/* Botón de confirmar */}
        <Button onClick={handleVerify} className="bg-[#a100f2] hover:bg-[#7d00c1]">
          Confirmar
        </Button>
      </div>
    </div>
  );
};

export default VerificationInput;
