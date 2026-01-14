import React, { useState, useEffect } from "react";
import { Home, Clock, BarChart3, Wrench, Users, Fuel, Vault, Route, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Lottie from "lottie-react";
import logoutAnim from "../../assets/lotties/Campervan _ Ignite Animation.json"; // ejemplo

const SidebarNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logOut, user } = useAuth();

  const [activeItem, setActiveItem] = useState("home");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  // Construimos el menú y ocultamos "Planilla" si el usuario no es administrador
  const navItems = [
    { id: "home", route: "/home", icon: Home },
    ...(user && user.userType === "Administrador" ? [{ id: "planilla", route: "/planilla", icon: BarChart3 }] : []),
    { id: "maintenance", route: "/mantenimientos", icon: Wrench },
    { id: "diesel", route: "/diesel", icon: Fuel },
    { id: "viajesInternos", route: "/viajesInternos", icon: Route },
    { id: "CajaChica", route: "/CajaChica", icon: Vault },
  ];

  useEffect(() => {
    const currentItem = navItems.find((item) => item.route === location.pathname);
    if (currentItem) setActiveItem(currentItem.id);
  }, [location.pathname]);

  const handleNavigation = (item) => {
    if (item.route) {
      setActiveItem(item.id);
      navigate(item.route);
    }
  };

  const handleLogoutClick = () => {
    if (isLogoutLoading) return;
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async (cerrarSesion) => {
    setShowLogoutModal(false);

    if (cerrarSesion) {
      // Cerrar sesión completamente (eliminar cookies)
      if (isLogoutLoading) return;

      setIsLogoutLoading(true);

      try {
        await logOut(); // elimina cookies del servidor y UI
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Error en cierre de sesión:", error);
      } finally {
        setIsLogoutLoading(false);
      }
    } else {
      // Solo volver a selección de proceso (mantener sesión)
      navigate("/SeleccionarProceso", { replace: true });
    }
  };

  return (
    <div className="h-screen bg-white flex">
      <div className="w-20 relative">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 80 600"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="riveraGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#34353A", stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: "#5F8EAD", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#34353A", stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          <path
            d="M 0 0
               C 30 0, 50 20, 60 50
               C 70 80, 80 100, 80 150
               L 80 450
               C 80 500, 70 520, 60 550
               C 50 580, 30 600, 0 600
               L 0 0 Z"
            fill="url(#riveraGradient)"
          />

          <path
            d="M 80 0
               C 60 50, 70 100, 80 150"
            fill="none"
            stroke="rgba(95, 142, 173, 0.2)"
            strokeWidth="1.5"
          />

          <path
            d="M 80 450
               C 70 500, 60 550, 80 600"
            fill="none"
            stroke="rgba(93, 150, 70, 0.2)"
            strokeWidth="1.5"
          />
        </svg>

        <div className="relative z-10 flex flex-col items-center h-full py-12">
          <nav className="flex flex-col gap-10 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`
                    w-11 h-11 rounded-xl flex items-center justify-center
                    transition-all duration-300 relative
                    ${isActive
                      ? "bg-white bg-opacity-25 backdrop-blur-sm shadow-lg"
                      : "hover:bg-white hover:bg-opacity-15"
                    }
                  `}
                  title={item.id}
                >
                  <Icon size={24} strokeWidth={1.8} className="text-white" />
                  {isActive && (
                    <div className="absolute -right-10 top-0 w-1 h-full bg-[#5D9646] rounded-l-full shadow-lg"></div>
                  )}
                </button>
              );
            })}

            {/* Botón de salir justo debajo de Caja Chica */}
            <button
              onClick={handleLogoutClick}
              disabled={isLogoutLoading}
              className="w-11 h-11 rounded-xl flex items-center justify-center
                       transition-all duration-300
                       hover:bg-red-500 hover:bg-opacity-20
                       hover:scale-110 group
                       disabled:opacity-50 disabled:cursor-not-allowed"
              title="Salir"
            >
              <LogOut size={24} strokeWidth={1.8} className="text-white group-hover:text-red-200 transition-colors" />
            </button>
          </nav>
        </div>
      </div>

      <div className="flex-1 bg-white">{/* contenido */}</div>

      {/* Modal de confirmación */}
      {showLogoutModal && (
        <div
  className="
    relative bg-white/90 backdrop-blur-xl
    rounded-2xl w-[340px] p-6 shadow-2xl
    animate-[fadeInScale_0.25s_ease-out]
    overflow-hidden
  "
>
  {/* LOTTIE FONDO */}
  <Lottie
    animationData={logoutAnim}
    loop
    autoplay
    className="absolute inset-0 opacity-10 pointer-events-none"
  />

  {/* CONTENIDO */}
  <div className="relative z-10">
    <h3 className="text-lg font-semibold text-gray-900 text-center">
      Cerrar sesión
    </h3>

    <p className="text-sm text-gray-500 text-center mt-2 mb-6">
      ¿Qué deseas hacer?
    </p>

    <div className="flex flex-col gap-3">
      <button
        onClick={() => handleLogoutConfirm(false)}
        disabled={isLogoutLoading}
        className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-all"
      >
        Cambiar de proceso
      </button>

      <button
        onClick={() => handleLogoutConfirm(true)}
        disabled={isLogoutLoading}
        className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all"
      >
        {isLogoutLoading ? "Cerrando..." : "Cerrar sesión"}
      </button>

      <button
        onClick={() => setShowLogoutModal(false)}
        disabled={isLogoutLoading}
        className="w-full py-3 rounded-xl text-gray-500 hover:text-gray-700 text-sm transition-all"
      >
        Cancelar
      </button>
    </div>
  </div>
</div>

      )}

    </div>
  );
};

export default SidebarNav;