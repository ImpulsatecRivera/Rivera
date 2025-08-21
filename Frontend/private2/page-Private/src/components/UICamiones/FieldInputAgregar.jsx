import React from 'react';
import { ChevronDown } from 'lucide-react';

const FormFieldInput = ({
  id,
  label,
  icon: Icon,
  type = 'text',
  placeholder,
  error,
  required = false,
  options = null, // Para select
  className = '',
  focusColor = '#5D9646',
  iconColor = '#5D9646',
  labelColor = '#34353A',
  disabled = false,
  // ✅ Extraer props de react-hook-form
  name,
  onChange,
  onBlur: rhfOnBlur,
  ref,
  ...props
}) => {
  const baseClasses = `w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
    error
      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
      : 'border-gray-300 bg-white hover:border-gray-400'
  } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''} ${className}`;

  const handleFocus = (e) => {
    if (!error && !disabled) {
      e.target.style.borderColor = focusColor;
      e.target.style.boxShadow = `0 0 0 4px ${focusColor}40`;
    }
  };

  const handleBlur = (e) => {
    // Llamar primero al onBlur de react-hook-form
    if (rhfOnBlur) {
      rhfOnBlur(e);
    }
    
    if (!error && !disabled) {
      e.target.style.borderColor = '#d1d5db';
      e.target.style.boxShadow = 'none';
    }
  };

  // ✅ Props comunes para todos los inputs
  const commonProps = {
    id,
    name,
    onChange,
    onBlur: handleBlur,
    onFocus: handleFocus,
    disabled,
    ref,
    ...props
  };

  const renderInput = () => {
    if (type === 'select' && options) {
      return (
        <div className="relative">
          <select
            {...commonProps}
            className={`${baseClasses} appearance-none`}
          >
            <option value="">{placeholder || 'Seleccionar...'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          placeholder={placeholder}
          className={`${baseClasses} resize-none`}
        />
      );
    }

    return (
      <input
        {...commonProps}
        type={type}
        placeholder={placeholder}
        className={baseClasses}
      />
    );
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center space-x-2 text-sm font-semibold" style={{ color: labelColor }}>
        {Icon && <Icon className="w-4 h-4" style={{ color: iconColor }} />}
        <span>{label} {required && '*'}</span>
      </label>
      {renderInput()}
      {error && (
        <p className="text-red-500 text-xs flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error.message || 'Este campo es obligatorio'}</span>
        </p>
      )}
    </div>
  );
};

export default FormFieldInput;