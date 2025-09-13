import Lottie from 'lottie-react';
import carAnimation from '../../assets/lotties/Car _ Ignite Animation.json'; // Tu archivo

// Reemplaza el div del emoji por:
<Lottie 
  animationData={carAnimation}
  loop={true}
  autoplay={true}
  style={{ width: '100%', height: '100%' }}
/>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* SOLO TU LOTTIE */}
      <div 
        id="lottie-container"
        className="w-96 h-96"
      >
        {/* Placeholder - reemplaza esto con tu Lottie */}
        <div className="w-full h-full flex items-center justify-center text-white text-8xl">
          🚗
        </div>
      </div>
    </div>
  );


// Componente principal
const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ¡App Cargada!
        </h1>
        <button 
          onClick={() => setIsLoading(true)}
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
        >
          Ver pantalla de carga
        </button>
      </div>
    </div>
  );
};

export default App;