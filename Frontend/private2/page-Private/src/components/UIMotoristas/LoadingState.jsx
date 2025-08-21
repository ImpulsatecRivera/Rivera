import React from 'react';

const LoadingState = ({ 
  message = "Cargando...", 
  color = "#5F8EAD",
  size = "h-8 w-8" 
}) => {
  return (
    <div className="text-center py-12">
      <div 
        className={`inline-block animate-spin rounded-full ${size} border-b-2`} 
        style={{borderColor: color}}
      ></div>
      <p className="text-gray-500 mt-4">{message}</p>
    </div>
  );
};

export default LoadingState;