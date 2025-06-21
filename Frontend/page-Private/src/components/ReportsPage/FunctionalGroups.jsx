import React from 'react';

const ProgressBar = ({ name, progress, bgColor }) => (
  <div className="flex items-center space-x-3">
    <div className={`w-6 h-6 ${bgColor} rounded flex items-center justify-center`}>
      <div className="w-2 h-2 bg-white rounded" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-700 font-medium">{name}</span>
        <span className="text-xs text-gray-600">{progress}% Total</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`${bgColor} h-1.5 rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  </div>
);

const FunctionalGroups = () => {
  const groups = [
    { name: 'Motorizadas no programadas', progress: 74, bgColor: 'bg-red-500' },
    { name: 'Mantenimientos', progress: 52, bgColor: 'bg-blue-500' },
    { name: 'Tickets destinados', progress: 38, bgColor: 'bg-orange-500' }
  ];

  return (
    <div className="bg-white rounded-lg p-4 mb-6 border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Grupos Funcionales</h3>
      <div className="space-y-4">
        {groups.map((group, index) => (
          <ProgressBar key={index} {...group} />
        ))}
      </div>
    </div>
  );
};

export default FunctionalGroups;