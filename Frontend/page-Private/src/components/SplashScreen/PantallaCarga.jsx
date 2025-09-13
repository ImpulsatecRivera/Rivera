import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import carAnimation from './Car_Ignite Animation.json';

const PantallaCarga = ({ onLoadingComplete }) => {
  useEffect(() => {
    // Duración exacta de tu Lottie: 4 segundos (240 frames ÷ 60 fps)
    const timer = setTimeout(() => {
      onLoadingComplete?.();
    }, 4000); // 4000ms = 4 segundos

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-96 h-96">
        <Lottie 
          animationData={carAnimation}
          loop={false}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default PantallaCarga;