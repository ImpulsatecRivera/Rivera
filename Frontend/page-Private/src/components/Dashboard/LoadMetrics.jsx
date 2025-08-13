import React, { useEffect, useState } from 'react';
import axios from 'axios';

const colors = ['#EF4444', '#3B82F6', '#F97316', '#8B5CF6', '#5F8EAD'];

const LoadMetrics = () => {
  const [loadMetrics, setLoadMetrics] = useState([]);

  useEffect(() => {
    const fetchLoadData = async () => {
  try {
    const res = await axios.get('http://localhost:4000/api/viajes/cargas/frecuentes');
    const totalCantidad = res.data.data.reduce((sum, item) => sum + item.cantidad, 0);

    const dataWithColors = res.data.data.map((item, index) => ({
      label: item._id,
      value: item.cantidad,
      percentage: totalCantidad > 0 ? (item.cantidad / totalCantidad) * 100 : 0,
      color: colors[index % colors.length],
    }));

    setLoadMetrics(dataWithColors);
  } catch (error) {
    console.error("Error al obtener cargas frecuentes:", error);
  }
};


    fetchLoadData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg border">

      <div className="space-y-4">
        {loadMetrics.length === 0 ? (
          <p className="text-sm text-gray-500">No hay datos disponibles.</p>
        ) : (
          loadMetrics.map((metric, index) => (
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
                    backgroundColor: metric.color,
                  }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LoadMetrics;
