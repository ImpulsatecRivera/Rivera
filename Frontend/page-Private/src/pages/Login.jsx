import Avatar from "../components/Login/Avatar";
import Input from "../components/Login/Input";
import Button from "../components/Login/Button";
import SideImage from "../components/Login/SideImage";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gray-100">
      
      {/* Columna del formulario */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-8">
        <Avatar />
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          ¡Bienvenido de vuelta!
        </h2>

        <form className="w-full max-w-md space-y-4">
          <Input label="Correo" type="email" placeholder="ejemplo@email.com" />
          <Input label="Contraseña" type="password" placeholder="Al menos 8 caracteres" />
          <div className="text-right text-sm">
            <a href="#" className="text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a>
          </div>
          <Button>Iniciar sesión</Button>
        </form>
      </div>

      {/* Imagen lateral */}
      <div className="w-full lg:w-[30%] flex justify-center p-4">
        <SideImage />
      </div>
    </div>
  );
};

export default Login;
