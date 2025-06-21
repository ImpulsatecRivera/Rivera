import React from 'react';

const ReportsCard = () => {
  return (
    <div className="flex-1 flex flex-col justify-between bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg text-center border border-gray-200 min-h-[180px]">
      {/* Ícono central */}
      <div className="flex items-center justify-center mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <div className="space-y-1">
              <div className="w-4 h-0.5 bg-blue-500 rounded"></div>
              <div className="w-3 h-0.5 bg-orange-400 rounded"></div>
              <div className="w-4 h-0.5 bg-purple-500 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-900 mb-2">Informes</h3>

      <p className="text-xs text-gray-600 mb-4 leading-relaxed px-1">
        Resumen semanal agrupado de todos los viajes imagen principal de la empresa
      </p>

      <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors">
        Ver más
      </button>
    </div>
  );
};

export default ReportsCard;