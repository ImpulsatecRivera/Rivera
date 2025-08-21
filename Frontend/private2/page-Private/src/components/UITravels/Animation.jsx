// UITravel/animations.js
import { useEffect } from 'react';

export const useAnimations = () => {
  const styles = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
      20%, 40%, 60%, 80% { transform: translateX(3px); }
    }
    
    @keyframes redPulse {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
      }
      50% { 
        box-shadow: 0 0 0 20px rgba(239, 68, 68, 0);
      }
    }
    
    @keyframes greenPulse {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
      }
      50% { 
        box-shadow: 0 0 0 20px rgba(34, 197, 94, 0);
      }
    }
    
    @keyframes bluePulse {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
      }
      50% { 
        box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
      }
    }
    
    @keyframes grayPulse {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(107, 114, 128, 0.4);
      }
      50% { 
        box-shadow: 0 0 0 20px rgba(107, 114, 128, 0);
      }
    }
    
    @keyframes wiggle {
      0%, 7%, 14%, 21%, 28%, 35%, 42%, 49%, 56%, 63%, 70%, 77%, 84%, 91%, 98%, 100% {
        transform: rotate(0deg);
      }
      3.5%, 10.5%, 17.5%, 24.5%, 31.5%, 38.5%, 45.5%, 52.5%, 59.5%, 66.5%, 73.5%, 80.5%, 87.5%, 94.5% {
        transform: rotate(-2deg);
      }
    }
    
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .animate-shake {
      animation: shake 0.8s ease-in-out;
    }
    
    .animate-red-pulse {
      animation: redPulse 2s infinite;
    }
    
    .animate-green-pulse {
      animation: greenPulse 2s infinite;
    }
    
    .animate-blue-pulse {
      animation: bluePulse 2s infinite;
    }
    
    .animate-gray-pulse {
      animation: grayPulse 2s infinite;
    }
    
    .animate-wiggle {
      animation: wiggle 1s ease-in-out infinite;
    }
    
    .animate-heartbeat {
      animation: heartbeat 1.5s ease-in-out infinite;
    }
  `;

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return null;
};