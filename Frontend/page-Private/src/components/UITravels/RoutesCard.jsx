// components/RoutesCard.jsx
import React from 'react';

const RoutesCard = ({ onAddTruck }) => {
  return (
    <div className="bg-gray-50 rounded-3xl shadow-sm p-6 flex-shrink-0">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 relative">
          <div className="w-8 h-8 bg-orange-400 rounded-lg"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-lg"></div>
        </div>
        <div className="w-12 h-6 bg-blue-500 rounded-lg mx-auto mb-3"></div>
        <div className="w-8 h-4 bg-gray-300 rounded mx-auto"></div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">Ver rutas frecuentes</h3>
      <p className="text-gray-500 text-xs mb-4 text-center">
        eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        Ut enim ad minim.
      </p>
      
      <button
        onClick={onAddTruck} 
        className="w-full bg-gray-900 text-white py-3 px-4 rounded-2xl hover:bg-gray-800 transition-colors font-medium text-sm"
      >
        Ver mas
      </button>
    </div>
  );
};

export default RoutesCard;