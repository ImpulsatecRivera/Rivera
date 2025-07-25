import React from 'react';
import { Truck } from 'lucide-react';

const PantallaCarga = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
      <div className="w-full h-full bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-2xl flex items-center justify-center relative overflow-hidden">
        {/* Efecto de brillo de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/30 to-transparent animate-pulse"></div>
        
        <div className="relative z-10 text-center space-y-8">
          {/* Logo/Icono principal con efectos mejorados */}
          <div className="relative flex justify-center">
            {/* Círculo de fondo animado */}
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full blur-2xl opacity-40 animate-pulse"
                 style={{ 
                   background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                   animation: 'pulse-glow 2s ease-in-out infinite alternate'
                 }}>
            </div>
            
            {/* Icono del camión */}
            <div className="relative">
              <Truck className="w-20 h-20 text-blue-600 animate-bounce" 
                     style={{ animationDuration: '2s' }} />
            </div>
          </div>

          {/* Texto principal mejorado */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sistema Rivera
            </h1>
            <div className="space-y-2">
              <p className="text-xl text-gray-700 font-medium animate-pulse">
                Cargando...
              </p>
              <p className="text-sm text-gray-500">
                Conectando con base de datos y verificando credenciales
              </p>
            </div>
          </div>

          {/* Barra de progreso mejorada */}
          

          {/* Puntos de carga animados mejorados */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg"
                 style={{ 
                   animation: 'bounce-delay 1.4s ease-in-out infinite',
                   animationDelay: '0ms'
                 }}>
            </div>
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg"
                 style={{ 
                   animation: 'bounce-delay 1.4s ease-in-out infinite',
                   animationDelay: '200ms'
                 }}>
            </div>
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg"
                 style={{ 
                   animation: 'bounce-delay 1.4s ease-in-out infinite',
                   animationDelay: '400ms'
                 }}>
            </div>
          </div>

          {/* Mensaje de estado adicional */}
          <div className="text-xs text-gray-400 animate-pulse">
            Por favor espera un momento mientras preparamos todo para ti
          </div>
        </div>

        {/* Animaciones CSS mejoradas */}
        <style jsx>{`
          @keyframes loading-progress {
            0% { 
              width: 0%; 
              opacity: 0.8;
            }
            25% { 
              width: 30%; 
              opacity: 1;
            }
            50% { 
              width: 60%; 
              opacity: 1;
            }
            75% { 
              width: 85%; 
              opacity: 0.9;
            }
            100% { 
              width: 100%; 
              opacity: 0.7;
            }
          }

          @keyframes bounce-delay {
            0%, 80%, 100% {
              transform: scale(0.8) translateY(0);
              opacity: 0.7;
            }
            40% {
              transform: scale(1.1) translateY(-8px);
              opacity: 1;
            }
          }

          @keyframes pulse-glow {
            0% {
              transform: scale(0.95);
              opacity: 0.3;
            }
            100% {
              transform: scale(1.05);
              opacity: 0.6;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PantallaCarga;