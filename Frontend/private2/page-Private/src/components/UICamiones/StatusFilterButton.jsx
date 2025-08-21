import React from 'react';

const StatusFilterButton = ({ 
  status, 
  label, 
  count, 
  activeFilter, 
  onClick,
  primaryColor = '#5F8EAD' 
}) => {
  const isActive = activeFilter === status;

  return (
    <button
      onClick={() => onClick(status)}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'text-white shadow-lg'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
      style={{
        backgroundColor: isActive ? primaryColor : undefined
      }}
    >
      {label} {count > 0 && <span className="ml-1">({count})</span>}
    </button>
  );
};

export default StatusFilterButton;