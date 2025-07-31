// components/AnimatedBarChart.jsx
import React from 'react';

const AnimatedBarChart = ({ animatedBars, barHeights }) => {
  return (
    <div className="mb-8 flex-shrink-0">
      <div className="flex items-end justify-center space-x-2 h-32">
        {animatedBars.map((height, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className={`w-4 rounded-t-sm transition-all duration-1000 ease-out ${
                index === 10 ? 'bg-gradient-to-t from-purple-600 to-purple-400' : 
                index % 3 === 0 ? 'bg-gradient-to-t from-emerald-500 to-emerald-300' :
                index % 3 === 1 ? 'bg-gradient-to-t from-orange-500 to-orange-300' :
                'bg-gradient-to-t from-cyan-500 to-cyan-300'
              }`}
              style={{
                height: `${height}px`,
                transform: `scaleY(${height / barHeights[index] || 0})`,
                transformOrigin: 'bottom'
              }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedBarChart;