import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react';

const SidebarNav = () => {
  const [activeItem, setActiveItem] = useState('Inicio');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingItem, setAnimatingItem] = useState('');

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
    </svg>
  );

  const menuItems = [
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
    
    setIsAnimating(true);
    setAnimatingItem(itemName);
    
    // Esperar a que termine la animación del camión
    setTimeout(() => {
      setActiveItem(itemName);
      setIsAnimating(false);
      setAnimatingItem('');
    }, 5000); // Duración total de la animación más lenta
    
    console.log(`Navegando a: ${itemName}`);
  };

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    // Aquí puedes agregar la lógica de logout
  };

  return (
    <div className="w-64 h-screen text-white flex flex-col" style={{ backgroundColor: '#34353A' }}>
      <style jsx>{`
        .truck-animation {
          animation: truckMove 5s ease-in-out;
        }
        
        @keyframes truckMove {
          0% {
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
            opacity: 0;
          }
        }
        
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
            transform: rotate(360deg);
          }
        }
      `}</style>
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

      {/* Logout Button */}
      <div className="p-4 border-t" style={{ borderColor: '#4A4B50' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg transition-all duration-200 opacity-50 hover:opacity-75"
        >
          <LogOut size={20} className="mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default SidebarNav;