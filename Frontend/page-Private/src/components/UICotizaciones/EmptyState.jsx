// components/EmptyState.jsx
import React from 'react';
import { Search } from 'lucide-react';

const EmptyState = ({ 
  title = "No se encontraron cotizaciones", 
  message = "Intenta con otros términos de búsqueda o filtros",
  icon: IconComponent = Search
}) => {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <IconComponent size={32} className="text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-600 mb-2">{title}</h3>
      <p className="text-slate-500">{message}</p>
    </div>
  );
};

export default EmptyState;