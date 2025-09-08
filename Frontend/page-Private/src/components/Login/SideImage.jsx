import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

const SideImage = () => {
  const animationContainer = useRef(null);
  const animationInstance = useRef(null);

  useEffect(() => {
    // Cargar y reproducir la animación Lottie
    if (animationContainer.current) {
      animationInstance.current = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg', // 'svg', 'canvas' o 'html'
        loop: true,
        autoplay: true,
        path: './assets/lotties/Car loading.json', // Cambia esta ruta por la de tu archivo
        // O si tienes el JSON importado:
        // animationData: yourLottieData,
      });

      // Configuraciones adicionales para hacerlo más épico
      animationInstance.current.setSpeed(0.8); // Velocidad más cinematográfica
    }

    // Cleanup
    return () => {
      if (animationInstance.current) {
        animationInstance.current.destroy();
      }
    };
  }, []);

  // Función para reiniciar la animación al hacer hover (opcional)
  const handleMouseEnter = () => {
    if (animationInstance.current) {
      animationInstance.current.goToAndPlay(0);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px] lg:min-h-screen">
      {/* 🌟 Container principal con efectos épicos */}
      <div 
        className="relative w-full h-full rounded-2xl lg:rounded-l-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)'
        }}
        onMouseEnter={handleMouseEnter}
      >
        
        {/* 🎬 Overlay sutil para mayor profundidad */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.1) 100%)'
          }}
        />

        {/* 🚛 Container de la animación Lottie */}
        <div 
          ref={animationContainer}
          className="absolute inset-0 z-20 w-full h-full"
          style={{
            transform: 'scale(1.1)', // Ligeramente más grande para llenar mejor
            transformOrigin: 'center center'
          }}
        />

        {/* ✨ Efectos de luz/brillo opcionales */}
        <div 
          className="absolute top-0 left-0 w-full h-32 z-30 opacity-30"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)'
          }}
        />

        {/* 🌟 Partículas de fondo (opcional, puedes comentar si no las quieres) */}
        <div className="absolute inset-0 z-5">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white opacity-10 animate-pulse"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                animationDuration: (Math.random() * 3 + 2) + 's'
              }}
            />
          ))}
        </div>

        {/* 🚀 Texto sutil de marca (opcional) */}
        <div className="absolute bottom-8 left-8 z-40">
          <div className="text-white/80 text-sm font-medium">
            Tu Empresa Logística
          </div>
          <div className="text-white/60 text-xs mt-1">
            Conectando destinos
          </div>
        </div>
      </div>

      {/* 🎯 Indicador de carga mientras se carga el Lottie */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-2xl lg:rounded-l-3xl">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm opacity-80">Cargando experiencia...</p>
        </div>
      </div>
    </div>
  );
};

export default SideImage;