// components/PageHeader.jsx
import React from 'react';

const PageHeader = ({ 
  title = "Gestión de cotizaciones", 
  subtitle = "Administra y supervisa todas las cotizaciones de transporte" 
}) => {
  return (
    <div className="mb-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        <p className="text-slate-600 text-lg">{subtitle}</p>
      </div>
    </div>
  );
};

export default PageHeader;