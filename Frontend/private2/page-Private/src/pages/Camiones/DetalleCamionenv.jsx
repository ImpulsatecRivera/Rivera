import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, AlertCircle, Truck } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTruckDetail } from '../../components/Camiones/hooks/HookVer'; // Ajusta la ruta según tu estructura
import CamionFord from "../../images/CamionFord.jpg";

const DetalleCamionenv = () => {
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
          <div className="flex-1 p-6 overflow-hidden">
            <div className="bg-white rounded-3xl shadow-lg h-full overflow-hidden flex flex-col">
              <div className="flex items-center gap-4 p-6 border-b border-gray-200 flex-shrink-0">
                <button onClick={handleBackToMenu} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-xl font-semibold text-gray-800">Información del vehículo</h1>
              </div>
              
              {/* Enhanced Loading Screen */}
              <div className="flex-1 flex items-center justify-center relative" 
                   style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b2f 100%)'}}>
                
                {/* Background Animation */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-10 animate-pulse"
                       style={{backgroundColor: '#5F8EAD'}}>
                  </div>
                  <div className="absolute bottom-10 right-10 w-16 h-16 rounded-full opacity-10 animate-pulse"
                       style={{backgroundColor: '#5D9646', animationDelay: '1s'}}>
                  </div>
                  <div className="absolute top-1/2 left-4 w-12 h-12 rounded-full opacity-10 animate-pulse"
                       style={{backgroundColor: '#5F8EAD', animationDelay: '0.5s'}}>
                  </div>
                </div>

                <div className="text-center z-10">
                  {/* Enhanced Profile Loading Animation */}
                  <div className="relative mb-8">
                    <div className="w-28 h-28 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl overflow-hidden relative" 
                         style={{background: 'linear-gradient(135deg, #5F8EAD 0%, #5D9646 100%)'}}>
                      <Truck className="w-14 h-14 text-white animate-pulse" />
                      
                      {/* Multiple rotating borders */}
                      <div className="absolute inset-0 rounded-2xl border-4 border-transparent animate-spin"
                           style={{
                             borderTopColor: '#FFFFFF',
                             borderRightColor: 'rgba(255,255,255,0.3)'
                           }}>
                      </div>
                      <div className="absolute inset-2 rounded-xl border-2 border-transparent animate-spin"
                           style={{
                             borderBottomColor: '#FFFFFF',
                             borderLeftColor: 'rgba(255,255,255,0.2)',
                             animationDirection: 'reverse'
                           }}>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Loading Text */}
                  <div className="space-y-4 mb-8">
                    <h2 className="text-2xl font-bold text-white animate-pulse">
                      Cargando Camión
                    </h2>
                    <p className="text-gray-300 text-lg">
                      Preparando información del vehículo
                    </p>
                  </div>

                  {/* Modern Loading Dots with Ripple Effect */}
                  <div className="flex justify-center space-x-3 mb-8">
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full animate-bounce" 
                           style={{
                             backgroundColor: '#5F8EAD',
                             animationDelay: '0ms'
                           }}>
                      </div>
                      <div className="absolute inset-0 w-4 h-4 rounded-full animate-ping" 
                           style={{backgroundColor: '#5F8EAD', opacity: '0.3'}}>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full animate-bounce" 
                           style={{
                             backgroundColor: '#FFFFFF',
                             animationDelay: '0.2s'
                           }}>
                      </div>
                      <div className="absolute inset-0 w-4 h-4 rounded-full animate-ping" 
                           style={{backgroundColor: '#FFFFFF', opacity: '0.3', animationDelay: '0.2s'}}>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full animate-bounce" 
                           style={{
                             backgroundColor: '#5D9646',
                             animationDelay: '0.4s'
                           }}>
                      </div>
                      <div className="absolute inset-0 w-4 h-4 rounded-full animate-ping" 
                           style={{backgroundColor: '#5D9646', opacity: '0.3', animationDelay: '0.4s'}}>
                      </div>
                    </div>
                  </div>
                  
                  {/* Advanced Progress Bar */}
                  <div className="w-80 mx-auto">
                    <div className="w-full bg-gray-600 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
                      <div className="h-2 rounded-full relative overflow-hidden animate-pulse"
                           style={{
                             background: 'linear-gradient(90deg, #5F8EAD 0%, #5D9646 50%, #5F8EAD 100%)',
                             width: '100%'
                           }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse">
                        </div>
                      </div>
                    </div>
                    
                    {/* Dynamic Loading Steps */}
                    <div className="text-sm text-gray-400 animate-pulse">
                      <span className="inline-block">
                        Verificando datos del camión...
                      </span>
                    </div>
                  </div>
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
          <div className="flex-1 p-6 overflow-hidden">
            <div className="bg-white rounded-3xl shadow-lg h-full overflow-hidden flex flex-col">
              <div className="flex items-center gap-4 p-6 border-b border-gray-200 flex-shrink-0">
                <button onClick={handleBackToMenu} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-xl font-semibold text-gray-800">Error al cargar el camión</h1>
              </div>
              <div className="flex-1 flex justify-center items-center">
                <div className="text-center max-w-md">
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h2>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button 
                    onClick={refetch}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
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
          <div className="flex-1 p-6 overflow-hidden">
            <div className="bg-white rounded-3xl shadow-lg h-full overflow-hidden flex flex-col">
              <div className="flex items-center gap-4 p-6 border-b border-gray-200 flex-shrink-0">
                <button onClick={handleBackToMenu} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-xl font-semibold text-gray-800">Camión no encontrado</h1>
              </div>
              <div className="flex-1 flex justify-center items-center">
                <div className="text-center">
                  <p className="text-gray-600">No se encontró información del camión</p>
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
        <div className="flex-1 p-6 overflow-hidden">
          <div className="bg-white rounded-3xl shadow-lg h-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-gray-200 flex-shrink-0">
              <button onClick={handleBackToMenu} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Información del vehículo</h1>
            </div>

            <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
              {/* Left Sidebar - Statistics */}
              <div className="w-full lg:w-80 p-8 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 flex-shrink-0">
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
                    <div className="w-full h-60 sm:h-72 bg-white rounded-2xl overflow-hidden relative shadow-md">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{truck.plate}</div>
                          <div className="text-sm text-gray-500">Placa</div>
                        </div>
                        <div className="text-3xl">🚗</div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{truck.card}</div>
                          <div className="text-sm text-gray-500">Tarjeta de circulación</div>
                        </div>
                        <div className="text-3xl">📋</div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{truck.year}</div>
                          <div className="text-sm text-gray-500">Año</div>
                        </div>
                        <div className="text-3xl">📅</div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info Cards - Bottom Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{truck.driver}</div>
                          <div className="text-sm text-gray-500">Motorista encargado</div>
                        </div>
                        <div className="text-3xl">👤</div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{truck.brand}</div>
                          <div className="text-sm text-gray-500">Marca</div>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{truck.brand.charAt(0)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-md">
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
                    <div className={`inline-flex items-center px-6 py-3 rounded-full border shadow-sm ${getStatusColor(truck.status)}`}>
                      <div className={`w-3 h-3 rounded-full mr-3 ${getStatusDotColor(truck.status)}`} />
                      <span className="font-semibold text-lg mr-3">
                        {truck.status === 'No especificado' ? 'Sin estado' : truck.status}
                      </span>
                      <div className="w-6 h-6 bg-current rounded-full flex items-center justify-center opacity-70">
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

export default DetalleCamionenv;