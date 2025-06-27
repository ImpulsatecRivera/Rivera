import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, ArrowLeft } from 'lucide-react';

const TravelDashboard = () => {
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
  const [editForm, setEditForm] = useState({
    cotizacion: '300.00',
    horaLlegada: '7:00 AM',
    descripcion: 'Descarga de productos en walmart\nconstitución',
    horaSalida: '8 PM',
    auxiliar: 'Johan Velasco'
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

  // Ahora el botón "Editar" abre directamente el modal de edición
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

  // Cuando se intenta actualizar, se muestra la confirmación
  const handleUpdateTrip = () => {
    setIsEditClosing(true);
    setTimeout(() => {
      setShowEditModal(false);
      setIsEditClosing(false);
      setShowConfirmEditModal(true);
      setIsConfirmEditClosing(false);
    }, 300);
  };

  // Confirmar la actualización
  const handleConfirmEdit = () => {
    console.log('Actualizando viaje:', editForm);
    setIsConfirmEditClosing(true);
    setTimeout(() => {
      setShowConfirmEditModal(false);
      setIsConfirmEditClosing(false);
    }, 300);
  };

  // Cancelar la actualización y volver al modal de edición
  const handleCancelEdit = () => {
    setIsConfirmEditClosing(true);
    setTimeout(() => {
      setShowConfirmEditModal(false);
      setIsConfirmEditClosing(false);
      setShowEditModal(true);
      setIsEditClosing(false);
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
    console.log('Eliminar viaje:', selectedTrip);
    handleCloseModal();
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
    { category: 'Food and Drinks', amount: '879,400', progress: animatedProgress[0] },
    { category: 'Shopping', amount: '1,378,200', progress: animatedProgress[1] },
    { category: 'Housing', amount: '928,500', progress: animatedProgress[2] },
    { category: 'Transportation', amount: '420,700', progress: animatedProgress[3] },
    { category: 'Vehicle', amount: '520,000', progress: animatedProgress[4] }
  ];

  return (
    <div className="flex h-screen bg-[#34353A] overflow-hidden">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-xl p-8 h-full overflow-hidden">
          <div className="grid grid-cols-3 gap-8 h-full">
            
            {/* Left Column - Trips Chart and List */}
            <div className="col-span-2 bg-gray-50 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-8 h-full flex flex-col">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Viajes</h2>
                  <p className="text-gray-500 text-sm">Porcentaje de viajes</p>
                </div>
                
                {/* Animated Bar Chart */}
                <div className="mb-8 flex-shrink-0">
                  <div className="flex items-end justify-center space-x-2 h-32">
                    {animatedBars.map((height, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className={`w-4 rounded-t-sm transition-all duration-1000 ease-out ${
                            index === 10 ? 'bg-blue-600' : 'bg-blue-300'
                          }`}
                          style={{
                            height: `${height}px`,
                            transform: `scaleY(${height / barHeights[index] || 0})`,
                            transformOrigin: 'bottom'
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Scheduled Trips */}
                <div className="flex-1 overflow-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Viajes programados de este día</h3>
                  <div className="space-y-3 mb-6">
                    {scheduledTrips.map((trip, index) => (
                      <div key={index} className="flex items-center p-3 hover:bg-white rounded-xl transition-colors group">
                        <div className={`w-10 h-10 rounded-full ${trip.color} flex items-center justify-center mr-4`}>
                          <span className="text-white text-sm">
                            {trip.icon}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{trip.type}</div>
                              <div className="text-sm text-gray-500">{trip.time} • {trip.description}</div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button 
                                onClick={() => handleTripMenuClick(trip, index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                              >
                                <MoreHorizontal size={16} className="text-gray-400" />
                              </button>
                              <div className={`w-3 h-3 rounded-full ${trip.status}`}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center">
                    <Plus size={20} className="mr-2" />
                    Programar un viaje
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right Column - Earnings and Stats */}
            <div className="space-y-6 h-full flex flex-col">
              {/* Earnings Card */}
              <div className="bg-gray-50 rounded-3xl shadow-sm p-6 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Porcentaje de ganancias</h3>
                <div className="space-y-5">
                  {earningsData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{item.category}</span>
                        <span className="font-semibold text-gray-900 text-sm">{item.amount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Routes Card */}
              <div className="bg-gray-50 rounded-3xl shadow-sm p-6 flex-shrink-0">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 relative">
                    <div className="w-8 h-8 bg-orange-400 rounded-lg"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-lg"></div>
                  </div>
                  <div className="w-12 h-6 bg-blue-500 rounded-lg mx-auto mb-3"></div>
                  <div className="w-8 h-4 bg-gray-300 rounded mx-auto"></div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">Ver rutas frecuentes</h3>
                <p className="text-gray-500 text-xs mb-4 text-center">
                  eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                  Ut enim ad minim.
                </p>
                
                <button className="w-full bg-gray-900 text-white py-3 px-4 rounded-2xl hover:bg-gray-800 transition-colors font-medium text-sm">
                  Ver mas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Selección de Acción */}
        {showModal && (
          <div 
            className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
              isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
            }`}
            onClick={handleCloseModal}
          >
            <div 
              className={`bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative transform transition-all duration-300 ease-out ${
                isClosing 
                  ? 'scale-95 opacity-0 translate-y-4' 
                  : 'scale-100 opacity-100 translate-y-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              
              <div className="text-center mt-8">
                <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-500 animate-pulse">
                  <span className="text-white text-3xl font-bold animate-bounce">?</span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4 transform transition-all duration-300 delay-100">
                  ¿Deseas editar o eliminar un viaje?
                </h2>
                
                <p className="text-gray-600 mb-8 transform transition-all duration-300 delay-200">
                  Elija la opción
                </p>
                
                <div className="flex space-x-4 transform transition-all duration-300 delay-300">
                  <button 
                    onClick={handleDelete}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform"
                  >
                    Eliminar
                  </button>
                  <button 
                    onClick={handleEdit}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edición de Viaje - SEGUNDO */}
        {showEditModal && (
          <div 
            className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
              isEditClosing ? 'bg-opacity-0' : 'bg-opacity-50'
            }`}
            onClick={handleCloseEditModal}
          >
            <div 
              className={`bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ease-out ${
                isEditClosing 
                  ? 'scale-95 opacity-0 translate-y-4' 
                  : 'scale-100 opacity-100 translate-y-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={handleCloseEditModal}
                className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              
              <div className="mt-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Editar Viaje
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cotización */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cotización
                    </label>
                    <input
                      type="text"
                      value={editForm.cotizacion}
                      onChange={(e) => handleInputChange('cotizacion', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center"
                      placeholder="300.00"
                    />
                  </div>

                  {/* Hora de llegada */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de llegada
                    </label>
                    <input
                      type="text"
                      value={editForm.horaLlegada}
                      onChange={(e) => handleInputChange('horaLlegada', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center"
                      placeholder="7:00 AM"
                    />
                  </div>

                  {/* Descripción del viaje */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción del viaje
                    </label>
                    <textarea
                      value={editForm.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-center"
                      placeholder="Descarga de productos en walmart constitución"
                    />
                  </div>

                  {/* Hora de salida */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de salida
                    </label>
                    <input
                      type="text"
                      value={editForm.horaSalida}
                      onChange={(e) => handleInputChange('horaSalida', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center"
                      placeholder="8 PM"
                    />
                  </div>

                  {/* Auxiliar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auxiliar <span className="text-xs text-gray-500">(Campo no obligatorio)</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.auxiliar}
                      onChange={(e) => handleInputChange('auxiliar', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center"
                      placeholder="Johan Velasco"
                    />
                  </div>
                </div>

                {/* Botón de actualizar */}
                <div className="mt-8">
                  <button 
                    onClick={handleUpdateTrip}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform"
                  >
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación para Editar - ÚLTIMO */}
        {showConfirmEditModal && (
          <div 
            className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
              isConfirmEditClosing ? 'bg-opacity-0' : 'bg-opacity-50'
            }`}
            onClick={handleCancelEdit}
          >
            <div 
              className={`bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative transform transition-all duration-300 ease-out ${
                isConfirmEditClosing 
                  ? 'scale-95 opacity-0 translate-y-4' 
                  : 'scale-100 opacity-100 translate-y-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-500">
                  <span className="text-white text-3xl font-bold">?</span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4 transform transition-all duration-300 delay-100">
                  ¿Desea editar los datos?
                </h2>
                
                <p className="text-gray-600 mb-8 transform transition-all duration-300 delay-200">
                  Elija la opción
                </p>
                
                <div className="flex space-x-4 transform transition-all duration-300 delay-300">
                  <button 
                    onClick={handleCancelEdit}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConfirmEdit}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform"
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