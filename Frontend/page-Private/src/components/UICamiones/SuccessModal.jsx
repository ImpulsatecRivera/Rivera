import React from 'react';
import { Check } from 'lucide-react';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = "Operación exitosa",
  description = "Los cambios se han guardado correctamente.",
  buttonText = "Continuar",
  successColor = "#10B981"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center animate-bounce-in">
        <div 
          className="w-16 h-16 text-white rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse"
          style={{ backgroundColor: successColor }}
        >
          <Check size={32} />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <button 
          onClick={onClose} 
          className="text-white px-4 py-2 rounded hover:opacity-90 transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ backgroundColor: successColor }}
        >
          {buttonText}
        </button>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-bounce-in { animation: bounce-in 0.6s ease-out; }
      `}</style>
    </div>
  );
};

export default SuccessModal;