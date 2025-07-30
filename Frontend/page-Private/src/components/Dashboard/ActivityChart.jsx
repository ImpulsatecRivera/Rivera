import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const options = [
  { label: "Diario", value: "dia" },
  { label: "Semanal", value: "semana" },
  { label: "Mensual", value: "mes" },
  { label: "Anual", value: "año" },
];

const ActivityChart = () => {
  const [data, setData] = useState([]);
  const [tipo, setTipo] = useState("mes");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:4000/api/viajes/estadisticas?tipo=${tipo}`);
        setData(res.data.data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [tipo]);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm w-full h-80">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-700">Viajes</h3>
        <div className="relative">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none pr-8"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="h-60">
        {loading ? (
          <p className="text-sm text-gray-400">Cargando datos...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barCategoryGap="20%"
            >
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Bar
                dataKey="viajes"
                fill="#3B82F6"
                radius={[12, 12, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ActivityChart;
