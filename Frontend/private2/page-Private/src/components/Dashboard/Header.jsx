import React from 'react';

const Header = () => {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">
          ¡Bienvenido, es un gusto tenerte con nosotros!
        </h1>
        <p className="text-gray-600 text-xs">Actividad de viajes.</p>
      </div>
    </div>
  );
};

export default Header;