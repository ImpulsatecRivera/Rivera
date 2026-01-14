import React from 'react';
import { useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { useAuth } from '../../context/AuthContext';

import characterImage from '../../images/Avatar.png';
import gearsIcon from '../../images/procesos.png';
import peopleIcon from '../../images/usuarios.png';

const Seleccionar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen py-12 px-4 overflow-hidden">
      {/* Spline 3D Background - Interactivo */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Spline
          scene="https://prod.spline.design/ZK5t9FNLWV1UHl5N/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-900/40 via-gray-900/30 to-gray-900/40 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto pointer-events-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-2xl md:text-3xl font-normal text-white mb-6 drop-shadow-lg">
            Hola {user?.name || user?.nombre || 'Usuario'}, ¿qué deseas realizar este día?
          </h1>
          <div className="flex justify-center">
            <img src={characterImage} alt="Character" className="w-32 h-auto drop-shadow-2xl" />
          </div>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card Procesos Internos */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="flex flex-col items-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <img src={gearsIcon} alt="Gears" className="w-12 h-12" />
              </div>
              
              {/* Title */}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Procesos internos
              </h2>
              
              {/* Description */}
              <p className="text-sm text-gray-600 text-center mb-8 leading-relaxed">
                Gestiona y optimiza tus flujos de trabajo internos, automatiza tareas y
                mejora la eficiencia operativa
              </p>
              
              {/* Button */}
              <button 
                onClick={() => navigate('/home')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Ingresar
              </button>
            </div>
          </div>

          {/* Card Procesos Externos */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="flex flex-col items-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <img src={peopleIcon} alt="People" className="w-12 h-12" />
              </div>
              
              {/* Title */}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Procesos externos
              </h2>
              
              {/* Description */}
              <p className="text-sm text-gray-600 text-center mb-8 leading-relaxed">
                Colabora con tu equipo y stakeholders externos, coordina proyectos y mantén
                comunicación efectiva
              </p>
              
              {/* Button */}
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Ingresar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seleccionar;