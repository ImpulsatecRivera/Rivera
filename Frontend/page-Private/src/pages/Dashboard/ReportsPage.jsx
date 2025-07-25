import React from 'react';
import { FiClock, FiTrendingDown } from 'react-icons/fi';
import ReportsHeader from '../../components/ReportsPage/ReportsHeader';
import MainMetrics from '../../components/ReportsPage/MainMetrics';
import MetricCard from '../../components/ReportsPage/MetricCard';
import FunctionalGroups from '../../components/ReportsPage/FunctionalGroups';
import TripsChartStatic from '../../components/ReportsPage/TripsChart';
import BottomMetrics from '../../components/ReportsPage/BottomMetrics';

const ReportsPage = () => {
  return (
    <div className="w-full h-screen overflow-hidden bg-[#34353A] reports-container">
      <div className="h-full p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 overflow-hidden">
        <div className="bg-white rounded-lg h-full p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 flex flex-col overflow-hidden">
          
          {/* Header - Altura fija */}
          <div className="flex-shrink-0 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
            <ReportsHeader />
          </div>
          
          {/* Contenido principal - Flex-grow con overflow */}
          <div className="flex-1 min-h-0 overflow-hidden">
            
            {/* Layout Mobile-First: Stack vertical en móviles, grid en pantallas grandes */}
            <div className="h-full flex flex-col lg:grid lg:grid-cols-12 tablet-grid-adjustment gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 overflow-hidden reports-grid">
              
              {/* Columna principal izquierda */}
              <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-8 tablet-col-main flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 min-h-0 overflow-hidden">
                
                {/* FunctionalGroups - Altura adaptativa */}
                <div className="flex-shrink-0 h-auto max-h-[25vh] sm:max-h-[30vh] lg:max-h-none functional-groups-container">
                  <div className="h-full overflow-hidden">
                    <FunctionalGroups />
                  </div>
                </div>
                
                {/* TripsChart - Toma el espacio restante */}
                <div className="flex-1 min-h-0 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] trips-chart-container">
                  <div className="h-full overflow-hidden">
                    <TripsChartStatic />
                  </div>
                </div>
                
                {/* BottomMetrics - Altura fija en desktop, oculto en móvil pequeño */}
                <div className="hidden sm:block flex-shrink-0 h-auto max-h-[20vh] lg:max-h-none">
                  <div className="h-full overflow-hidden">
                    <BottomMetrics />
                  </div>
                </div>
              </div>
              
              {/* Columna lateral derecha */}
              <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-4 tablet-col-side flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 min-h-0 overflow-hidden reports-flex">
                
                {/* MainMetrics */}
                <div className="flex-shrink-0 h-auto">
                  <MainMetrics />
                </div>
                
                {/* MetricCards Container */}
                <div className="flex-1 flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 min-h-0">
                  
                  {/* MetricCard 1 */}
                  <div className="flex-shrink-0">
                    <MetricCard 
                      icon={FiClock} 
                      value="02:36" 
                      sublabel="Por viaje" 
                    />
                  </div>
                  
                  {/* MetricCard 2 */}
                  <div className="flex-shrink-0">
                    <MetricCard 
                      icon={FiTrendingDown} 
                      value="-4.5%" 
                      sublabel="Comparado con el mes anterior" 
                    />
                  </div>
                  
                  {/* Spacer para empujar contenido hacia arriba si es necesario */}
                  <div className="flex-1 min-h-0"></div>
                </div>
              </div>
              
              {/* BottomMetrics visible solo en móvil pequeño */}
              <div className="sm:hidden flex-shrink-0 mt-2">
                <BottomMetrics />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos CSS inline para evitar conflictos */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Optimizaciones de rendimiento y responsividad */
          .reports-container {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }
          
          /* Extra Small: hasta 480px */
          @media (max-width: 480px) {
            .reports-container .p-3 {
              padding: 0.5rem !important;
            }
          }
          
          /* Medium: 641px - 768px - Tablets pequeñas */
          @media (min-width: 641px) and (max-width: 768px) {
            .tablet-grid-adjustment {
              grid-template-columns: repeat(8, 1fr) !important;
            }
            
            .tablet-col-main {
              grid-column: span 5 !important;
            }
            
            .tablet-col-side {
              grid-column: span 3 !important;
            }
          }
          
          /* Large: 769px - 1024px - Tablets grandes */
          @media (min-width: 769px) and (max-width: 1024px) {
            .functional-groups-container {
              max-height: 20vh !important;
            }
            
            .trips-chart-container {
              min-height: 300px !important;
            }
          }
          
          /* Orientación landscape en móviles */
          @media (max-height: 500px) and (orientation: landscape) {
            .functional-groups-container {
              max-height: 35vh !important;
            }
            
            .trips-chart-container {
              min-height: 150px !important;
            }
          }
          
          /* 2XL: pantallas grandes */
          @media (min-width: 1281px) {
            .trips-chart-container {
              min-height: 400px !important;
            }
          }
          
          /* Smooth transitions */
          .reports-grid, .reports-flex {
            transition: gap 0.2s ease-in-out;
          }
          
          /* Mejoras de accesibilidad */
          @media (prefers-reduced-motion: reduce) {
            .reports-grid, .reports-flex {
              transition: none !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default ReportsPage;