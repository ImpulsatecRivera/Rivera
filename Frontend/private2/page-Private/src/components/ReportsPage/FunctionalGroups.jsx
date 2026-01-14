import React, { useEffect, useState } from 'react';
import { config } from "../../config";

const API_URL = config.api.API_URL;

// 🏷️ FUNCIONES AUXILIARES PARA BADGES DE RIESGO
const getRiskBadgeClass = (risk) => {
  const classes = {
    'fragil': 'bg-yellow-500/20 text-yellow-400',
    'peligroso': 'bg-red-500/20 text-red-400',
    'perecedero': 'bg-green-500/20 text-green-400',
    'refrigerado': 'bg-blue-500/20 text-blue-400',
    'congelado': 'bg-cyan-500/20 text-cyan-400',
    'inflamable': 'bg-orange-500/20 text-orange-400',
    'toxico': 'bg-purple-500/20 text-purple-400',
    'corrosivo': 'bg-red-500/20 text-red-400',
    'especial': 'bg-amber-500/20 text-amber-400',
  };
  return classes[risk] || 'bg-gray-500/20 text-gray-400';
};

const getRiskLabel = (risk) => {
  const labels = {
    'fragil': '⚠️',
    'peligroso': '☢️',
    'perecedero': '⏰',
    'refrigerado': '❄️',
    'congelado': '🧊',
    'inflamable': '🔥',
    'toxico': '☠️',
    'corrosivo': '⚗️',
    'especial': '🔶',
  };
  return labels[risk] || '📦';
};

// 📦 MAPEO DE IMÁGENES PARA NUEVAS CATEGORÍAS
const categoryImages = {
  // Alimentos
  'alimentos': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&crop=center',
  'alimentos_perecederos': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&crop=center',
  'alimentos_no_perecederos': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop&crop=center',
  'bebidas': 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=100&h=100&fit=crop&crop=center',
  
  // Materiales
  'materiales_construccion': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&h=100&fit=crop&crop=center',
  'textiles': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=100&h=100&fit=crop&crop=center',
  'electronicos': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop&crop=center',
  'electrónicos': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop&crop=center',
  
  // Especializados
  'medicamentos': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop&crop=center',
  'maquinaria': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=center',
  'vehiculos': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=100&h=100&fit=crop&crop=center',
  'vehículos': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=100&h=100&fit=crop&crop=center',
  
  // Químicos y combustibles
  'quimicos': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=100&h=100&fit=crop&crop=center',
  'químicos': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=100&h=100&fit=crop&crop=center',
  'productos_químicos': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=100&h=100&fit=crop&crop=center',
  'combustibles': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=100&h=100&fit=crop&crop=center',
  
  // Otros materiales
  'papel_carton': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop&crop=center',
  'muebles': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop&crop=center',
  'productos_agricolas': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=100&h=100&fit=crop&crop=center',
  'metales': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=100&fit=crop&crop=center',
  'plasticos': 'https://images.unsplash.com/photo-1552865246-ddfa2bc3b709?w=100&h=100&fit=crop&crop=center',
  'plásticos': 'https://images.unsplash.com/photo-1552865246-ddfa2bc3b709?w=100&h=100&fit=crop&crop=center',
  'vidrio_ceramica': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center',
  'productos_limpieza': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=100&h=100&fit=crop&crop=center',
  'cosmeticos': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop&crop=center',
  'cosméticos': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop&crop=center',
  'juguetes': 'https://images.unsplash.com/photo-1558060370-d140361fb27d?w=100&h=100&fit=crop&crop=center',
  
  // Fallbacks para categorías comunes del backend
  'carga general': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=100&h=100&fit=crop&crop=center',
  'general': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=100&h=100&fit=crop&crop=center',
  'fragil': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=100&fit=crop&crop=center',
  'frágil': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=100&fit=crop&crop=center',
  'peligrosa': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center',
  'refrigerada': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&crop=center',
  'liquida': 'https://images.unsplash.com/photo-1582560469781-1965b9af903d?w=100&h=100&fit=crop&crop=center',
  'líquida': 'https://images.unsplash.com/photo-1582560469781-1965b9af903d?w=100&h=100&fit=crop&crop=center',
  'otros': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=100&h=100&fit=crop&crop=center',
  'sin categoría': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=100&h=100&fit=crop&crop=center'
};

