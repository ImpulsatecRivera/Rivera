import React from 'react';

const PantallaCarga = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-8">
        {/* Contenedor principal del loading */}
        <div className="relative">
          {/* Círculo de fondo sutil */}
          <div className="absolute inset-0 w-32 h-32 rounded-full blur-xl opacity-30 animate-pulse"
               style={{ background: 'linear-gradient(135deg, #5D9646, #5F8EAD)' }}>
          </div>
          
          {/* Puntos suspensivos */}
          <div className="relative flex items-center justify-center space-x-2 p-8">
            <div className="w-4 h-4 rounded-full animate-bounce shadow-lg"
                 style={{ 
                   background: 'linear-gradient(135deg, #5D9646, #5F8EAD)',
                   animationDelay: '0ms', 
                   animationDuration: '1.4s' 
                 }}>
            </div>
            <div className="w-4 h-4 rounded-full animate-bounce shadow-lg"
                 style={{ 
                   background: 'linear-gradient(135deg, #5D9646, #5F8EAD)',
                   animationDelay: '160ms', 
                   animationDuration: '1.4s' 
                 }}>
            </div>
            <div className="w-4 h-4 rounded-full animate-bounce shadow-lg"
                 style={{ 
                   background: 'linear-gradient(135deg, #5D9646, #5F8EAD)',
                   animationDelay: '320ms', 
                   animationDuration: '1.4s' 
                 }}>
            </div>
          </div>
        </div>
        
        {/* Texto de carga opcional */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-700 animate-pulse">
            Cargando
          </h2>
          <p className="text-sm text-gray-500 max-w-xs text-center">
            Por favor espera un momento...
          </p>
        </div>
        
        {/* Barra de progreso animada opcional */}
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full animate-pulse"
               style={{
                 background: 'linear-gradient(90deg, #5D9646, #5F8EAD)',
                 width: '60%',
                 animation: 'loading-bar 2s ease-in-out infinite alternate'
               }}>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 20%; }
          50% { width: 80%; }
          100% { width: 60%; }
        }
      `}</style>
    </div>
  );
};

export default PantallaCarga;