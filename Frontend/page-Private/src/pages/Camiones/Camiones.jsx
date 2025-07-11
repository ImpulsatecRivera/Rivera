import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Camion from "../../images/camion.png"

const Camiones = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Nuevo estado para loading

  const navigate = useNavigate();

  const getStatusColor = (status) => {
    if (!status || status.trim() === '') {
      return 'text-gray-600 bg-gray-50';
    }
    switch (status.toUpperCase()) {
      case 'DISPONIBLE':
        return 'text-green-600 bg-green-50';
      case 'NO DISPONIBLE':
        return 'text-red-600 bg-red-50';
      case 'MANTENIMIENTO':
        return 'text-yellow-600 bg-yellow-50';
      case 'EN RUTA':
        return 'text-blue-600 bg-blue-50';
      case 'SIN ESTADO':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getDotColor = (status) => {
    if (!status || status.trim() === '') {
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

  // Función para normalizar los datos del camión
  const normalizeTruckData = (truck) => {
    // Intenta diferentes campos comunes para el ID
    const id = truck.id || truck._id || truck.truck_id || truck.camion_id;
    
    return {
      ...truck,
      id: id,
      // Asegúrate de que otros campos también estén normalizados
      name: truck.name || truck.nombre || truck.model || 'Camión sin nombre',
      licensePlate: truck.licensePlate || truck.placa || truck.license_plate || 'N/A',
      state: truck.state || truck.estado || truck.status || 'SIN ESTADO',
      img: truck.img || truck.image || truck.foto || null
    };
  };

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/camiones');
        const data = await res.json();
        console.log("Camiones recibidos:", data);

        const camiones = Array.isArray(data) ? data : data.camiones || [];
        
        // Normaliza los datos y filtra elementos sin ID válido
        const normalizedTrucks = camiones
          .map(normalizeTruckData)
          .filter(truck => truck.id !== undefined && truck.id !== null)
          .map((truck, index) => {
            // Asignar algunos camiones como "Sin estado" para demostración
            if (index % 4 === 0) { // Cada 4to camión sin estado
              return {
                ...truck,
                state: 'Sin estado'
              };
            }
            return truck;
          });

        console.log("Camiones normalizados:", normalizedTrucks);
        setTrucks(normalizedTrucks);
        setError(false);
      } catch (err) {
        console.error('Error al obtener camiones:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTrucks();
  }, []);

  const handleAddTruck = () => navigate('/camiones/aggCamion');
  
  const handleEditTruck = (e, truck) => {
    e.stopPropagation();
    if (truck.id) {
      navigate(`/camiones/editarCamion/${truck.id}`);
    } else {
      console.error('No se puede editar: ID del camión no válido');
    }
  };
  
  const handleDeleteClick = (e, truck) => {
    e.stopPropagation();
    setSelectedTruck(truck);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true); // Mostrar loading
      
      // Eliminar del backend
      const response = await fetch(`http://localhost:4000/api/camiones/${selectedTruck.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Solo si se eliminó exitosamente del backend, quitar del estado local
        setTrucks(trucks.filter(t => t.id !== selectedTruck.id));
        setShowDeleteModal(false);
        setShowSuccessModal(true);
        console.log('Camión eliminado exitosamente de la base de datos');
      } else {
        // Si hay error en el backend, mostrar mensaje
        const errorData = await response.json();
        console.error('Error al eliminar camión:', errorData);
        alert('Error al eliminar el camión. Inténtalo de nuevo.');
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error de conexión al eliminar camión:', error);
      alert('Error de conexión. Verifica tu conexión a internet.');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false); // Ocultar loading
    }
  };
  
  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    setSelectedTruck(null);
  };

  const TruckCard = ({ truck }) => {
    const handleCardClick = () => {
      if (truck.id) {
        console.log('Navegando a camión con id:', truck.id);
        navigate(`/camiones/${truck.id}`);
      } else {
        console.error('No se puede navegar: ID del camión no válido', truck);
      }
    };

    return (
      <div
        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="text-md font-semibold text-gray-800">{truck.name}</div>
          <div className="flex gap-2">
            <button 
              onClick={(e) => handleEditTruck(e, truck)}
              disabled={!truck.id}
              className={`${!truck.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Edit3 size={16} className="text-gray-500 hover:text-gray-700" />
            </button>
            <button 
              onClick={(e) => handleDeleteClick(e, truck)}
              disabled={!truck.id}
              className={`${!truck.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Trash2 size={16} className="text-gray-500 hover:text-red-600" />
            </button>
          </div>
        </div>
        <div className="mb-3">
          <img
            src={truck.img || Camion}
            alt={truck.name}
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
        <p className="text-sm text-gray-600 mb-1">Placa: {truck.licensePlate}</p>
        <div className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(truck.state)}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${getDotColor(truck.state)}`} />
          {truck.state ? truck.state.toUpperCase() : 'SIN ESTADO'}
        </div>
        
        {/* Indicador de debug para desarrollo */}
        {process.env.NODE_ENV === 'development' && !truck.id && (
          <div className="mt-2 text-xs text-red-500 bg-red-50 p-1 rounded">
            ⚠️ ID no válido
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#34353A]">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-xl p-6 h-full overflow-hidden flex flex-col">
          <div className="mt-4">
            <button onClick={handleAddTruck} className="flex items-center space-x-4 text-gray-600 hover:text-gray-800 transition-colors">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Agregar camión</span>
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-400 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center mt-10 font-medium">Error al cargar los camiones.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto">
              {trucks.map((truck) => (
                <TruckCard key={truck.id} truck={truck} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center animate-scale-in">
            <div className="w-16 h-16 bg-red-500 text-white rounded-full mx-auto flex items-center justify-center mb-4 animate-shake">
              <X size={32} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">¿Eliminar camión?</h2>
            <p className="text-gray-600 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={handleDeleteConfirm} 
                disabled={isDeleting}
                className={`px-4 py-2 rounded transition-all duration-200 ${
                  isDeleting 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-red-500 text-white hover:bg-red-600 hover:scale-105 active:scale-95'
                }`}
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Eliminando...
                  </div>
                ) : (
                  'Eliminar'
                )}
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                disabled={isDeleting}
                className={`px-4 py-2 border rounded transition-all duration-200 ${
                  isDeleting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-100 hover:scale-105 active:scale-95'
                }`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center animate-bounce-in">
            <div className="w-16 h-16 bg-green-500 text-white rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
              <Check size={32} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Camión eliminado</h2>
            <p className="text-gray-600 mb-6">El camión fue eliminado exitosamente.</p>
            <button 
              onClick={handleSuccessContinue} 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-2px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(2px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Camiones;