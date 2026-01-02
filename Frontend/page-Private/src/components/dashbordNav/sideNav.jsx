import React, { useState, useEffect } from "react";
import { Home, Clock, BarChart3, Wrench, Users, Fuel, Vault, Route, FileText } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const SidebarNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("home");

  const navItems = [
    { id: "home", route: "/home", icon: Home },
    { id: "planilla", route: "/planilla", icon: BarChart3 },
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
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#6C5CE7", stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: "#5F4FD1", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#6C5CE7", stopOpacity: 1 }} />
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
            fill="url(#purpleGradient)"
          />

          <path
            d="M 80 0
               C 60 50, 70 100, 80 150"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />

          <path
            d="M 80 450
               C 70 500, 60 550, 80 600"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
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
                    ${
                      isActive
                        ? "bg-white bg-opacity-25 backdrop-blur-sm shadow-lg"
                        : "hover:bg-white hover:bg-opacity-15"
                    }
                  `}
                  title={item.id}
                >
                  <Icon size={24} strokeWidth={1.8} className="text-white" />
                  {isActive && (
                    <div className="absolute -right-10 top-0 w-1 h-full bg-emerald-500 rounded-l-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex-1 bg-white">{/* contenido */}</div>
    </div>
  );
};

export default SidebarNav;
