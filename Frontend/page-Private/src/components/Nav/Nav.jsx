import React, { useState, useEffect } from 'react';
import { User, LogOut, Menu, X } from 'lucide-react';
import avatarImg from '../../images/avatarDashboard.png';
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const SidebarNav = () => {
  const [activeItem, setActiveItem] = useState('Inicio');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingItem, setAnimatingItem] = useState('');
  const [pendingRoute, setPendingRoute] = useState(null);
  // 🆕 Estados para responsividad
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTabletCollapsed, setIsTabletCollapsed] = useState(false);
  
  const { logOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🆕 Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
        setIsTabletCollapsed(false);
      } else if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🆕 Cerrar menú móvil al navegar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // SVG del camión de reparto (sin cambios)
  const TruckIcon = () => (
    <svg 
      width="60" 
      height="36" 
      viewBox="0 0 60 36" 
      fill="none" 
      className="truck-svg"
    >
      {/* Caja de carga blanca */}
      <rect x="8" y="8" width="28" height="20" fill="#FFFFFF" stroke="#374151" strokeWidth="2" rx="2"/>
      
      {/* Cabina azul */}
      <rect x="36" y="12" width="16" height="16" fill="#3B82F6" stroke="#374151" strokeWidth="2" rx="1"/>
      
      {/* Parabrisas */}
      <rect x="38" y="14" width="12" height="6" fill="#E5E7EB" stroke="#374151" strokeWidth="1"/>
      
      {/* Puerta de la caja de carga */}
      <rect x="10" y="10" width="24" height="16" fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="1"/>
      <line x1="22" y1="12" x2="22" y2="24" stroke="#D1D5DB" strokeWidth="1"/>
      <circle cx="20" cy="18" r="1" fill="#6B7280"/>
      <circle cx="24" cy="18" r="1" fill="#6B7280"/>
      
      {/* Logo/texto de empresa */}
      <rect x="12" y="14" width="8" height="3" fill="#3B82F6" rx="0.5"/>
      <rect x="12" y="19" width="6" height="2" fill="#D1D5DB" rx="0.3"/>
      
      {/* Rueda trasera */}
      <g className="wheel" style={{ transformOrigin: '16px 30px' }}>
        <circle cx="16" cy="30" r="5" fill="#1F2937" stroke="#374151" strokeWidth="2"/>
        <circle cx="16" cy="30" r="3" fill="#6B7280"/>
        <rect x="14.5" y="28" width="3" height="4" fill="#9CA3AF"/>
        <circle cx="16" cy="30" r="1.5" fill="#D1D5DB"/>
      </g>
      
      {/* Rueda delantera */}
      <g className="wheel" style={{ transformOrigin: '44px 30px' }}>
        <circle cx="44" cy="30" r="5" fill="#1F2937" stroke="#374151" strokeWidth="2"/>
        <circle cx="44" cy="30" r="3" fill="#6B7280"/>
        <rect x="42.5" y="28" width="3" height="4" fill="#9CA3AF"/>
        <circle cx="44" cy="30" r="1.5" fill="#D1D5DB"/>
      </g>
      
      {/* Faro delantero */}
      <circle cx="50" cy="18" r="2" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1"/>
      
      {/* Parachoques delantero */}
      <rect x="52" y="24" width="2" height="4" fill="#6B7280"/>
      
      {/* Manija de la cabina */}
      <rect x="36" y="20" width="1" height="3" fill="#374151"/>
    </svg>
  );

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', route: '/dashboard' },
    { id:'viajes',name: 'Viajes', route: '/viajes' },
    { id:'cotizaciones',name: 'Cotizaciones', route: '/cotizaciones' },
    {id:'Empleados', name: 'Empleados', route: '/empleados' },
    { id:'Motoristas',name: 'Motoristas', route: '/motoristas' },
    { id:'Proveedores',name: 'Proveedores', route: '/proveedores' },
    { id:'Camiones',name: 'Camiones', route: '/camiones' },
    { id:'clientes',name: 'clientes', route: '/clientes' },
  ];

  const handleNavClick = (event, itemName, route) => {
    // Si ya estamos en esa ruta, no hacer nada
    if (location.pathname === route) {
      event.preventDefault();
      return;
    }

    // Si hay animación en curso, bloquear
    if (isAnimating) {
      event.preventDefault();
      console.log('Navegación bloqueada - animación en curso');
      return;
    }
    
    // Prevenir navegación inmediata
    event.preventDefault();
    
    // Guardar la ruta destino
    setPendingRoute(route);
    setIsAnimating(true);
    setAnimatingItem(itemName);
    
    // Ejecutar animación y después navegar
    setTimeout(() => {
      setActiveItem(itemName);
      setIsAnimating(false);
      setAnimatingItem('');
      
      // Navegar DESPUÉS de la animación
      navigate(route);
      setPendingRoute(null);
      console.log(`Navegando a: ${itemName} - ${route}`);
    }, 2000);
  };

  const handleLogout = async () => {
    // BLOQUEAR si ya hay una animación en curso
    if (isAnimating) {
      console.log('Logout bloqueado - animación en curso');
      return;
    }

    console.log('Cerrando sesión...');
    setIsAnimating(true);
    setAnimatingItem('Cerrar sesión');

    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.error("Error en cierre de sesión:", error);
    } finally {
      setIsAnimating(false);
      setAnimatingItem('');
    }
  };

  // 🆕 Funciones para responsividad
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTabletCollapse = () => {
    setIsTabletCollapsed(!isTabletCollapsed);
  };

  return (
    <>
      {/* 🆕 Botón hamburguesa para móvil */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white hover:bg-gray-700 transition-colors shadow-lg"
        style={{ backgroundColor: '#34353A' }}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 🆕 Overlay para móvil */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      <div 
        className={`
  fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto
  h-screen text-white flex flex-col transition-all duration-300 ease-in-out
  w-64 sm:w-72 md:w-64 lg:w-64
  ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  ${isTabletCollapsed ? 'md:w-16' : ''}
`}
        style={{ backgroundColor: '#34353A' }}
      >
        <style>{`
          .menu-button {
            position: relative;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
          }
          
          .menu-button.disabled {
            pointer-events: none !important;
            opacity: 0.4 !important;
            cursor: not-allowed !important;
          }
          
          .menu-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 0.5rem;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
          }
          
          .menu-button:not(.disabled):hover::before {
            opacity: 1;
          }
          
          .menu-button:not(.disabled):hover {
            transform: translateX(8px) scale(1.02);
            box-shadow: 
              0 10px 25px rgba(0, 0, 0, 0.3),
              0 0 20px rgba(59, 130, 246, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
            border-left: 3px solid #3B82F6;
          }
          
          .menu-button.active {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.1));
            border-left: 3px solid #60A5FA;
            box-shadow: 
              0 8px 20px rgba(0, 0, 0, 0.2),
              0 0 15px rgba(59, 130, 246, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }
          
          .menu-text {
            position: relative;
            z-index: 2;
            font-weight: 500;
            letter-spacing: 0.025em;
          }
          
          .logout-button {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .logout-button.disabled {
            pointer-events: none !important;
            opacity: 0.4 !important;
            cursor: not-allowed !important;
          }
          
          .logout-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.2), transparent);
            transition: left 0.5s ease;
          }
          
          .logout-button:not(.disabled):hover::before {
            left: 100%;
          }
          
          .logout-button:not(.disabled):hover {
            background: rgba(239, 68, 68, 0.1);
            border-left: 3px solid #EF4444;
            transform: translateX(4px);
            box-shadow: 0 6px 15px rgba(239, 68, 68, 0.2);
          }
          
          .truck-container {
            position: absolute;
            top: 50%;
            left: -80px;
            transform: translateY(-50%);
            animation: truckMove 2s ease-in-out;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
          }
          
          @keyframes truckMove {
            0% {
              left: -80px;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              left: calc(100% + 20px);
              opacity: 0;
            }
          }
          
          .smoke-trail {
            position: absolute;
            top: 50%;
            left: -10px;
            transform: translateY(-50%);
            width: 2px;
            height: 2px;
            background: #9CA3AF;
            border-radius: 50%;
            opacity: 0;
            animation: smokeTrail 2s ease-out;
          }
          
          .smoke-trail:nth-child(2) {
            animation-delay: 0.1s;
          }
          
          .smoke-trail:nth-child(3) {
            animation-delay: 0.2s;
          }
          
          .smoke-trail:nth-child(4) {
            animation-delay: 0.3s;
          }
          
          .smoke-trail:nth-child(5) {
            animation-delay: 0.4s;
          }
          
          @keyframes smokeTrail {
            0% {
              opacity: 0;
              transform: translateY(-50%) scale(0);
            }
            20% {
              opacity: 0.6;
              transform: translateY(-50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translateY(-60px) scale(1.5);
              background: #D1D5DB;
            }
          }
          
          .truck-container .truck-svg .wheel {
            animation: wheelSpin 0.15s linear infinite;
          }
          
          @keyframes wheelSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          /* 🆕 Estilos responsivos agregados */
          @media (min-width: 768px) and (max-width: 1023px) {
            .sidebar-tablet.collapsed .menu-text:not(.collapsed-text),
            .sidebar-tablet.collapsed .profile-img,
            .sidebar-tablet.collapsed .logout-text {
              opacity: 0;
              pointer-events: none;
            }
          }
        `}</style>

        {/* 🆕 Botón de colapso para tablet */}
        <button
          onClick={toggleTabletCollapse}
          className="hidden md:flex lg:hidden absolute -right-3 top-4 w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full items-center justify-center text-white transition-colors z-10"
        >
          <Menu size={14} />
        </button>

        {/* Profile Section - 🆕 Responsivo */}
        <div className={`flex items-center justify-center transition-all duration-300 ${isTabletCollapsed ? 'py-4 px-2' : 'py-4 sm:py-6 lg:py-8 px-4'}`}>
          <img
            src={avatarImg}
            alt="Avatar"
            className={`profile-img rounded-full object-cover mx-auto transition-all duration-300 ${
              isTabletCollapsed ? 'w-8 h-8' : 'w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24'
            }`}
          />
        </div>

        {/* Navigation Menu - 🆕 Responsivo */}
        <nav className={`flex-1 mt-2 sm:mt-4 lg:mt-6 transition-all duration-300 ${isTabletCollapsed ? 'px-2' : 'px-3 sm:px-4'}`}>
          <ul className="space-y-1 sm:space-y-2">
            {menuItems.map((item) => (
              <li key={item.name} className="relative">
                <NavLink
                  to={item.route}
                  onClick={(e) => handleNavClick(e, item.name, item.route)}
                  className={({ isActive }) =>
                    `menu-button w-full text-left rounded-lg relative overflow-hidden block transition-all duration-300 ${
                      isActive ? 'active text-white opacity-100' : 'text-gray-300 opacity-75'
                    } ${isAnimating ? 'disabled' : 'cursor-pointer'} ${
                      /* 🆕 Clases responsivas para items del menú */
                      isTabletCollapsed ? 'px-2 py-2 text-center' : 'px-3 sm:px-4 py-2 sm:py-3'
                    }`
                  }
                  title={isTabletCollapsed ? item.name : ''}
                >
                  <span 
                    className={`menu-text transition-opacity duration-300 ${
                      animatingItem === item.name ? 'opacity-30' : 'opacity-100'
                    } ${/* 🆕 Texto responsivo */
                      isTabletCollapsed ? 'text-xs collapsed-text' : 'text-sm sm:text-base'
                    }`}
                  >
                    {/* 🆕 Mostrar solo inicial en modo colapsado */}
                    {isTabletCollapsed ? item.name.charAt(0).toUpperCase() : item.name}
                  </span>

                  {/* Animación del camión - 🆕 Solo se muestra si no está colapsado */}
                  {animatingItem === item.name && !isTabletCollapsed && (
                    <>
                      <div className="truck-container">
                        <TruckIcon />
                      </div>
                      <div className="smoke-trail"></div>
                      <div className="smoke-trail"></div>
                      <div className="smoke-trail"></div>
                      <div className="smoke-trail"></div>
                      <div className="smoke-trail"></div>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button - 🆕 Responsivo */}
        <div className={`border-t transition-all duration-300 ${isTabletCollapsed ? 'p-2' : 'p-3 sm:p-4'}`} style={{ borderColor: '#4A4B50' }}>
          <button
            onClick={handleLogout}
            disabled={isAnimating}
            title={isTabletCollapsed ? 'Cerrar Sesión' : ''}
            className={`logout-button w-full flex items-center text-gray-300 rounded-lg opacity-75 transition-all duration-300 ${
              isAnimating ? 'disabled' : 'cursor-pointer'
            } ${/* 🆕 Clases responsivas para logout */
              isTabletCollapsed ? 'px-2 py-2 justify-center' : 'px-3 sm:px-4 py-2 sm:py-3'
            }`}
          >
            <LogOut size={isTabletCollapsed ? 16 : 20} className={isTabletCollapsed ? '' : 'mr-2 sm:mr-3'} />
            <span className={`logout-text transition-opacity duration-300 ${isTabletCollapsed ? 'hidden' : 'text-sm sm:text-base'}`}>
              Cerrar Sesión 
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SidebarNav;