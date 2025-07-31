import React from 'react';

const SubmitButton = ({ 
  isSubmitting, 
  children, 
  icon: Icon, 
  loadingText = "Procesando...", 
  backgroundColor = '#5D9646',
  hoverColor = '#4a7a37'
}) => {
  return (
    <div className="flex justify-center pt-6 sm:pt-8">
      <button
        type="submit"
        className="text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3"
        style={{ backgroundColor }}
        onMouseEnter={(e) => {
          if (!isSubmitting) e.target.style.backgroundColor = hoverColor;
        }}
        onMouseLeave={(e) => {
          if (!isSubmitting) e.target.style.backgroundColor = backgroundColor;
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            {Icon && <Icon className="w-5 h-5" />}
            <span>{children}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default SubmitButton;