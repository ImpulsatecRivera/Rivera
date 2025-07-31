import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionButton, 
  hasFilters = false 
}) => {
  return (
    <div className="text-center py-20">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
        <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {title}
        </h3>
        <p className="text-gray-500 mb-4">
          {description}
        </p>
        {!hasFilters && actionButton}
      </div>
    </div>
  );
};

export default EmptyState;