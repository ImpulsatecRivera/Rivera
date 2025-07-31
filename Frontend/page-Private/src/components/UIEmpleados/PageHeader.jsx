import React from 'react';
import { ArrowLeft } from 'lucide-react';

const PageHeader = ({ onBack, title, subtitle }) => {
  return (
    <div className="backdrop-blur-md border-b" style={{ backgroundColor: '#34353A', borderColor: '#5F8EAD60' }}>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-3 text-white hover:text-gray-200 transition-all duration-300 group"
        >
          <div className="p-2 rounded-full transition-all duration-300" style={{ backgroundColor: '#5F8EAD60' }}>
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-sm font-medium hidden sm:inline">{title}</span>
          <span className="text-sm font-medium sm:hidden">Volver</span>
        </button>
      </div>
    </div>
  );
};

export default PageHeader;