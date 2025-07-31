// SweetAlert.jsx
import React from 'react';

const SweetAlert = ({ 
  isOpen, 
  onClose, 
  onPrimary, 
  onSecondary,
  title = "¿Deseas eliminar o actualizar un elemento?",
  description = "Elija la opción",
  primaryText = "Eliminar",
  secondaryText = "Actualizar",
  primaryColor = "#dc2626", // red-600
  secondaryColor = "#16a34a", // green-600
  icon = "?"
}) => {
  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideInUp {
            from {
              transform: translateY(100px) scale(0.9);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes bounceIn {
            0% {
              transform: scale(0.3);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes fadeInUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className={`bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl relative transform transition-all duration-300 ${
            isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
          style={{
            animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors duration-200 hover:scale-110 transform"
          >
            ×
          </button>
          
          <div className="text-center">
            <div 
              className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300 hover:bg-gray-300"
              style={{
                animation: isOpen ? 'bounceIn 0.6s ease-out 0.2s both' : 'none'
              }}
            >
              <span className="text-2xl text-gray-600">{icon}</span>
            </div>
            <h3 
              className="text-lg font-semibold text-gray-900 mb-2 transition-all duration-300"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
              }}
            >
              {title}
            </h3>
            <p 
              className="text-gray-600 mb-6 transition-all duration-300"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.4s both' : 'none'
              }}
            >
              {description}
            </p>
            <div 
              className="flex space-x-3"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
              }}
            >
              <button
                onClick={onPrimary}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
                style={{
                  backgroundColor: primaryColor,
                  '&:hover': {
                    backgroundColor: primaryColor === '#dc2626' ? '#b91c1c' : primaryColor
                  }
                }}
              >
                {primaryText}
              </button>
              <button
                onClick={onSecondary}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
                style={{
                  backgroundColor: secondaryColor,
                  '&:hover': {
                    backgroundColor: secondaryColor === '#16a34a' ? '#15803d' : secondaryColor
                  }
                }}
              >
                {secondaryText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SweetAlert;