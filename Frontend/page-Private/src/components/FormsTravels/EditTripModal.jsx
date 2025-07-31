// FormsTravels/EditTripModal.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

const EditTripModal = ({ 
  show, 
  isClosing, 
  onClose, 
  onUpdate, 
  editForm, 
  onInputChange 
}) => {
  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ease-out ${
          isClosing 
            ? 'scale-95 opacity-0 translate-y-4' 
            : 'scale-100 opacity-100 translate-y-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center animate-fade-in-up">
            Editar Viaje
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cotización */}
            <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cotización
              </label>
              <input
                type="text"
                value={editForm.cotizacion}
                onChange={(e) => onInputChange('cotizacion', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center hover:scale-105 focus:scale-105"
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
                onChange={(e) => onInputChange('horaLlegada', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center hover:scale-105 focus:scale-105"
                placeholder="7:00 AM"
              />
            </div>

            {/* Descripción del viaje */}
            <div className="md:col-span-2 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del viaje
              </label>
              <textarea
                value={editForm.descripcion}
                onChange={(e) => onInputChange('descripcion', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-center hover:scale-105 focus:scale-105"
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
                onChange={(e) => onInputChange('horaSalida', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center hover:scale-105 focus:scale-105"
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
                onChange={(e) => onInputChange('auxiliar', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center hover:scale-105 focus:scale-105"
                placeholder="Johan Velasco"
              />
            </div>
          </div>

          {/* Botón de actualizar */}
          <div className="mt-8 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <button 
              onClick={onUpdate}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:shadow-green-300 active:animate-pulse"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTripModal;