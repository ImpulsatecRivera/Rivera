import React, { useState } from 'react';
import { Home, Clock, BarChart3, ShoppingBag, FileText, Users } from 'lucide-react';

const SidebarNav = () => {
  const [activeItem, setActiveItem] = useState('reports');

  const navItems = [
    { id: 'home', route: '/home', icon: Home },
    { id: 'time', icon: Clock },
    { id: 'reports', icon: BarChart3 },
    { id: 'products', icon: ShoppingBag },
    { id: 'documents', icon: FileText },
    { id: 'users', icon: Users }
  ];

  return (
    <div className="h-screen bg-white flex">
      {/* Sidebar con forma ondulada */}
      <div className="w-20 relative">
        {/* SVG con la forma ondulada exacta */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 80 600" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#6C5CE7', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#5F4FD1', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#6C5CE7', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Forma principal con curvas suaves */}
          <path
            d="M 0 0 
               C 30 0, 50 20, 60 50
               C 70 80, 80 100, 80 150
               L 80 450
               C 80 500, 70 520, 60 550
               C 50 580, 30 600, 0 600
               L 0 0 Z"
            fill="url(#purpleGradient)"
          />
          
          {/* Curva decorativa interna derecha superior */}
          <path
            d="M 80 0
               C 60 50, 70 100, 80 150"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
          
          {/* Curva decorativa interna derecha inferior */}
          <path
            d="M 80 450
               C 70 500, 60 550, 80 600"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        </svg>

        {/* Contenido sobre el SVG */}
        <div className="relative z-10 flex flex-col items-center h-full py-12">
          {/* Navigation Items */}
          <nav className="flex flex-col gap-10 mt-4">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  className={`
                    w-11 h-11 rounded-xl flex items-center justify-center
                    transition-all duration-300 relative
                    ${isActive 
                      ? 'bg-white bg-opacity-25 backdrop-blur-sm shadow-lg' 
                      : 'hover:bg-white hover:bg-opacity-15'
                    }
                  `}
                >
                  <Icon 
                    size={24} 
                    strokeWidth={1.8}
                    className="text-white"
                  />
                  
                  {/* Línea verde para el ítem activo */}
                  {isActive && (
                    <div className="absolute -right-10 top-0 w-1 h-full bg-emerald-500 rounded-l-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Resto del contenido (área blanca) */}
      <div className="flex-1 bg-white">
        {/* Aquí va el contenido principal */}
      </div>
    </div>
  );
};

export default SidebarNav;