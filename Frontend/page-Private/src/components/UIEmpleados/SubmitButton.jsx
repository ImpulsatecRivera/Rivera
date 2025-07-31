import React from 'react';

const SubmitButton = ({ 
  loading, 
  onClick, 
  icon: Icon, 
  text, 
  loadingText = "Procesando...",
  disabled = false
}) => {
  return (
    <div className="flex justify-center pt-6 sm:pt-8">
      <button
        onClick={onClick}
        type="submit"
        className="text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3"
        style={{ backgroundColor: '#5D9646' }}
        onMouseEnter={(e) => {
          if (!loading && !disabled) e.target.style.backgroundColor = '#4a7a37';
        }}
        onMouseLeave={(e) => {
          if (!loading && !disabled) e.target.style.backgroundColor = '#5D9646';
        }}
        disabled={loading || disabled}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            {Icon && <Icon className="w-5 h-5" />}
            <span>{text}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default SubmitButton;