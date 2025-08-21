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
    <div className="w-full h-screen bg-[#34353A] reports-container">
      <div className="h-full p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8">
        <div className="bg-white rounded-lg h-full overflow-hidden">
          
          {/* Contenedor con scroll personalizado */}
          <div className="h-full overflow-y-scroll overflow-x-hidden reports-scroll p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
            
            {/* Header - Fijo en la parte superior */}
            <div className="sticky top-0 bg-white z-10 pb-3 sm:pb-4 md:pb-5 lg:pb-6 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              <ReportsHeader />
            </div>
            
            {/* Contenido principal */}
            <div className="min-h-[150vh]">
              
              {/* Layout responsivo */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
                
                {/* Columna principal izquierda */}
                <div className="lg:col-span-8 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                  
                  {/* FunctionalGroups */}
                  <div className="h-auto min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]">
                    <FunctionalGroups />
                  </div>
                  
                  {/* TripsChart */}
                  <div className="h-auto min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[450px] xl:min-h-[500px]">
                    <TripsChartStatic />
                  </div>
                  
                  {/* BottomMetrics - Oculto en móvil */}
                  <div className="hidden sm:block h-auto min-h-[150px] lg:min-h-[200px]">
                    <BottomMetrics />
                  </div>
                </div>
                
                {/* Columna lateral derecha */}
                <div className="lg:col-span-4 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                  
                  {/* MainMetrics */}
                  <div className="h-auto">
                    <MainMetrics />
                  </div>
                  
                  {/* MetricCards */}
                  <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                    <MetricCard 
                      icon={FiClock} 
                      value="02:36" 
                      sublabel="Por viaje" 
                    />
                    
                    <MetricCard 
                      icon={FiTrendingDown} 
                      value="-4.5%" 
                      sublabel="Comparado con el mes anterior" 
                    />
                  </div>
                </div>
              </div>
              
              {/* BottomMetrics visible solo en móvil */}
              <div className="sm:hidden mt-4">
                <BottomMetrics />
              </div>
              
              {/* Padding bottom para espacio adicional y forzar scroll */}
              <div className="h-20 sm:h-24 md:h-32 lg:h-40"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos para responsive y scroll personalizado */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Scroll personalizado - FORZADO */
          .reports-scroll {
            scrollbar-width: thin;
            scrollbar-color: #94A3B8 #E2E8F0;
            scroll-behavior: smooth;
          }
          
          .reports-scroll::-webkit-scrollbar {
            width: 12px;
            background: #F1F5F9;
          }
          
          .reports-scroll::-webkit-scrollbar-track {
            background: #E2E8F0;
            border-radius: 6px;
            margin: 4px;
          }
          
          .reports-scroll::-webkit-scrollbar-thumb {
            background: #94A3B8;
            border-radius: 6px;
            border: 2px solid #E2E8F0;
            transition: all 0.2s ease;
          }
          
          .reports-scroll::-webkit-scrollbar-thumb:hover {
            background: #64748B;
            border-color: #CBD5E1;
          }
          
          .reports-scroll::-webkit-scrollbar-thumb:active {
            background: #475569;
          }
          
          /* Optimizaciones para móviles muy pequeños */
          @media (max-width: 375px) {
            .reports-container .p-2 {
              padding: 0.25rem !important;
            }
            
            .reports-scroll {
              padding: 0.75rem !important;
            }
          }
          
          /* Tablets en modo portrait */
          @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
            .lg\\:col-span-8 {
              grid-column: span 12 !important;
            }
            
            .lg\\:col-span-4 {
              grid-column: span 12 !important;
            }
            
            .lg\\:grid-cols-12 {
              grid-template-columns: repeat(1, 1fr) !important;
            }
          }
          
          /* Tablets en modo landscape */
          @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
            .lg\\:col-span-8 {
              grid-column: span 8 !important;
            }
            
            .lg\\:col-span-4 {
              grid-column: span 4 !important;
            }
          }
          
          /* Móviles en modo landscape */
          @media (max-height: 500px) and (orientation: landscape) {
            .min-h-\\[200px\\] {
              min-height: 150px !important;
            }
            
            .min-h-\\[300px\\] {
              min-height: 200px !important;
            }
            
            .min-h-\\[350px\\] {
              min-height: 250px !important;
            }
          }
          
          /* Pantallas ultra anchas */
          @media (min-width: 1536px) {
            .xl\\:min-h-\\[500px\\] {
              min-height: 600px !important;
            }
          }
          
          /* Mejoras de rendimiento */
          .reports-container {
            contain: layout style paint;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }
          
          /* Suavizado de transiciones */
          .reports-scroll {
            scroll-behavior: smooth;
          }
          
          /* Accesibilidad - Reducir movimiento si está activado */
          @media (prefers-reduced-motion: reduce) {
            .reports-scroll {
              scroll-behavior: auto;
            }
            
            .reports-scroll::-webkit-scrollbar-thumb {
              transition: none;
            }
          }
          
          /* Dark mode support para el scroll */
          @media (prefers-color-scheme: dark) {
            .reports-scroll::-webkit-scrollbar-track {
              background: #2D3748;
            }
            
            .reports-scroll::-webkit-scrollbar-thumb {
              background: #4A5568;
            }
            
            .reports-scroll::-webkit-scrollbar-thumb:hover {
              background: #718096;
            }
          }
        `
      }} />
    </div>
  );
};

export default ReportsPage;