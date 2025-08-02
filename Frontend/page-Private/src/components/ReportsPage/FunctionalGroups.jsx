import React, { useEffect, useState } from 'react';

// Componente individual mejorado
const CategoryItem = ({ image, name, progress, gradientClass, count, riskLevel }) => (
  <div className="flex items-center space-x-3 mb-4 last:mb-0">
    {image ? (
      <img 
        src={image}
        alt={name}
        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        onError={(e) => {
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJNMjQgMTZDMjAgMTYgMTYgMjAgMTYgMjRDMTYgMjggMjAgMzIgMjQgMzJDMjggMzIgMzIgMjggMzIgMjRDMzIgMjAgMjggMTYgMjQgMTYiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
        }}
      />
    ) : (
      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-base font-semibold text-gray-900 truncate">{name}</h4>
        {riskLevel && riskLevel !== 'normal' && (
          <span className={`text-xs px-2 py-1 rounded-full ${getRiskBadgeClass(riskLevel)}`}>
            {getRiskLabel(riskLevel)}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${gradientClass} transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-lg font-bold text-gray-900">{progress}%</span>
          <div className="text-xs text-gray-500">
            {count} viaje{count !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// 🏷️ FUNCIONES AUXILIARES PARA BADGES DE RIESGO
const getRiskBadgeClass = (risk) => {
  const classes = {
    'fragil': 'bg-yellow-100 text-yellow-800',
    'peligroso': 'bg-red-100 text-red-800',
    'perecedero': 'bg-green-100 text-green-800',
    'refrigerado': 'bg-blue-100 text-blue-800',
    'congelado': 'bg-cyan-100 text-cyan-800',
    'inflamable': 'bg-orange-100 text-orange-800',
    'toxico': 'bg-purple-100 text-purple-800',
    'corrosivo': 'bg-red-100 text-red-800',
  };
  return classes[risk] || 'bg-gray-100 text-gray-800';
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
  };
  return labels[risk] || '📦';
};

// 📦 MAPEO DE IMÁGENES PARA NUEVAS CATEGORÍAS
const categoryImages = {
  // Alimentos
  'alimentos_perecederos': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&crop=center',
  'alimentos_no_perecederos': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop&crop=center',
  'bebidas': 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=100&h=100&fit=crop&crop=center',
  
  // Materiales
  'materiales_construccion': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&h=100&fit=crop&crop=center',
  'textiles': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=100&h=100&fit=crop&crop=center',
  'electronicos': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop&crop=center',
  
  // Especializados
  'medicamentos': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop&crop=center',
  'maquinaria': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=center',
  'vehiculos': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=100&h=100&fit=crop&crop=center',
  
  // Químicos y combustibles
  'quimicos': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=100&h=100&fit=crop&crop=center',
  'combustibles': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=100&h=100&fit=crop&crop=center',
  
  // Otros materiales
  'papel_carton': 'https://images.unsplash.com/photo-1586264811115-ed21e0b3e1a1?w=100&h=100&fit=crop&crop=center',
  'muebles': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop&crop=center',
  'productos_agricolas': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=100&h=100&fit=crop&crop=center',
  'metales': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=100&fit=crop&crop=center',
  'plasticos': 'https://images.unsplash.com/photo-1552865246-ddfa2bc3b709?w=100&h=100&fit=crop&crop=center',
  'vidrio_ceramica': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center',
  'productos_limpieza': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=100&h=100&fit=crop&crop=center',
  'cosmeticos': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop&crop=center',
  'juguetes': 'https://images.unsplash.com/photo-1558060370-d140361fb27d?w=100&h=100&fit=crop&crop=center',
  
  // Fallbacks para categorías antiguas
  'general': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=100&h=100&fit=crop&crop=center',
  'fragil': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=100&fit=crop&crop=center',
  'peligrosa': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center',
  'refrigerada': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&crop=center',
  'liquida': 'https://images.unsplash.com/photo-1582560469781-1965b9af903d?w=100&h=100&fit=crop&crop=center',
  'otros': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=100&h=100&fit=crop&crop=center'
};

// 🏷️ NOMBRES DISPLAY AMIGABLES
const categoryDisplayNames = {
  // Nuevas categorías
  'alimentos_perecederos': 'Alimentos Perecederos',
  'alimentos_no_perecederos': 'Alimentos No Perecederos',
  'bebidas': 'Bebidas',
  'materiales_construccion': 'Materiales de Construcción',
  'textiles': 'Textiles y Confecciones',
  'electronicos': 'Electrónicos',
  'medicamentos': 'Medicamentos',
  'maquinaria': 'Maquinaria y Equipos',
  'vehiculos': 'Vehículos y Repuestos',
  'quimicos': 'Productos Químicos',
  'combustibles': 'Combustibles',
  'papel_carton': 'Papel y Cartón',
  'muebles': 'Muebles y Decoración',
  'productos_agricolas': 'Productos Agrícolas',
  'metales': 'Metales',
  'plasticos': 'Plásticos',
  'vidrio_ceramica': 'Vidrio y Cerámica',
  'productos_limpieza': 'Productos de Limpieza',
  'cosmeticos': 'Cosméticos',
  'juguetes': 'Juguetes y Deportes',
  'otros': 'Otros',
  
  // Categorías antiguas (por compatibilidad)
  'general': 'Carga General',
  'fragil': 'Carga Frágil',
  'peligrosa': 'Carga Peligrosa',
  'refrigerada': 'Refrigerada',
  'liquida': 'Líquidos',
};

// 🌈 GRADIENTES TEMÁTICOS POR CATEGORÍA
const getGradientForCategory = (category) => {
  const gradients = {
    // Alimentos - verdes
    'alimentos_perecederos': 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-500',
    'alimentos_no_perecederos': 'bg-gradient-to-r from-emerald-400 via-green-500 to-green-600',
    'bebidas': 'bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-500',
    
    // Materiales - grises/azules
    'materiales_construccion': 'bg-gradient-to-r from-gray-500 via-slate-600 to-gray-700',
    'textiles': 'bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500',
    'electronicos': 'bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-500',
    
    // Especializados
    'medicamentos': 'bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500',
    'maquinaria': 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500',
    'vehiculos': 'bg-gradient-to-r from-slate-400 via-gray-500 to-zinc-600',
    
    // Peligrosos - rojos/naranjas
    'quimicos': 'bg-gradient-to-r from-red-400 via-red-500 to-red-600',
    'combustibles': 'bg-gradient-to-r from-orange-400 via-red-500 to-red-600',
    
    // Otros
    'papel_carton': 'bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500',
    'muebles': 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500',
    'productos_agricolas': 'bg-gradient-to-r from-lime-400 via-green-500 to-emerald-500',
    'metales': 'bg-gradient-to-r from-slate-400 via-zinc-500 to-stone-600',
    'plasticos': 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500',
    'vidrio_ceramica': 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500',
    'productos_limpieza': 'bg-gradient-to-r from-teal-400 via-emerald-500 to-green-500',
    'cosmeticos': 'bg-gradient-to-r from-pink-400 via-rose-500 to-red-500',
    'juguetes': 'bg-gradient-to-r from-violet-400 via-purple-500 to-pink-500',
    
    // Fallbacks
    'general': 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600',
    'otros': 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600'
  };
  return gradients[category] || gradients.general;
};

const FunctionalGroups = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalTrips, setTotalTrips] = useState(0);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch('http://localhost:4000/api/viajes/cargas/distribucion');
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();

        if (json.success && json.data) {
          let distribucionArray;
          
          if (json.data.distribucion && Array.isArray(json.data.distribucion)) {
            distribucionArray = json.data.distribucion;
            setTotalTrips(json.data.total || 0);
          } else if (Array.isArray(json.data)) {
            distribucionArray = json.data;
          } else {
            setError('Formato de datos no válido');
            return;
          }

          const mapped = distribucionArray.map((item, index) => {
            const categoria = item.tipo || item.categoria || item._id || 'otros';
            const porcentaje = Math.round(item.porcentaje || 0);
            const count = item.count || 0;
            
            return {
              name: categoryDisplayNames[categoria] || categoria.charAt(0).toUpperCase() + categoria.slice(1),
              progress: porcentaje,
              count: count,
              image: categoryImages[categoria] || null,
              gradientClass: getGradientForCategory(categoria),
              rawType: categoria,
              riskLevel: item.clasificacionRiesgo || null
            };
          });
          
          setCategories(mapped);
        } else {
          setError('No se encontraron datos válidos');
        }
      } catch (error) {
        console.error('Error al cargar distribución de cargas:', error);
        setError(error.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDistribution();
  }, []);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 h-full overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Distribución de Cargas</h3>
        <p className="text-sm text-gray-500">
          {totalTrips > 0 ? `${totalTrips} viajes totales` : 'Por categoría'}
        </p>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-500">Cargando datos...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">❌ Error</div>
            <p className="text-sm text-gray-500">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Reintentar
            </button>
          </div>
        ) : categories.length > 0 ? (
          categories.map((category, index) => (
            <CategoryItem key={`${category.rawType}-${index}`} {...category} />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">📦</div>
            <p className="text-sm text-gray-500">No hay datos de cargas disponibles</p>
            <p className="text-xs text-gray-400 mt-1">
              Verifica que tengas viajes creados en tu base de datos
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FunctionalGroups;