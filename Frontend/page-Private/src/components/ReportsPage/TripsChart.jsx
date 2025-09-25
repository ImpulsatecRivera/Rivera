import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

const TripsChart = () => {
  const [tripData, setTripData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState('mes');
  const [chartType, setChartType] = useState('bar');

  // 📊 Opciones de período disponibles
  const periodoOptions = [
    { label: "Diario", value: "dia" },
    { label: "Semanal", value: "semana" },
    { label: "Mensual", value: "mes" },
    { label: "Anual", value: "año" }
  ];

  // 🔄 Función para obtener datos del backend
  const fetchTripStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📊 Obteniendo estadísticas de viajes - Período: ${periodo}`);
      
      // 🔧 USAR TU ENDPOINT REAL
      const response = await fetch(`https://riveraproject-production-933e.up.railway.app/api/viajes/trip-stats?periodo=${periodo}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // 🎯 Procesar datos del backend
        const processedData = result.data.map((item, index) => {
          let label = "";
          
          // 📅 Formatear etiquetas según el período
          if (typeof item._id === "object" && item._id !== null) {
            // Para semanas: objeto {year, week}
            if ("year" in item._id && "week" in item._id) {
              label = `${item._id.year} S${item._id.week}`;
            }
            // Para semanas ISO: objeto {year, isoWeek}
            else if ("year" in item._id && "isoWeek" in item._id) {
              label = `${item._id.year} S${item._id.isoWeek}`;
            }
            else {
              label = `Período ${index + 1}`;
            }
          } else {
            const valor = String(item._id);
            
            switch (periodo) {
              case "dia":
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
            periodo: label,
            viajes: item.totalViajes || 0,
            completados: item.completados || 0,
            progresoPromedio: Math.round(item.progresoPromedio || 0),
            // 📊 Datos adicionales para tooltips
            tasaCompletado: item.totalViajes > 0 ? 
              Math.round((item.completados / item.totalViajes) * 100) : 0,
            rawId: item._id
          };
        });

        // 📈 Ordenar datos por período si es necesario
        const sortedData = processedData.sort((a, b) => {
          if (periodo === "mes" && !isNaN(a.rawId) && !isNaN(b.rawId)) {
            return parseInt(a.rawId) - parseInt(b.rawId);
          }
          return 0;
        });

        setTripData(sortedData);
        console.log('✅ Datos procesados:', sortedData);
        
      } else {
        throw new Error(result.message || 'Estructura de respuesta inválida');
      }
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      setError(error.message);
      
      // 🎯 Datos de ejemplo como fallback
      const datosEjemplo = generarDatosEjemplo(periodo);
      setTripData(datosEjemplo);
      
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Generar datos de ejemplo según el período
  const generarDatosEjemplo = (tipoPeriodo) => {
    switch (tipoPeriodo) {
      case "dia":
        return Array.from({ length: 7 }, (_, i) => {
          const fecha = new Date();
          fecha.setDate(fecha.getDate() - (6 - i));
          return {
            periodo: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            viajes: Math.floor(Math.random() * 20) + 5,
            completados: Math.floor(Math.random() * 15) + 3,
            progresoPromedio: Math.floor(Math.random() * 30) + 70,
            tasaCompletado: Math.floor(Math.random() * 20) + 80
          };
        });
        
      case "semana":
        return Array.from({ length: 4 }, (_, i) => ({
          periodo: `Sem ${i + 1}`,
          viajes: Math.floor(Math.random() * 50) + 20,
          completados: Math.floor(Math.random() * 40) + 15,
          progresoPromedio: Math.floor(Math.random() * 20) + 75,
          tasaCompletado: Math.floor(Math.random() * 15) + 85
        }));
        
      case "año":
        return Array.from({ length: 3 }, (_, i) => ({
          periodo: `${2022 + i}`,
          viajes: Math.floor(Math.random() * 200) + 100,
          completados: Math.floor(Math.random() * 150) + 80,
          progresoPromedio: Math.floor(Math.random() * 15) + 80,
          tasaCompletado: Math.floor(Math.random() * 10) + 90
        }));
        
      default: // mes
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return meses.map(mes => ({
          periodo: mes,
          viajes: Math.floor(Math.random() * 80) + 150,
          completados: Math.floor(Math.random() * 60) + 120,
          progresoPromedio: Math.floor(Math.random() * 25) + 70,
          tasaCompletado: Math.floor(Math.random() * 20) + 80
        }));
    }
  };

  // 🔄 Cargar datos cuando cambie el período
  useEffect(() => {
    fetchTripStats();
  }, [periodo]);

  // 🎨 Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              📊 Total viajes: <span className="font-medium">{data.viajes}</span>
            </p>
            <p className="text-sm text-green-600">
              ✅ Completados: <span className="font-medium">{data.completados}</span>
            </p>
            <p className="text-sm text-purple-600">
              📈 Progreso promedio: <span className="font-medium">{data.progresoPromedio}%</span>
            </p>
            <p className="text-sm text-orange-600">
              🎯 Tasa éxito: <span className="font-medium">{data.tasaCompletado}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // 🔄 Función para refrescar datos
  const handleRefresh = () => {
    fetchTripStats();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[400px]">
      {/* 📊 Header con controles */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900">Estadísticas de Viajes</h2>
          {error && (
            <span className="text-xs text-red-500" title={error}>⚠️</span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Selector de período */}
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            disabled={loading}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-50"
          >
            {periodoOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Selector de tipo de gráfico */}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            disabled={loading}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-50"
          >
            <option value="bar">Barras</option>
            <option value="line">Líneas</option>
          </select>

          {/* Botón de actualización */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Actualizar estadísticas"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* 📈 Gráfico principal */}
      <div className="h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Cargando estadísticas...</p>
            </div>
          </div>
        ) : error && tripData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-500 mb-2">❌ {error}</p>
              <button
                onClick={handleRefresh}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        ) : tripData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">📊 No hay datos disponibles para este período</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart
                data={tripData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barCategoryGap="20%"
              >
                <XAxis
                  dataKey="periodo"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="viajes"
                  fill="#4285F4"
                  radius={[8, 8, 0, 0]}
                  name="Total Viajes"
                />
                <Bar
                  dataKey="completados"
                  fill="#10B981"
                  radius={[8, 8, 0, 0]}
                  name="Completados"
                />
              </BarChart>
            ) : (
              <LineChart
                data={tripData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="periodo"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="viajes"
                  stroke="#4285F4"
                  strokeWidth={3}
                  dot={{ fill: "#4285F4", strokeWidth: 2, r: 4 }}
                  name="Total Viajes"
                />
                <Line
                  type="monotone"
                  dataKey="completados"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  name="Completados"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* 📊 Información adicional */}
      {!loading && tripData.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {tripData.reduce((sum, item) => sum + item.viajes, 0)}
              </div>
              <div className="text-xs text-gray-500">Total Viajes</div>
            </div>
            <div>
              <div className="text-sm font-medium text-green-600">
                {tripData.reduce((sum, item) => sum + item.completados, 0)}
              </div>
              <div className="text-xs text-gray-500">Completados</div>
            </div>
            <div>
              <div className="text-sm font-medium text-purple-600">
                {tripData.length > 0 ? 
                  Math.round(tripData.reduce((sum, item) => sum + item.progresoPromedio, 0) / tripData.length) : 0}%
              </div>
              <div className="text-xs text-gray-500">Progreso Prom</div>
            </div>
            <div>
              <div className="text-sm font-medium text-orange-600">
                {tripData.length > 0 ? 
                  Math.round(tripData.reduce((sum, item) => sum + item.tasaCompletado, 0) / tripData.length) : 0}%
              </div>
              <div className="text-xs text-gray-500">Tasa Éxito</div>
            </div>
          </div>
          
          {error && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Mostrando datos de ejemplo. Error: {error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TripsChart;