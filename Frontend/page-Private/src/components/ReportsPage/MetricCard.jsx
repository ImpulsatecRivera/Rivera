import React from 'react';

const MetricCard = ({ icon: Icon, value, sublabel, color = 'green' }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100 text-center hover:shadow-md transition-shadow">
      {Icon && (
        <div className="flex items-center justify-center mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
            <Icon size={16} />
          </div>
        </div>
      )}
      <h3 className="text-lg font-bold text-gray-900">{value}</h3>
      <p className="text-xs text-gray-600">{sublabel}</p>
    </div>
  );
};

export default MetricCard;