import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const TruckDetailScreen = ({ truck, onNavigateBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DISPONIBLE':
        return 'text-green-600 bg-green-50';
      case 'NO DISPONIBLE':
        return 'text-red-600 bg-red-50';
      case 'MANTENIMIENTO':
        return 'text-yellow-600 bg-yellow-50';
      case 'EN RUTA':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === truck.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? truck.images.length - 1 : prev - 1
    );
  };

  const handleBackToMenu = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      console.log('Navegar a la página anterior');
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-xl h-full overflow-auto">
          {/* Header */}
          <div className="flex items-center gap-4 p-6 border-b border-gray-200">
            <button 
              onClick={handleBackToMenu}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Información del vehículo</h1>
          </div>

          <div className="flex">
            {/* Left Sidebar - Statistics */}
            <div className="w-80 p-6 border-r border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Estadísticas del vehículo</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Kilometraje</span>
                  <span className="font-medium text-gray-900">{truck?.kilometraje}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Vida restante</span>
                  <span className="font-medium text-gray-900">{truck?.vidaUtil}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Valor original</span>
                  <span className="font-medium text-gray-900">{truck?.valorOriginal}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Combustible</span>
                  <span className="font-medium text-gray-900">{truck?.combustible}</span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Valor de depreciación</span>
                  <span className="font-medium text-gray-900">{truck?.valorDepreciacion}</span>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6">
              {/* Image Carousel */}
              <div className="relative mb-6">
                <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden relative">
                  <img 
                    src={truck?.images[currentImageIndex]} 
                    alt={truck?.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  {truck?.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                      >
                        <ChevronLeft size={20} className="text-gray-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                      >
                        <ChevronRight size={20} className="text-gray-700" />
                      </button>
                    </>
                  )}
                  
                  {/* Image Indicators */}
                  {truck?.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {truck.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? 'bg-white' 
                              : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Info Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{truck?.plate}</div>
                  <div className="text-blue-500 text-sm mt-1">🇺🇸</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{truck?.card}</div>
                  <div className="text-green-500 text-sm mt-1">🏆</div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{truck?.year}</div>
                  <div className="text-orange-500 text-sm mt-1">🏠</div>
                </div>
              </div>

              {/* Driver Info Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                  <div className="text-sm font-medium text-gray-900">Ronald Richards</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Conductor
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                  <div className="text-sm font-medium text-gray-900">Ford</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Marca
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                  <div className="text-sm font-medium text-gray-900">F150</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                    Modelo
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-end">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(truck?.status)}`}>
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    truck?.status === 'DISPONIBLE' ? 'bg-green-500' :
                    truck?.status === 'NO DISPONIBLE' ? 'bg-red-500' :
                    truck?.status === 'MANTENIMIENTO' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  {truck?.status}
                  <span className="ml-2">✓</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información adicional</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium text-gray-900 ml-2">{truck?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium text-gray-900 ml-2">{truck?.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Origen:</span>
                    <span className="font-medium text-gray-900 ml-2">{truck?.origin}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Descripción:</span>
                    <p className="font-medium text-gray-900 mt-1">{truck?.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckDetailScreen;