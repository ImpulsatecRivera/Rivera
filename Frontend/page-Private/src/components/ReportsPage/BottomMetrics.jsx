import React, { useEffect, useState } from "react";
import { Users, Truck, Clock, Package, TrendingUp, ArrowUp } from "lucide-react";

const MetricCard = ({ icon: Icon, title, value, trend, trendValue, color = "green", loading = false }) => {
  const colorClasses = {
    green: "text-green-500 bg-green-50",
    blue: "text-blue-500 bg-blue-50",
    purple: "text-purple-500 bg-purple-50",
    orange: "text-orange-500 bg-orange-50",
    red: "text-red-500 bg-red-50"
  };

  const trendColors = {
    positive: "text-green-600 bg-green-100",
    negative: "text-red-600 bg-red-100",
    neutral: "text-gray-600 bg-gray-100"
  };

  return (
    <div className="bg-white p-3 sm:p-4 lg:p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-gray-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={18} className={colorClasses[color].split(' ')[0]} />
        </div>
        {trend && trendValue && !loading && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
            <ArrowUp 
              size={12} 
              className={`transform ${trend === 'negative' ? 'rotate-180' : ''} ${trend === 'neutral' ? 'rotate-90' : ''}`} 
            />
            {trendValue}
          </div>
        )}
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        )}
      </div>

      {/* Title */}
      <div className="text-xs sm:text-sm font-medium text-gray-600 mb-2 leading-tight">
        {title}
      </div>

      {/* Value */}
      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-none">
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
        ) : (
          value
        )}
      </div>
    </div>
  );
};

