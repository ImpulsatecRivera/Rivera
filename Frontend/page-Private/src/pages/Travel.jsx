import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, ArrowLeft, Check, X, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TravelDashboard = () => {
  const navigate = useNavigate();
  // Agregamos estilos CSS para las animaciones personalizadas
  const styles = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
      20%, 40%, 60%, 80% { transform: translateX(3px); }
    }
    
    @keyframes redPulse {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
      }
      50% { 
        box-shadow: 0 0 0 20px rgba(239, 68, 68, 0);
      }
    }
    
    @keyframes greenPulse {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
      }
      50% { 
        box-shadow: 0 0 0 20px rgba(34, 197, 94, 0);
      }
    }
    
    @keyframes bluePulse {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
      }
      50% { 
        box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
      }
    }
    
    @keyframes grayPulse {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(107, 114, 128, 0.4);
      }
      50% { 
        box-shadow: 0 0 0 20px rgba(107, 114, 128, 0);
      }
    }
    
    @keyframes wiggle {
      0%, 7%, 14%, 21%, 28%, 35%, 42%, 49%, 56%, 63%, 70%, 77%, 84%, 91%, 98%, 100% {
        transform: rotate(0deg);
      }
      3.5%, 10.5%, 17.5%, 24.5%, 31.5%, 38.5%, 45.5%, 52.5%, 59.5%, 66.5%, 73.5%, 80.5%, 87.5%, 94.5% {
        transform: rotate(-2deg);
      }
    }
    
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .animate-shake {
      animation: shake 0.8s ease-in-out;
    }
    
    .animate-red-pulse {
      animation: redPulse 2s infinite;
    }
    
    .animate-green-pulse {
      animation: greenPulse 2s infinite;
    }
    
    .animate-blue-pulse {
      animation: bluePulse 2s infinite;
    }
    
    .animate-gray-pulse {
      animation: grayPulse 2s infinite;
    }
    
    .animate-wiggle {
      animation: wiggle 1s ease-in-out infinite;
    }
    
    .animate-heartbeat {
      animation: heartbeat 1.5s ease-in-out infinite;
    }

    /* Responsivo personalizado */
    @media (max-width: 768px) {
      .mobile-padding {
        padding: 1rem !important;
      }
      
      .mobile-text {
        font-size: 0.875rem !important;
      }
      
      .mobile-header {
        font-size: 1.25rem !important;
      }
    }
  `;

  // Inyectamos los estilos en el head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleAddTruck = () => navigate('/viajes/maps');

  const barHeights = [60, 80, 45, 90, 120, 70, 50, 85, 95, 110, 140, 75, 65, 100];
  const [animatedBars, setAnimatedBars] = useState(Array(14).fill(0));
  const [animatedProgress, setAnimatedProgress] = useState(Array(5).fill(0));
  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditClosing, setIsEditClosing] = useState(false);
  const [showConfirmEditModal, setShowConfirmEditModal] = useState(false);
  const [isConfirmEditClosing, setIsConfirmEditClosing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSuccessClosing, setIsSuccessClosing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleteClosing, setIsDeleteClosing] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [isDeleteSuccessClosing, setIsDeleteSuccessClosing] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [isProgramClosing, setIsProgramClosing] = useState(false);
  const [showProgramSuccessModal, setShowProgramSuccessModal] = useState(false);
  const [isProgramSuccessClosing, setIsProgramSuccessClosing] = useState(false);
  const [editForm, setEditForm] = useState({
    cotizacion: '300.00',
    horaLlegada: '7:00 AM',
    descripcion: 'Descarga de productos en walmart\nconstitución',
    horaSalida: '8 PM',
    auxiliar: 'Johan Velasco'
  });
  
  const [programForm, setProgramForm] = useState({
    cotizacion: '',
    horaLlegada: '',
    descripcion: '',
    horaSalida: '',
    auxiliar: ''
  });

  const handleTripMenuClick = (trip, index) => {
    setSelectedTrip({ ...trip, index });
    setShowModal(true);
    setIsClosing(false);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedTrip(null);
      setIsClosing(false);
    }, 300);
  };

  const handleEdit = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedTrip(null);
      setIsClosing(false);
      setShowEditModal(true);
      setIsEditClosing(false);
    }, 300);
  };

  const handleUpdateTrip = () => {
    setIsEditClosing(true);
    setTimeout(() => {
      setShowEditModal(false);
      setIsEditClosing(false);
      setShowConfirmEditModal(true);
      setIsConfirmEditClosing(false);
    }, 300);
  };

  const handleConfirmEdit = () => {
    console.log('Actualizando viaje:', editForm);
    setIsConfirmEditClosing(true);
    setTimeout(() => {
      setShowConfirmEditModal(false);
      setIsConfirmEditClosing(false);
      setShowSuccessModal(true);
      setIsSuccessClosing(false);
    }, 300);
  };

  const handleCancelEdit = () => {
    setIsConfirmEditClosing(true);
    setTimeout(() => {
      setShowConfirmEditModal(false);
      setIsConfirmEditClosing(false);
      setShowEditModal(true);
      setIsEditClosing(false);
    }, 300);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessClosing(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setIsSuccessClosing(false);
    }, 300);
  };

  const handleCloseEditModal = () => {
    setIsEditClosing(true);
    setTimeout(() => {
      setShowEditModal(false);
      setIsEditClosing(false);
    }, 300);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedTrip(null);
      setIsClosing(false);
      setShowDeleteModal(true);
      setIsDeleteClosing(false);
    }, 300);
  };

  const handleConfirmDelete = () => {
    console.log('Eliminando viaje:', selectedTrip);
    setIsDeleteClosing(true);
    setTimeout(() => {
      setShowDeleteModal(false);
      setIsDeleteClosing(false);
      setShowDeleteSuccessModal(true);
      setIsDeleteSuccessClosing(false);
    }, 300);
  };

  const handleCloseDeleteSuccessModal = () => {
    setIsDeleteSuccessClosing(true);
    setTimeout(() => {
      setShowDeleteSuccessModal(false);
      setIsDeleteSuccessClosing(false);
      setSelectedTrip(null);
    }, 300);
  };

  const handleOpenProgramModal = () => {
    setShowProgramModal(true);
    setIsProgramClosing(false);
  };

  const handleCloseProgramModal = () => {
    setIsProgramClosing(true);
    setTimeout(() => {
      setShowProgramModal(false);
      setIsProgramClosing(false);
      setProgramForm({
        cotizacion: '',
        horaLlegada: '',
        descripcion: '',
        horaSalida: '',
        auxiliar: ''
      });
    }, 300);
  };

  const handleProgramInputChange = (field, value) => {
    setProgramForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProgramTrip = () => {
    console.log('Programando viaje:', programForm);
    setShowProgramSuccessModal(true);
    setIsProgramSuccessClosing(false);
  };

  const handleCloseProgramSuccessModal = () => {
    setIsProgramSuccessClosing(true);
    setTimeout(() => {
      setShowProgramSuccessModal(false);
      setIsProgramSuccessClosing(false);
      setIsProgramClosing(true);
      setTimeout(() => {
        setShowProgramModal(false);
        setIsProgramClosing(false);
        setProgramForm({
          cotizacion: '',
          horaLlegada: '',
          descripcion: '',
          horaSalida: '',
          auxiliar: ''
        });
      }, 300);
    }, 300);
  };

  const handleCancelDelete = () => {
    setIsDeleteClosing(true);
    setTimeout(() => {
      setShowDeleteModal(false);
      setIsDeleteClosing(false);
      setShowModal(true);
      setIsClosing(false);
    }, 300);
  };

  const progressValues = [85, 70, 55, 40, 30];

  useEffect(() => {
    const animateBars = () => {
      barHeights.forEach((height, index) => {
        setTimeout(() => {
          setAnimatedBars(prev => {
            const newBars = [...prev];
            newBars[index] = height;
            return newBars;
          });
        }, index * 100);
      });
    };

    const animateProgress = () => {
      progressValues.forEach((progress, index) => {
        setTimeout(() => {
          setAnimatedProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = progress;
            return newProgress;
          });
        }, index * 200 + 1000);
      });
    };

    animateBars();
    animateProgress();
  }, []);

  const scheduledTrips = [
    { 
      type: 'Grocery', 
      color: 'bg-blue-500', 
      status: 'bg-green-400',
      time: '5:12 pm',
      description: 'Belanja di pasar',
      icon: '🛒'
    },
    { 
      type: 'Transportation', 
      color: 'bg-purple-500', 
      status: 'bg-red-400',
      time: '5:12 pm',
      description: 'Naik bus umum',
      icon: '🚌'
    },
    { 
      type: 'Housing', 
      color: 'bg-orange-500', 
      status: 'bg-yellow-400',
      time: '5:12 pm',
      description: 'Bayar Listrik',
      icon: '🏠'
    },
    { 
      type: 'Housing', 
      color: 'bg-orange-500', 
      status: 'bg-green-400',
      time: '5:12 pm',
      description: 'Bayar Listrik',
      icon: '🏠'
    },
    { 
      type: 'Housing', 
      color: 'bg-orange-500', 
      status: 'bg-yellow-400',
      time: '5:12 pm',
      description: 'Bayar Listrik',
      icon: '🏠'
    },
    { 
      type: 'Housing', 
      color: 'bg-orange-500', 
      status: 'bg-red-400',
      time: '5:12 pm',
      description: 'Bayar Listrik',
      icon: '🏠'
    }
  ];

  const earningsData = [
    { category: 'Food and Drinks', amount: '879,400', progress: animatedProgress[0], color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { category: 'Shopping', amount: '1,378,200', progress: animatedProgress[1], color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { category: 'Housing', amount: '928,500', progress: animatedProgress[2], color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { category: 'Transportation', amount: '420,700', progress: animatedProgress[3], color: 'bg-gradient-to-r from-cyan-500 to-cyan-600' },
    { category: 'Vehicle', amount: '520,000', progress: animatedProgress[4], color: 'bg-gradient-to-r from-pink-500 to-pink-600' }
  ];

  return (
    <div className="flex h-screen bg-[#34353A] overflow-hidden">
      <div className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div className="bg-white rounded-xl p-2 sm:p-4 lg:p-8 h-full overflow-hidden">
          {/* Layout responsivo: columna única en móvil, grid en desktop */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8 h-full">
            
            {/* Columna principal - Gráfico de viajes y lista */}
            <div className="xl:col-span-2 bg-gray-50 rounded-xl lg:rounded-3xl shadow-sm overflow-hidden order-1">
              <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
                <div className="mb-4 lg:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Viajes</h2>
                  <p className="text-gray-500 text-sm">Porcentaje de viajes</p>
                </div>
                
                {/* Gráfico de barras animado - responsivo */}
                <div className="mb-4 lg:mb-8 flex-shrink-0">
                  <div className="flex items-end justify-center space-x-1 sm:space-x-2 h-24 sm:h-32">
                    {animatedBars.map((height, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className={`w-2 sm:w-4 rounded-t-sm transition-all duration-1000 ease-out ${
                            index === 10 ? 'bg-gradient-to-t from-purple-600 to-purple-400' : 
                            index % 3 === 0 ? 'bg-gradient-to-t from-emerald-500 to-emerald-300' :
                            index % 3 === 1 ? 'bg-gradient-to-t from-orange-500 to-orange-300' :
                            'bg-gradient-to-t from-cyan-500 to-cyan-300'
                          }`}
                          style={{
                            height: `${height * 0.7}px`,
                            transform: `scaleY(${height / barHeights[index] || 0})`,
                            transformOrigin: 'bottom'
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Lista de viajes programados */}
                <div className="flex-1 overflow-auto">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Viajes programados de este día</h3>
                  
                  <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                    {scheduledTrips.map((trip, index) => (
                      <div key={index} className="flex items-center p-2 sm:p-3 hover:bg-white rounded-lg xl:rounded-xl transition-colors group">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${trip.color} flex items-center justify-center mr-3 sm:mr-4`}>
                          <span className="text-white text-xs sm:text-sm">
                            {trip.icon}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900 text-sm sm:text-base">{trip.type}</div>
                              <div className="text-xs sm:text-sm text-gray-500">{trip.time} • {trip.description}</div>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <button 
                                onClick={() => handleTripMenuClick(trip, index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                              >
                                <MoreHorizontal size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                              </button>
                              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${trip.status}`}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Botón Programar Viaje */}
                <div className="mt-2 sm:mt-4 px-0 sm:px-8">
                  <button 
                    onClick={handleOpenProgramModal}
                    className="w-full p-3 sm:p-4 text-gray-900 hover:bg-gray-50 rounded-lg xl:rounded-xl transition-colors flex items-center justify-start"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-black rounded-full flex items-center justify-center mr-2 sm:mr-3">
                      <Plus size={12} className="text-white sm:w-3.5 sm:h-3.5" />
                    </div>
                    <span className="font-medium text-sm sm:text-base">Programar un viaje</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Columna derecha - Ganancias y estadísticas */}
            <div className="space-y-4 lg:space-y-6 h-full flex flex-col order-2 xl:order-3">
              {/* Card de ganancias */}
              <div className="bg-gray-50 rounded-xl lg:rounded-3xl shadow-sm p-4 sm:p-6 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Porcentaje de ganancias</h3>
                <div className="space-y-3 lg:space-y-5">
                  {earningsData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-700">{item.category}</span>
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">{item.amount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div 
                          className={`${item.color} h-1.5 sm:h-2 rounded-full transition-all duration-1000 ease-out shadow-sm`}
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Card de rutas */}
              <div className="bg-gray-50 rounded-xl lg:rounded-3xl shadow-sm p-4 sm:p-6 flex-shrink-0">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 relative">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-400 rounded-md sm:rounded-lg"></div>
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-6 sm:h-6 bg-blue-500 rounded-md sm:rounded-lg"></div>
                  </div>
                  <div className="w-10 h-4 sm:w-12 sm:h-6 bg-blue-500 rounded-md sm:rounded-lg mx-auto mb-3"></div>
                  <div className="w-6 h-3 sm:w-8 sm:h-4 bg-gray-300 rounded mx-auto"></div>
                </div>
                
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 text-center">Ver rutas frecuentes</h3>
                <p className="text-gray-500 text-xs mb-4 text-center">
                  eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                  Ut enim ad minim.
                </p>
                
                <button
                  onClick={handleAddTruck} 
                  className="w-full bg-gray-900 text-white py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  Ver mas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Selección de Acción - Responsivo */}
        {showModal && (
          <div 
            className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
              isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
            }`}
            onClick={handleCloseModal}
          >
            <div 
              className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md w-full mx-4 relative transform transition-all duration-300 ease-out ${
                isClosing 
                  ? 'scale-95 opacity-0 translate-y-4' 
                  : 'scale-100 opacity-100 translate-y-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 sm:top-6 left-4 sm:left-6 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <ArrowLeft size={18} className="text-gray-600 sm:w-5 sm:h-5" />
              </button>
              
              <div className="text-center mt-8 lg:mt-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transform transition-all duration-500 animate-wiggle animate-gray-pulse">
                  <span className="text-white text-2xl sm:text-3xl font-bold animate-heartbeat">?</span>
                </div>
                
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 transform transition-all duration-300 delay-100 animate-fade-in-up px-2">
                  ¿Deseas editar o eliminar un viaje?
                </h2>
                
                <p className="text-gray-600 mb-6 sm:mb-8 transform transition-all duration-300 delay-200 animate-fade-in-up text-sm sm:text-base">
                  Elija la opción
                </p>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 transform transition-all duration-300 delay-300 animate-fade-in-up">
                  <button 
                    onClick={handleDelete}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:rotate-1 hover:shadow-red-300 active:animate-pulse text-sm sm:text-base"
                  >
                    Eliminar
                  </button>
                  <button 
                    onClick={handleEdit}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:-rotate-1 hover:shadow-green-300 active:animate-pulse text-sm sm:text-base"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edición de Viaje - Responsivo */}
        {showEditModal && (
          <div 
            className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
              isEditClosing ? 'bg-opacity-0' : 'bg-opacity-50'
            }`}
            onClick={handleCloseEditModal}
          >
            <div 
              className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ease-out ${
                isEditClosing 
                  ? 'scale-95 opacity-0 translate-y-4' 
                  : 'scale-100 opacity-100 translate-y-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={handleCloseEditModal}
                className="absolute top-4 sm:top-6 left-4 sm:left-6 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <ArrowLeft size={18} className="text-gray-600 sm:w-5 sm:h-5" />
              </button>
              
              <div className="mt-8 lg:mt-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center animate-fade-in-up">
                  Editar Viaje
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {/* Cotización */}
                  <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cotización
                    </label>
                    <input
                      type="text"
                      value={editForm.cotizacion}
                      onChange={(e) => handleInputChange('cotizacion', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center hover:scale-105 focus:scale-105 text-sm sm:text-base"
                      placeholder="300.00"
                    />
                  </div>

                  {/* Hora de llegada */}
                  <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de llegada
                    </label>
                    <input
                      type="text"
                      value={editForm.horaLlegada}
                      onChange={(e) => handleInputChange('horaLlegada', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center hover:scale-105 focus:scale-105 text-sm sm:text-base"
                      placeholder="7:00 AM"
                    />
                  </div>

                  {/* Descripción del viaje */}
                  <div className="lg:col-span-2 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción del viaje
                    </label>
                    <textarea
                      value={editForm.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      rows={4}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-center hover:scale-105 focus:scale-105 text-sm sm:text-base"
                      placeholder="Descarga de productos en walmart constitución"
                    />
                  </div>

                  {/* Hora de salida */}
                  <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de salida
                    </label>
                    <input
                      type="text"
                      value={editForm.horaSalida}
                      onChange={(e) => handleInputChange('horaSalida', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center hover:scale-105 focus:scale-105 text-sm sm:text-base"
                      placeholder="8 PM"
                    />
                  </div>

                  {/* Auxiliar */}
                  <div className="animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auxiliar <span className="text-xs text-gray-500">(Campo no obligatorio)</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.auxiliar}
                      onChange={(e) => handleInputChange('auxiliar', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center hover:scale-105 focus:scale-105 text-sm sm:text-base"
                      placeholder="Johan Velasco"
                    />
                  </div>
                </div>

                {/* Botón de actualizar */}
                <div className="mt-6 sm:mt-8 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                  <button 
                    onClick={handleUpdateTrip}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:shadow-green-300 active:animate-pulse"
                  >
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación para Editar - Responsivo */}
        {showConfirmEditModal && (
          <div 
            className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
              isConfirmEditClosing ? 'bg-opacity-0' : 'bg-opacity-50'
            }`}
            onClick={handleCancelEdit}
          >
            <div 
              className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md w-full mx-4 relative transform transition-all duration-300 ease-out ${
                isConfirmEditClosing 
                  ? 'scale-95 opacity-0 translate-y-4' 
                  : 'scale-100 opacity-100 translate-y-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transform transition-all duration-500 animate-wiggle animate-blue-pulse">
                  <span className="text-blue-600 text-2xl sm:text-3xl font-bold animate-heartbeat">?</span>
                </div>
                
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 transform transition-all duration-300 delay-100 animate-fade-in-up px-2">
                  ¿Desea editar los datos?
                </h2>
                
                <p className="text-gray-600 mb-6 sm:mb-8 transform transition-all duration-300 delay-200 animate-fade-in-up text-sm sm:text-base">
                  Elija la opción
                </p>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 transform transition-all duration-300 delay-300 animate-fade-in-up">
                  <button 
                    onClick={handleCancelEdit}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:rotate-1 hover:shadow-red-300 active:animate-pulse text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConfirmEdit}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:-rotate-1 hover:shadow-green-300 active:animate-pulse text-sm sm:text-base"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Éxito - Responsivo */}
        {showSuccessModal && (
          <div 
            className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
              isSuccessClosing ? 'bg-opacity-0' : 'bg-opacity-50'
            }`}
            onClick={handleCloseSuccessModal}
          >
            <div 
              className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md w-full mx-4 relative transform transition-all duration-300 ease-out ${
                isSuccessClosing 
                  ? 'scale-95 opacity-0 translate-y-4' 
                  : 'scale-100 opacity-100 translate-y-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transform transition-all duration-500 animate-heartbeat animate-green-pulse">
                  <Check size={28} className="text-green-600 animate-bounce sm:w-9 sm:h-9" />
                </div>
                
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 transform transition-all duration-300 delay-100 animate-fade-in-up">
                  Viaje agregado con éxito
                </h2>
                
                <p className="text-gray-600 mb-6 sm:mb-8 transform transition-all duration-300 delay-200 animate-fade-in-up text-sm sm:text-base">
                  Viaje agregado correctamente
                </p>
                
                <div className="transform transition-all duration-300 delay-300 animate-fade-in-up">
                  <button 
                    onClick={handleCloseSuccessModal}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:shadow-green-300 active:animate-pulse text-sm sm:text-base"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Eliminación - Responsivo */}
        {showDeleteModal && (
          <div 
            className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
              isDeleteClosing ? 'bg-opacity-0' : 'bg-opacity-50'
            }`}
            onClick={handleCancelDelete}
          >
            <div 
              className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md w-full mx-4 relative transform transition-all duration-300 ease-out ${
                isDeleteClosing 
                  ? 'scale-95 opacity-0 translate-y-4' 
                  : 'scale-100 opacity-100 translate-y-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transform transition-all duration-500 hover:scale-110 animate-shake animate-red-pulse">
                  <X size={28} className="text-red-600 animate-bounce sm:w-9 sm:h-9" />
                </div>
                
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 transform transition-all duration-300 delay-100 animate-fade-in-up px-2">
                  ¿Está seguro de que desea eliminar este viaje?
                </h2>
                
                <p className="text-gray-600 mb-6 sm:mb-8 transform transition-all duration-300 delay-200 animate-fade-in-up text-sm sm:text-base">
                  Este viaje se eliminará con esta acción
                </p>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 transform transition-all duration-300 delay-300 animate-fade-in-up">
                  <button 
                    onClick={handleCancelDelete}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:rotate-1 hover:shadow-gray-300 text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConfirmDelete}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:-rotate-1 hover:shadow-red-300 active:animate-pulse text-sm sm:text-base"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Éxito de Eliminación - Responsivo */}
        {showDeleteSuccessModal && (
          <div 
            className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
              isDeleteSuccessClosing ? 'bg-opacity-0' : 'bg-opacity-50'
            }`}
            onClick={handleCloseDeleteSuccessModal}
          >
            <div 
              className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md w-full mx-4 relative transform transition-all duration-300 ease-out ${
                isDeleteSuccessClosing 
                  ? 'scale-95 opacity-0 translate-y-4' 
                  : 'scale-100 opacity-100 translate-y-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transform transition-all duration-500 animate-heartbeat animate-green-pulse">
                  <Check size={28} className="text-green-600 animate-bounce sm:w-9 sm:h-9" />
                </div>
                
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 transform transition-all duration-300 delay-100 animate-fade-in-up">
                  Viaje eliminado con éxito
                </h2>
                
                <p className="text-gray-600 mb-6 sm:mb-8 transform transition-all duration-300 delay-200 animate-fade-in-up text-sm sm:text-base">
                  Viaje eliminado correctamente
                </p>
                
                <div className="transform transition-all duration-300 delay-300 animate-fade-in-up">
                  <button 
                    onClick={handleCloseDeleteSuccessModal}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:shadow-green-300 active:animate-pulse text-sm sm:text-base"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Programar Viaje - Completamente Responsivo */}
        {showProgramModal && (
          <div 
            className={`fixed inset-0 bg-gray-800 z-50 transition-all duration-300 ease-out ${
              isProgramClosing ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {/* Header oscuro */}
            <div className="bg-gray-800 text-white p-3 sm:p-4 flex items-center">
              <button 
                onClick={handleCloseProgramModal}
                className="flex items-center text-white hover:bg-gray-700 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-colors"
              >
                <ArrowLeft size={18} className="mr-1 sm:mr-2 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium">Volver al menú principal</span>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="bg-white rounded-t-2xl sm:rounded-t-3xl mt-2 sm:mt-4 mx-2 sm:mx-4 mb-2 sm:mb-4 p-4 sm:p-8 lg:p-16 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-6rem)] relative overflow-y-auto">
              {/* Header del formulario */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-8 sm:mb-12 lg:mb-20">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-normal text-black mr-0 sm:mr-6 mb-4 sm:mb-0">Programar viaje</h1>
                <div className="relative">
                  {/* Icono calculadora */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 sm:border-4 border-black rounded-lg flex flex-col justify-center items-center bg-white">
                    <div className="grid grid-cols-3 gap-1 sm:gap-1.5 mb-1">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-black rounded-full"></div>
                    </div>
                  </div>
                  {/* Icono reloj */}
                  <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 bg-black rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-1 sm:border-2 border-white rounded-full relative">
                      <div className="absolute top-0.5 left-1/2 w-0.5 h-1 sm:h-1.5 bg-white transform -translate-x-1/2"></div>
                      <div className="absolute top-1/2 left-0.5 w-0.5 sm:w-1 h-0.5 bg-white transform -translate-y-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primera fila - Responsiva */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 lg:gap-16 mb-6 sm:mb-8 lg:mb-12">
                {/* Cotización */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-base sm:text-lg font-normal text-black mb-2 sm:mb-4">
                    Cotización
                  </label>
                  <input
                    type="text"
                    value={programForm.cotizacion}
                    onChange={(e) => handleProgramInputChange('cotizacion', e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg sm:rounded-xl bg-gray-50 text-gray-600 focus:outline-none focus:border-gray-400 text-sm sm:text-base"
                    placeholder="Introduce la cotización del viaje"
                  />
                </div>

                {/* Hora de llegada */}
                <div>
                  <label className="block text-base sm:text-lg font-normal text-black mb-2 sm:mb-4">
                    Hora de llegada
                  </label>
                  <div className="relative">
                    <select
                      value={programForm.horaLlegada}
                      onChange={(e) => handleProgramInputChange('horaLlegada', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg sm:rounded-xl bg-gray-50 text-gray-600 appearance-none focus:outline-none focus:border-gray-400 text-sm sm:text-base"
                    >
                      <option value="">Hora de llegada</option>
                      <option value="6:00 AM">6:00 AM</option>
                      <option value="7:00 AM">7:00 AM</option>
                      <option value="8:00 AM">8:00 AM</option>
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Auxiliar */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-base sm:text-lg font-normal text-black mb-2 sm:mb-4">
                    Auxiliar <span className="text-gray-500 text-sm">(Campo no obligatorio)</span>
                  </label>
                  <input
                    type="text"
                    value={programForm.auxiliar}
                    onChange={(e) => handleProgramInputChange('auxiliar', e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg sm:rounded-xl bg-gray-50 text-gray-600 focus:outline-none focus:border-gray-400 text-sm sm:text-base"
                    placeholder="Introduce el auxiliar asignado"
                  />
                </div>
              </div>

              {/* Segunda fila - Responsiva */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-16 mb-6 sm:mb-8 lg:mb-12">
                {/* Descripción del viaje */}
                <div>
                  <label className="block text-base sm:text-lg font-normal text-black mb-2 sm:mb-4">
                    Descripción del viaje
                  </label>
                  <textarea
                    value={programForm.descripcion}
                    onChange={(e) => handleProgramInputChange('descripcion', e.target.value)}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg sm:rounded-xl bg-gray-50 text-gray-600 resize-none focus:outline-none focus:border-gray-400 text-sm sm:text-base"
                    placeholder="Introduce la descripción del viaje"
                  />
                </div>

                {/* Hora de salida */}
                <div>
                  <label className="block text-base sm:text-lg font-normal text-black mb-2 sm:mb-4">
                    Hora de salida
                  </label>
                  <div className="relative">
                    <select
                      value={programForm.horaSalida}
                      onChange={(e) => handleProgramInputChange('horaSalida', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg sm:rounded-xl bg-gray-50 text-gray-600 appearance-none focus:outline-none focus:border-gray-400 text-sm sm:text-base"
                    >
                      <option value="">Hora de salida</option>
                      <option value="6:00 PM">6:00 PM</option>
                      <option value="7:00 PM">7:00 PM</option>
                      <option value="8:00 PM">8:00 PM</option>
                      <option value="9:00 PM">9:00 PM</option>
                      <option value="10:00 PM">10:00 PM</option>
                      <option value="11:00 PM">11:00 PM</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de guardar centrado */}
              <div className="flex justify-center">
                <button 
                  onClick={handleProgramTrip}
                  className="bg-green-600 hover:bg-green-700 text-white py-2.5 sm:py-3 px-8 sm:px-12 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm sm:text-base"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Éxito de Programar Viaje - Responsivo */}
        {showProgramSuccessModal && (
          <div 
            className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
              isProgramSuccessClosing ? 'bg-opacity-0' : 'bg-opacity-50'
            }`}
            onClick={handleCloseProgramSuccessModal}
          >
            <div 
              className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md w-full mx-4 relative transform transition-all duration-300 ease-out ${
                isProgramSuccessClosing 
                  ? 'scale-95 opacity-0 translate-y-4' 
                  : 'scale-100 opacity-100 translate-y-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transform transition-all duration-500 animate-heartbeat animate-green-pulse">
                  <Check size={28} className="text-green-600 animate-bounce sm:w-9 sm:h-9" />
                </div>
                
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 transform transition-all duration-300 delay-100 animate-fade-in-up">
                  Viaje agregado con éxito
                </h2>
                
                <p className="text-gray-600 mb-6 sm:mb-8 transform transition-all duration-300 delay-200 animate-fade-in-up text-sm sm:text-base">
                  Viaje agregado correctamente.
                </p>
                
                <div className="transform transition-all duration-300 delay-300 animate-fade-in-up">
                  <button 
                    onClick={handleCloseProgramSuccessModal}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:shadow-green-300 active:animate-pulse text-sm sm:text-base"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelDashboard;