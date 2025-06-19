// src/pages/ResetPassword.jsx
import Input from "../components/Login/Input";
import Button from "../components/Login/Button";
import Title from "../components/RecoverPassword/Title";
import resetImage from "../images/reset-password.png";

const ResetPassword = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Imagen lateral izquierda */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-10">
        <img src={resetImage} alt="Ilustración reset password" className="max-w-xs w-full" />
      </div>

      {/* Formulario */}
      <div className="w-full lg:w-1/2 bg-[#2c2c34] text-white flex flex-col justify-center items-center p-10 space-y-6">
        <Title className="text-white">Recuperación de contraseña</Title>
        <p className="text-sm text-center max-w-sm text-white">
          Ingresa tu nueva contraseña actualizada
        </p>

        <form className="w-full max-w-sm space-y-4">
          <Input label="Nueva Contraseña" type="password" placeholder="Nueva Contraseña" />
          <Input label="Confirma tu contraseña" type="password" placeholder="Confirma tu contraseña" />
          <Button className="bg-[#a100f2] hover:bg-[#7d00c1]">Confirmar</Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
