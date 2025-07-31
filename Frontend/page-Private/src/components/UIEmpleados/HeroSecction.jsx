// 2. components/UI/HeroSection.jsx
import React from 'react';

const HeroSection = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4 sm:mb-6 shadow-2xl" style={{ backgroundColor: '#5D9646' }}>
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
      </div>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">{title}</h1>
      <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto px-4">
        {subtitle}
      </p>
    </div>
  );
};

export default HeroSection;
