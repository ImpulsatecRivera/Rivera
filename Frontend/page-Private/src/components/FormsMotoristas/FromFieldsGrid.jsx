import React from 'react';

const FormFieldsGrid = ({ children, className = "" }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ${className}`}>
      {children}
    </div>
  );
};

export default FormFieldsGrid;