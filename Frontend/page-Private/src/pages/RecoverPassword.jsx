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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Validación de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Por favor, introduce tu correo electrónico");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Por favor, introduce un correo electrónico válido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Enviando solicitud con email:", email);
      
      const response = await axios.post("http://localhost:4000/api/recovery/requestCode", 
        { email },
        {
          withCredentials: true, // Para manejar cookies
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Respuesta exitosa:", response.data);
      // Éxito - navegar a la siguiente página
      navigate("/verification-input", { state: { email } });
      
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Respuesta del servidor:", error.response?.data);
      console.error("Status code:", error.response?.status);
      
      setError(error.response?.data?.message || "Error al enviar el código");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-10">
        <img src={ilustracion} alt="Ilustración de recuperación" className="max-w-xs w-full" />
      </div>

      <div className="w-full lg:w-1/2 bg-[#2c2c34] text-white flex flex-col justify-center items-center p-10 space-y-6">
        <img src={candado} alt="Icono de candado" className="w-24 h-24 mb-4" />
        <Title className="text-white">RECUPERAR CONTRASEÑA</Title>
        <p className="text-center text-white text-sm max-w-sm">
          Para recuperar tu contraseña, introduce el correo con el que te registraste.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <Input 
            label="Correo" 
            type="email" 
            placeholder="ejemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          
          <Button 
            type="submit"
            disabled={loading}
            className={`bg-[#a100f2] hover:bg-[#7d00c1] disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? "Enviando..." : "Enviar código"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RecoverPassword;