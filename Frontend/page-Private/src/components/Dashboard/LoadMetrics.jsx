import React from 'react';

const LoadMetrics = () => {
  const loadMetrics = [
<<<<<<< HEAD
    { label: 'Food and Drinks', value: '672.400', color: '#EF4444', percentage: 85 },
    { label: 'Shopping', value: '1.378.200', color: '#3B82F6', percentage: 95 },
    { label: 'Housing', value: '938.700', color: '#F97316', percentage: 70 },
    { label: 'Transportation', value: '463.700', color: '#8B5CF6', percentage: 40 },
    { label: 'Vehicles', value: '520.000', color: '#5F8EAD', percentage: 50 }
  ];

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Tipos de carga frecuentes</h2>

      <div className="space-y-4">
        {loadMetrics.map((metric, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700 font-medium">{metric.label}</span>
              <span className="text-sm font-semibold text-gray-900">{metric.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${metric.percentage}%`,
                  backgroundColor: metric.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
=======
    { label: 'Food and Drinks', value: '672.400', color: 'bg-red-500', percentage: 85 },
    { label: 'Shopping', value: '1.378.200', color: 'bg-blue-500', percentage: 75 },
    { label: 'Housing', value: '938.700', color: 'bg-orange-500', percentage: 60 },
    { label: 'Transportation', value: '463.700', color: 'bg-purple-500', percentage: 45 },
    { label: 'Vehicles', value: '520.000', color: 'bg-gray-500', percentage: 30 }
  ];

  return (
    <div className="space-y-3 w-full">
      <h2 className="text-sm font-semibold text-gray-700 text-left pl-2">Tipos de carga frecuentes</h2>

      {loadMetrics.map((metric, index) => (
        <div key={index}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-700 font-medium">{metric.label}</span>
            <span className="text-xs font-semibold text-gray-900">{metric.value}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`${metric.color} h-1.5 rounded-full transition-all duration-300`}
              style={{ width: `${metric.percentage}%` }}
            ></div>
          </div>
        </div>
      ))}
>>>>>>> 6ecb9b0548fabc3613b556d805023fca83065325
    </div>
  );
};

export default LoadMetrics;