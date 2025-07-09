import React from 'react';
import { LogOut } from 'lucide-react';
import avatarImg from '../../images/avatarDashboard.png';

const Sidebar = () => {
  const sidebarItems = [
    { label: 'Inicio', active: true },
    { label: 'Viajes' },
    { label: 'Cotizaciones' },
    { label: 'Empleados' },
    { label: 'Motoristas' },
    { label: 'Proveedores' },
    { label: 'Camiones' }
  ];

  return (
    <div className="w-48 min-h-screen flex flex-col p-4 bg-[#34353A]">
      <img
        src={avatarImg}
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover mx-auto"
      />
      <nav className="space-y-1 flex-1">
        {sidebarItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`block px-0 py-1.5 text-xs font-medium transition-colors ${
              item.active ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="mt-auto">
        <button className="flex items-center space-x-2 text-gray-400 hover:text-white text-xs">
          <LogOut size={14} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;