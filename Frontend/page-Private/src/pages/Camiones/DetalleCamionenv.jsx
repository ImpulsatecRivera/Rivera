import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTruckDetail } from '../../components/Camiones/hooks/HookVer'; // Ajusta la ruta según tu estructura
import CamionFord from "../../images/CamionFord.jpg";

const TruckDetailScreen = () => {
  const { id: truckId } = useParams();
  const navigate = useNavigate();
  const { truck, loading, error, refetch } = useTruckDetail(truckId);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState({});

  // Efecto para las animaciones de las barras de progreso
  useEffect(() => {
    if (truck?.stats) {
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
    }
  }, [truck]);

  const nextImage = () => {
    if (truck?.images) {
      setCurrentImageIndex((prev) =>
        prev === truck.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (truck?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? truck.images.length - 1 : prev - 1
      );
    }
  };

  const handleBackToMenu = () => {
    navigate('/camiones');
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const getStatusColor = (status) => {
    if (!status || status.trim() === '' || status === 'No especificado') {
      return 'bg-gray-100 text-gray-600';
    }
    switch (status.toUpperCase()) {
      case 'DISPONIBLE':
        return 'bg-green-100 text-green-700';
      case 'NO DISPONIBLE':
        return 'bg-red-100 text-red-700';
      case 'MANTENIMIENTO':
        return 'bg-yellow-100 text-yellow-700';
      case 'EN RUTA':
        return 'bg-blue-100 text-blue-700';
      case 'SIN ESTADO':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusDotColor = (status) => {
    if (!status || status.trim() === '' || status === 'No especificado') {
      return 'bg-gray-400';
    }
    switch (status.toUpperCase()) {
      case 'DISPONIBLE':
        return 'bg-green-500';
      case 'NO DISPONIBLE':
        return 'bg-red-500';
      case 'MANTENIMIENTO':
        return 'bg-yellow-500';
      case 'EN RUTA':
        return 'bg-blue-500';
      case 'SIN ESTADO':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="h-screen overflow-hidden" style={{ backgroundColor: '#34353A' }}>
        <div className="h-full flex flex-col">
          <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-hidden">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg h-full overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 sm:gap-4 p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                <button onClick={handleBackToMenu} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft size={18} className="text-gray-600 sm:w-5 sm:h-5" />
                </button>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Información del vehículo</h1>
              </div>
              <div className="flex-1 flex justify-center items-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-4" />
                  <p className="text-gray-600 text-sm sm:text-base">Cargando información del camión...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen overflow-hidden" style={{ backgroundColor: '#34353A' }}>
        <div className="h-full flex flex-col">
          <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-hidden">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg h-full overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 sm:gap-4 p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                <button onClick={handleBackToMenu} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft size={18} className="text-gray-600 sm:w-5 sm:h-5" />
                </button>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Error al cargar el camión</h1>
              </div>
              <div className="flex-1 flex justify-center items-center px-4">
                <div className="text-center max-w-md">
                  <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Error al cargar</h2>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
                  <button 
                    onClick={refetch}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="h-screen overflow-hidden" style={{ backgroundColor: '#34353A' }}>
        <div className="h-full flex flex-col">
          <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-hidden">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg h-full overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 sm:gap-4 p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                <button onClick={handleBackToMenu} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft size={18} className="text-gray-600 sm:w-5 sm:h-5" />
                </button>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Camión no encontrado</h1>
              </div>
              <div className="flex-1 flex justify-center items-center">
                <div className="text-center">
                  <p className="text-gray-600 text-sm sm:text-base">No se encontró información del camión</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden" style={{ backgroundColor: '#34353A' }}>
      <div className="h-full flex flex-col">
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg h-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-4 p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <button onClick={handleBackToMenu} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={18} className="text-gray-600 sm:w-5 sm:h-5" />
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Información del vehículo</h1>
            </div>

            <div className="flex flex-1 flex-col xl:flex-row overflow-hidden">
              {/* Left Sidebar - Statistics */}
              <div className="w-full xl:w-80 2xl:w-96 p-4 sm:p-6 lg:p-8 border-b xl:border-b-0 xl:border-r border-gray-200 bg-gray-50 flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6 sm:mb-8">Estadísticas del vehículo</h2>

                <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                  {Object.entries(truck.stats).map(([key, stat], index) => {
                    const labels = {
                      kilometraje: "Kilometraje",
                      viajesRealizados: "Viajes realizados",
                      visitasAlTaller: "Visitas al taller",
                      combustible: "Combustible",
                      vecesNoDisponible: "Veces no disponible",
                    };

                    return (
                      <div key={key} className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium text-sm sm:text-base">{labels[key]}</span>
                          <span className="font-bold text-gray-900 text-lg sm:text-xl">{stat.value}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
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
                <div className="p-4 sm:p-6 lg:p-8">
                  {/* Image Carousel */}
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-full h-48 sm:h-60 md:h-72 lg:h-80 bg-white rounded-xl sm:rounded-2xl overflow-hidden relative shadow-md">
                      <img
                        src={truck.images[currentImageIndex] || CamionFord}
                        alt={truck.name}
                        className="w-full h-full object-contain"
                      />

                      {/* Navigation Arrows */}
                      {truck.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 sm:p-2 transition-all"
                          >
                            <ChevronLeft size={16} className="text-gray-700 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 sm:p-2 transition-all"
                          >
                            <ChevronRight size={16} className="text-gray-700 sm:w-5 sm:h-5" />
                          </button>
                        </>
                      )}

                      {/* Image Indicators */}
                      {truck.images.length > 1 && (
                        <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2">
                          {truck.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => goToImage(index)}
                              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                    <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{truck.plate}</div>
                          <div className="text-xs sm:text-sm text-gray-500">Placa</div>
                        </div>
                        <div className="text-2xl sm:text-3xl ml-2">🚗</div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{truck.card}</div>
                          <div className="text-xs sm:text-sm text-gray-500">Tarjeta de circulación</div>
                        </div>
                        <div className="text-2xl sm:text-3xl ml-2">📋</div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-md sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{truck.year}</div>
                          <div className="text-xs sm:text-sm text-gray-500">Año</div>
                        </div>
                        <div className="text-2xl sm:text-3xl ml-2">📅</div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info Cards - Bottom Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{truck.driver}</div>
                          <div className="text-xs sm:text-sm text-gray-500">Motorista encargado</div>
                        </div>
                        <div className="text-2xl sm:text-3xl ml-2">👤</div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{truck.brand}</div>
                          <div className="text-xs sm:text-sm text-gray-500">Marca</div>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                          <span className="text-white font-bold text-sm sm:text-lg">{truck.brand.charAt(0)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-md sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{truck.model}</div>
                          <div className="text-xs sm:text-sm text-gray-500">Modelo</div>
                        </div>
                        <div className="text-2xl sm:text-3xl ml-2">🚛</div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-center sm:justify-end">
                    <div className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full border shadow-sm ${getStatusColor(truck.status)} max-w-full`}>
                      <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2 sm:mr-3 ${getStatusDotColor(truck.status)}`} />
                      <span className="font-semibold text-sm sm:text-lg mr-2 sm:mr-3 truncate">
                        {truck.status === 'No especificado' ? 'Sin estado' : truck.status}
                      </span>
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-current rounded-full flex items-center justify-center opacity-70 flex-shrink-0">
                        <span className="text-white text-xs sm:text-sm font-bold">✓</span>
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