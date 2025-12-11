import React, { useState } from 'react';
import { DollarSign, Tag, Clock, HandCoins, RotateCcw } from 'lucide-react';
import Spline from '@splinetool/react-spline';

const SalesDashboard = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const smallCards = [
    { icon: DollarSign },
    { icon: Tag },
    { icon: Clock },
    { icon: HandCoins }
  ];

  const handleCardClick = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-light text-gray-600">
          RELATÓRIO DE <span className="font-semibold text-gray-800">VENDAS</span>
        </h1>
        <div className="w-full h-px bg-gray-200 mt-3 md:mt-4"></div>
      </div>

      {/* Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Small Cards Column - Stacked */}
        <div className="lg:col-span-2 order-1">
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            <div className="relative lg:block" style={{ minHeight: '120px', height: 'auto' }}>
              {smallCards.map((card, index) => {
                const Icon = card.icon;
                const isExpanded = expandedIndex === index;
                
                let topPosition;
                if (expandedIndex === null) {
                  topPosition = index * 35;
                } else {
                  if (index === expandedIndex) {
                    topPosition = 0;
                  } else if (index < expandedIndex) {
                    const positionFromEnd = expandedIndex - index;
                    topPosition = (smallCards.length - positionFromEnd) * 35;
                  } else {
                    topPosition = (index - expandedIndex) * 35;
                  }
                }
                
                return (
                  <div
                    key={index}
                    onClick={() => handleCardClick(index)}
                    className="lg:absolute w-32 lg:w-full transition-all duration-500 ease-out cursor-pointer flex-shrink-0"
                    style={{
                      top: `${topPosition}px`,
                      zIndex: isExpanded ? 50 : (10 - index)
                    }}
                  >
                    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                      <div className="p-2 md:p-3 bg-indigo-50 rounded-xl w-fit">
                        <Icon size={20} className="text-indigo-400" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Large Cards Section */}
        <div className="lg:col-span-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4 md:gap-6 order-2">
          {/* Purple Card with gradient header */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden h-60 md:h-64 border border-gray-100">
              {/* Purple gradient header */}
              <div className="h-14 md:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 relative">
                <div className="absolute bottom-3 left-4 md:left-5">
                  <div className="p-2 bg-white rounded-lg">
                    <RotateCcw size={18} className="text-indigo-500" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <div className="p-4 md:p-5">
                {/* Content - Tus datos aquí */}
              </div>
            </div>
          </div>

          {/* Two white cards */}
          <div className="md:col-span-2 lg:col-span-4 grid grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-md h-60 md:h-64 border border-gray-100">
              <div className="p-2 md:p-3 bg-indigo-50 rounded-xl w-fit">
                <Tag size={20} className="text-indigo-400" strokeWidth={1.5} />
              </div>
              {/* Content - Tus datos aquí */}
            </div>
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-md h-60 md:h-64 border border-gray-100">
              <div className="p-2 md:p-3 bg-indigo-50 rounded-xl w-fit">
                <Clock size={20} className="text-indigo-400" strokeWidth={1.5} />
              </div>
              {/* Content - Tus datos aquí */}
            </div>
          </div>

          {/* Right white card */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-md h-60 md:h-64 border border-gray-100">
              <div className="p-2 md:p-3 bg-indigo-50 rounded-xl w-fit">
                <HandCoins size={20} className="text-indigo-400" strokeWidth={1.5} />
              </div>
              {/* Content - Tus datos aquí */}
            </div>
          </div>
        </div>

        {/* Purple gradient card - Left bottom */}
        <div className="lg:col-span-2 order-3">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 rounded-2xl p-5 md:p-6 shadow-lg h-64 md:h-72 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 md:w-24 h-20 md:h-24 bg-indigo-500 rounded-full opacity-20 -mr-10 md:-mr-12 -mt-10 md:-mt-12"></div>
            <div className="absolute bottom-0 left-0 w-16 md:w-20 h-16 md:h-20 bg-indigo-800 rounded-full opacity-30 -ml-8 md:-ml-10 -mb-8 md:-mb-10"></div>
            {/* Content - Tus datos aquí */}
          </div>
        </div>

        {/* Two white cards - Center bottom */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 order-4">
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-md h-64 md:h-72 border border-gray-100">
            {/* Content - Tus datos aquí */}
          </div>
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-md h-64 md:h-72 border border-gray-100">
            {/* Content - Tus datos aquí */}
          </div>
        </div>

        {/* Large white card - Right bottom */}
        <div className="lg:col-span-3 order-5">
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-md h-64 md:h-72 border border-gray-100">
            {/* Content - Tus datos aquí */}
          </div>
        </div>
      </div>

      {/* Bottom full-width card CON SPLINE 3D INTERACTIVO */}
      <div className="mt-4 md:mt-6 bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 rounded-2xl shadow-xl min-h-80 md:min-h-96 border border-indigo-400 relative overflow-hidden">
        {/* Spline como fondo con interactividad completa */}
        <div className="absolute inset-0 opacity-40" style={{ pointerEvents: 'auto' }}>
          <Spline 
            scene="https://prod.spline.design/Ny1TEyTSv-UIe58Z/scene.splinecode"
            style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
          />
        </div>
        
        {/* Overlay para mejor legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/30 to-transparent pointer-events-none"></div>
        
        {/* Contenido sobre el Spline - sin bloquear el mouse */}
        <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between pointer-events-none">
          <div className="pointer-events-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Resumen General</h2>
            <p className="text-indigo-100 text-sm md:text-base">Estadísticas consolidadas del período</p>
          </div>
          
          {/* Estadísticas - estas cards SÍ deben capturar eventos del mouse */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pointer-events-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              <p className="text-indigo-200 text-xs md:text-sm mb-1">Total Ventas</p>
              <p className="text-white text-xl md:text-2xl font-bold">$125,450</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              <p className="text-indigo-200 text-xs md:text-sm mb-1">Clientes</p>
              <p className="text-white text-xl md:text-2xl font-bold">1,234</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              <p className="text-indigo-200 text-xs md:text-sm mb-1">Productos</p>
              <p className="text-white text-xl md:text-2xl font-bold">456</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              <p className="text-indigo-200 text-xs md:text-sm mb-1">Crecimiento</p>
              <p className="text-white text-xl md:text-2xl font-bold">+18%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;