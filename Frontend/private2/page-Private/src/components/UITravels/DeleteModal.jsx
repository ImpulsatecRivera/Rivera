// components/DeleteModal.jsx
import React from 'react';
import { X } from 'lucide-react';

const DeleteModal = ({ show, isClosing, onCancel, onConfirm }) => {
  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
      }`}
      onClick={onCancel}
    >
      <div 
        className={`bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative transform transition-all duration-300 ease-out ${
          isClosing 
            ? 'scale-95 opacity-0 translate-y-4' 
            : 'scale-100 opacity-100 translate-y-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-500 hover:scale-110 animate-shake animate-red-pulse">
            <X size={36} className="text-red-600 animate-bounce" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2 transform transition-all duration-300 delay-100 animate-fade-in-up">
            ¿Está seguro de que desea eliminar este viaje?
          </h2>
          
          <p className="text-gray-600 mb-8 transform transition-all duration-300 delay-200 animate-fade-in-up">
            Este viaje se eliminará con esta acción
          </p>
          
          <div className="flex space-x-4 transform transition-all duration-300 delay-300 animate-fade-in-up">
            <button 
              onClick={onCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:rotate-1 hover:shadow-gray-300"
            >
              Cancelar
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:-rotate-1 hover:shadow-red-300 active:animate-pulse"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;