import React from 'react';

const LoadMetrics = () => {
  const loadMetrics = [
    { label: 'Food and Drinks', value: '672.400', color: '#EF4444', percentage: 85 },
    { label: 'Shopping', value: '1.378.200', color: '#3B82F6', percentage: 95 },
    { label: 'Housing', value: '938.700', color: '#F97316', percentage: 70 },
    { label: 'Transportation', value: '463.700', color: '#8B5CF6', percentage: 40 },
    { label: 'Vehicles', value: '520.000', color: '#5F8EAD', percentage: 50 }
  ];

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Tipos de carga frecuentes.</h2>

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
    </div>
  );
};

export default LoadMetrics;