const BottomMetrics = () => {
  // 📊 Estado para usuarios activos
  const [usuariosActivosData, setUsuariosActivosData] = useState({
    value: "0",
    trend: "neutral",
    trendValue: "0%",
    loading: true,
    error: null
  });

  // 🚛 Estado para cargas entregadas
  const [cargasEntregadasData, setCargasEntregadasData] = useState({
    value: "0",
    trend: "neutral",
    trendValue: "0%",
    loading: true,
    error: null
  });

  // ⏰ Estado para tiempo promedio de viaje
  const [tiempoPromedioData, setTiempoPromedioData] = useState({
    value: "N/A",
    trend: "neutral",
    trendValue: "0%",
    loading: true,
    error: null
  });

  // 📦 Estado para capacidades de carga
  const [capacidadInicialData, setCapacidadInicialData] = useState({
    value: "0%",
    trend: "neutral",
    trendValue: "0%",
    loading: true,
    error: null
  });

  const [capacidadActualData, setCapacidadActualData] = useState({
    value: "0%",
    trend: "neutral",
    trendValue: "0%",
    loading: true,
    error: null
  });

  const [incrementoEficienciaData, setIncrementoEficienciaData] = useState({
    value: "+0%",
    trend: "neutral",
    trendValue: "0%",
    loading: true,
    error: null
  });

  // 🔄 Función para obtener usuarios activos
  const fetchUsuariosActivos = async () => {
    try {
      setUsuariosActivosData(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('📊 Obteniendo usuarios activos...');
      
      const response = await fetch('http://localhost:4000/api/clientes/resumen-usuarios');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const res = await response.json();
      console.log('✅ Datos de usuarios activos:', res);
      
      if (res.success && res.data) {
        setUsuariosActivosData({
          value: res.data.usuariosActivos || "0",
          trend: res.data.tendencia === "positive" ? "positive" : 
                 res.data.tendencia === "negative" ? "negative" : "neutral",
          trendValue: res.data.cambio || "0%",
          loading: false,
          error: null
        });
      } else {
        throw new Error('Formato de respuesta inválido');
      }
      
    } catch (error) {
      console.error("❌ Error al obtener usuarios activos:", error);
      setUsuariosActivosData({
        value: "1,893", // Valor de fallback
        trend: "positive",
        trendValue: "+12%",
        loading: false,
        error: error.message
      });
    }
  };

  // 🚛 Función para obtener cargas entregadas
  const fetchCargasEntregadas = async () => {
    try {
      setCargasEntregadasData(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🚛 Obteniendo cargas entregadas...');
      
      const response = await fetch('http://localhost:4000/api/viajes/completed');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const res = await response.json();
      console.log('✅ Datos de cargas entregadas:', res);
      
      // 📊 Procesar respuesta según el formato que devuelva tu API
      let value = "0";
      let trend = "neutral";
      let trendValue = "0%";
      
      if (res.success) {
        // Si tu API devuelve un formato específico, ajusta aquí
        if (res.data) {
          if (typeof res.data === 'number') {
            value = res.data.toLocaleString();
          } else if (res.data.total) {
            value = res.data.total.toLocaleString();
          } else if (res.data.completed) {
            value = res.data.completed.toLocaleString();
          } else if (res.data.count) {
            value = res.data.count.toLocaleString();
          } else if (Array.isArray(res.data)) {
            value = res.data.length.toLocaleString();
          }
          
          // Extraer tendencia si viene en la respuesta
          if (res.data.tendencia) {
            trend = res.data.tendencia;
          }
          if (res.data.cambio) {
            trendValue = res.data.cambio;
          }
        } else if (res.total) {
          value = res.total.toLocaleString();
        } else if (Array.isArray(res)) {
          value = res.length.toLocaleString();
        }
      }
      
      setCargasEntregadasData({
        value,
        trend,
        trendValue,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error("❌ Error al obtener cargas entregadas:", error);
      setCargasEntregadasData({
        value: "3,298", // Valor de fallback
        trend: "positive",
        trendValue: "+8%",
        loading: false,
        error: error.message
      });
    }
  };

  // ⏰ Función para obtener tiempo promedio de viaje
  const fetchTiempoPromedio = async () => {
    try {
      setTiempoPromedioData(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('⏰ Obteniendo tiempo promedio de viaje...');
      
      const response = await fetch('http://localhost:4000/api/viajes/tiempo-promedio');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const res = await response.json();
      console.log('✅ Datos de tiempo promedio:', res);
      
      if (res.success && res.data) {
        setTiempoPromedioData({
          value: res.data.tiempoPromedio || "N/A",
          trend: res.data.tendencia || "neutral",
          trendValue: res.data.cambio || "0%",
          loading: false,
          error: null
        });
      } else {
        throw new Error('Formato de respuesta inválido');
      }
      
    } catch (error) {
      console.error("❌ Error al obtener tiempo promedio:", error);
      setTiempoPromedioData({
        value: "2h 34m", // Valor de fallback
        trend: "negative",
        trendValue: "-5%",
        loading: false,
        error: error.message
      });
    }
  };

  // 📦 Función para obtener capacidades de carga
  const fetchCapacidades = async () => {
    try {
      setCapacidadInicialData(prev => ({ ...prev, loading: true, error: null }));
      setCapacidadActualData(prev => ({ ...prev, loading: true, error: null }));
      setIncrementoEficienciaData(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('📦 Obteniendo capacidades de carga...');
      
      const response = await fetch('http://localhost:4000/api/viajes/capacidad-carga');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const res = await response.json();
      console.log('✅ Datos de capacidades:', res);
      
      if (res.success && res.data) {
        // Capacidad inicial
        if (res.data.capacidadInicial) {
          setCapacidadInicialData({
            value: res.data.capacidadInicial.porcentaje || "0%",
            trend: res.data.capacidadInicial.tendencia || "neutral",
            trendValue: res.data.capacidadInicial.cambio || "0%",
            loading: false,
            error: null
          });
        }

        // Capacidad actual
        if (res.data.capacidadActual) {
          setCapacidadActualData({
            value: res.data.capacidadActual.porcentaje || "0%",
            trend: res.data.capacidadActual.tendencia || "neutral",
            trendValue: res.data.capacidadActual.cambio || "0%",
            loading: false,
            error: null
          });
        }

        // Incremento de eficiencia
        if (res.data.incrementoEficiencia) {
          setIncrementoEficienciaData({
            value: res.data.incrementoEficiencia.valor || "+0%",
            trend: res.data.incrementoEficiencia.tendencia || "neutral",
            trendValue: res.data.incrementoEficiencia.cambio || "0%",
            loading: false,
            error: null
          });
        }
      } else {
        throw new Error('Formato de respuesta inválido');
      }
      
    } catch (error) {
      console.error("❌ Error al obtener capacidades:", error);
      
      // Valores de fallback
      setCapacidadInicialData({
        value: "64%",
        trend: "neutral",
        trendValue: "0%",
        loading: false,
        error: error.message
      });

      setCapacidadActualData({
        value: "86%",
        trend: "positive",
        trendValue: "+22%",
        loading: false,
        error: error.message
      });

      setIncrementoEficienciaData({
        value: "+34%",
        trend: "positive",
        trendValue: "+7%",
        loading: false,
        error: error.message
      });
    }
  };

  // 🔄 Función para actualizar todas las métricas
  const fetchAllMetrics = async () => {
    await Promise.all([
      fetchUsuariosActivos(),
      fetchCargasEntregadas(),
      fetchTiempoPromedio(),
      fetchCapacidades()
    ]);
  };

  // 🔄 Cargar datos al montar el componente
  useEffect(() => {
    fetchAllMetrics();
    
    // 🔄 Actualizar cada 5 minutos
    const interval = setInterval(fetchAllMetrics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // 📊 Métricas dinámicas (todas conectadas al backend)
  const allMetrics = [
    {
      icon: Users,
      title: "Usuarios activos",
      value: usuariosActivosData.value,
      color: "green",
      trend: usuariosActivosData.trend,
      trendValue: usuariosActivosData.trendValue,
      loading: usuariosActivosData.loading
    },
    {
      icon: Truck,
      title: "Cargas entregadas",
      value: cargasEntregadasData.value,
      color: "blue",
      trend: cargasEntregadasData.trend,
      trendValue: cargasEntregadasData.trendValue,
      loading: cargasEntregadasData.loading
    },
    {
      icon: Clock,
      title: "Tiempo promedio de viaje",
      value: tiempoPromedioData.value,
      color: "purple",
      trend: tiempoPromedioData.trend,
      trendValue: tiempoPromedioData.trendValue,
      loading: tiempoPromedioData.loading
    },
    {
      icon: Package,
      title: "Capacidad inicial de carga",
      value: capacidadInicialData.value,
      color: "orange",
      trend: capacidadInicialData.trend,
      trendValue: capacidadInicialData.trendValue,
      loading: capacidadInicialData.loading
    },
    {
      icon: Package,
      title: "Capacidad actual de carga",
      value: capacidadActualData.value,
      color: "green",
      trend: capacidadActualData.trend,
      trendValue: capacidadActualData.trendValue,
      loading: capacidadActualData.loading
    },
    {
      icon: TrendingUp,
      title: "Incremento de eficiencia",
      value: incrementoEficienciaData.value,
      color: "green",
      trend: incrementoEficienciaData.trend,
      trendValue: incrementoEficienciaData.trendValue,
      loading: incrementoEficienciaData.loading
    }
  ];

  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-4 sm:mb-5 lg:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1">
              Métricas de Rendimiento
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Indicadores clave de desempeño del sistema - Datos en tiempo real
            </p>
          </div>
          
          {/* 🔄 Botón de actualización para todas las métricas */}
          <button
            onClick={fetchAllMetrics}
            disabled={usuariosActivosData.loading || cargasEntregadasData.loading || 
                     tiempoPromedioData.loading || capacidadInicialData.loading || 
                     capacidadActualData.loading || incrementoEficienciaData.loading}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
            title="Actualizar todas las métricas"
          >
            {(usuariosActivosData.loading || cargasEntregadasData.loading || 
              tiempoPromedioData.loading || capacidadInicialData.loading || 
              capacidadActualData.loading || incrementoEficienciaData.loading) ? '🔄' : '↻'}
          </button>
        </div>
        
        {/* ⚠️ Indicadores de error */}
        {(usuariosActivosData.error || cargasEntregadasData.error || tiempoPromedioData.error || 
          capacidadInicialData.error || capacidadActualData.error || incrementoEficienciaData.error) && (
          <div className="mt-2 space-y-1">
            {usuariosActivosData.error && (
              <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                ⚠️ Usuarios activos: usando datos de ejemplo ({usuariosActivosData.error})
              </div>
            )}
            {cargasEntregadasData.error && (
              <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                ⚠️ Cargas entregadas: usando datos de ejemplo ({cargasEntregadasData.error})
              </div>
            )}
            {tiempoPromedioData.error && (
              <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                ⚠️ Tiempo promedio: usando datos de ejemplo ({tiempoPromedioData.error})
              </div>
            )}
            {(capacidadInicialData.error || capacidadActualData.error || incrementoEficienciaData.error) && (
              <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                ⚠️ Capacidades: usando datos de ejemplo (Error de conexión)
              </div>
            )}
          </div>
        )}
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
        {allMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Mobile Alternative Layout - Stack for very small screens */}
      <div className="block xs:hidden mt-4">
        <div className="space-y-3">
          {allMetrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${metric.color === 'green' ? 'text-green-500 bg-green-50' : 
                  metric.color === 'blue' ? 'text-blue-500 bg-blue-50' :
                  metric.color === 'purple' ? 'text-purple-500 bg-purple-50' :
                  metric.color === 'orange' ? 'text-orange-500 bg-orange-50' :
                  'text-red-500 bg-red-50'}`}>
                  <metric.icon size={16} />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600">{metric.title}</div>
                  <div className="text-lg font-bold text-gray-900">
                    {metric.loading ? (
                      <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                    ) : (
                      metric.value
                    )}
                  </div>
                </div>
              </div>
              {metric.trend && metric.trendValue && !metric.loading && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  metric.trend === 'positive' ? 'text-green-600 bg-green-100' :
                  metric.trend === 'negative' ? 'text-red-600 bg-red-100' :
                  'text-gray-600 bg-gray-100'
                }`}>
                  <ArrowUp 
                    size={10} 
                    className={`transform ${metric.trend === 'negative' ? 'rotate-180' : ''} ${metric.trend === 'neutral' ? 'rotate-90' : ''}`} 
                  />
                  {metric.trendValue}
                </div>
              )}
              {metric.loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ✨ Status Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>🔄 Auto-actualización: 5 min</span>
            <span>📊 Datos en tiempo real</span>
            <span>🚀 6 métricas conectadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Sistema activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* XS Breakpoint */
          @media (min-width: 360px) {
            .xs\\:grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .xs\\:hidden {
              display: none;
            }
          }
          
          /* Improved hover effects */
          .group:hover .group-hover\\:scale-110 {
            transform: scale(1.1);
          }
          
          /* Better responsive text sizing */
          @media (max-width: 480px) {
            .text-lg { font-size: 1rem; }
            .text-xl { font-size: 1.125rem; }
            .text-2xl { font-size: 1.25rem; }
          }
          
          /* Tablet specific adjustments */
          @media (min-width: 768px) and (max-width: 1023px) {
            .lg\\:grid-cols-6 {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }
          
          /* Small desktop adjustments */
          @media (min-width: 1024px) and (max-width: 1279px) {
            .lg\\:grid-cols-6 {
              grid-template-columns: repeat(6, minmax(0, 1fr));
            }
          }
          
          /* Large screens - keep 6 columns but with better spacing */
          @media (min-width: 1280px) {
            .xl\\:grid-cols-6 {
              grid-template-columns: repeat(6, minmax(0, 1fr));
            }
          }
          
          /* Animation improvements */
          .transition-all {
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          /* Focus styles for accessibility */
          .group:focus-within {
            outline: 2px solid #3B82F6;
            outline-offset: 2px;
          }
          
          /* Print styles */
          @media print {
            .shadow-sm, .shadow-md {
              box-shadow: none !important;
              border: 1px solid #e5e7eb !important;
            }
          }

          /* Custom animations for loading states */
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .5;
            }
          }
          
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `
      }} />
    </div>
  );
};

export default BottomMetrics;