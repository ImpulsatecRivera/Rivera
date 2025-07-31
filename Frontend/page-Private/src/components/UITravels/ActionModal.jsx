// components/ActionModal.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

const ActionModal = ({ show, isClosing, onClose, onEdit, onDelete }) => {
  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
      }`}
      onClick={onClose}
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
          onClick={onClose}
          className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        
        <div className="text-center mt-8">
          <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-500 animate-wiggle animate-gray-pulse">
            <span className="text-white text-3xl font-bold animate-heartbeat">?</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4 transform transition-all duration-300 delay-100 animate-fade-in-up">
            ¿Deseas editar o eliminar un viaje?
          </h2>
          
          <p className="text-gray-600 mb-8 transform transition-all duration-300 delay-200 animate-fade-in-up">
            Elija la opción
          </p>
          
          <div className="flex space-x-4 transform transition-all duration-300 delay-300 animate-fade-in-up">
            <button 
              onClick={onDelete}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:rotate-1 hover:shadow-red-300 active:animate-pulse"
            >
              Eliminar
            </button>
            <button 
              onClick={onEdit}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:-rotate-1 hover:shadow-green-300 active:animate-pulse"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;