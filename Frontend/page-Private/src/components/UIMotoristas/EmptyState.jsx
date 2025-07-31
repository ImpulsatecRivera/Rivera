import React from 'react';
import { User } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = User,
  title,
  description,
  searchTerm,
  actionButton,
  onAction
}) => {
  const defaultTitle = searchTerm 
    ? 'No se encontraron resultados para tu búsqueda.' 
    : 'No hay elementos registrados.';
    
  const defaultDescription = searchTerm 
    ? 'Intenta ajustar los filtros de búsqueda.' 
    : 'Comienza agregando tu primer elemento.';

  return (
    <div className="text-center py-12">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
        <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">
          {title || defaultTitle}
        </p>
        <p className="text-gray-400 text-sm mb-4">
          {description || defaultDescription}
        </p>
        {!searchTerm && actionButton && onAction && (
          <button
            onClick={onAction}
            className="px-6 py-3 text-white rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg shadow-md font-medium"
            style={{background: 'linear-gradient(135deg, #5D9646 0%, #4a7a37 100%)'}}
          >
            {actionButton}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;