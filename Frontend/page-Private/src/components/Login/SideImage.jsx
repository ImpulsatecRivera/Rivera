import { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web';
// Importa tu archivo JSON directamente
import carLoadingAnimation from '../../assets/lotties/Car loading.json';

const SideImage = () => {
  const animationContainer = useRef(null);
  const animationInstance = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Cargar y reproducir la animación Lottie
    if (animationContainer.current) {
      animationInstance.current = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: carLoadingAnimation,
      });

      // Configuraciones adicionales para hacerlo más épico
      animationInstance.current.setSpeed(0.7); // Velocidad más cinematográfica y suave
      
      // Marcar como cargado cuando esté listo
      animationInstance.current.addEventListener('complete', () => {
        setIsLoaded(true);
      });

      // También marcar como cargado inmediatamente para loops infinitos
      setTimeout(() => setIsLoaded(true), 1000);
    }

    // Cleanup
    return () => {
      if (animationInstance.current) {
        animationInstance.current.destroy();
      }
    };
  }, []);

  // Función para reiniciar la animación al hacer hover
  const handleMouseEnter = () => {
    if (animationInstance.current) {
      animationInstance.current.setSpeed(1); // Acelerar en hover
    }
  };

  const handleMouseLeave = () => {
    if (animationInstance.current) {
      animationInstance.current.setSpeed(0.7); // Volver a velocidad normal
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px] lg:min-h-screen">
      {/* 🌟 Container principal ÉPICO - Sin óvalo, área completa */}
      <div 
        className="relative w-full h-full overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at top right, #1e3a8a 0%, #1e40af 30%, #3730a3 60%, #1e1b4b 100%),
            linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
          `
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        
        {/* 🎬 Overlay dinámico para profundidad */}
        <div 
          className="absolute inset-0 z-10 transition-opacity duration-1000"
          style={{
            background: `
              radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.1) 70%),
              radial-gradient(circle at top left, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at bottom right, rgba(147, 51, 234, 0.05) 0%, transparent 50%)
            `,
            opacity: isLoaded ? 1 : 0.5
          }}
        />

        {/* 🚛 Container de la animación Lottie - ÁREA COMPLETA */}
        <div 
          ref={animationContainer}
          className={`absolute inset-0 z-20 w-full h-full transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{
            filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.1))'
          }}
        />

        {/* ✨ Efectos de luz ambiente más dinámicos */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {/* Luz superior */}
          <div 
            className="absolute top-0 left-0 w-full h-40 opacity-20"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)'
            }}
          />
          
          {/* Luz lateral */}
          <div 
            className="absolute top-0 right-0 w-40 h-full opacity-10"
            style={{
              background: 'linear-gradient(270deg, rgba(59, 130, 246, 0.2) 0%, transparent 100%)'
            }}
          />
        </div>

        {/* 🌟 Estrellas/partículas animadas más elegantes */}
        <div className="absolute inset-0 z-15 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                opacity: Math.random() * 0.4 + 0.1,
                animationDelay: Math.random() * 5 + 's',
                animationDuration: (Math.random() * 4 + 3) + 's'
              }}
            />
          ))}
        </div>

        {/* 🌊 Ondas de fondo sutil */}
        <div className="absolute bottom-0 left-0 w-full h-32 z-5 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              background: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(255,255,255,0.1) 2px,
                  rgba(255,255,255,0.1) 4px
                )
              `
            }}
          />
        </div>

        {/* 🚀 Texto de marca más elegante */}
       

        {/* 💎 Badge de "powered by" sutil */}
        
      </div>

      {/* 🎯 Indicador de carga mejorado */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-50 transition-opacity duration-1000">
          <div className="text-white text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-blue-400 mx-auto mb-6"></div>
              <div className="animate-ping absolute top-0 left-1/2 transform -translate-x-1/2 rounded-full h-16 w-16 border-2 border-blue-300 opacity-20"></div>
            </div>
            <p className="text-lg font-medium text-blue-200 mb-2">Cargando experiencia</p>
            <p className="text-sm text-blue-300/70">Preparando tu viaje...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideImage;