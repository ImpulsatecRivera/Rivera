import { useNavigate } from "react-router-dom";
import Input from "../components/Login/Input";
import Button from "../components/Login/Button";
import ilustracion from "../images/verification.png";
import Title from "../components/RecoverPassword/Title";

const VerificationCode = () => {
  const navigate = useNavigate();

  const handleVerify = () => {
    navigate("/verification-input");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-10">
        <img src={ilustracion} alt="Ilustración" className="max-w-xs w-full" />
      </div>

      <div className="w-full lg:w-1/2 bg-[#2c2c34] text-white flex flex-col justify-center items-center p-10 space-y-6">
        <Title className="text-white">INGRESE SU CORREO</Title>
        <p className="text-center text-sm max-w-sm">
          INGRESA TU CORREO ELECTRÓNICO PARA ENVIARTE EL CÓDIGO DE VERIFICACIÓN.
        </p>

        <form className="w-full max-w-sm space-y-4">
          <Input
            type="text"
            placeholder="Introduce tu código de verificación"
          />
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="bg-[#a100f2] hover:bg-[#7d00c1]"
          >
            Verificar código
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerificationCode;
