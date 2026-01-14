import React, { useEffect, useState } from 'react';
import { config } from '../../config';

const API_URL = config.api.API_URL;

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

const LoadMetrics = () => {
  const [loadMetrics, setLoadMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDistribution = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Obteniendo distribución de cargas...');
      
      // 🔧 RUTA CORRECTA: carga-distribution
      const response = await fetch(`${API_URL}/viajes/carga-distribution`, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const res = await response.json();
      const cargasData = res.data || [];
      const totalCantidad = cargasData.reduce((sum, item) => sum + (item.cantidad || item.count || 0), 0);

      const dataWithColors = cargasData.map((item, index) => {
        const cantidad = item.cantidad || item.count || 0;
        const percentage = totalCantidad > 0 ? (cantidad / totalCantidad) * 100 : 0;
        
        return {
          label: item.tipo || item.name || item.categoria || 'Sin categoría',
          value: cantidad,
          percentage: percentage,
          color: colors[index % colors.length],
          pesoPromedio: item.pesoPromedio || 0,
          pesoTotal: item.pesoTotal || 0,
          valorPromedio: item.valorPromedio || 0,
          valorTotal: item.valorTotal || 0,
          ejemplos: item.ejemplos || [],
          subcategorias: item.subcategorias || [],
          descripcion: item.descripcion || item.tipo,
          tasaCompletado: item.tasaCompletado || 0,
          viajesActivos: item.viajesActivos || 0,
          clasificacionRiesgo: item.clasificacionRiesgo || 'normal',
          riesgosEspeciales: item.riesgosEspeciales || 0
        };
      });

      setLoadMetrics(dataWithColors);
      
    } catch (error) {
      console.error("Error al obtener distribución de cargas:", error);
      setError(error.message || 'Error desconocido');
      
      const datosEjemplo = [
        { label: 'Electrónicos', value: 25, percentage: 35, color: colors[0], pesoTotal: 500, valorTotal: 50000, viajesActivos: 5, ejemplos: ['Laptops', 'Tablets'] },
        { label: 'Alimentos', value: 18, percentage: 25, color: colors[1], pesoTotal: 1000, valorTotal: 15000, viajesActivos: 4, ejemplos: ['Frutas', 'Verduras'] },
        { label: 'Maquinaria', value: 15, percentage: 21, color: colors[2], pesoTotal: 3000, valorTotal: 80000, viajesActivos: 3, ejemplos: ['Motores', 'Bombas'] },
        { label: 'Textiles', value: 8, percentage: 11, color: colors[3], pesoTotal: 200, valorTotal: 5000, viajesActivos: 2, ejemplos: ['Ropa', 'Telas'] },
        { label: 'Químicos', value: 6, percentage: 8, color: colors[4], pesoTotal: 150, valorTotal: 3000, viajesActivos: 1, ejemplos: ['Ácidos', 'Bases'] }
      ];
      setLoadMetrics(datosEjemplo);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistribution();
  }, []);

  const handleRefresh = () => {
    fetchDistribution();
  };

  // 📊 Componente Card
  const MetricCard = ({ metric }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-lg transition-all group">
      <div className="flex gap-3">
        {/* Indicador de color */}
        <div className="flex-shrink-0">
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-md"
            style={{ backgroundColor: metric.color }}
          />
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                {metric.label}
              </h4>
              {metric.clasificacionRiesgo === 'especial' && (
                <span className="inline-block text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded mt-1 font-medium">
                  ⚠️ Especial
                </span>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg sm:text-2xl font-bold" style={{ color: metric.color }}>
                {metric.value}
              </div>
              <div className="text-xs text-gray-500">
                {metric.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${metric.percentage}%`,
                backgroundColor: metric.color,
              }}
            />
          </div>
          
          {/* Info mini */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 p-1.5 rounded">
              <p className="text-gray-500">📦 {(metric.pesoTotal / 1000).toFixed(1)}t</p>
            </div>
            <div className="bg-gray-50 p-1.5 rounded">
              <p className="text-gray-500">💰 ${(metric.valorTotal / 1000).toFixed(0)}k</p>
            </div>
          </div>
          
          {/* Ejemplos */}
          {metric.ejemplos && metric.ejemplos.length > 0 && (
            <p className="text-xs text-gray-500 mt-2 truncate">
              {metric.ejemplos.join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Estadísticas totales
  const totalCantidad = loadMetrics.reduce((sum, cat) => sum + cat.value, 0);
  const totalPeso = loadMetrics.reduce((sum, cat) => sum + (cat.pesoTotal || 0), 0);
  const totalValor = loadMetrics.reduce((sum, cat) => sum + (cat.valorTotal || 0), 0);
  const totalActivos = loadMetrics.reduce((sum, cat) => sum + (cat.viajesActivos || 0), 0);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 rounded-2xl overflow-hidden">
      {/* Header - Compacto y Responsive */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">📦</span>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Distribución de Cargas
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {loadMetrics.length} categoría{loadMetrics.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg transition-all disabled:opacity-50 flex-shrink-0 whitespace-nowrap"
          >
            {loading ? '🔄' : '↻'} Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas - Responsive Grid */}
      {!loading && loadMetrics.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex-shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="text-xs text-gray-600 font-medium">Categorías</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600 mt-1">{loadMetrics.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <p className="text-xs text-gray-600 font-medium">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600 mt-1">{totalCantidad}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <p className="text-xs text-gray-600 font-medium">Peso</p>
              <p className="text-lg sm:text-2xl font-bold text-amber-600 mt-1">{(totalPeso / 1000).toFixed(1)}t</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              <p className="text-xs text-gray-600 font-medium">Activos</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600 mt-1">{totalActivos}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center animate-spin">
                <span className="text-xl">⚙️</span>
              </div>
              <p className="text-gray-600 font-medium">Cargando...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && loadMetrics.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center max-w-xs">
              <p className="text-3xl mb-2">❌</p>
              <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Sin datos */}
        {!loading && !error && loadMetrics.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-center">📭 No hay datos</p>
          </div>
        )}

        {/* Grid con Scroll */}
        {!loading && loadMetrics.length > 0 && (
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db transparent'
          }}>
            <style>{`
              .load-metrics-list::-webkit-scrollbar {
                width: 6px;
              }
              .load-metrics-list::-webkit-scrollbar-track {
                background: transparent;
              }
              .load-metrics-list::-webkit-scrollbar-thumb {
                background-color: #d1d5db;
                border-radius: 3px;
              }
              .load-metrics-list::-webkit-scrollbar-thumb:hover {
                background-color: #9ca3af;
              }
            `}</style>
            <div className="load-metrics-list space-y-2 sm:space-y-3">
              {loadMetrics.map((metric, index) => (
                <MetricCard key={`${metric.label}-${index}`} metric={metric} />
              ))}
            </div>
            {error && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                ⚠️ Datos de ejemplo
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadMetrics;