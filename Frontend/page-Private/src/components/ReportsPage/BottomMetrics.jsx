import React from "react";
import { Clock, TrendingDown } from "lucide-react";

const BottomMetrics = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg shadow min-h-[120px]">
        <div className="text-sm font-semibold text-gray-600">Tiempo promedio</div>
        <div className="flex items-center gap-2 mt-2">
          <Clock className="text-blue-500" size={16} />
          <span className="text-xl font-bold">02:36</span>
        </div>
        <span className="text-xs text-gray-500">Por viaje</span>
      </div>
      <div className="bg-white p-4 rounded-lg shadow min-h-[120px]">
        <div className="text-sm font-semibold text-gray-600">Disminución mensual</div>
        <div className="flex items-center gap-2 mt-2">
          <TrendingDown className="text-red-500" size={16} />
          <span className="text-xl font-bold">-4.5%</span>
        </div>
        <span className="text-xs text-gray-500">Comparado al mes anterior</span>
      </div>
    </div>
  );
};

export default BottomMetrics;