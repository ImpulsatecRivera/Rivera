import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import CamionFord from "../../images/CamionFord.jpg";

const TruckDetailScreen = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState({});

  // Sample truck data matching the screenshot
  const truck = {
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      CamionFord,
    ],
    plate: "P1234245-0",
    card: "P97932-9",
    year: "1978",
    driver: "Ronald Richards",
    brand: "Ford",
    model: "F150",
    status: "Disponible",
    stats: {
      kilometraje: { value: "97,528", percentage: 25 },
      viajesRealizados: { value: "150", percentage: 60 },
      visitasAlTaller: { value: "4", percentage: 15 },
      combustible: { value: "1/2", percentage: 50 },
      vecesNoDisponible: { value: "35", percentage: 30 },
    },
  };

  // Animation effect for progress bars
  useEffect(() => {
    const timer = setTimeout(() => {
      Object.keys(truck.stats).forEach((key, index) => {
        setTimeout(() => {
          setLoadingProgress((prev) => ({
            ...prev,
            [key]: truck.stats[key].percentage,
          }));
        }, index * 300);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
    <div className="h-screen overflow-hidden" style={{ backgroundColor: '#34353A' }}>
      <div className="h-full flex flex-col">
        <div className="flex-1 p-6 overflow-hidden">
          <div className="bg-white rounded-3xl shadow-lg h-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-gray-200 flex-shrink-0">
              <button onClick={handleBackToMenu} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Información del vehículo</h1>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar - Statistics */}
              <div className="w-80 p-8 border-r border-gray-200 bg-gray-50 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-800 mb-8">Estadísticas del vehículo</h2>

                <div className="space-y-10">
                  {Object.entries(truck.stats).map(([key, stat], index) => {
                    const labels = {
                      kilometraje: "Kilometraje",
                      viajesRealizados: "Viajes realizados",
                      visitasAlTaller: "Visitas al taller",
                      combustible: "Combustible",
                      vecesNoDisponible: "Veces no disponible",
                    };

                    return (
                      <div key={key} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium text-base">{labels[key]}</span>
                          <span className="font-bold text-gray-900 text-xl">{stat.value}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${loadingProgress[key] || 0}%`,
                              transitionDelay: `${index * 300}ms`,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                  {/* Image Carousel */}
                  <div className="relative mb-6">
                    <div className="w-full h-72 bg-white rounded-2xl overflow-hidden relative shadow-md">
                      <img
                        src={truck.images[currentImageIndex]}
                        alt="Truck"
                        className="w-full h-full object-contain"
                      />

                      {/* Navigation Arrows */}
                      {truck.images.length > 1 && (
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
                      {truck.images.length > 1 && (
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

                  {/* Vehicle Info Cards - Top Row */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.1] hover:shadow-2xl hover:rotate-[10deg] hover:translate-y-4 hover:bg-gradient-to-r hover:from-purple-300 hover:to-pink-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{truck.plate}</div>
                          <div className="text-sm text-gray-500">Tarjeta de circulación</div>
                        </div>
                        <div className="text-3xl">🇺🇸</div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.1] hover:shadow-2xl hover:rotate-[10deg] hover:translate-y-4 hover:bg-gradient-to-r hover:from-purple-300 hover:to-pink-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{truck.card}</div>
                          <div className="text-sm text-gray-500">Placa</div>
                        </div>
                        <div className="text-3xl">🏆</div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.1] hover:shadow-2xl hover:rotate-[10deg] hover:translate-y-4 hover:bg-gradient-to-r hover:from-purple-300 hover:to-pink-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{truck.year}</div>
                          <div className="text-sm text-gray-500">Año</div>
                        </div>
                        <div className="text-3xl">🚚</div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info Cards - Bottom Row */}
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.1] hover:shadow-2xl hover:rotate-[10deg] hover:translate-y-4 hover:bg-gradient-to-r hover:from-purple-300 hover:to-pink-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{truck.driver}</div>
                          <div className="text-sm text-gray-500">Motorista encargado</div>
                        </div>
                        <div className="text-3xl">👤</div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.1] hover:shadow-2xl hover:rotate-[10deg] hover:translate-y-4 hover:bg-gradient-to-r hover:from-purple-300 hover:to-pink-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{truck.brand}</div>
                          <div className="text-sm text-gray-500">Marca</div>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">F</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.1] hover:shadow-2xl hover:rotate-[10deg] hover:translate-y-4 hover:bg-gradient-to-r hover:from-purple-300 hover:to-pink-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{truck.model}</div>
                          <div className="text-sm text-gray-500">Modelo</div>
                        </div>
                        <div className="text-3xl">🚛</div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-end">
                    <div className="inline-flex items-center px-6 py-3 rounded-full bg-green-100 border border-green-200 shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-green-700 font-semibold text-lg mr-3">{truck.status}</span>
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    </div>
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
