import Input from "../components/Login/Input";
import Button from "../components/Login/Button";
import candado from "../images/candado.png";
import ilustracion from "../images/recover.png";
import Title from "../components/RecoverPassword/Title";

const RecoverPassword = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Imagen izquierda */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-10">
        <img
          src={ilustracion}
          alt="Ilustración de recuperación"
          className="max-w-xs w-full"
        />
      </div>

      {/* Formulario */}
      <div className="w-full lg:w-1/2 bg-[#2c2c34] text-white flex flex-col justify-center items-center p-10 space-y-6">
        <img src={candado} alt="Icono de candado" className="w-24 h-24 mb-4" />
        <Title className="text-white">RECUPERAR CONTRASEÑA</Title>
        <p className="text-center text-white text-sm max-w-sm">
          Para recuperar tu contraseña, introduce el correo con el que te registraste.
        </p>

        <form className="w-full max-w-sm space-y-4">
          <Input label="Correo" type="email" placeholder="ejemplo@email.com" />
         <Button className="bg-[#a100f2] hover:bg-[#7d00c1]">
            Enviar código
         </Button>

        </form>
      </div>
    </div>
  );
};

export default RecoverPassword;
