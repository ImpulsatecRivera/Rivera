import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 🔧 RUTA CORRECTA: trip-stats con parámetro 'periodo'
        const res = await axios.get(
          `http://localhost:4000/api/viajes/trip-stats?periodo=${tipo}`
        );

        console.log('📊 Datos recibidos del backend:', res.data);

        // 📊 Verificar que la respuesta tenga la estructura esperada
        if (!res.data.success || !res.data.data) {
          throw new Error('Estructura de respuesta inválida del servidor');
        }

        // 🎯 Mapear los datos para adaptarlos al gráfico
        const mappedData = res.data.data.map((item, index) => {
          let label = "";
          
          // 📅 Manejar diferentes tipos de agrupación según el período
          if (typeof item._id === "object" && item._id !== null) {
            // Para semanas: objeto {year, week}
            if ("year" in item._id && "week" in item._id) {
              label = `${item._id.year} S${item._id.week}`;
            }
            // Para semanas ISO: objeto {year, isoWeek}
            else if ("year" in item._id && "isoWeek" in item._id) {
              label = `${item._id.year} S${item._id.isoWeek}`;
            }
            // Para otros objetos complejos
            else {
              label = `Período ${index + 1}`;
            }
          } 
          // Para valores simples (día, mes, año)
          else {
            const valor = String(item._id);
            
            // 📅 Formatear según el tipo de período
            switch (tipo) {
              case "dia":
                // Fecha en formato YYYY-MM-DD
                if (valor.includes("-")) {
                  const fecha = new Date(valor);
                  label = fecha.toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: 'short' 
                  });
                } else {
                  label = `Día ${valor}`;
                }
                break;
                
              case "mes":
                // Número del mes (1-12)
                if (!isNaN(valor)) {
                  const meses = [
                    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
                  ];
                  label = meses[parseInt(valor) - 1] || `Mes ${valor}`;
                } else {
                  label = valor;
                }
                break;
                
              case "año":
                label = valor;
                break;
                
              default:
                label = valor;
            }
          }

          return {
            label,
            viajes: item.totalViajes || 0,
            completados: item.completados || 0,
            progresoPromedio: Math.round(item.progresoPromedio || 0),
            // 📊 Campos adicionales para el tooltip
            periodo: tipo,
            fecha: item._id
          };
        });

        // 📈 Ordenar datos por fecha/período si es necesario
        const sortedData = mappedData.sort((a, b) => {
          if (tipo === "mes" && !isNaN(a.fecha) && !isNaN(b.fecha)) {
            return parseInt(a.fecha) - parseInt(b.fecha);
          }
          return 0;
        });

        setData(sortedData);
        console.log('✅ Datos procesados para el gráfico:', sortedData);
        
      } catch (error) {
        console.error("❌ Error al cargar estadísticas:", error);
        setError(error.response?.data?.message || error.message || 'Error desconocido');
        
        // 🎯 Datos de ejemplo en caso de error
        const datosEjemplo = generarDatosEjemplo(tipo);
        setData(datosEjemplo);
        
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [tipo]);

  // 🎯 Función para generar datos de ejemplo según el período
  const generarDatosEjemplo = (periodo) => {
    switch (periodo) {
      case "dia":
        return Array.from({ length: 7 }, (_, i) => {
          const fecha = new Date();
          fecha.setDate(fecha.getDate() - (6 - i));
          return {
            label: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            viajes: Math.floor(Math.random() * 20) + 5,
            completados: Math.floor(Math.random() * 15) + 3,
            progresoPromedio: Math.floor(Math.random() * 30) + 70
          };
        });
        
      case "semana":
        return Array.from({ length: 4 }, (_, i) => ({
          label: `Sem ${i + 1}`,
          viajes: Math.floor(Math.random() * 50) + 20,
          completados: Math.floor(Math.random() * 40) + 15,
          progresoPromedio: Math.floor(Math.random() * 20) + 75
        }));
        
      case "año":
        return Array.from({ length: 3 }, (_, i) => ({
          label: `${2022 + i}`,
          viajes: Math.floor(Math.random() * 200) + 100,
          completados: Math.floor(Math.random() * 150) + 80,
          progresoPromedio: Math.floor(Math.random() * 15) + 80
        }));
        
      default: // mes
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        return meses.map(mes => ({
          label: mes,
          viajes: Math.floor(Math.random() * 80) + 30,
          completados: Math.floor(Math.random() * 60) + 20,
          progresoPromedio: Math.floor(Math.random() * 25) + 70
        }));
    }
  };

  // 🔄 Función para refrescar datos
  const handleRefresh = () => {
    fetchStats();
  };

  // 🎨 Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
          {payload[0]?.payload?.progresoPromedio && (
            <p className="text-xs text-gray-500 mt-1">
              Progreso promedio: {payload[0].payload.progresoPromedio}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm w-full h-80">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-gray-700">
            Estadísticas de Viajes
          </h3>
          {error && (
            <span className="ml-2 text-xs text-red-500" title={error}>
              ⚠️
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 🔄 Botón de recarga */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Actualizar datos"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {/* 📊 Selector de período */}
          <div className="relative">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none pr-8"
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="h-60 flex items-center justify-center">
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
            <p className="text-sm text-gray-400">Cargando estadísticas...</p>
          </div>
        ) : error && data.length === 0 ? (
          <div className="text-center">
            <p className="text-sm text-red-500 mb-2">❌ {error}</p>
            <button
              onClick={handleRefresh}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-gray-400">📊 No hay datos disponibles para este período.</p>
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
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Bar
                dataKey="viajes"
                fill="#3B82F6"
                radius={[12, 12, 0, 0]}
                barSize={24}
                name="Total Viajes"
              />
              <Bar
                dataKey="completados"
                fill="#10B981"
                radius={[12, 12, 0, 0]}
                barSize={24}
                name="Completados"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* 📊 Resumen de datos */}
      {!loading && data.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              Total viajes: {data.reduce((sum, item) => sum + item.viajes, 0)}
            </span>
            <span>
              Completados: {data.reduce((sum, item) => sum + item.completados, 0)}
            </span>
            <span>
              Tasa éxito: {data.length > 0 ? 
                Math.round((data.reduce((sum, item) => sum + item.completados, 0) / 
                           data.reduce((sum, item) => sum + item.viajes, 0)) * 100) : 0}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityChart;