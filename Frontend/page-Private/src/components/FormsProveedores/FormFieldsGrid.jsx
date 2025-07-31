// FormFieldsGrid.jsx
import React from 'react';

const FormFieldsGrid = ({ children, columns = "2", className = "" }) => {
  const gridCols = {
    "1": "grid-cols-1",
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6 ${className}`}>
      {children}
    </div>
  );
};

export default FormFieldsGrid;