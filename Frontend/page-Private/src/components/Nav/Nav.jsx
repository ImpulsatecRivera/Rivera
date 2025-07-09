import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react';
<<<<<<< HEAD
import avatarImg from '../../images/avatarDashboard.png';
import { NavLink } from "react-router-dom";
=======
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325

const SidebarNav = () => {
  const [activeItem, setActiveItem] = useState('Inicio');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingItem, setAnimatingItem] = useState('');

<<<<<<< HEAD
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
=======
  // SVG del camión más grande sin carretera
  const TruckIcon = () => (
    <svg 
      width="80" 
      height="56" 
      viewBox="0 0 80 56" 
      fill="none" 
      className="inline-block truck-svg"
    >
      {/* Carrocería principal amarilla */}
      <rect x="4" y="16" width="44" height="24" fill="#F59E0B" stroke="#374151" strokeWidth="4" rx="3"/>
      
      {/* Cabina roja */}
      <path d="M48 16 L48 40 L72 40 L72 28 L64 16 Z" fill="#EF4444" stroke="#374151" strokeWidth="4"/>
      
      {/* Parabrisas */}
      <path d="M50 19 L60 19 L64 26 L50 26 Z" fill="#E5E7EB" stroke="#374151" strokeWidth="3"/>
      
      {/* Ventana lateral */}
      <rect x="52" y="28" width="16" height="8" fill="#E5E7EB" stroke="#374151" strokeWidth="2"/>
      
      {/* Rueda izquierda */}
      <circle cx="16" cy="44" r="8.5" fill="#6B7280" stroke="#374151" strokeWidth="4"/>
      <circle cx="16" cy="44" r="5.5" fill="#374151"/>
      <circle cx="16" cy="44" r="2" fill="#FFFFFF"/>
      
      {/* Rueda derecha */}
      <circle cx="60" cy="44" r="8.5" fill="#6B7280" stroke="#374151" strokeWidth="4"/>
      <circle cx="60" cy="44" r="5.5" fill="#374151"/>
      <circle cx="60" cy="44" r="2" fill="#FFFFFF"/>
      
      {/* Detalles de la carrocería */}
      <rect x="6" y="36" width="40" height="2" fill="#D97706"/>
      <rect x="6" y="20" width="40" height="2" fill="#D97706"/>
      
      {/* Separación entre cabina y carrocería */}
      <line x1="48" y1="16" x2="48" y2="40" stroke="#374151" strokeWidth="4"/>
      
      {/* Faro delantero */}
      <circle cx="69" cy="24" r="3" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/>
      
      {/* Parachoques */}
      <rect x="72" y="30" width="2" height="8" fill="#374151"/>
      
      {/* Líneas de movimiento y viento */}
      <g className="motion-lines">
        <path d="M-4 10 L4 10" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" opacity="0.8"/>
        <path d="M-6 16 L2 16" stroke="#60A5FA" strokeWidth="3.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M-3 22 L5 22" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" opacity="0.7"/>
        <path d="M-5 28 L3 28" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
        <path d="M-4 34 L4 34" stroke="#60A5FA" strokeWidth="3.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M-2 40 L6 40" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
      </g>
      
      {/* Humo del escape */}
      <g className="exhaust-smoke">
        <circle cx="-2" cy="33" r="3" fill="#9CA3AF" opacity="0.4"/>
        <circle cx="-6" cy="30" r="2.5" fill="#9CA3AF" opacity="0.3"/>
        <circle cx="-3" cy="36" r="2.8" fill="#9CA3AF" opacity="0.2"/>
        <circle cx="-8" cy="33" r="2" fill="#9CA3AF" opacity="0.15"/>
      </g>
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
    </svg>
  );

  const menuItems = [
<<<<<<< HEAD
    { id: 'dashboard', name: 'Dashboard', route: '/dashboard' },
    { id:'viajes',name: 'Viajes', route: '/viajes' },
    { id:'cotizaciones',name: 'Cotizaciones', route: '/cotizaciones' },
    {id:'Empleados', name: 'Empleados', route: '/empleados' },
    { id:'Motoristas',name: 'Motoristas', route: '/motoristas' },
    { id:'Proveedores',name: 'Proveedores', route: '/proveedores' },
    { id:'Camiones',name: 'Camiones', route: '/camiones' },
    { id:'clientes',name: 'clientes', route: '/clientes' },
    
  ];

  const handleItemClick = async (itemName) => {
    if (isAnimating) return;
=======
    { name: 'Inicio', path: '/inicio' },
    { name: 'Viajes', path: '/viajes' },
    { name: 'Cotizaciones', path: '/cotizaciones' },
    { name: 'Empleados', path: '/empleados' },
    { name: 'Motoristas', path: '/motoristas' },
    { name: 'Proveedores', path: '/proveedores' },
    { name: 'Camiones', path: '/camiones' }
  ];

  const handleItemClick = async (itemName) => {
    if (isAnimating) return; // Prevenir clicks durante la animación
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
    
    setIsAnimating(true);
    setAnimatingItem(itemName);
    
<<<<<<< HEAD
    // Duración de la animación
=======
    // Esperar a que termine la animación del camión
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
    setTimeout(() => {
      setActiveItem(itemName);
      setIsAnimating(false);
      setAnimatingItem('');
<<<<<<< HEAD
    }, 2000);
=======
    }, 5000); // Duración total de la animación más lenta
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
    
    console.log(`Navegando a: ${itemName}`);
  };

  const handleLogout = () => {
    console.log('Cerrando sesión...');
<<<<<<< HEAD
=======
    // Aquí puedes agregar la lógica de logout
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
  };

  return (
    <div className="w-64 h-screen text-white flex flex-col" style={{ backgroundColor: '#34353A' }}>
<<<<<<< HEAD
      <style >{`
        .menu-button {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
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
        
        .menu-button:hover::before {
          opacity: 1;
        }
        
        .menu-button:hover {
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
        
        .profile-section {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
          border-radius: 1rem;
          padding: 1.5rem;
          margin: 1rem;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .profile-avatar {
          transition: all 0.3s ease;
          box-shadow: 
            0 8px 20px rgba(0, 0, 0, 0.3),
            0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        
        .profile-avatar:hover {
          transform: scale(1.05);
          box-shadow: 
            0 12px 30px rgba(0, 0, 0, 0.4),
            0 0 0 4px rgba(59, 130, 246, 0.5),
            0 0 20px rgba(59, 130, 246, 0.3);
        }
        
        .logout-button {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
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
        
        .logout-button:hover::before {
          left: 100%;
        }
        
        .logout-button:hover {
          background: rgba(239, 68, 68, 0.1);
          border-left: 3px solid #EF4444;
          transform: translateX(4px);
          box-shadow: 0 6px 15px rgba(239, 68, 68, 0.2);
        }
        
        .sidebar-container {
          background: linear-gradient(180deg, rgba(52, 53, 58, 0.95), rgba(52, 53, 58, 1));
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .truck-container {
          position: absolute;
          top: 50%;
          left: -80px;
          transform: translateY(-50%);
          animation: truckMove 2s ease-in-out;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
=======
      <style jsx>{`
        .truck-animation {
          animation: truckMove 5s ease-in-out;
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
        }
        
        @keyframes truckMove {
          0% {
<<<<<<< HEAD
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
=======
            transform: translateX(-480px);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            transform: translateX(480px);
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
            opacity: 0;
          }
        }
        
<<<<<<< HEAD
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
=======
        .truck-svg {
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));
        }
        
        .truck-animation .motion-lines {
          animation: motionLines 5s ease-in-out;
        }
        
        @keyframes motionLines {
          0%, 100% {
            opacity: 0;
            transform: translateX(0);
          }
          12%, 88% {
            opacity: 1;
            transform: translateX(-15px);
          }
        }
        
        .truck-animation .exhaust-smoke {
          animation: smokeMove 5s ease-in-out;
        }
        
        @keyframes smokeMove {
          0%, 100% {
            opacity: 0;
            transform: translateX(0) scale(0.5);
          }
          15%, 85% {
            opacity: 1;
            transform: translateX(-20px) scale(1);
          }
          50% {
            transform: translateX(-35px) scale(1.3);
          }
        }
        
        .truck-animation svg {
          animation: truckBounce 5s ease-in-out;
        }
        
        @keyframes truckBounce {
          0%, 100% {
            transform: translateY(0);
          }
          15%, 85% {
            transform: translateY(-5px);
          }
          30%, 70% {
            transform: translateY(-3px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        
        .truck-animation .truck-svg circle {
          animation: wheelRotate 0.4s linear infinite;
          transform-origin: center;
        }
        
        @keyframes wheelRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
            transform: rotate(360deg);
          }
        }
      `}</style>
<<<<<<< HEAD

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
          className={({ isActive }) =>
            `menu-button w-full text-left px-4 py-3 rounded-lg relative overflow-hidden block ${
              isActive ? 'active text-white opacity-100' : 'text-gray-300 opacity-75'
            } ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}`
          }
          onClick={() => handleItemClick(item.name)}
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

=======
      {/* Profile Section */}
      <div className="flex items-center justify-center py-8">
        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
          <User size={32} className="text-gray-300" />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleItemClick(item.name)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 relative overflow-hidden ${
                  activeItem === item.name
                    ? 'text-white opacity-100'
                    : 'text-gray-300 hover:bg-gray-600 hover:text-white opacity-50 hover:opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Contenido del botón */}
                  <span 
                    className={`transition-all duration-300 ${
                      animatingItem === item.name ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'
                    }`}
                  >
                    {item.name}
                  </span>
                  
                  {/* Animación del camión */}
                  {animatingItem === item.name && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="truck-animation">
                        <TruckIcon />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325

      {/* Logout Button */}
      <div className="p-4 border-t" style={{ borderColor: '#4A4B50' }}>
        <button
          onClick={handleLogout}
<<<<<<< HEAD
          disabled={isAnimating}
          className={`logout-button w-full flex items-center px-4 py-3 text-gray-300 rounded-lg opacity-75 ${
            isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <LogOut size={20} className="mr-3" />
          Cerrar Sesión 
=======
          className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg transition-all duration-200 opacity-50 hover:opacity-75"
        >
          <LogOut size={20} className="mr-3" />
          Cerrar Sesión
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
        </button>
      </div>
    </div>
  );
};

export default SidebarNav;