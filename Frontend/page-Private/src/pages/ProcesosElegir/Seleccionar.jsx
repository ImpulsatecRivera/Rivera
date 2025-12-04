import React, { useEffect, useRef } from 'react';
import { Settings, Users } from 'lucide-react';

const Seleccionar = () => {
  const lottieRefs = useRef([]);
  
  const animationData = {"nm":"Comp 1","ddd":0,"h":300,"w":500,"meta":{"g":"@lottiefiles/toolkit-js 0.33.2"},"layers":[{"ty":4,"nm":"Shape Layer 4","sr":1,"st":0,"op":2731,"ip":0,"hd":false,"ddd":0,"bm":0,"hasMask":false,"ao":0,"ks":{"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":0,"k":[119.05,71.43,100],"ix":6},"sk":{"a":0,"k":0},"p":{"a":0,"k":[251.26,145.41,0],"ix":2},"r":{"a":0,"k":180,"ix":10},"sa":{"a":0,"k":0},"o":{"a":0,"k":100,"ix":11}},"ef":[],"shapes":[{"ty":"gr","bm":0,"hd":false,"mn":"ADBE Vector Group","nm":"Rectangle 1","ix":1,"cix":2,"np":4,"it":[{"ty":"rc","bm":0,"hd":false,"mn":"ADBE Vector Shape - Rect","nm":"Rectangle Path 1","d":1,"p":{"a":0,"k":[0,0],"ix":3},"r":{"a":0,"k":24,"ix":4},"s":{"a":0,"k":[392.874,392.874],"ix":2}},{"ty":"tm","bm":0,"hd":false,"mn":"ADBE Vector Filter - Trim","nm":"Trim Paths 1","ix":2,"e":{"a":1,"k":[{"o":{"x":0.333,"y":0},"i":{"x":0.667,"y":1},"s":[0],"t":0},{"s":[100],"t":60}],"ix":2},"o":{"a":0,"k":0,"ix":3},"s":{"a":1,"k":[{"o":{"x":0.333,"y":0},"i":{"x":0.667,"y":1},"s":[0],"t":0},{"o":{"x":0.333,"y":0},"i":{"x":0.667,"y":1},"s":[73],"t":30},{"s":[100],"t":60}],"ix":1},"m":1},{"ty":"st","bm":0,"hd":false,"mn":"ADBE Vector Graphic - Stroke","nm":"Stroke 1","lc":2,"lj":2,"ml":1,"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":14,"ix":5},"c":{"a":0,"k":[1,0.3843,0],"ix":3}},{"ty":"tr","a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"sk":{"a":0,"k":0,"ix":4},"p":{"a":0,"k":[1.059,-6.429],"ix":2},"r":{"a":0,"k":0,"ix":6},"sa":{"a":0,"k":0,"ix":5},"o":{"a":0,"k":100,"ix":7}}]}],"ind":1},{"ty":4,"nm":"Shape Layer 1","sr":1,"st":0,"op":2731,"ip":0,"hd":false,"ddd":0,"bm":0,"hasMask":false,"ao":0,"ks":{"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":0,"k":[119.05,71.43,100],"ix":6},"sk":{"a":0,"k":0},"p":{"a":0,"k":[248.74,154.59,0],"ix":2},"r":{"a":0,"k":0,"ix":10},"sa":{"a":0,"k":0},"o":{"a":0,"k":100,"ix":11}},"ef":[],"shapes":[{"ty":"gr","bm":0,"hd":false,"mn":"ADBE Vector Group","nm":"Rectangle 1","ix":1,"cix":2,"np":3,"it":[{"ty":"rc","bm":0,"hd":false,"mn":"ADBE Vector Shape - Rect","nm":"Rectangle Path 1","d":1,"p":{"a":0,"k":[0,0],"ix":3},"r":{"a":0,"k":24,"ix":4},"s":{"a":0,"k":[392.874,392.874],"ix":2}},{"ty":"st","bm":0,"hd":false,"mn":"ADBE Vector Graphic - Stroke","nm":"Stroke 1","lc":1,"lj":1,"ml":4,"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":5,"ix":5},"c":{"a":0,"k":[1,1,1],"ix":3}},{"ty":"tr","a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"sk":{"a":0,"k":0,"ix":4},"p":{"a":0,"k":[1.059,-6.429],"ix":2},"r":{"a":0,"k":0,"ix":6},"sa":{"a":0,"k":0,"ix":5},"o":{"a":0,"k":100,"ix":7}}]}],"ind":2}],"v":"5.9.0","fr":30,"op":61,"ip":0,"assets":[]};

  // Posiciones de las animaciones alrededor de la pantalla
  const positions = [
    { top: '10%', left: '5%' },
    { top: '15%', right: '8%' },
    { top: '50%', left: '3%' },
    { top: '55%', right: '5%' },
    { bottom: '15%', left: '7%' },
    { bottom: '20%', right: '10%' },
  ];

  useEffect(() => {
    const loadLottie = async () => {
      try {
        // Cargar lottie-web desde CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
        script.async = true;
        
        script.onload = () => {
          const lottie = window.lottie;
          
          // Crear animación para cada referencia
          lottieRefs.current.forEach((ref, index) => {
            if (ref) {
              lottie.loadAnimation({
                container: ref,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: animationData,
                rendererSettings: {
                  preserveAspectRatio: 'xMidYMid slice'
                }
              });
              
              // Agregar un pequeño delay aleatorio para cada animación
              setTimeout(() => {
                if (ref.children[0]) {
                  ref.children[0].style.opacity = '1';
                }
              }, index * 300);
            }
          });
        };
        
        document.body.appendChild(script);
        
        return () => {
          document.body.removeChild(script);
        };
      } catch (error) {
        console.error('Error cargando Lottie:', error);
      }
    };

    loadLottie();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 relative overflow-hidden">
      {/* Animaciones Lottie alrededor de la pantalla */}
      {positions.map((pos, index) => (
        <div
          key={index}
          ref={el => lottieRefs.current[index] = el}
          className="fixed z-0 pointer-events-none"
          style={{
            ...pos,
            width: '80px',
            height: '80px',
            opacity: 0.6,
            transition: 'opacity 0.5s ease-in'
          }}
        />
      ))}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-2xl md:text-3xl font-normal text-gray-900 mb-6">
            Hola fitin que deseas realizar este día
          </h1>
          
          {/* Lottie central más grande */}
          <div className="flex justify-center">
            <div 
              ref={el => lottieRefs.current[positions.length] = el}
              className="w-32 h-32 md:w-40 md:h-40"
            />
          </div>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card Procesos Internos */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="flex flex-col items-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 transform transition-transform hover:scale-110">
                <Settings className="w-12 h-12 text-blue-600" />
              </div>
              
              {/* Title */}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Procesos internos
              </h2>
              
              {/* Description */}
              <p className="text-sm text-gray-600 text-center mb-8 leading-relaxed">
                Gestiona y optimiza tus flujos de trabajo internos, automatiza tareas y
                mejora la eficiencia operativa
              </p>
              
              {/* Button */}
              <button 
                onClick={() => console.log('Navegando a /dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105"
              >
                Ingresar
              </button>
            </div>
          </div>

          {/* Card Procesos Externos */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="flex flex-col items-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6 transform transition-transform hover:scale-110">
                <Users className="w-12 h-12 text-purple-600" />
              </div>
              
              {/* Title */}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Procesos externos
              </h2>
              
              {/* Description */}
              <p className="text-sm text-gray-600 text-center mb-8 leading-relaxed">
                Colabora con tu equipo y stakeholders externos, coordina proyectos y mantén
                comunicación efectiva
              </p>
              
              {/* Button */}
              <button 
                onClick={() => console.log('Navegando a /clientes')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105"
              >
                Ingresar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seleccionar;