// 🏷️ NOMBRES DISPLAY AMIGABLES (expandido para compatibilidad)
const categoryDisplayNames = {
  // Categorías del backend
  'carga general': 'Carga General',
  'electronicos': 'Electrónicos',
  'electrónicos': 'Electrónicos',
  'alimentos': 'Alimentos',
  'maquinaria': 'Maquinaria',
  'textiles': 'Textiles',
  'quimicos': 'Químicos',
  'químicos': 'Químicos',
  'productos_químicos': 'Productos Químicos',
  'vehiculos': 'Vehículos',
  'vehículos': 'Vehículos',
  'medicamentos': 'Medicamentos',
  'combustibles': 'Combustibles',
  'construccion': 'Construcción',
  'construcción': 'Construcción',
  
  // Nuevas categorías expandidas
  'alimentos_perecederos': 'Alimentos Perecederos',
  'alimentos_no_perecederos': 'Alimentos No Perecederos',
  'bebidas': 'Bebidas',
  'materiales_construccion': 'Materiales de Construcción',
  'papel_carton': 'Papel y Cartón',
  'muebles': 'Muebles y Decoración',
  'productos_agricolas': 'Productos Agrícolas',
  'metales': 'Metales',
  'plasticos': 'Plásticos',
  'plásticos': 'Plásticos',
  'vidrio_ceramica': 'Vidrio y Cerámica',
  'productos_limpieza': 'Productos de Limpieza',
  'cosmeticos': 'Cosméticos',
  'cosméticos': 'Cosméticos',
  'juguetes': 'Juguetes y Deportes',
  
  // Categorías antiguas (por compatibilidad)
  'general': 'Carga General',
  'fragil': 'Carga Frágil',
  'frágil': 'Carga Frágil',
  'peligrosa': 'Carga Peligrosa',
  'refrigerada': 'Refrigerada',
  'liquida': 'Líquidos',
  'líquida': 'Líquidos',
  'otros': 'Otros',
  'sin categoría': 'Sin Categoría'
};

