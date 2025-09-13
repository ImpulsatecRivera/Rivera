import React from 'react';
import Lottie from 'lottie-react';
import carAnimation from '../../assets/lotties/Car _ Ignite Animation.json';

const PantallaCarga = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-96 h-96">
        <Lottie 
          animationData={carAnimation}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default PantallaCarga;