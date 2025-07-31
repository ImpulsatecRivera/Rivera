import React from 'react';
import { X } from 'lucide-react';

const DeleteConfirmModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  isLoading = false,
  title = "¿Eliminar elemento?",
  description = "Esta acción no se puede deshacer.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  loadingText = "Eliminando..."
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center animate-scale-in">
        <div className="w-16 h-16 bg-red-500 text-white rounded-full mx-auto flex items-center justify-center mb-4 animate-shake">
          <X size={32} />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className={`px-4 py-2 rounded transition-all duration-200 ${
              isLoading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-red-500 text-white hover:bg-red-600 hover:scale-105 active:scale-95'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                {loadingText}
              </div>
            ) : (
              confirmText
            )}
          </button>
          <button 
            onClick={onCancel} 
            disabled={isLoading}
            className={`px-4 py-2 border rounded transition-all duration-200 ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-100 hover:scale-105 active:scale-95'
            }`}
          >
            {cancelText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default DeleteConfirmModal;