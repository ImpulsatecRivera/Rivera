
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';

const ActivityChart = () => {
  const data = [
    { month: 'ENE', viajes: 100 },
    { month: 'FEB', viajes: 120 },
    { month: 'MAR', viajes: 140 },
    { month: 'ABR', viajes: 280 },
    { month: 'MAY', viajes: 300 },
    { month: 'JUN', viajes: 280 },
    { month: 'JUL', viajes: 290 },
    { month: 'AGO', viajes: 80 },
    { month: 'SEP', viajes: 300 },
    { month: 'OCT', viajes: 340 },
    { month: 'NOV', viajes: 360 },
    { month: 'DIC', viajes: 400 },
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
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            barCategoryGap="20%"
          >
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 400]}
              ticks={[0, 100, 200, 300, 400]}
            />
            <Bar 
              dataKey="viajes" 
              fill="#3B82F6" 
              radius={[12, 12, 0, 0]} 
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityChart;
