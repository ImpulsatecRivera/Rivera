import React from 'react';

const FormContainer = ({ children, onSubmit, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 xl:p-12 ${className}`}>
      <form onSubmit={onSubmit} className="space-y-6 sm:space-y-8">
        {children}
      </form>
    </div>
  );
};

export default FormContainer;