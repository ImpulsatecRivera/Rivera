import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import avatarImg from '../../images/avatarDashboard.png';
import { NavLink, useNavigate } from "react-router-dom";

const SidebarNav = () => {
  const [activeItem, setActiveItem] = useState('Inicio');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingItem, setAnimatingItem] = useState('');
  const navigate = useNavigate();

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
      <rect x="36" y="12" width="16" height="16" fill="#3B82F6" stroke="#374151" strokeWidth="2" rx="1"/>
      <rect x="38" y="14" width="12" height="6" fill="#E5E7EB" stroke="#374151" strokeWidth="1"/>
      <rect x="10" y="10" width="24" height="16" fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="1"/>
      <line x1="22" y1="12" x2="22" y2="24" stroke="#D1D5DB" strokeWidth="1"/>
      <circle cx="20" cy="18" r="1" fill="#6B7280"/>
      <circle cx="24" cy="18" r="1" fill="#6B7280"/>
      <rect x="12" y="14" width="8" height="3" fill="#3B82F6" rx="0.5"/>
      <rect x="12" y="19" width="6" height="2" fill="#D1D5DB" rx="0.3"/>
      <g className="wheel" style={{ transformOrigin: '16px 30px' }}>
        <circle cx="16" cy="30" r="5" fill="#1F2937" stroke="#374151" strokeWidth="2"/>
        <circle cx="16" cy="30" r="3" fill="#6B7280"/>
        <rect x="14.5" y="28" width="3" height="4" fill="#9CA3AF"/>
        <circle cx="16" cy="30" r="1.5" fill="#D1D5DB"/>
      </g>
      <g className="wheel" style={{ transformOrigin: '44px 30px' }}>
        <circle cx="44" cy="30" r="5" fill="#1F2937" stroke="#374151" strokeWidth="2"/>
        <circle cx="44" cy="30" r="3" fill="#6B7280"/>
        <rect x="42.5" y="28" width="3" height="4" fill="#9CA3AF"/>
        <circle cx="44" cy="30" r="1.5" fill="#D1D5DB"/>
      </g>
      <circle cx="50" cy="18" r="2" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1"/>
      <rect x="52" y="24" width="2" height="4" fill="#6B7280"/>
      <rect x="36" y="20" width="1" height="3" fill="#374151"/>
    </svg>
  );

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', route: '/dashboard' },
    { id:'viajes', name: 'Viajes', route: '/viajes' },
    { id:'cotizaciones', name: 'Cotizaciones', route: '/cotizaciones' },
    { id:'Empleados', name: 'Empleados', route: '/empleados' },
    { id:'Motoristas', name: 'Motoristas', route: '/motoristas' },
    { id:'Proveedores', name: 'Proveedores', route: '/proveedores' },
    { id:'Camiones', name: 'Camiones', route: '/camiones' },
    { id:'clientes', name: 'clientes', route: '/clientes' },
  ];

  const handleItemClick = async (itemName) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimatingItem(itemName);

    setTimeout(() => {
      setActiveItem(itemName);
      setIsAnimating(false);
      setAnimatingItem('');
    }, 2000);
  };

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    setIsAnimating(true);
    setAnimatingItem('Cerrar sesión');
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  return (
    <div className="w-64 h-screen text-white flex flex-col" style={{ backgroundColor: '#34353A' }}>
      <div className="flex items-center justify-center py-8">
        <img src={avatarImg} alt="Avatar" className="w-24 h-24 rounded-full object-cover mx-auto" />
      </div>

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
                {animatingItem === item.name && (
                  <div className="truck-container">
                    <TruckIcon />
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t" style={{ borderColor: '#4A4B50' }}>
        <button
          onClick={handleLogout}
          disabled={isAnimating}
          className={`logout-button w-full flex items-center px-4 py-3 text-gray-300 rounded-lg opacity-75 ${
            isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'
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
