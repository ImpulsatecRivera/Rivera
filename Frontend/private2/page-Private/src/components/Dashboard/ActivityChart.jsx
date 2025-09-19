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

  // 🔧 Función principal para obtener estadísticas
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📊 Obteniendo estadísticas para período: ${tipo}`);
      
      const res = await axios.get(
        `https://riveraproject-production.up.railway.app/api/viajes/trip-stats?periodo=${tipo}`,
        {
          timeout: 10000, // 10 segundos de timeout
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('📊 Respuesta del servidor:', res.data);

      // ✅ Verificar estructura de respuesta
      if (!res.data) {
        throw new Error('Respuesta vacía del servidor');
      }

      // 📊 Manejar diferentes formatos de respuesta
      let responseData = [];
      
      if (res.data.success && res.data.data) {
        // Formato: { success: true, data: [...] }
        responseData = res.data.data;
      } else if (Array.isArray(res.data)) {
        // Formato: [...]
        responseData = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        // Formato alternativo
        responseData = res.data.data;
      } else {
        throw new Error('Formato de respuesta no reconocido');
      }

      if (!Array.isArray(responseData) || responseData.length === 0) {
        console.warn('⚠️ No hay datos disponibles para este período');
        setData([]);
        return;
      }

      // 🎯 Procesar y mapear los datos
      const mappedData = responseData.map((item, index) => {
        const processedItem = processDataItem(item, index, tipo);
        console.log(`📋 Procesando item ${index}:`, { original: item, processed: processedItem });
        return processedItem;
      });

      // 📈 Ordenar datos
      const sortedData = sortDataByPeriod(mappedData, tipo);
      
      setData(sortedData);
      console.log('✅ Datos finales para el gráfico:', sortedData);
      
    } catch (error) {
      console.error("❌ Error detallado:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });

      let errorMessage = 'Error desconocido';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout - El servidor tardó demasiado en responder';
      } else if (error.response) {
        // Error del servidor (4xx, 5xx)
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Error del servidor (${error.response.status})`;
      } else if (error.request) {
        // Error de conexión
        errorMessage = 'Error de conexión - Verifica que el servidor esté ejecutándose';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // 🎯 Cargar datos de ejemplo solo en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Modo desarrollo: Cargando datos de ejemplo');
        const datosEjemplo = generarDatosEjemplo(tipo);
        setData(datosEjemplo);
      }
      
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Effect para cargar datos cuando cambia el tipo
  useEffect(() => {
    fetchStats();
  }, [tipo]);

  // 📊 Procesar un item individual de datos
  const processDataItem = (item, index, periodo) => {
    let label = "";
    let fecha = item._id;

    // 🏷️ Generar etiqueta según el tipo de _id
    if (typeof item._id === "object" && item._id !== null) {
      // Para semanas: {year, week} o {year, isoWeek}
      if (item._id.year && (item._id.week || item._id.isoWeek)) {
        const weekNum = item._id.week || item._id.isoWeek;
        label = `${item._id.year} S${weekNum}`;
      }
      // Para otros objetos complejos
      else {
        label = `Período ${index + 1}`;
      }
    } else {
      // Para valores simples
      label = formatLabelByPeriod(String(item._id), periodo);
    }

    return {
      label,
      viajes: parseInt(item.totalViajes) || parseInt(item.viajes) || 0,
      completados: parseInt(item.completados) || parseInt(item.viajesCompletados) || 0,
      progresoPromedio: Math.round(parseFloat(item.progresoPromedio) || 0),
      periodo: periodo,
      fecha: fecha,
      // Campos adicionales que podrían venir del backend
      pendientes: parseInt(item.pendientes) || 0,
      cancelados: parseInt(item.cancelados) || 0
    };
  };

  // 🏷️ Formatear etiquetas según el período
  const formatLabelByPeriod = (valor, periodo) => {
    switch (periodo) {
      case "dia":
        if (valor.includes("-")) {
          // Formato fecha YYYY-MM-DD
          const fecha = new Date(valor + 'T00:00:00');
          return fecha.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'short' 
          });
        }
        return `Día ${valor}`;
        
      case "mes":
        if (!isNaN(valor)) {
          const meses = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
          ];
          return meses[parseInt(valor) - 1] || `Mes ${valor}`;
        }
        return valor;
        
      case "año":
        return valor;
        
      default:
        return valor;
    }
  };

  // 📈 Ordenar datos según el período
  const sortDataByPeriod = (data, periodo) => {
    return data.sort((a, b) => {
      switch (periodo) {
        case "mes":
          if (!isNaN(a.fecha) && !isNaN(b.fecha)) {
            return parseInt(a.fecha) - parseInt(b.fecha);
          }
          break;
        case "dia":
          if (typeof a.fecha === 'string' && typeof b.fecha === 'string') {
            return new Date(a.fecha) - new Date(b.fecha);
          }
          break;
        case "año":
          if (!isNaN(a.fecha) && !isNaN(b.fecha)) {
            return parseInt(a.fecha) - parseInt(b.fecha);
          }
          break;
      }
      return 0;
    });
  };

  // 🎯 Generar datos de ejemplo para desarrollo
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

  // 🎨 Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between items-center mb-1">
              <span style={{ color: entry.color }} className="text-sm">
                {entry.name}:
              </span>
              <span className="font-medium ml-2">{entry.value}</span>
            </div>
          ))}
          {payload[0]?.payload?.progresoPromedio > 0 && (
            <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
              Progreso promedio: {payload[0].payload.progresoPromedio}%
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // 📊 Calcular estadísticas resumidas
  const calcularEstadisticas = () => {
    if (data.length === 0) return { totalViajes: 0, totalCompletados: 0, tasaExito: 0 };

    const totalViajes = data.reduce((sum, item) => sum + item.viajes, 0);
    const totalCompletados = data.reduce((sum, item) => sum + item.completados, 0);
    const tasaExito = totalViajes > 0 ? Math.round((totalCompletados / totalViajes) * 100) : 0;

    return { totalViajes, totalCompletados, tasaExito };
  };

  const stats = calcularEstadisticas();

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm w-full h-80">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-gray-700">
            Estadísticas de Viajes
          </h3>
          {error && (
            <span 
              className="ml-2 text-xs text-red-500 cursor-help" 
              title={`Error: ${error}`}
            >
              ⚠️
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 🔄 Botón de recarga */}
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
            title="Actualizar datos"
          >
            <svg 
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
          
          {/* 📊 Selector de período */}
          <div className="relative">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              disabled={loading}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none pr-8 disabled:opacity-50"
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
              onClick={fetchStats}
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
      
      {/* 📊 Resumen de estadísticas */}
      {!loading && data.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total viajes: {stats.totalViajes}</span>
            <span>Completados: {stats.totalCompletados}</span>
            <span>Tasa éxito: {stats.tasaExito}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityChart;