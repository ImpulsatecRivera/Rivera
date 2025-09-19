import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from '../assets/image.png';

const Navegation = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Arial:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <nav
      className="w-full bg-white text-gray-800 shadow-sm"
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#ffffff", // fondo blanco
      }}
    >
      <div className="flex flex-wrap justify-between items-center w-full px-6 py-4">
        {/* Logo más grande */}
        <div className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="h-16 w-auto"
          />
        </div>

        {/* Botón hamburguesa (móvil y tablet) */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú de navegación */}
        <div
          className={`w-full md:w-auto ${
            menuOpen ? "block" : "hidden"
          } md:flex md:items-center md:space-x-12`}
        >
          <ul className="flex flex-col md:flex-row md:space-x-12 mt-4 md:mt-0 w-full md:w-auto">
            <li>
              <Link
                to="/"
                className="block text-center md:text-left text-green-700 hover:text-green-800 transition duration-200 text-base font-medium py-2"
              >
               Inicio              
              </Link>
            </li>
            <li>
              <Link
                to="/Ficha"
                className="block text-center md:text-left text-green-700 hover:text-green-800 transition duration-200 text-base font-medium py-2"
              >
                Ficha Historica
              </Link>
            </li>
            <li>
              <Link
                to="/Dedicacion"
                className="block text-center md:text-left text-green-700 hover:text-green-800 transition duration-200 text-base font-medium py-2"
              >
                Nuestra Dedicación
              </Link>
            </li>
            <li>
              <Link
                to="/mision-vision"
                className="block text-center md:text-left text-green-700 hover:text-green-800 transition duration-200 text-base font-medium py-2"
              >
                Misión y visión
              </Link>
            </li>
            <li>
              <Link
                to="/redes-sociales"
                className="block text-center md:text-left text-green-700 hover:text-green-800 transition duration-200 text-base font-medium py-2"
              >
                Nuestras redes sociales
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Línea negra divisoria abajo del menú */}
      <div className="w-full h-[2px] bg-black mt-2"></div>
    </nav>
  );
};

export default Navegation;
