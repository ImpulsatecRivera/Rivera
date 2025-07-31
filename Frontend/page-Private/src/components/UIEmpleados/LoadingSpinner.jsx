import React from 'react';
import { Briefcase } from 'lucide-react';

const LoadingSpinner = ({ message = "Cargando..." }) => {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor: '#5F8EAD'}}></div>
      <p className="text-gray-500 mt-4">{message}</p>
    </div>
  );
};

export const EmptyState = ({ 
  icon: Icon = Briefcase, 
  title = "No se encontraron resultados", 
  description = "Intenta ajustar los filtros de búsqueda.",
  action 
}) => {
  return (
    <div className="text-center py-12">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
        <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">{title}</p>
        <p className="text-gray-400 text-sm">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
};

export default LoadingSpinner;