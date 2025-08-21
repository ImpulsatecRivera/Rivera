import React from 'react';
import { Edit3, Trash2, Truck } from 'lucide-react';

const TruckCard = ({ 
  truck, 
  onEdit, 
  onDelete, 
  onClick,
  defaultImage,
  getStatusColor,
  getDotColor 
}) => {
  const handleCardClick = () => {
    if (onClick && truck.id) {
      onClick(truck.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit && truck.id) {
      onEdit(truck);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete && truck.id) {
      onDelete(truck);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] group"
      onClick={handleCardClick}
      style={{boxShadow: '0 4px 20px rgba(0,0,0,0.08)'}}
    >
      {/* Header con nombre y acciones */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#5F8EAD] transition-colors">
            {truck.name}
          </h3>
          <p className="text-sm text-gray-500 font-medium">Placa: {truck.licensePlate}</p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={handleEdit}
            disabled={!truck.id}
            className={`p-2 rounded-lg transition-all duration-200 ${!truck.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#5F8EAD] hover:text-white bg-gray-100'}`}
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={handleDelete}
            disabled={!truck.id}
            className={`p-2 rounded-lg transition-all duration-200 ${!truck.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 hover:text-white bg-gray-100'}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Imagen del camión */}
      <div className="relative mb-4 overflow-hidden rounded-xl">
        <img
          src={truck.img || defaultImage}
          alt={truck.name}
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Información adicional */}
      <div className="space-y-3">
        {truck.brand && truck.model && (
          <div className="flex items-center text-sm text-gray-600">
            <Truck className="w-4 h-4 mr-2 text-[#5F8EAD]" />
            <span>{truck.brand} {truck.model}</span>
            {truck.age && <span className="ml-2 text-gray-400">({truck.age})</span>}
          </div>
        )}

        {/* Estado del camión */}
        <div className={`inline-flex items-center text-xs font-semibold px-3 py-2 rounded-full border ${getStatusColor ? getStatusColor(truck.state) : 'text-gray-600 bg-gray-50 border-gray-200'}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${getDotColor ? getDotColor(truck.state) : 'bg-gray-400'} animate-pulse`} />
          {truck.state ? truck.state.toUpperCase() : 'SIN ESTADO'}
        </div>
      </div>

      {/* Indicador de debug para desarrollo */}
      {process.env.NODE_ENV === 'development' && !truck.id && (
        <div className="mt-3 text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-200">
          ⚠️ ID no válido
        </div>
      )}
    </div>
  );
};

export default TruckCard;