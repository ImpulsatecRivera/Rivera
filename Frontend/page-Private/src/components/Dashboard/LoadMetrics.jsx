import React, { useEffect, useState } from 'react';

const colors = ['#EF4444', '#3B82F6', '#F97316', '#8B5CF6', '#5F8EAD'];

const LoadMetrics = () => {
  const [loadMetrics, setLoadMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 FUNCIÓN PRINCIPAL PARA OBTENER DATOS
  const fetchDistribution = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Obteniendo distribución de cargas...');
      
      // 🔧 RUTA CORRECTA: carga-distribution
      const response = await fetch('http://localhost:4000/api/viajes/carga-distribution');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const res = await response.json();
      
      // 📊 El backend devuelve la data en res.data.data
      const cargasData = res.data.data || [];
      
      // 📈 Calcular total para porcentajes (ya viene calculado desde el backend)
      const totalCantidad = cargasData.reduce((sum, item) => sum + (item.count || 0), 0);

      // 🎨 Mapear datos con colores y formato para el frontend
      const dataWithColors = cargasData.map((item, index) => ({
        // 🏷️ Usar 'name' que viene del backend, fallback a 'categoria'
        label: item.name || item.categoria || item.tipo || 'Sin categoría',
        
        // 📊 Usar 'count' que viene del backend
        value: item.count,
        
        // 📈 Usar porcentaje del backend o calcularlo
        percentage: item.porcentaje || item.percentage || 
                   (totalCantidad > 0 ? (item.count / totalCantidad) * 100 : 0),
        
        // 🎨 Asignar color
        color: colors[index % colors.length],
        
        // 📦 Información adicional del backend
        pesoPromedio: item.pesoPromedio || 0,
        pesoTotal: item.pesoTotal || 0,
        ejemplos: item.ejemplos || [],
        descripcion: item.descripcion || item.name
      }));

      setLoadMetrics(dataWithColors);
      console.log('✅ Datos de cargas cargados:', dataWithColors);
      
    } catch (error) {
      console.error("❌ Error al obtener distribución de cargas:", error);
      setError(error.message || 'Error desconocido');
      
      // 🔧 Datos de ejemplo en caso de error (opcional)
      const datosEjemplo = [
        { label: 'Electrónicos', value: 25, percentage: 35, color: colors[0] },
        { label: 'Alimentos', value: 18, percentage: 25, color: colors[1] },
        { label: 'Maquinaria', value: 15, percentage: 21, color: colors[2] },
        { label: 'Textiles', value: 8, percentage: 11, color: colors[3] },
        { label: 'Químicos', value: 6, percentage: 8, color: colors[4] }
      ];
      setLoadMetrics(datosEjemplo);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Cargar datos al montar el componente
  useEffect(() => {
    fetchDistribution();
  }, []);

  // 🔄 Función para recargar datos (CORREGIDA)
  const handleRefresh = () => {
    fetchDistribution(); // ✅ Usar el nombre correcto de la función
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      {/* 📊 Header con título y botón de recarga */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Distribución de Cargas
        </h3>
        <button
          onClick={handleRefresh} // ✅ Ahora funciona correctamente
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? '🔄 Cargando...' : '↻ Actualizar'}
        </button>
      </div>

      <div className="space-y-4">
        {/* 🔄 Estado de carga */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-500">Cargando datos...</span>
          </div>
        )}

        {/* ❌ Estado de error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">
              ❌ Error: {error}
            </p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm text-red-700 underline hover:text-red-800 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* 📊 Datos de cargas */}
        {!loading && !error && loadMetrics.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            📦 No hay datos de cargas disponibles.
          </p>
        )}

        {!loading && loadMetrics.length > 0 && (
          <>
            {loadMetrics.map((metric, index) => (
              <div key={index} className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 font-medium">
                      {metric.label}
                    </span>
                    {metric.ejemplos && metric.ejemplos.length > 0 && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({metric.ejemplos[0]})
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {metric.value}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({metric.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                
                {/* 📊 Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${metric.percentage}%`,
                      backgroundColor: metric.color,
                    }}
                  ></div>
                </div>
                
                {/* 📦 Información adicional en hover */}
                {(metric.pesoPromedio > 0 || metric.pesoTotal > 0) && (
                  <div className="mt-1 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {metric.pesoPromedio > 0 && (
                      <span>Peso prom: {metric.pesoPromedio.toFixed(1)}kg</span>
                    )}
                    {metric.pesoTotal > 0 && metric.pesoPromedio > 0 && <span> | </span>}
                    {metric.pesoTotal > 0 && (
                      <span>Total: {metric.pesoTotal.toFixed(1)}kg</span>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {/* 📊 Resumen de estadísticas */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Categorías: {loadMetrics.length}</span>
                <span>
                  Peso total: {loadMetrics.reduce((sum, cat) => sum + (cat.pesoTotal || 0), 0).toFixed(1)} kg
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>
                  Más común: {loadMetrics[0]?.label || 'N/A'}
                </span>
                <span>
                  {loadMetrics[0]?.percentage.toFixed(1) || 0}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* 📈 Información adicional en modo error con datos de ejemplo */}
      {error && loadMetrics.length > 0 && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700">
            ⚠️ Mostrando datos de ejemplo. Error: {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadMetrics;