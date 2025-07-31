import React from 'react';

const ErrorState = ({ 
  error, 
  onRetry, 
  retryText = "Intentar de Nuevo",
  primaryColor = "#5F8EAD" 
}) => {
  return (
    <div className="text-center py-12">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 text-white rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg shadow-md"
            style={{background: `linear-gradient(135deg, ${primaryColor} 0%, #4a7ba7 100%)`}}
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;