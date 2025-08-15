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
      console.log('📦 Respuesta completa del backend:', res);
      
      // 🔧 CORRECCIÓN: Los datos están en res.data (que es el array de tipos de carga)
      const cargasData = res.data || [];
      console.log('📊 Datos de cargas extraídos:', cargasData);
      
      // 📈 Calcular total para porcentajes
      const totalCantidad = cargasData.reduce((sum, item) => sum + (item.cantidad || item.count || 0), 0);
      console.log('📊 Total cantidad:', totalCantidad);

      // 🎨 Mapear datos con colores y formato para el frontend
      const dataWithColors = cargasData.map((item, index) => {
        // 📊 Calcular porcentaje
        const cantidad = item.cantidad || item.count || 0;
        const percentage = totalCantidad > 0 ? (cantidad / totalCantidad) * 100 : 0;
        
        return {
          // 🏷️ Usar 'tipo' que viene del backend
          label: item.tipo || item.name || item.categoria || 'Sin categoría',
          
          // 📊 Usar 'cantidad' que viene del backend
          value: cantidad,
          
          // 📈 Calcular porcentaje
          percentage: percentage,
          
          // 🎨 Asignar color
          color: colors[index % colors.length],
          
          // 📦 Información adicional del backend
          pesoPromedio: item.pesoPromedio || 0,
          pesoTotal: item.pesoTotal || 0,
          valorPromedio: item.valorPromedio || 0,
          valorTotal: item.valorTotal || 0,
          ejemplos: item.ejemplos || [],
          subcategorias: item.subcategorias || [], // 📂 Agregar subcategorías
          descripcion: item.descripcion || item.tipo,
          tasaCompletado: item.tasaCompletado || 0,
          viajesActivos: item.viajesActivos || 0,
          clasificacionRiesgo: item.clasificacionRiesgo || 'normal',
          riesgosEspeciales: item.riesgosEspeciales || 0
        };
      });

      setLoadMetrics(dataWithColors);
      console.log('✅ Datos de cargas procesados:', dataWithColors);
      
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

  // 🔄 Función para recargar datos
  const handleRefresh = () => {
    fetchDistribution();
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      {/* 📊 Header con título y botón de recarga */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Distribución de Cargas
        </h3>
        <button
          onClick={handleRefresh}
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
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700 font-medium">
                        {metric.label}
                      </span>
                      {/* 📂 Mostrar ejemplos (no subcategorías) */}
                      {metric.ejemplos && metric.ejemplos.length > 0 && (
                        <span className="text-xs text-gray-500 mt-0.5">
                          📂 {metric.ejemplos.join(', ')}
                        </span>
                      )}
                    </div>
                    {/* 🚨 Indicador de riesgo */}
                    {metric.clasificacionRiesgo === 'especial' && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-1 rounded">
                        ⚠️ Especial
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
                <div className="mt-1 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="grid grid-cols-2 gap-2">
                    {metric.pesoPromedio > 0 && (
                      <span>Peso prom: {metric.pesoPromedio.toFixed(1)}kg</span>
                    )}
                    {metric.pesoTotal > 0 && (
                      <span>Peso total: {metric.pesoTotal.toFixed(1)}kg</span>
                    )}
                    {metric.valorPromedio > 0 && (
                      <span>Valor prom: ${metric.valorPromedio.toLocaleString()}</span>
                    )}
                    {metric.valorTotal > 0 && (
                      <span>Valor total: ${metric.valorTotal.toLocaleString()}</span>
                    )}
                    {metric.tasaCompletado > 0 && (
                      <span>Completado: {metric.tasaCompletado}%</span>
                    )}
                    {metric.viajesActivos > 0 && (
                      <span>Activos: {metric.viajesActivos}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* 📊 Resumen de estadísticas */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Categorías:</span>
                    <span className="text-gray-700 font-medium">{loadMetrics.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Peso total:</span>
                    <span className="text-gray-700 font-medium">
                      {loadMetrics.reduce((sum, cat) => sum + (cat.pesoTotal || 0), 0).toFixed(1)} kg
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Más común:</span>
                    <span className="text-gray-700 font-medium">{loadMetrics[0]?.label || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Valor total:</span>
                    <span className="text-gray-700 font-medium">
                      ${loadMetrics.reduce((sum, cat) => sum + (cat.valorTotal || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
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