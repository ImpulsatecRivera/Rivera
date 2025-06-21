import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const ActivityChart = () => {
  const data = [
    { month: 'Ene', viajes: 30 },
    { month: 'Feb', viajes: 45 },
    { month: 'Mar', viajes: 15 },
    { month: 'Abr', viajes: 70 },
    { month: 'May', viajes: 95 },
    { month: 'Jun', viajes: 65 },
    { month: 'Jul', viajes: 85 },
    { month: 'Ago', viajes: 100 },
    { month: 'Sep', viajes: 55 },
    { month: 'Oct', viajes: 40 },
    { month: 'Nov', viajes: 80 },
    { month: 'Dic', viajes: 20 },
  ];

  return (
    <div className="bg-white rounded-lg p-4 shadow w-full h-64">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-800">Viajes</h3>
        <select className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600 focus:outline-none">
          <option>Mensual</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="viajes" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;