// 🌈 GRADIENTES TEMÁTICOS POR CATEGORÍA (expandido)
const getGradientForCategory = (category) => {
  const categoryKey = category.toLowerCase().trim();
  
  const gradients = {
    // Alimentos - verdes
    'alimentos': 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-500',
    'alimentos_perecederos': 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-500',
    'alimentos_no_perecederos': 'bg-gradient-to-r from-emerald-400 via-green-500 to-green-600',
    'bebidas': 'bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-500',
    
    // Electrónicos - azules/púrpuras
    'electronicos': 'bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-500',
    'electrónicos': 'bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-500',
    
    // Materiales - grises/azules
    'materiales_construccion': 'bg-gradient-to-r from-gray-500 via-slate-600 to-gray-700',
    'construccion': 'bg-gradient-to-r from-gray-500 via-slate-600 to-gray-700',
    'construcción': 'bg-gradient-to-r from-gray-500 via-slate-600 to-gray-700',
    'textiles': 'bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500',
    
    // Especializados
    'medicamentos': 'bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500',
    'maquinaria': 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500',
    'vehiculos': 'bg-gradient-to-r from-slate-400 via-gray-500 to-zinc-600',
    'vehículos': 'bg-gradient-to-r from-slate-400 via-gray-500 to-zinc-600',
    
    // Peligrosos - rojos/naranjas
    'quimicos': 'bg-gradient-to-r from-red-400 via-red-500 to-red-600',
    'químicos': 'bg-gradient-to-r from-red-400 via-red-500 to-red-600',
    'productos_químicos': 'bg-gradient-to-r from-red-400 via-red-500 to-red-600',
    'combustibles': 'bg-gradient-to-r from-orange-400 via-red-500 to-red-600',
    'peligrosa': 'bg-gradient-to-r from-red-400 via-orange-500 to-red-500',
    
    // Otros
    'papel_carton': 'bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500',
    'muebles': 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500',
    'productos_agricolas': 'bg-gradient-to-r from-lime-400 via-green-500 to-emerald-500',
    'metales': 'bg-gradient-to-r from-slate-400 via-zinc-500 to-stone-600',
    'plasticos': 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500',
    'plásticos': 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500',
    'vidrio_ceramica': 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500',
    'productos_limpieza': 'bg-gradient-to-r from-teal-400 via-emerald-500 to-green-500',
    'cosmeticos': 'bg-gradient-to-r from-pink-400 via-rose-500 to-red-500',
    'cosméticos': 'bg-gradient-to-r from-pink-400 via-rose-500 to-red-500',
    'juguetes': 'bg-gradient-to-r from-violet-400 via-purple-500 to-pink-500',
    
    // Categorías especiales
    'fragil': 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500',
    'frágil': 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500',
    'refrigerada': 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500',
    'liquida': 'bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500',
    'líquida': 'bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500',
    
    // Fallbacks
    'general': 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600',
    'carga general': 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600',
    'otros': 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600',
    'sin categoría': 'bg-gradient-to-r from-gray-400 via-slate-500 to-gray-600'
  };
  
  return gradients[categoryKey] || gradients.general;
};

// 🔧 FUNCIÓN PARA NORMALIZAR NOMBRES DE CATEGORÍAS
const normalizeCategory = (category) => {
  if (!category) return 'sin categoría';
  return category.toLowerCase().trim();
};

const FunctionalGroups = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalTrips, setTotalTrips] = useState(0);

  useEffect(() => {
    fetchDistribution();
  }, []);

  const fetchDistribution = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${API_URL}/viajes/carga-distribution`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const json = await res.json();
      console.log('✅ Distribución de cargas recibida:', json);

      if (!json.success) {
        throw new Error(json.message || 'Respuesta del servidor no exitosa');
      }

      if (!json.data || !Array.isArray(json.data)) {
        throw new Error('Datos no válidos recibidos del servidor');
      }

      const distribucionArray = json.data;
      setTotalTrips(json.estadisticas?.totalViajes || distribucionArray.reduce((sum, item) => sum + (item.count || 0), 0));

      const mapped = distribucionArray.map((item, index) => {
        const categoria = normalizeCategory(
          item.categoria || 
          item.name || 
          item.tipo || 
          item._id || 
          'sin categoría'
        );
        
        const count = item.count || 0;
        const porcentaje = Math.round(item.porcentaje || item.percentage || 0);
        
        const displayName = categoryDisplayNames[categoria] || 
                           item.name || 
                           categoria.charAt(0).toUpperCase() + categoria.slice(1);

        return {
          name: displayName,
          progress: porcentaje,
          count: count,
          image: categoryImages[categoria] || null,
          gradientClass: getGradientForCategory(categoria),
          rawType: categoria,
          riskLevel: item.clasificacionRiesgo || null,
          pesoPromedio: item.pesoPromedio || 0,
          pesoTotal: item.pesoTotal || 0,
          ejemplos: item.ejemplos || [],
          valorPromedio: item.valorPromedio || 0
        };
      });
      
      const sortedMapped = mapped.sort((a, b) => b.progress - a.progress);
      
      setCategories(sortedMapped);
      console.log('🎯 Categorías procesadas:', sortedMapped);
      
    } catch (error) {
      console.error('❌ Error al cargar distribución de cargas:', error);
      setError(error.message);
      
      const datosEjemplo = [
        {
          name: 'Electrónicos',
          progress: 35,
          count: 25,
          image: categoryImages.electronicos,
          gradientClass: getGradientForCategory('electronicos'),
          rawType: 'electronicos',
          riskLevel: null,
          pesoPromedio: 150,
          pesoTotal: 500,
          ejemplos: ['Equipos de cómputo']
        },
        {
          name: 'Alimentos',
          progress: 28,
          count: 20,
          image: categoryImages.alimentos,
          gradientClass: getGradientForCategory('alimentos'),
          rawType: 'alimentos',
          riskLevel: 'perecedero',
          pesoPromedio: 500,
          pesoTotal: 1000,
          ejemplos: ['Productos frescos']
        },
        {
          name: 'Maquinaria',
          progress: 22,
          count: 16,
          image: categoryImages.maquinaria,
          gradientClass: getGradientForCategory('maquinaria'),
          rawType: 'maquinaria',
          riskLevel: null,
          pesoPromedio: 2500,
          pesoTotal: 3000,
          ejemplos: ['Equipo industrial']
        },
        {
          name: 'Textiles',
          progress: 15,
          count: 11,
          image: categoryImages.textiles,
          gradientClass: getGradientForCategory('textiles'),
          rawType: 'textiles',
          riskLevel: null,
          pesoPromedio: 80,
          pesoTotal: 200,
          ejemplos: ['Ropa y telas']
        }
      ];
      
      setCategories(datosEjemplo);
      setTotalTrips(datosEjemplo.reduce((sum, item) => sum + item.count, 0));
      
    } finally {
      setLoading(false);
    }
  };

  // 📊 Componente Card Responsive - Completamente Optimizado
  const CategoryCard = ({ category }) => (
    <div className="group relative overflow-hidden bg-gradient-to-r from-[#2a2d31] to-[#1f2124] border border-gray-700/40 rounded-xl hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 p-2.5 sm:p-3.5 lg:p-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Imagen - Responsive */}
        <div className="flex-shrink-0 w-full sm:w-32 lg:w-36">
          {category.image ? (
            <img 
              src={category.image}
              alt={category.name}
              className="w-full sm:w-32 lg:w-36 h-28 sm:h-32 lg:h-36 rounded-lg object-cover shadow-lg ring-1 ring-gray-600/50"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzJhMmQzMSIvPgo8cGF0aCBkPSJNMjQgMTZDMjAgMTYgMTYgMjAgMTYgMjRDMTYgMjggMjAgMzIgMjQgMzJDMjggMzIgMzIgMjggMzIgMjRDMzIgMjAgMjggMTYgMjQgMTYiIGZpbGw9IiM1NTVhNWYiLz4KPC9zdmc+';
              }}
            />
          ) : (
            <div className="w-full sm:w-32 lg:w-36 h-28 sm:h-32 lg:h-36 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-lg ring-1 ring-gray-600/50">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Header */}
          <div>
            <div className="flex justify-between items-start gap-2 sm:gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm lg:text-base font-bold text-white truncate">
                  {category.name}
                </h4>
                {category.riskLevel && category.riskLevel !== 'normal' && (
                  <span className={`text-xs px-2 py-0.5 sm:py-1 rounded-full inline-flex items-center gap-1 mt-1 font-semibold ${getRiskBadgeClass(category.riskLevel)}`}>
                    {getRiskLabel(category.riskLevel)}
                  </span>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-300">{category.count}</p>
                <p className="text-xs text-gray-400">viajes</p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-2 sm:mt-2.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-400">Distribución</span>
                <span className="text-xs sm:text-sm font-bold text-blue-400">{category.progress}%</span>
              </div>
              <div className="w-full bg-[#1a1c1f] rounded-full h-1.5 sm:h-2 overflow-hidden border border-gray-700/50">
                <div
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${category.gradientClass}`}
                  style={{ width: `${Math.min(Math.max(category.progress, 0), 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Info Stats */}
          {category.pesoTotal > 0 && (
            <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-1.5 sm:gap-2">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 sm:p-2.5">
                <p className="text-xs text-gray-400 font-semibold">Peso</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-blue-300 mt-0.5">{(category.pesoTotal / 1000).toFixed(1)}t</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 sm:p-2.5">
                <p className="text-xs text-gray-400 font-semibold">Valor</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-purple-300 mt-0.5">${(category.valorPromedio * category.count / 1000).toLocaleString('es-ES', {maximumFractionDigits: 0})}k</p>
              </div>
            </div>
          )}

          {/* Ejemplos */}
          {category.ejemplos && category.ejemplos.length > 0 && (
            <p className="text-xs text-gray-500 mt-2 truncate">📌 {category.ejemplos.join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-[#34353A] to-[#2a2d31] rounded-2xl border border-gray-700/40 overflow-hidden shadow-2xl">
      {/* Header Simple y Responsivo */}
      <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 border-b border-gray-700/40 bg-gradient-to-r from-[#34353A] via-[#34353A] to-[#2a2d31]">
        <div className="flex justify-between items-start gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white flex items-center gap-2">
              📦 Distribución
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {totalTrips > 0 ? (
                <><span className="text-blue-400 font-bold">{totalTrips}</span> viajes • <span className="text-purple-400 font-bold">{categories.length}</span> cat</>
              ) : 'Categorías'}
            </p>
          </div>
          
          <button
            onClick={fetchDistribution}
            disabled={loading}
            className="p-2 sm:p-2.5 text-gray-300 hover:text-white hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 rounded-lg transition-all border border-gray-600/50 flex-shrink-0"
            title="Actualizar"
          >
            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-600 border-t-blue-500 mx-auto mb-3"></div>
              <p className="text-sm text-gray-400">Cargando...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && categories.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-3xl mb-3">❌</p>
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <button 
                onClick={fetchDistribution} 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Sin datos */}
        {!loading && !error && categories.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-sm">📦 Sin datos</p>
          </div>
        )}

        {/* Cards con Scroll */}
        {!loading && categories.length > 0 && (
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 lg:px-5 py-3 sm:py-4" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#555a5f transparent'
          }}>
            <style>{`
              .functional-groups-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .functional-groups-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .functional-groups-scroll::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
                border-radius: 3px;
              }
              .functional-groups-scroll::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, #60a5fa 0%, #a78bfa 100%);
              }
            `}</style>
            <div className="functional-groups-scroll space-y-2.5 sm:space-y-3">
              {categories.map((category, index) => (
                <CategoryCard key={`${category.rawType}-${index}`} category={category} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats - Responsive */}
      {!loading && categories.length > 0 && (
        <div className="flex-shrink-0 p-3 sm:p-4 lg:p-5 border-t border-gray-700/40 bg-gradient-to-r from-[#2a2d31] to-[#1f2124]">
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 lg:gap-3">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2.5 sm:p-3 lg:p-3.5 text-center">
              <p className="text-xs font-semibold text-gray-400">Categorías</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-300 mt-1">{categories.length}</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2.5 sm:p-3 lg:p-3.5 text-center">
              <p className="text-xs font-semibold text-gray-400">Peso</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-300 mt-1">{(categories.reduce((sum, cat) => sum + (cat.pesoTotal || 0), 0) / 1000).toFixed(1)}t</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5 sm:p-3 lg:p-3.5 text-center truncate">
              <p className="text-xs font-semibold text-gray-400">Top</p>
              <p className="text-sm sm:text-base lg:text-base font-bold text-emerald-300 mt-1 truncate line-clamp-1">{categories[0]?.name || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Aviso de datos de ejemplo */}
      {error && categories.length > 0 && (
        <div className="flex-shrink-0 p-3 bg-amber-500/20 border-t border-amber-600/50 text-xs text-amber-300">
          ⚠️ Datos de ejemplo
        </div>
      )}
    </div>
  );
};

export default FunctionalGroups;