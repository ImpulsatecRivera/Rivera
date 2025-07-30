import React, { useEffect, useState } from 'react';

// Componente individual
const CategoryItem = ({ image, name, progress, gradientClass }) => (
  <div className="flex items-center space-x-3 mb-4 last:mb-0">
    <img 
      src={image}
      alt={name}
      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
      onError={(e) => {
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJNMjQgMTZDMjAgMTYgMTYgMjAgMTYgMjRDMTYgMjggMjAgMzIgMjQgMzJDMjggMzIgMzIgMjggMzIgMjRDMzIgMjAgMjggMTYgMjQgMTYiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
      }}
    />
    <div className="flex-1 min-w-0">
      <h4 className="text-base font-semibold text-gray-900 mb-2 truncate">{name}</h4>
      <div className="flex items-center space-x-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${gradientClass} transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-lg font-bold text-gray-900">{progress}%</span>
          <span className="text-sm text-gray-500 ml-1">Viajes</span>
        </div>
      </div>
    </div>
  </div>
);

// Lista de imágenes opcionales para tipos conocidos
const categoryImages = {
  'Alimentos perecederos': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&crop=center',
  'Medicamentos': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop&crop=center',
  'Equipos electrónicos': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop&crop=center',
};

const gradientOptions = [
  'bg-gradient-to-r from-orange-400 via-pink-500 to-pink-300',
  'bg-gradient-to-r from-orange-400 via-red-500 to-pink-300',
  'bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-300',
  'bg-gradient-to-r from-violet-500 via-pink-400 to-red-400',
];

const FunctionalGroups = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/viajes/cargas/distribucion');
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((item, index) => ({
            name: item.name,
            progress: item.percentage,
            image: categoryImages[item.name] || '', // usa imagen por defecto si no hay
            gradientClass: gradientOptions[index % gradientOptions.length],
          }));
          setCategories(mapped);
        }
      } catch (error) {
        console.error('Error al cargar distribución de cargas:', error);
      }
    };

    fetchDistribution();
  }, []);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 h-full overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Grupos Funcionales</h3>
        <p className="text-sm text-gray-500">Distribución por categoría</p>
      </div>

      <div className="space-y-4 overflow-y-auto flex-1">
        {categories.length > 0 ? (
          categories.map((category, index) => (
            <CategoryItem key={index} {...category} />
          ))
        ) : (
          <p className="text-sm text-gray-500">Cargando datos...</p>
        )}
      </div>
    </div>
  );
};

export default FunctionalGroups;
