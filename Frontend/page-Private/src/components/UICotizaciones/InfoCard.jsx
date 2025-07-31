// components/InfoCard.jsx
import React from 'react';

const InfoCard = ({ 
  title, 
  children, 
  icon: IconComponent, 
  gradient = "from-blue-50 to-indigo-50",
  borderColor = "border-blue-100",
  iconColor = "text-blue-600"
}) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 border ${borderColor}`}>
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        <IconComponent className={iconColor} size={24} />
        {title}
      </h2>
      {children}
    </div>
  );
};

export default InfoCard;