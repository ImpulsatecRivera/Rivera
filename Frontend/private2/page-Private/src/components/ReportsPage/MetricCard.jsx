import React from 'react';

const MetricCard = ({ icon: Icon, value, sublabel, color = 'green' }) => {
  const colorClasses = {
    green: 'bg-green-500/20 text-green-400',
    blue: 'bg-blue-500/20 text-blue-400',
    orange: 'bg-orange-500/20 text-orange-400',
    red: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="bg-[#2a2d31] p-4 sm:p-5 md:p-6 rounded-lg border border-[#34353A] text-center min-h-[120px] sm:min-h-[140px] md:min-h-[160px] hover:border-[#555a5f] transition-all duration-200">
      {Icon && (
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
            <Icon size={20} className="sm:w-6 md:w-7" />
          </div>
        </div>
      )}
      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{value}</h3>
      <p className="text-xs sm:text-sm text-gray-400">{sublabel}</p>
    </div>
  );
};

export default MetricCard;