import React, { useState, useEffect } from "react";
import { Home, BarChart3, Wrench, Fuel, Vault, Route, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/authContext";
import Lottie from "lottie-react";
import logoutAnim from "../../assets/lotties/Campervan _ Ignite Animation.json";
import logoRivera from "../../images/logo.png"; // 

const SidebarNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logOut, user } = useAuth();

  const [activeItem, setActiveItem] = useState("home");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { id: "home", route: "/home", icon: Home, label: "Inicio" },
    ...(user?.userType === "Administrador" ? [{ id: "planilla", route: "/planilla", icon: BarChart3, label: "Planilla" }] : []),
    { id: "maintenance", route: "/mantenimientos", icon: Wrench, label: "Mantenimientos" },
    { id: "diesel", route: "/diesel", icon: Fuel, label: "Diesel" },
    { id: "viajesInternos", route: "/viajesInternos", icon: Route, label: "Viajes" },
    { id: "CajaChica", route: "/CajaChica", icon: Vault, label: "Caja Chica" },
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
      if (isLogoutLoading) return;
      setIsLogoutLoading(true);

      try {
        await logOut();
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Error en cierre de sesión:", error);
      } finally {
        setIsLogoutLoading(false);
      }
    } else {
      navigate("/SeleccionarProceso", { replace: true });
    }
  };

  return (
    <div className="h-screen bg-white flex">
      <div
        className={`h-screen bg-[#2C2D31] flex flex-col transition-all duration-300 relative border-r border-white/5
                    ${isExpanded ? 'w-64' : 'w-20'}`}
      >
        {/* Pattern de fondo sutil */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
            backgroundSize: '24px 24px'
          }} 
        />

        {/* Acento de color en el borde izquierdo */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#5F8EAD] via-[#5D9646] to-[#5F8EAD]" />

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-8 bg-white rounded-full p-1.5 shadow-lg 
                     hover:scale-110 transition-all z-20 border border-gray-200
                     hover:shadow-xl hover:shadow-[#5F8EAD]/20"
        >
          {isExpanded ? (
            <ChevronLeft size={18} className="text-[#5F8EAD]" />
          ) : (
            <ChevronRight size={18} className="text-[#5F8EAD]" />
          )}
        </button>

        {/* Header/Logo Area - CON TU LOGO */}
       <div className="px-6 py-6 relative z-10">
  <div className={`flex items-center gap-3 ${!isExpanded && 'justify-center'}`}>
    {/* Logo más grande */}
    <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center 
                  border border-[#5F8EAD]/20 shadow-lg overflow-hidden p-2">
      <img 
        src={logoRivera} 
        alt="Rivera Logo" 
        className="w-full h-full object-contain"
      />
    </div>
    {isExpanded && (
      <div>
        <h2 className="font-bold text-xl text-white">Rivera</h2>
        <p className="text-xs text-gray-400">Distribuidora y Transportes</p>
      </div>
    )}
  </div>
</div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                  transition-all duration-200 relative group overflow-hidden
                  ${isActive
                    ? 'bg-[#5F8EAD]/20 text-white shadow-lg shadow-[#5F8EAD]/10 border border-[#5F8EAD]/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }
                  ${!isExpanded && 'justify-center'}
                `}
              >
                {/* Glow effect en active */}
                {isActive && (
                  <div className="absolute inset-0 bg-[#5F8EAD]/10 rounded-xl blur-sm -z-10" />
                )}

                {/* Hover ripple effect */}
                <span className="absolute inset-0 bg-white/5 scale-0 group-hover:scale-100 
                               transition-transform duration-500 rounded-xl -z-10" />

                <Icon 
                  size={22} 
                  strokeWidth={2} 
                  className="transition-transform group-hover:scale-110 duration-200"
                />
                
                {isExpanded && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}

                {/* Indicador activo */}
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 bg-[#5D9646] rounded-full 
                                shadow-lg shadow-[#5D9646]/50 animate-pulse" />
                )}

                {/* Tooltip para modo colapsado */}
                {!isExpanded && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs 
                                  rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none 
                                  transition-all whitespace-nowrap z-50 shadow-xl
                                  border border-gray-700">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 
                                  border-4 border-transparent border-r-gray-900" />
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer - Logout Button */}
        <div className="p-3 border-t border-white/5 relative z-10">
          <button
            onClick={handleLogoutClick}
            disabled={isLogoutLoading}
            className={`
              w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
              transition-all duration-200 group relative overflow-hidden
              text-red-400 hover:bg-red-500/10 hover:text-red-300
              border border-transparent hover:border-red-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${!isExpanded && 'justify-center'}
            `}
          >
            <span className="absolute inset-0 bg-red-500/5 scale-0 group-hover:scale-100 
                           transition-transform duration-500 rounded-xl -z-10" />

            <LogOut 
              size={22} 
              strokeWidth={2} 
              className="transition-transform group-hover:scale-110 duration-200"
            />
            {isExpanded && <span className="font-medium text-sm">Salir</span>}

            {!isExpanded && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs 
                              rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none 
                              transition-all whitespace-nowrap z-50 shadow-xl
                              border border-gray-700">
                Salir
                <div className="absolute right-full top-1/2 -translate-y-1/2 
                              border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </button>

          {/* User Info */}
          {isExpanded && user && (
            <div className="mt-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5
                          hover:bg-white/[0.07] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#5F8EAD]/20 flex items-center justify-center
                              border border-[#5F8EAD]/30">
                  <span className="text-[#5F8EAD] font-bold text-sm">
                    {user.nombre?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{user.nombre}</p>
                  <p className="text-gray-400 text-xs truncate">{user.userType}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white">{/* contenido */}</div>

      {/* Modal de confirmación - ORIGINAL */}
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