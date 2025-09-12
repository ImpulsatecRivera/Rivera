import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
// Importa tu animación JSON
import carAnimation from '../../assets/lotties/Delivery Truck _ Ignite Animation.json';

const PantallaCarga = ({ onLoadingComplete }) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Iniciando...');

  // SOLO UN MÉTODO: Timer fijo basado en la duración real de la animación
  useEffect(() => {
    console.log('🚀 PantallaCarga iniciada');
    setDebugInfo('Cargando animación...');
    
    // Timer para 4 segundos (duración real de tu animación + pequeño margen)
    const timer = setTimeout(() => {
      console.log('⏰ 4.2 segundos completados - cerrando pantalla');
      setDebugInfo('Animación completada - cerrando...');
      setShowContent(true);
      
      if (onLoadingComplete) {
        console.log('📞 Llamando onLoadingComplete');
        onLoadingComplete();
      }
    }, 4200); // 4.2 segundos para asegurar que la animación termine

    return () => {
      console.log('🧹 Limpiando timer');
      clearTimeout(timer);
    };
  }, [onLoadingComplete]);

  // Solo para debugging - NO controla el tiempo
  const handleAnimationComplete = () => {
    console.log('🎬 onComplete ejecutado (solo para debug)');
    setAnimationComplete(true);
    setDebugInfo('Animación onComplete disparado');
  };

  // Debugging adicional
  const handleAnimationData = () => {
    console.log('📁 Datos de animación cargados');
    setDebugInfo('Datos de animación listos');
  };

  const handleAnimationError = (error) => {
    console.error('❌ Error en animación:', error);
    setDebugInfo('Error al cargar animación');
  };

  // Si ya debe mostrar contenido, no renderizar la pantalla de carga
  if (showContent) {
    console.log('✅ showContent es true - no renderizando pantalla');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6 z-50">
      <div className="w-full h-full bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-2xl flex items-center justify-center relative overflow-hidden">
        {/* Efecto de brillo de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/30 to-transparent animate-pulse"></div>
        
        <div className="relative z-10 text-center space-y-8">
          {/* Logo/Icono principal con efectos mejorados */}
          <div className="relative flex justify-center">
            {/* Círculo de fondo animado */}
            <div className="absolute inset-0 w-40 h-40 mx-auto rounded-full blur-2xl opacity-40 animate-pulse"
                 style={{ 
                   background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                   animation: 'pulse-glow 4s ease-in-out infinite alternate'
                 }}>
            </div>
            
            {/* Animación Lottie del carro */}
            <div className="relative w-36 h-36">
              <Lottie 
                animationData={carAnimation}
                loop={false} // UN SOLO CICLO
                autoplay={true}
                className="w-full h-full"
                onComplete={handleAnimationComplete}
                onDataReady={handleAnimationData}
                onLoadedImages={handleAnimationData}
                onError={handleAnimationError}
                speed={1} // Velocidad normal
              />
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
                {animationComplete 
                  ? "Finalizando carga..." 
                  : "Conectando con base de datos y verificando credenciales"
                }
              </p>
              {/* Info de debugging */}
              <p className="text-xs text-red-500 font-mono">
                DEBUG: {debugInfo}
              </p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-64 mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all ease-linear"
                style={{
                  width: '0%',
                  animation: 'loading-progress 4.2s ease-out forwards'
                }}
              >
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Esperando 4.2 segundos para animación completa
            </p>
          </div>

          {/* Puntos de carga animados */}
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

        {/* Animaciones CSS */}
        <style jsx>{`
          @keyframes loading-progress {
            0% { width: 0%; }
            25% { width: 30%; }
            50% { width: 60%; }
            75% { width: 85%; }
            100% { width: 100%; }
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