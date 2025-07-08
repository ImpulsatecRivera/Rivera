import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Camion from "../../images/camion.png"

const TruckMainScreen = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    default:
      return 'bg-gray-400';
  }
};


  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/camiones');
        const data = await res.json();
        setTrucks(data);
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

  const handleAddTruck = () => navigate('/Camiones/aggCamion');

  const handleEditTruck = (e, truck) => {
    e.stopPropagation();
    // Aquí puedes pasar el camión al estado global o navegación con datos
    navigate('/Camiones/editarCamion');
  };

  const handleDeleteClick = (e, truck) => {
    e.stopPropagation();
    setSelectedTruck(truck);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setTrucks(trucks.filter(t => t.id !== selectedTruck.id));
    setShowDeleteModal(false);
    setShowSuccessModal(true);
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    setSelectedTruck(null);
  };

  const TruckCard = ({ truck }) => (
   <div
  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
  
  onClick={() => {
  console.log('Navegando a camión con id:', truck.id);
  navigate(`/camiones/${truck.id}`);
}}
>

      <div className="flex justify-between items-start mb-2">
        <div className="text-md font-semibold text-gray-800">{truck.name}</div>
        <div className="flex gap-2">
          <button onClick={(e) => handleEditTruck(e, truck)}>
            <Edit3 size={16} className="text-gray-500 hover:text-gray-700" />
          </button>
          <button onClick={(e) => handleDeleteClick(e, truck)}>
            <Trash2 size={16} className="text-gray-500 hover:text-red-600" />
          </button>
        </div>
      </div>
      <div className="mb-3">
        <img
          src={truck.img || Camion }
          alt={truck.name}
          className="w-full h-32 object-cover rounded-md"
        />
      </div>
      <p className="text-sm text-gray-600 mb-1">Placa: {truck.licensePlate || 'N/A'}</p>
     <div className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(truck.state)}`}>
  <div className={`w-2 h-2 rounded-full mr-2 ${getDotColor(truck.state)}`} />
  {truck.state?.toUpperCase() || 'SIN ESTADO'}
</div>

    </div>
  );

  return (
    <div className="flex h-screen bg-[#34353A]">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-xl p-6 h-full overflow-hidden flex flex-col">
          {/* Header */}
          <div className="mt-4">
                       <button onClick={handleAddTruck} className="flex items-center space-x-4 text-gray-600 hover:text-gray-800 transition-colors"

>
                         <Plus className="w-5 h-5" />
                         <span className="font-medium">Agregar camion</span>
                       </button>
                     </div>

          {/* Content */}
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

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center">
            <div className="w-16 h-16 bg-red-500 text-white rounded-full mx-auto flex items-center justify-center mb-4">
              <X size={32} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">¿Eliminar camión?</h2>
            <p className="text-gray-600 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Eliminar
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center">
            <div className="w-16 h-16 bg-green-500 text-white rounded-full mx-auto flex items-center justify-center mb-4">
              <Check size={32} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Camión eliminado</h2>
            <p className="text-gray-600 mb-6">El camión fue eliminado exitosamente.</p>
            <button
              onClick={handleSuccessContinue}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckMainScreen;
