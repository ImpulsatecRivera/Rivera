// components/SweetAlert.jsx
import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const SweetAlert = ({ isOpen, onClose, onConfirm, title, text, type = 'warning' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-yellow-600" size={32} />
          </div>
        );
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-red-600" size={32} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform scale-100 animate-pulse">
        {getIcon()}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 text-center mb-8">{text}</p>
        <div className="flex gap-4 justify-center">
          {type === 'warning' ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium"
              >
                Sí, eliminar
              </button>
            </>
          ) : (
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 font-medium"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SweetAlert;