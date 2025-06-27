import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const staticTripData = [
  { mes: "Ene", viajes: 150 },
  { mes: "Feb", viajes: 200 },
  { mes: "Mar", viajes: 160 },
  { mes: "Abr", viajes: 220 },
  { mes: "May", viajes: 180 },
  { mes: "Jun", viajes: 190 },
  { mes: "Jul", viajes: 140 },
  { mes: "Ago", viajes: 210 },
  { mes: "Sep", viajes: 230 },
  { mes: "Oct", viajes: 300 },
  { mes: "Nov", viajes: 310 },
  { mes: "Dic", viajes: 320 }
];

const TripsChartStatic = () => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm h-[250px]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700">Viajes</h2>
        <span className="text-xs text-gray-400">Mensual</span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={staticTripData}
          barCategoryGap={10}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar
            dataKey="viajes"
            fill="#4285F4"
            barSize={8}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TripsChartStatic;