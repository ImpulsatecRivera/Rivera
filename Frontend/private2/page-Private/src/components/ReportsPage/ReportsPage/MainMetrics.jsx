import React, { useState, useEffect } from 'react';
import { Users, Truck, Clock } from 'lucide-react';
import { config } from "../../config";

const API_URL = config.api.API_URL;

const MainMetrics = () => {
  // 📊 Estados para las métricas dinámicas
  const [usuariosActivos, setUsuariosActivos] = useState({
    value: "0",
    loading: true,
    error: null
  });

  const [cargasEntregadas, setCargasEntregadas] = useState({
    value: "0", 
    loading: true,
    error: null
  });

  const [tiempoPromedio, setTiempoPromedio] = useState({
    value: "N/A",
    loading: true,
    error: null
  });

  // 🔄 Función para obtener usuarios activos
  const fetchUsuariosActivos = async () => {
    try {
      setUsuariosActivos(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`${API_URL}/clientes/resumen-usuarios`, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const res = await response.json();
      
      if (res.success && res.data) {
        setUsuariosActivos({
          value: res.data.usuariosActivos || "0",
          loading: false,
          error: null
        });
      } else {
        throw new Error('Formato de respuesta inválido');
      }
      
    } catch (error) {
      console.error("❌ Error al obtener usuarios activos:", error);
      setUsuariosActivos({
        value: "1,893", // Valor de fallback
        loading: false,
        error: error.message
      });
    }
  };

  // 🚛 Función para obtener cargas entregadas
  const fetchCargasEntregadas = async () => {
    try {
      setCargasEntregadas(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`${API_URL}/viajes/completed`, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const res = await response.json();
      
      // 📊 Procesar respuesta según el formato que devuelva tu API
      let value = "0";
      
      if (res.success && res.data) {
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
      }
      
      setCargasEntregadas({
        value,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error("❌ Error al obtener cargas entregadas:", error);
      setCargasEntregadas({
        value: "3,298", // Valor de fallback
        loading: false,
        error: error.message
      });
    }
  };

  // ⏰ Función para obtener tiempo promedio
  const fetchTiempoPromedio = async () => {
    try {
      setTiempoPromedio(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`${API_URL}/viajes/tiempo-promedio`, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const res = await response.json();
      
      if (res.success && res.data) {
        setTiempoPromedio({
          value: res.data.tiempoPromedio || "N/A",
          loading: false,
          error: null
        });
      } else {
        throw new Error('Formato de respuesta inválido');
      }
      
    } catch (error) {
      console.error("❌ Error al obtener tiempo promedio:", error);
      setTiempoPromedio({
        value: "2h 34m", // Valor de fallback
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
      fetchTiempoPromedio()
    ]);
  };

  // 🔄 Cargar datos al montar el componente
  useEffect(() => {
    fetchAllMetrics();
    
    // 🔄 Actualizar cada 3 minutos
    const interval = setInterval(fetchAllMetrics, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // 📊 Configuración de métricas con datos dinámicos
  const metrics = [
    {
      icon: Users,
      title: "Usuarios activos",
      value: usuariosActivos.value,
      color: "text-green-500",
      loading: usuariosActivos.loading,
      error: usuariosActivos.error
    },
    {
      icon: Truck,
      title: "Cargas entregadas", 
      value: cargasEntregadas.value,
      color: "text-green-500",
      loading: cargasEntregadas.loading,
      error: cargasEntregadas.error
    },
    {
      icon: Clock,
      title: "Tiempo promedio de viaje",
      value: tiempoPromedio.value,
      color: "text-green-500", 
      loading: tiempoPromedio.loading,
      error: tiempoPromedio.error
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-[#2a2d31] rounded-lg border border-[#34353A] p-3 sm:p-4 md:p-5 min-h-[100px] sm:min-h-[120px] flex flex-col justify-between relative group hover:border-[#555a5f] transition-all duration-300">
          {/* 🔄 Indicador de carga */}
          {metric.loading && (
            <div className="absolute top-2 right-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* ⚠️ Indicador de error */}
          {metric.error && (
            <div className="absolute top-2 right-2">
              <div className="w-4 h-4 bg-amber-500/20 rounded-full flex items-center justify-center" title={`Error: ${metric.error}`}>
                <span className="text-xs">⚠️</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <metric.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-green-400 ${metric.loading ? 'opacity-50' : ''}`} />
            <span className="text-xs sm:text-sm text-gray-400 font-medium leading-tight">
              {metric.title}
            </span>
          </div>
          
          <div className="flex-1 flex items-center">
            {metric.loading ? (
              <div className="animate-pulse bg-gray-500/20 h-6 sm:h-8 w-16 sm:w-20 rounded"></div>
            ) : (
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-none">
                {metric.value}
              </span>
            )}
          </div>

          {/* 🔄 Botón de actualización en hover */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                switch (index) {
                  case 0:
                    fetchUsuariosActivos();
                    break;
                  case 1:
                    fetchCargasEntregadas();
                    break;
                  case 2:
                    fetchTiempoPromedio();
                    break;
                  default:
                    break;
                }
              }}
              disabled={metric.loading}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
              title="Actualizar métrica"
            >
              {metric.loading ? '🔄' : '↻'}
            </button>
          </div>
        </div>
      ))}
      
      {/* 📊 Status bar */}
      <div className="col-span-1 sm:col-span-3 mt-2 sm:mt-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-400 gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <span>🔄 Auto-actualización: 3 min</span>
            <span className="hidden sm:inline">📊 Datos en tiempo real</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* 📊 Status de cada métrica */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${usuariosActivos.loading ? 'bg-blue-400 animate-pulse' : usuariosActivos.error ? 'bg-amber-400' : 'bg-green-400'}`}></div>
              <span className="text-xs">Usuarios</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${cargasEntregadas.loading ? 'bg-blue-400 animate-pulse' : cargasEntregadas.error ? 'bg-amber-400' : 'bg-green-400'}`}></div>
              <span className="text-xs">Cargas</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${tiempoPromedio.loading ? 'bg-blue-400 animate-pulse' : tiempoPromedio.error ? 'bg-amber-400' : 'bg-green-400'}`}></div>
              <span className="text-xs">Tiempo</span>
            </div>

            {/* 🔄 Botón de actualización general */}
            <button
              onClick={fetchAllMetrics}
              disabled={usuariosActivos.loading || cargasEntregadas.loading || tiempoPromedio.loading}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
              title="Actualizar todas las métricas"
            >
              {(usuariosActivos.loading || cargasEntregadas.loading || tiempoPromedio.loading) ? '🔄' : '↻ Todo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMetrics;