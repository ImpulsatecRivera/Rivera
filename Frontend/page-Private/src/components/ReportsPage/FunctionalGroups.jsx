import React, { useEffect, useState } from 'react';
import { config } from "../../config";

const API_URL = config.api.API_URL;

// Componente individual mejorado con diseño responsive y contraste para fondo oscuro
const CategoryItem = ({ image, name, progress, gradientClass, count, riskLevel, pesoPromedio, ejemplos }) => (
  <div className="group hover:shadow-lg rounded-xl p-3 sm:p-4 transition-all duration-300 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/80 hover:bg-gray-800/80">
    {/* Vista Desktop - Layout horizontal */}
    <div className="hidden sm:flex items-center space-x-4">
      {image ? (
        <img 
          src={image}
          alt={name}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover flex-shrink-0 shadow-md ring-2 ring-gray-700/50"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzM3NDE1MSIvPgo8cGF0aCBkPSJNMjQgMTZDMjAgMTYgMTYgMjAgMTYgMjRDMTYgMjggMjAgMzIgMjQgMzJDMjggMzIgMzIgMjggMzIgMjRDMzIgMjAgMjggMTYgMjQgMTYiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+';
          }}
        />
      ) : (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-700/50 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-gray-700/50">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2 gap-2">
          <h4 className="text-sm sm:text-base font-semibold text-gray-100 truncate">{name}</h4>
          {riskLevel && riskLevel !== 'normal' && (
            <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 font-medium ${getRiskBadgeClass(riskLevel)}`}>
              {getRiskLabel(riskLevel)}
            </span>
          )}
        </div>
        
        {/* 📊 Información adicional en hover */}
        {ejemplos && ejemplos.length > 0 && (
          <div className="text-xs text-gray-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1">
            Ej: {ejemplos[0]}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2">
          <div className="flex-1 bg-gray-700/50 rounded-full h-2.5 shadow-inner">
            <div
              className={`h-2.5 rounded-full ${gradientClass} transition-all duration-500 ease-out shadow-sm`}
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
          <div className="flex justify-between sm:text-right sm:flex-shrink-0 sm:min-w-[120px]">
            <span className="text-sm sm:text-lg font-bold text-gray-100">{progress}%</span>
            <div className="text-xs text-gray-400 ml-2 sm:ml-0">
              {count} viaje{count !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        {pesoPromedio > 0 && (
          <div className="text-xs text-gray-500 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            ⚖️ {pesoPromedio.toFixed(1)} kg prom
          </div>
        )}
      </div>
    </div>

    {/* Vista Mobile - Layout de tarjeta compacta */}
    <div className="sm:hidden">
      <div className="flex items-start gap-3 mb-2.5">
        {image ? (
          <img 
            src={image}
            alt={name}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-md ring-2 ring-gray-700/50"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzM3NDE1MSIvPgo8cGF0aCBkPSJNMjQgMTZDMjAgMTYgMTYgMjAgMTYgMjRDMTYgMjggMjAgMzIgMjQgMzJDMjggMzIgMzIgMjggMzIgMjRDMzIgMjAgMjggMTYgMjQgMTYiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+';
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gray-700/50 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-gray-700/50">
            <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <h4 className="text-sm font-semibold text-gray-100 truncate flex-1">{name}</h4>
            {riskLevel && riskLevel !== 'normal' && (
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${getRiskBadgeClass(riskLevel)}`}>
                {getRiskLabel(riskLevel)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-400">{count} viaje{count !== 1 ? 's' : ''}</span>
            <span className="text-sm font-bold text-gray-100">{progress}%</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 items-center">
        <div className="flex-1 bg-gray-700/50 rounded-full h-2 shadow-inner">
          <div
            className={`h-2 rounded-full ${gradientClass} transition-all duration-500 ease-out shadow-sm`}
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
        {pesoPromedio > 0 && (
          <span className="text-xs text-gray-500 flex-shrink-0">⚖️ {pesoPromedio.toFixed(0)} kg</span>
        )}
      </div>
    </div>
  </div>
);

// 🏷️ FUNCIONES AUXILIARES PARA BADGES DE RIESGO (con mejor contraste)
const getRiskBadgeClass = (risk) => {
  const classes = {
    'fragil': 'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30',
    'peligroso': 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30',
    'perecedero': 'bg-green-500/20 text-green-300 ring-1 ring-green-500/30',
    'refrigerado': 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30',
    'congelado': 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30',
    'inflamable': 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/30',
    'toxico': 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30',
    'corrosivo': 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30',
    'especial': 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30',
  };
  return classes[risk] || 'bg-gray-500/20 text-gray-300 ring-1 ring-gray-500/30';
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
    'materiales_construccion': 'bg-gradient-to-r from-gray-400 via-slate-500 to-gray-600',
    'construccion': 'bg-gradient-to-r from-gray-400 via-slate-500 to-gray-600',
    'construcción': 'bg-gradient-to-r from-gray-400 via-slate-500 to-gray-600',
    'textiles': 'bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500',
    
    // Especializados
    'medicamentos': 'bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500',
    'maquinaria': 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500',
    'vehiculos': 'bg-gradient-to-r from-slate-400 via-gray-500 to-zinc-500',
    'vehículos': 'bg-gradient-to-r from-slate-400 via-gray-500 to-zinc-500',
    
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
    'metales': 'bg-gradient-to-r from-slate-400 via-zinc-500 to-stone-500',
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
      
      // 🔧 RUTA CORRECTA: carga-distribution
      const res = await fetch(`${API_URL}/viajes/carga-distribution`, { credentials: 'include' });
      
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

      // 📊 Procesar datos del backend
      const distribucionArray = json.data;
      setTotalTrips(json.estadisticas?.totalViajes || distribucionArray.reduce((sum, item) => sum + (item.count || 0), 0));

      const mapped = distribucionArray.map((item, index) => {
        // 🏷️ Obtener categoría del backend (usa múltiples campos por compatibilidad)
        const categoria = normalizeCategory(
          item.categoria || 
          item.name || 
          item.tipo || 
          item._id || 
          'sin categoría'
        );
        
        const count = item.count || 0;
        const porcentaje = Math.round(item.porcentaje || item.percentage || 0);
        
        // 📝 Nombre para mostrar
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
      
      // 📈 Ordenar por porcentaje descendente
      const sortedMapped = mapped.sort((a, b) => b.progress - a.progress);
      
      setCategories(sortedMapped);
      console.log('🎯 Categorías procesadas:', sortedMapped);
      
    } catch (error) {
      console.error('❌ Error al cargar distribución de cargas:', error);
      setError(error.message);
      
      // 🎯 Datos de ejemplo en caso de error
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
          ejemplos: ['Ropa y telas']
        }
      ];
      
      setCategories(datosEjemplo);
      setTotalTrips(datosEjemplo.reduce((sum, item) => sum + item.count, 0));
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-gray-700/50 shadow-xl h-full flex flex-col overflow-hidden">
      {/* 📊 Header con información - Fixed */}
      <div className="mb-4 flex justify-between items-center flex-shrink-0">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 flex items-center gap-2">
            📦 Distribución de Cargas
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {totalTrips > 0 ? `${totalTrips} viajes totales` : 'Por categoría'}
            {error && <span className="text-red-400 ml-2">⚠️ Usando datos de ejemplo</span>}
          </p>
        </div>
        
        {/* 🔄 Botón de recarga */}
        <button
          onClick={fetchDistribution}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-200 disabled:opacity-50 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
          title="Actualizar datos"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* 📊 Contenido principal con scroll - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/50 pr-2">
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
              <span className="text-sm text-gray-400">Cargando distribución...</span>
            </div>
          ) : error && categories.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/40 rounded-lg border border-gray-700/50">
              <div className="text-red-400 text-3xl mb-3">❌</div>
              <p className="text-sm text-gray-300 mb-1 font-medium">Error al cargar</p>
              <p className="text-xs text-gray-500 mb-4 px-4">{error}</p>
              <button 
                onClick={fetchDistribution} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
              >
                🔄 Reintentar
              </button>
            </div>
          ) : categories.length > 0 ? (
            <>
              {categories.map((category, index) => (
                <CategoryItem key={`${category.rawType}-${index}`} {...category} />
              ))}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-800/40 rounded-lg border border-gray-700/50">
              <div className="text-gray-500 text-4xl mb-3">📦</div>
              <p className="text-sm text-gray-300 mb-1 font-medium">No hay datos disponibles</p>
              <p className="text-xs text-gray-500 mb-4 px-4">
                Verifica que tengas viajes creados en tu base de datos
              </p>
              <button 
                onClick={fetchDistribution} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
              >
                📊 Cargar datos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 📊 Resumen de estadísticas - Fixed at bottom */}
      {categories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700/50 flex-shrink-0 bg-gray-800/30 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-700/30 rounded-lg p-2">
              <div className="text-gray-400 mb-0.5">Categorías</div>
              <div className="text-gray-100 font-bold text-base">{categories.length}</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-2">
              <div className="text-gray-400 mb-0.5">Peso total</div>
              <div className="text-gray-100 font-bold text-base">
                {categories.reduce((sum, cat) => sum + (cat.pesoTotal || 0), 0).toFixed(1)} kg
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700/30">
            <span className="text-xs text-gray-400">
              Más común: <span className="text-gray-300 font-medium">{categories[0]?.name || 'N/A'}</span>
            </span>
            <span className="text-xs font-bold text-gray-300">
              {categories[0]?.progress || 0}%
            </span>
          </div>
        </div>
      )}
      
      {/* 📈 Información adicional en modo error con datos de ejemplo */}
      {error && categories.length > 0 && (
        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex-shrink-0">
          <p className="text-xs text-amber-300 flex items-start gap-2">
            <span>⚠️</span>
            <span>Mostrando datos de ejemplo. Error: {error}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default FunctionalGroups;