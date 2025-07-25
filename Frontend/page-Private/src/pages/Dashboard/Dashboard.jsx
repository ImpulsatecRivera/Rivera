import React from 'react';
import Header from '../../components/Dashboard/Header';
import ActivityChart from '../../components/Dashboard/ActivityChart';
import CompletedTrips from '../../components/Dashboard/CompletedTrips';
import LoadMetrics from '../../components/Dashboard/LoadMetrics';
import ReportsCard from '../../components/Dashboard/ReportsCard';

const Dashboard = () => {
  return (
    <div className="h-screen bg-[#34353A] p-2 sm:p-4 lg:p-6 overflow-hidden">
      <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 h-full flex flex-col overflow-hidden">
        {/* Header - altura fija */}
        <div className="flex-shrink-0">
          <Header />
        </div>
        
        {/* Grid principal adaptativo - ocupa el resto del espacio */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 mt-4 sm:mt-6 flex-1 min-h-0 overflow-hidden">
          
          {/* Columna principal - Charts y Trips */}
          <div className="xl:col-span-8 flex flex-col gap-4 sm:gap-6 min-h-0 overflow-hidden">
            
            {/* Activity Chart - altura fija limitada */}
            <div className="flex-shrink-0 max-h-[40vh]">
              <ActivityChart />
            </div>
            
            {/* Completed Trips con scroll interno */}
            <div className="flex-1 min-h-0 bg-white rounded-lg border border-gray-100 flex flex-col overflow-hidden">
              {/* Header de la sección */}
              <div className="flex-shrink-0 p-4 pb-2 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Viajes Completados</h3>
              </div>
              
              {/* Contenedor con scroll para la lista de viajes */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <div 
                  className="h-full overflow-y-auto overflow-x-hidden px-4 py-2"
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
          <div className="xl:col-span-4 flex flex-col gap-4 sm:gap-6 min-h-0 overflow-hidden">
            
            {/* Load Metrics - altura limitada con scroll interno */}
            <div className="flex-1 min-h-0 max-h-[55vh] bg-white rounded-lg border border-gray-100 flex flex-col overflow-hidden">
              <div className="flex-shrink-0 p-4 pb-2 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Tipos de carga frecuentes</h3>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full overflow-y-auto px-4 py-2">
                  <LoadMetrics />
                </div>
              </div>
            </div>
            
            {/* Reports Card - altura mínima garantizada */}
            <div className="flex-shrink-0 min-h-[200px] bg-white rounded-lg border border-gray-100 flex flex-col overflow-hidden">
              <div className="flex-shrink-0 p-4 pb-2 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Informes</h3>
              </div>
              <div className="flex-1 flex flex-col justify-center p-4">
                <ReportsCard />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos CSS para el scroll customizado */}
      <style jsx global>{`
        /* Scroll personalizado para WebKit browsers (Chrome, Safari, Edge) */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #F8FAFC;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 3px;
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
        
        /* Optimizaciones para el scroll */
        .overflow-y-auto {
          /* Mejora el rendimiento del scroll en dispositivos móviles */
          -webkit-overflow-scrolling: touch;
          /* Previene el bounce en iOS */
          overscroll-behavior: contain;
        }
        
        /* Responsive adjustments */
        @media (max-width: 1279px) {
          .xl\\:col-span-8,
          .xl\\:col-span-4 {
            margin-bottom: 1rem;
          }
        }
        
        /* Asegurar que body y html no tengan scroll */
        html, body {
          overflow: hidden;
          height: 100%;
        }
        
        /* Optimizar el grid en móviles */
        @media (max-width: 1279px) {
          .grid.grid-cols-1.xl\\:grid-cols-12 {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .xl\\:col-span-8,
          .xl\\:col-span-4 {
            flex: none;
            height: auto;
          }
          
          /* En móviles, ajustar las alturas */
          .max-h-\\[40vh\\] {
            max-height: 30vh;
          }
          
          .max-h-\\[55vh\\] {
            max-height: 35vh;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;