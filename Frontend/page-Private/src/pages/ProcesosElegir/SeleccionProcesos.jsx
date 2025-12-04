import React from 'react';


import characterImage from '../../images/Avatar.png';
 import gearsIcon from '../../images/procesos.png';
 import peopleIcon from '../../images/usuarios.png';

const ProcessSelection = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-2xl md:text-3xl font-normal text-gray-900 mb-6">
            Hola fitin que deseas realizar este dia
          </h1>
          <div className="flex justify-center">
            {/* <img src={characterImage} alt="Character" className="w-32 h-auto" /> */}
            <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center text-4xl">
              👨‍💼
            </div>
          </div>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card Procesos Internos */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                {/* <img src={gearsIcon} alt="Gears" className="w-12 h-12" /> */}
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
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
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                Ingresar
              </button>
            </div>
          </div>

          {/* Card Procesos Externos */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                {/* <img src={peopleIcon} alt="People" className="w-12 h-12" /> */}
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
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
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                Ingresar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessSelection;