import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
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
    { month: 'Dic', viajes: 20 }
  ];

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm w-full h-80">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-700">Viajes</h3>
        <div className="relative">
          <select className="text-sm border border-gray-300 rounded-md px-3 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none pr-8">
            <option>Mensual</option>
            <option>Semanal</option>
            <option>Anual</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="h-60">
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
    </div>
  );
};

export default ActivityChart;
