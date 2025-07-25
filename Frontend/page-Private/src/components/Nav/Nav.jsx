import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import avatarImg from '../../images/avatarDashboard.png';
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const SidebarNav = () => {
  const [activeItem, setActiveItem] = useState('Inicio');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingItem, setAnimatingItem] = useState('');
  const [pendingRoute, setPendingRoute] = useState(null);
  const { logOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // SVG del camión de reparto
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

  return (
    <div className="w-64 h-screen text-white flex flex-col" style={{ backgroundColor: '#34353A' }}>
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
      `}</style>

      {/* Profile Section */}
      <div className="flex items-center justify-center py-8">
        <img
          src={avatarImg}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover mx-auto"
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 mt-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name} className="relative">
              <NavLink
                to={item.route}
                onClick={(e) => handleNavClick(e, item.name, item.route)}
                className={({ isActive }) =>
                  `menu-button w-full text-left px-4 py-3 rounded-lg relative overflow-hidden block ${
                    isActive ? 'active text-white opacity-100' : 'text-gray-300 opacity-75'
                  } ${isAnimating ? 'disabled' : 'cursor-pointer'}`
                }
              >
                <span 
                  className={`menu-text transition-opacity duration-300 ${
                    animatingItem === item.name ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  {item.name}
                </span>

                {/* Animación del camión */}
                {animatingItem === item.name && (
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

      {/* Logout Button */}
      <div className="p-4 border-t" style={{ borderColor: '#4A4B50' }}>
        <button
          onClick={handleLogout}
          disabled={isAnimating}
          className={`logout-button w-full flex items-center px-4 py-3 text-gray-300 rounded-lg opacity-75 ${
            isAnimating ? 'disabled' : 'cursor-pointer'
          }`}
        >
          <LogOut size={20} className="mr-3" />
          Cerrar Sesión 
        </button>
      </div>
    </div>
  );
};

export default SidebarNav;