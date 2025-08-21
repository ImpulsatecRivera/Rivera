// components/UICotizaciones/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ message = "Cargando cotizaciones..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      {/* Spinner animado */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      
      {/* Mensaje de carga */}
      <p className="mt-4 text-gray-600 text-lg">
        {message}
      </p>
      
      {/* Puntos animados */}
      <div className="flex space-x-1 mt-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;