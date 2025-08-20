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
      <div className="h-full p-1 xs:p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 2xl:p-8 overflow-hidden">
        <div className="bg-white rounded-lg h-full p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7 2xl:p-8 flex flex-col overflow-hidden">
          
          {/* Header - Altura fija */}
          <div className="flex-shrink-0 mb-2 xs:mb-3 sm:mb-4 md:mb-5 lg:mb-6 xl:mb-7 2xl:mb-8">
            <ReportsHeader />
          </div>
          
          {/* Contenido principal - Flex-grow con overflow */}
          <div className="flex-1 min-h-0 overflow-hidden">
            
            {/* Layout Mobile-First: Stack vertical en móviles, grid en pantallas grandes */}
            <div className="h-full flex flex-col sm:flex-col md:flex-col lg:grid lg:grid-cols-12 xl:grid-cols-12 2xl:grid-cols-12 tablet-grid-adjustment gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 overflow-hidden reports-grid">
              
              {/* Columna principal izquierda */}
              <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-8 tablet-col-main flex flex-col gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 min-h-0 overflow-hidden">
                
                {/* FunctionalGroups - Altura adaptativa */}
                <div className="flex-shrink-0 h-auto max-h-[20vh] xs:max-h-[22vh] sm:max-h-[25vh] md:max-h-[28vh] lg:max-h-[30vh] xl:max-h-none 2xl:max-h-none functional-groups-container">
                  <div className="h-full overflow-hidden">
                    <FunctionalGroups />
                  </div>
                </div>
                
                {/* TripsChart - Toma el espacio restante */}
                <div className="flex-1 min-h-0 min-h-[180px] xs:min-h-[200px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[320px] xl:min-h-[380px] 2xl:min-h-[420px] trips-chart-container">
                  <div className="h-full overflow-hidden">
                    <TripsChartStatic />
                  </div>
                </div>
                
                {/* BottomMetrics - Altura fija en desktop, oculto en móvil pequeño */}
                <div className="hidden md:block flex-shrink-0 h-auto max-h-[15vh] lg:max-h-[18vh] xl:max-h-[20vh] 2xl:max-h-none">
                  <div className="h-full overflow-hidden">
                    <BottomMetrics />
                  </div>
                </div>
              </div>
              
              {/* Columna lateral derecha */}
              <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-4 tablet-col-side flex flex-col gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 min-h-0 overflow-hidden reports-flex">
                
                {/* MainMetrics */}
                <div className="flex-shrink-0 h-auto">
                  <MainMetrics />
                </div>
                
                {/* MetricCards Container */}
                <div className="flex-1 flex flex-col gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 min-h-0">
                  
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
              <div className="md:hidden flex-shrink-0 mt-1 xs:mt-2 sm:mt-3">
                <BottomMetrics />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos CSS inline para responsive con scroll */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Optimizaciones de rendimiento y responsividad */
          .reports-container {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }
          
          /* Scroll para contenedores cuando sea necesario */
          .functional-groups-container, .trips-chart-container {
            overflow: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          /* Extra Small: hasta 380px - Teléfonos muy pequeños */
          @media (max-width: 380px) {
            .reports-container .p-1 {
              padding: 0.25rem !important;
            }
            
            .functional-groups-container {
              max-height: 18vh !important;
              overflow-y: auto;
            }
            
            .trips-chart-container {
              min-height: 160px !important;
              overflow: auto;
            }
            
            /* Scroll vertical si el contenido no cabe */
            .reports-grid {
              overflow-y: auto;
              max-height: calc(100vh - 80px);
            }
          }
          
          /* Small: 381px - 640px - Teléfonos normales */
          @media (min-width: 381px) and (max-width: 640px) {
            .functional-groups-container {
              max-height: 22vh !important;
              overflow-y: auto;
            }
            
            .trips-chart-container {
              min-height: 200px !important;
              overflow: auto;
            }
            
            .reports-grid {
              overflow-y: auto;
              max-height: calc(100vh - 100px);
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
            
            .functional-groups-container {
              max-height: 25vh !important;
              overflow-y: auto;
            }
            
            .trips-chart-container {
              min-height: 250px !important;
              overflow: auto;
            }
          }
          
          /* Large: 769px - 1024px - Tablets grandes */
          @media (min-width: 769px) and (max-width: 1024px) {
            .functional-groups-container {
              max-height: 28vh !important;
              overflow-y: auto;
            }
            
            .trips-chart-container {
              min-height: 300px !important;
              overflow: auto;
            }
          }
          
          /* XL: 1025px - 1280px - Desktop pequeño */
          @media (min-width: 1025px) and (max-width: 1280px) {
            .functional-groups-container {
              max-height: 32vh !important;
              overflow-y: auto;
            }
            
            .trips-chart-container {
              min-height: 350px !important;
              overflow: auto;
            }
          }
          
          /* 2XL: 1281px+ - Desktop grande */
          @media (min-width: 1281px) {
            .functional-groups-container {
              max-height: 35vh !important;
              overflow-y: auto;
            }
            
            .trips-chart-container {
              min-height: 400px !important;
              overflow: auto;
            }
          }
          
          /* 3XL: 1536px+ - Pantallas muy grandes */
          @media (min-width: 1536px) {
            .trips-chart-container {
              min-height: 450px !important;
              overflow: auto;
            }
          }
          
          /* 4XL: 1920px+ - Pantallas extra grandes */
          @media (min-width: 1920px) {
            .trips-chart-container {
              min-height: 500px !important;
              overflow: auto;
            }
          }
          
          /* Orientación landscape en móviles y tablets pequeñas */
          @media (max-height: 500px) and (orientation: landscape) and (max-width: 1024px) {
            .functional-groups-container {
              max-height: 30vh !important;
              overflow-y: auto;
            }
            
            .trips-chart-container {
              min-height: 140px !important;
              overflow: auto;
            }
            
            .reports-container .p-1,
            .reports-container .p-2 {
              padding: 0.5rem !important;
            }
            
            /* Scroll horizontal y vertical para landscape pequeño */
            .reports-grid {
              overflow: auto;
              max-height: calc(100vh - 60px);
            }
          }
          
          /* Orientación landscape específica para tablets */
          @media (max-height: 700px) and (orientation: landscape) and (min-width: 768px) and (max-width: 1024px) {
            .functional-groups-container {
              max-height: 25vh !important;
              overflow-y: auto;
            }
            
            .trips-chart-container {
              min-height: 200px !important;
              overflow: auto;
            }
          }
          
          /* Pantallas muy altas (modo retrato en tablets grandes) */
          @media (min-height: 1000px) and (orientation: portrait) {
            .functional-groups-container {
              max-height: 20vh !important;
              overflow-y: auto;
            }
            
            .trips-chart-container {
              min-height: 400px !important;
              overflow: auto;
            }
          }
          
          /* Pantallas ultra anchas */
          @media (min-width: 2560px) {
            .reports-grid {
              max-width: 2400px;
              margin: 0 auto;
            }
          }
          
          /* Scrollbar styling para mejor UX */
          .functional-groups-container::-webkit-scrollbar,
          .trips-chart-container::-webkit-scrollbar,
          .reports-grid::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          .functional-groups-container::-webkit-scrollbar-track,
          .trips-chart-container::-webkit-scrollbar-track,
          .reports-grid::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          
          .functional-groups-container::-webkit-scrollbar-thumb,
          .trips-chart-container::-webkit-scrollbar-thumb,
          .reports-grid::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
          }
          
          .functional-groups-container::-webkit-scrollbar-thumb:hover,
          .trips-chart-container::-webkit-scrollbar-thumb:hover,
          .reports-grid::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
          
          /* Smooth transitions para cambios de tamaño */
          .reports-grid, .reports-flex {
            transition: gap 0.2s ease-in-out, grid-template-columns 0.3s ease;
          }
          
          .functional-groups-container, .trips-chart-container {
            transition: max-height 0.3s ease, min-height 0.3s ease;
          }
          
          /* Mejoras de accesibilidad */
          @media (prefers-reduced-motion: reduce) {
            .reports-grid, .reports-flex, 
            .functional-groups-container, .trips-chart-container {
              transition: none !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default ReportsPage;