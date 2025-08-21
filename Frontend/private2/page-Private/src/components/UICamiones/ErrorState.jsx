import React from 'react';

const ErrorState = ({ 
  icon: Icon, 
  title = "Error al cargar", 
  description = "No se pudieron cargar los datos. Verifica tu conexión.",
  onRetry 
}) => {
  return (
    <div className="text-center py-20">
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
        <Icon className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">{title}</h3>
        <p className="text-red-600 mb-4">{description}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 transform hover:scale-105"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;