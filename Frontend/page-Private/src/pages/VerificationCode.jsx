import Input from "../components/Login/Input";
import Button from "../components/Login/Button";
import Title from "../components/RecoverPassword/Title";
import verificationImg from "../images/verification.png"; // la imagen con el teléfono y el código

const VerificationCode = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* Imagen izquierda */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-10">
        <img
          src={verificationImg}
          alt="Ilustración de verificación"
          className="max-w-xs w-full"
        />
      </div>

      {/* Formulario */}
      <div className="w-full lg:w-1/2 bg-[#2c2c34] text-white flex flex-col justify-center items-center p-10 space-y-6">
        <Title className="text-white">INGRESE SU CORREO</Title>

        <p className="text-center text-white text-sm max-w-sm">
          INGRESA TU CORREO ELECTRÓNICO PARA ENVIARTE EL CÓDIGO DE VERIFICACIÓN.
        </p>

        <form className="w-full max-w-sm space-y-4">
          <Input
            type="text"
            placeholder="Introduce tu código de verificación"
          />
          <Button className="bg-[#a100f2] hover:bg-[#7d00c1]">
            Verificar código
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerificationCode;
