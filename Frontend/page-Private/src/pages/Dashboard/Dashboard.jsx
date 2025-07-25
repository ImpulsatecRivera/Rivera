import React from 'react';
import Header from '../../components/Dashboard/Header';
import ActivityChart from '../../components/Dashboard/ActivityChart';
import CompletedTrips from '../../components/Dashboard/CompletedTrips';
import LoadMetrics from '../../components/Dashboard/LoadMetrics';
import ReportsCard from '../../components/Dashboard/ReportsCard';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#34353A] p-2 sm:p-4 lg:p-6">
      <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)] flex flex-col">
        <Header />
        
        {/* Grid principal adaptativo */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 mt-4 sm:mt-6 flex-1 overflow-hidden">
          
          {/* Columna principal - Charts y Trips */}
          <div className="xl:col-span-8 flex flex-col gap-4 sm:gap-6 min-h-0">
            
            {/* Activity Chart - altura fija */}
            <div className="w-full flex-shrink-0">
              <ActivityChart />
            </div>
            
            {/* Completed Trips con scroll específico en la lista */}
            <div className="flex-1 min-h-0 bg-white rounded-lg border border-gray-100 flex flex-col">
              {/* Header de la sección (si CompletedTrips tiene título) */}
              <div className="flex-shrink-0 p-4 pb-0">
                <h3 className="text-lg font-semibold text-gray-800">Viajes Completados</h3>
              </div>
              
              {/* Contenedor con scroll para la lista de viajes */}
              <div className="flex-1 min-h-0 p-4 pt-2">
                <div 
                  className="h-full overflow-y-auto overflow-x-hidden pr-2"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#CBD5E1 #F8FAFC'
                  }}
                >
                  <CompletedTrips />
                </div>
              </div>
            </div>
          </div>
          
          {/* Columna lateral - Metrics y Reports */}
          <div className="xl:col-span-4 flex flex-col gap-4 sm:gap-6 min-h-0">
            
            {/* Load Metrics - altura flexible pero limitada */}
            <div className="w-full flex-shrink-0 max-h-[50vh]">
              <div className="bg-white rounded-lg border border-gray-100 p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex-shrink-0">Tipos de carga frecuentes</h3>
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <LoadMetrics />
                </div>
              </div>
            </div>
            
            {/* Reports Card - altura mínima garantizada */}
            <div className="flex-1 min-h-[200px] flex flex-col">
              <div className="bg-white rounded-lg border border-gray-100 p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex-shrink-0">Informes</h3>
                <div className="flex-1 flex flex-col justify-center">
                  <ReportsCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos CSS para el scroll customizado */}
      <style jsx global>{`
        /* Scroll personalizado para WebKit browsers (Chrome, Safari, Edge) */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #F8FAFC;
          border-radius: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
          border: 1px solid #F8FAFC;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:active {
          background: #64748B;
        }
        
        /* Para Firefox */
        .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E1 #F8FAFC;
        }
        
        /* Smooth scrolling */
        .overflow-y-auto {
          scroll-behavior: smooth;
        }
        
        /* Asegurar que el contenido no se corte */
        .no-text-overflow {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        /* Espaciado mejorado en móviles */
        @media (max-width: 1279px) {
          .mobile-spacing {
            margin-bottom: 1rem;
          }
        }
        
        /* Optimizaciones adicionales para el scroll */
        .scroll-container {
          /* Mejora el rendimiento del scroll en dispositivos móviles */
          -webkit-overflow-scrolling: touch;
          /* Previene el bounce en iOS */
          overscroll-behavior: contain;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;