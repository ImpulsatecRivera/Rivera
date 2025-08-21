import React from 'react';

const FormInput = ({ 
  id, 
  name, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  icon: Icon, 
  label, 
  required = false, 
  error, 
  maxLength,
  readOnly = false,
  badge,
  onFocus,
  onBlur
}) => {
  const baseClasses = `w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4`;
  
  const getInputClasses = () => {
    if (readOnly) {
      return `${baseClasses} border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed`;
    }
    
    if (error) {
      return `${baseClasses} border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20`;
    }
    
    return `${baseClasses} border-gray-300 bg-white hover:border-gray-400`;
  };

  const handleFocus = (e) => {
    if (!error && !readOnly) {
      e.target.style.borderColor = '#5D9646';
      e.target.style.boxShadow = '0 0 0 4px #5D964640';
    }
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    if (!error && !readOnly) {
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
        {badge && (
          <span className="text-xs text-white px-2 py-1 rounded-full" style={{ backgroundColor: '#5F8EAD' }}>
            {badge}
          </span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        readOnly={readOnly}
        className={getInputClasses()}
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

export default FormInput;