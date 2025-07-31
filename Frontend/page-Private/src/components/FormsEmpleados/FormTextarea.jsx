import React from 'react';

const FormTextarea = ({ 
  id, 
  name, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon, 
  label, 
  required = false, 
  error,
  rows = 3,
  onFocus,
  onBlur
}) => {
  const baseClasses = `w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 resize-none`;
  
  const getTextareaClasses = () => {
    if (error) {
      return `${baseClasses} border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20`;
    }
    
    return `${baseClasses} border-gray-300 bg-white hover:border-gray-400`;
  };

  const handleFocus = (e) => {
    if (!error) {
      e.target.style.borderColor = '#5D9646';
      e.target.style.boxShadow = '0 0 0 4px #5D964640';
    }
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    if (!error) {
      e.target.style.borderColor = '#d1d5db';
      e.target.style.boxShadow = 'none';
    }
    if (onBlur) onBlur(e);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center space-x-2 text-sm font-semibold" style={{ color: '#34353A' }}>
        {Icon && <Icon className="w-4 h-4" style={{ color: '#5D9646' }} />}
        <span>{label} {required && '*'}</span>
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={getTextareaClasses()}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {error && (
        <p className="text-red-500 text-xs flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormTextarea;