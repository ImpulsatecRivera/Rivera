// 3. components/UI/SuccessAlert.jsx
import React from 'react';

const SuccessAlert = ({ isOpen, onClose, type = 'delete' }) => {
  if (!isOpen) return null;

  const isEdit = type === 'edit';

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
          <div className="text-center">
            <div 
              className="w-16 h-16 bg-green-400 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300"
              style={{
                animation: isOpen ? 'bounceIn 0.6s ease-out 0.2s both' : 'none'
              }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 
              className="text-lg font-semibold text-gray-900 mb-2 transition-all duration-300"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
              }}
            >
              {isEdit ? 'Empleado actualizado con éxito' : 'Empleado eliminado con éxito'}
            </h3>
            <p 
              className="text-gray-600 mb-6 transition-all duration-300"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.4s both' : 'none'
              }}
            >
              {isEdit ? 'Empleado actualizado correctamente' : 'Empleado eliminado correctamente'}
            </p>
            <div 
              className="flex justify-center"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
              }}
            >
              <button
                onClick={onClose}
                className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessAlert;