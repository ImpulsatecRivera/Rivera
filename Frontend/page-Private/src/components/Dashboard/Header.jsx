import React from 'react';
import { HelpCircle } from 'lucide-react';

const Header = ({ onStartTutorial, hasCompletedTutorial }) => {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">
          ¡Bienvenido, es un gusto tenerte con nosotros!
        </h1>
        <p className="text-gray-600 text-xs">Actividad de viajes.</p>
      </div>
      <button
        onClick={onStartTutorial}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#5F8EAD] text-[#5F8EAD] rounded-xl hover:bg-[#5F8EAD] hover:text-white font-bold shadow-lg transition-all transform hover:scale-105"
      >
        <HelpCircle size={18} />
        <span>Tutorial</span>
        {!hasCompletedTutorial && (
          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            !
          </span>
        )}
      </button>
    </div>
  );
};

export default Header;