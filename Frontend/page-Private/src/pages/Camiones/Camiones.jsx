import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TruckMainScreen = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
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

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/camiones');
        const data = await response.json();
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

  const handleAddTruck = () => {
    navigate('/Camiones/aggCamion');
  };

  const handleContinue = (e) => {
    e.preventDefault();
    navigate('/Camiones/verCamion');
  };

  const handleEditTruck = (truck, e) => {
    e.stopPropagation();
    console.log('Editar camión:', truck);
  };

  const handleDeleteTruck = (truck, e) => {
    e.stopPropagation();
    console.log('Eliminar camión:', truck);
  };

  const TruckItem = ({ truck }) => {
    const upperState = truck.state?.toUpperCase();

    return (
      <div
        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border rounded-lg"
        onClick={handleContinue}
      >
        {/* Imagen */}
        <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-3">
          <img
            src={truck.img || 'https://via.placeholder.com/200x120?text=Camión'}
            alt={truck.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Nombre del camión */}
        <h3 className="font-semibold text-gray-800 text-sm mb-1">{truck.name}</h3>

        {/* Placa */}
        <p className="text-xs text-gray-500 mb-2">
          Placa: {truck.licensePlate || truck.plate || 'N/A'}
        </p>

        {/* Estado */}
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              upperState === 'DISPONIBLE'
                ? 'bg-green-500'
                : upperState === 'NO DISPONIBLE'
                ? 'bg-red-500'
                : upperState === 'MANTENIMIENTO'
                ? 'bg-yellow-500'
                : upperState === 'EN RUTA'
                ? 'bg-blue-500'
                : 'bg-gray-400'
            }`}
          ></div>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(upperState)}`}
          >
            {truck.state || 'SIN ESTADO'}
          </span>
        </div>

        {/* Botones */}
        <div className="flex gap-2 mt-3">
          <button
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            onClick={(e) => handleEditTruck(truck, e)}
          >
            <Edit3 size={14} className="text-gray-500" />
          </button>
          <button
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            onClick={(e) => handleDeleteTruck(truck, e)}
          >
            <Trash2 size={14} className="text-gray-500" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#34353A] overflow-hidden">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-xl p-6 h-full overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div
              onClick={handleAddTruck}
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-800">Agregar un camión</h1>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-400 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 font-semibold text-sm mt-10">
              Error al visualizar camiones
            </div>
          ) : (
            <div className="h-full overflow-y-auto -mx-6 px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-4">
                {trucks.map((truck) => (
                  <TruckItem key={truck._id || truck.id} truck={truck} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TruckMainScreen;
