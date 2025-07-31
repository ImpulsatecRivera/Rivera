// components/EarningsCard.jsx
import React from 'react';

const EarningsCard = ({ earningsData }) => {
  return (
    <div className="bg-gray-50 rounded-3xl shadow-sm p-6 flex-1">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Porcentaje de ganancias</h3>
      <div className="space-y-5">
        {earningsData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">{item.category}</span>
              <span className="font-semibold text-gray-900 text-sm">{item.amount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${item.color} h-2 rounded-full transition-all duration-1000 ease-out shadow-sm`}
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarningsCard;