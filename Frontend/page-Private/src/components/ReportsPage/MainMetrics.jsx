import React from 'react';
import { Users, Truck, Clock } from 'lucide-react';

const MainMetrics = () => {
  const metrics = [
    {
      icon: Users,
      title: "Usuarios activos",
      value: "1,893",
      color: "text-green-500"
    },
    {
      icon: Truck,
      title: "Cargas entregadas", 
      value: "3,298",
      color: "text-green-500"
    },
    {
      icon: Clock,
      title: "Tiempo promedio de viaje",
      value: "2h 34m",
      color: "text-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 min-h-[120px] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <metric.icon className={`w-4 h-4 ${metric.color}`} />
            <span className="text-xs text-gray-600 font-medium leading-tight">
              {metric.title}
            </span>
          </div>
          <div className="flex-1 flex items-center">
            <span className={`text-2xl font-bold ${metric.color} leading-none`} style={{ lineHeight: '1.1' }}>
              {metric.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MainMetrics;