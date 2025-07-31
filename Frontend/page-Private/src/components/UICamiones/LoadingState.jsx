import React from 'react';

const LoadingState = ({ 
  message = "Cargando...", 
  primaryColor = '#5F8EAD' 
}) => {
  return (
    <div className="flex-1 flex justify-center items-center py-20">
      <div className="text-center">
        <div 
          className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-b-2" 
          style={{
            borderColor: primaryColor, 
            borderBottomColor: 'transparent'
          }} 
        />
        <p className="text-gray-500 mt-4">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;