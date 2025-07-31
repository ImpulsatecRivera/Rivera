// components/ConfirmationModal.jsx
import React from 'react';

const ConfirmationModal = ({ 
  show, 
  isClosing, 
  onCancel, 
  onConfirm, 
  title, 
  message, 
  icon, 
  iconColor = 'blue',
  cancelText = 'Cancelar',
  confirmText = 'Continuar'
}) => {
  if (!show) return null;

  const getIconColorClasses = () => {
    switch (iconColor) {
      case 'blue':
        return 'bg-blue-100 animate-blue-pulse';
      case 'red':
        return 'bg-red-100 animate-red-pulse';
      case 'green':
        return 'bg-green-100 animate-green-pulse';
      default:
        return 'bg-blue-100 animate-blue-pulse';
    }
  };

  const getIconTextColor = () => {
    switch (iconColor) {
      case 'blue':
        return 'text-blue-600';
      case 'red':
        return 'text-red-600';
      case 'green':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

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
          <div className={`w-20 h-20 ${getIconColorClasses()} rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-500 animate-wiggle`}>
            <span className={`${getIconTextColor()} text-3xl font-bold animate-heartbeat`}>
              {icon || '?'}
            </span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4 transform transition-all duration-300 delay-100 animate-fade-in-up">
            {title}
          </h2>
          
          <p className="text-gray-600 mb-8 transform transition-all duration-300 delay-200 animate-fade-in-up">
            {message}
          </p>
          
          <div className="flex space-x-4 transform transition-all duration-300 delay-300 animate-fade-in-up">
            <button 
              onClick={onCancel}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:rotate-1 hover:shadow-red-300 active:animate-pulse"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 transform hover:-rotate-1 hover:shadow-green-300 active:animate-pulse"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;