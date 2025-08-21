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
      <div className="h-full reports-padding reports-outer-scroll">
        <div className="bg-white reports-border reports-container-height reports-inner-padding flex flex-col reports-inner-overflow">
          
          {/* Header - Altura fija responsiva */}
          <div className="flex-shrink-0 reports-header-margin">
            <ReportsHeader />
          </div>
          
          {/* Contenido principal - Flex-grow con overflow */}
          <div className="flex-1 min-h-0 reports-content-scroll">
            
            {/* Layout principal responsivo */}
            <div className="reports-layout-height reports-main-layout reports-gap reports-main-overflow">
              
              {/* Columna principal izquierda */}
              <div className="reports-main-column flex flex-col reports-gap min-h-0 reports-column-overflow">
                
                {/* FunctionalGroups - Altura adaptativa por pantalla */}
                <div className="flex-shrink-0 functional-groups-height reports-groups-scroll">
                  <div className="h-full reports-component-overflow">
                    <FunctionalGroups />
                  </div>
                </div>
                
                {/* TripsChart - Espacio restante optimizado */}
                <div className="flex-1 min-h-0 trips-chart-min-height reports-chart-scroll">
                  <div className="h-full reports-component-overflow">
                    <TripsChartStatic />
                  </div>
                </div>
                
                {/* BottomMetrics - Solo visible en desktop */}
                <div className="bottom-metrics-desktop flex-shrink-0 reports-bottom-scroll">
                  <div className="h-full reports-component-overflow">
                    <BottomMetrics />
                  </div>
                </div>
              </div>
              
              {/* Columna lateral derecha */}
              <div className="reports-side-column flex flex-col reports-gap min-h-0 reports-column-overflow">
                
                {/* MainMetrics */}
                <div className="flex-shrink-0 h-auto reports-metrics-scroll">
                  <div className="reports-component-overflow">
                    <MainMetrics />
                  </div>
                </div>
                
                {/* MetricCards Container */}
                <div className="flex-1 flex flex-col reports-gap min-h-0 reports-cards-scroll">
                  
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
                  
                  {/* Spacer flexible */}
                  <div className="flex-1 min-h-0"></div>
                </div>
              </div>
              
              {/* BottomMetrics - Solo visible en móvil */}
              <div className="bottom-metrics-mobile flex-shrink-0 reports-mobile-bottom-scroll">
                <div className="reports-component-overflow">
                  <BottomMetrics />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sistema de CSS responsivo completo */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* =================================================================
             SISTEMA RESPONSIVE PROFESIONAL CON SCROLL INTELIGENTE
             ================================================================= */
          
          /* Optimizaciones base con scroll */
          .reports-container {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
            contain: layout style;
          }
          
          /* =================================================================
             SISTEMA DE SCROLL INTELIGENTE
             ================================================================= */
          
          /* Scroll principal del contenedor */
          .reports-outer-scroll {
            overflow: auto;
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 transparent;
          }
          
          .reports-outer-scroll::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          .reports-outer-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .reports-outer-scroll::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 3px;
          }
          
          .reports-outer-scroll::-webkit-scrollbar-thumb:hover {
            background-color: #94a3b8;
          }
          
          /* Contenedor con altura mínima para scroll */
          .reports-container-height {
            min-height: 100%;
            height: auto;
          }
          
          /* Overflow interno adaptativo */
          .reports-inner-overflow {
            overflow: visible;
          }
          
          /* Scroll del contenido principal */
          .reports-content-scroll {
            overflow: auto;
          }
          
          /* Layout con altura mínima */
          .reports-layout-height {
            min-height: 100%;
            height: auto;
          }
          
          /* Overflow principal adaptativo */
          .reports-main-overflow {
            overflow: visible;
          }
          
          /* Scroll de columnas */
          .reports-column-overflow {
            overflow: visible;
          }
          
          /* Scroll de componentes individuales */
          .reports-component-overflow {
            overflow: auto;
            scrollbar-width: thin;
            scrollbar-color: #e2e8f0 transparent;
          }
          
          .reports-component-overflow::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          
          .reports-component-overflow::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .reports-component-overflow::-webkit-scrollbar-thumb {
            background-color: #e2e8f0;
            border-radius: 2px;
          }
          
          .reports-component-overflow::-webkit-scrollbar-thumb:hover {
            background-color: #cbd5e1;
          }
          
          /* Scroll específicos por sección */
          .reports-groups-scroll {
            overflow: auto;
          }
          
          .reports-chart-scroll {
            overflow: hidden; /* El chart maneja su propio scroll */
          }
          
          .reports-bottom-scroll {
            overflow: auto;
          }
          
          .reports-metrics-scroll {
            overflow: visible;
          }
          
          .reports-cards-scroll {
            overflow: auto;
          }
          
          .reports-mobile-bottom-scroll {
            overflow: auto;
          }
          
          /* =================================================================
             MOBILE FIRST - SMARTPHONES (320px - 767px)
             ================================================================= */
          
          /* Extra Small: 320px - 374px (iPhone SE, pequeños Android) */
          .reports-padding { padding: 0.25rem; }
          .reports-border { border-radius: 0.375rem; }
          .reports-inner-padding { padding: 0.5rem; }
          .reports-header-margin { margin-bottom: 0.5rem; }
          .reports-main-layout { 
            display: flex; 
            flex-direction: column;
          }
          .reports-gap { gap: 0.5rem; }
          .reports-main-column { order: 1; }
          .reports-side-column { order: 2; }
          .functional-groups-height { height: auto; max-height: 15vh; }
          .trips-chart-min-height { min-height: 140px; }
          .bottom-metrics-desktop { display: none; }
          .bottom-metrics-mobile { display: block; order: 3; margin-top: 0.25rem; }
          
          /* Small: 375px - 424px (iPhone 12/13/14, Galaxy S) */
          @media (min-width: 375px) {
            .reports-padding { padding: 0.375rem; }
            .reports-inner-padding { padding: 0.625rem; }
            .reports-gap { gap: 0.625rem; }
            .functional-groups-height { max-height: 16vh; }
            .trips-chart-min-height { min-height: 150px; }
          }
          
          /* Medium Small: 425px - 480px (iPhone Plus/Max, grandes Android) */
          @media (min-width: 425px) {
            .reports-padding { padding: 0.5rem; }
            .reports-inner-padding { padding: 0.75rem; }
            .reports-header-margin { margin-bottom: 0.625rem; }
            .reports-gap { gap: 0.75rem; }
            .functional-groups-height { max-height: 17vh; }
            .trips-chart-min-height { min-height: 160px; }
          }
          
          /* Large Mobile: 481px - 640px (móviles landscape, phablets) */
          @media (min-width: 481px) {
            .reports-padding { padding: 0.625rem; }
            .reports-inner-padding { padding: 0.875rem; }
            .reports-gap { gap: 0.875rem; }
            .functional-groups-height { max-height: 18vh; }
            .trips-chart-min-height { min-height: 170px; }
          }
          
          /* =================================================================
             SCROLL ADAPTATIVO POR TAMAÑOS DE PANTALLA
             ================================================================= */
          
          /* Móviles: Scroll vertical principal */
          @media (max-width: 768px) {
            .reports-outer-scroll {
              overflow-y: auto;
              overflow-x: hidden;
            }
            
            .reports-content-scroll {
              overflow-y: auto;
              overflow-x: hidden;
              max-height: calc(100vh - 120px);
            }
            
            .reports-column-overflow {
              overflow-y: auto;
              overflow-x: hidden;
            }
            
            /* Scroll suave en móviles */
            .reports-component-overflow {
              -webkit-overflow-scrolling: touch;
              scroll-behavior: smooth;
            }
            
            /* Altura máxima para evitar overflow */
            .functional-groups-height {
              max-height: min(18vh, 150px);
              overflow-y: auto;
            }
            
            .trips-chart-min-height {
              max-height: 60vh;
              overflow: hidden;
            }
          }
          
          /* Tablets: Scroll bidireccional controlado */
          @media (min-width: 769px) and (max-width: 1024px) {
            .reports-outer-scroll {
              overflow: auto;
            }
            
            .reports-content-scroll {
              overflow: auto;
              max-height: calc(100vh - 140px);
            }
            
            .reports-main-overflow {
              overflow: auto;
            }
            
            .functional-groups-height {
              max-height: min(22vh, 200px);
            }
            
            .reports-bottom-scroll {
              max-height: min(15vh, 120px);
              overflow-y: auto;
            }
          }
          
          /* Desktop: Scroll optimizado por componente */
          @media (min-width: 1025px) {
            .reports-outer-scroll {
              overflow: auto;
            }
            
            .reports-content-scroll {
              overflow: visible;
            }
            
            .reports-main-overflow {
              overflow: visible;
            }
            
            .reports-column-overflow {
              overflow: visible;
            }
            
            /* Componentes individuales con scroll */
            .functional-groups-height {
              overflow-y: auto;
              max-height: min(26vh, 300px);
            }
            
            .reports-chart-scroll {
              overflow: hidden; /* Chart maneja su scroll internamente */
            }
            
            .reports-bottom-scroll {
              overflow-y: auto;
              max-height: min(18vh, 180px);
            }
            
            .reports-cards-scroll {
              overflow-y: auto;
              max-height: calc(100vh - 400px);
            }
          }
          
          /* =================================================================
             TABLETS - PEQUEÑAS A MEDIANAS (641px - 1024px)
             ================================================================= */
          
          /* Tablet Small: 641px - 768px (iPad Mini, tablets 7-8") */
          @media (min-width: 641px) {
            .reports-padding { padding: 0.75rem; }
            .reports-inner-padding { padding: 1rem; }
            .reports-header-margin { margin-bottom: 0.75rem; }
            .reports-gap { gap: 1rem; }
            .functional-groups-height { max-height: 20vh; }
            .trips-chart-min-height { min-height: 180px; }
          }
          
          /* Tablet Medium: 769px - 1024px (iPad estándar, tablets 9-11") */
          @media (min-width: 769px) {
            .reports-padding { padding: 1rem; }
            .reports-inner-padding { padding: 1.25rem; }
            .reports-header-margin { margin-bottom: 1rem; }
            .reports-gap { gap: 1.25rem; }
            .reports-main-layout { 
              display: grid; 
              grid-template-columns: 1fr 300px;
              grid-template-rows: 1fr auto;
            }
            .reports-main-column { 
              order: unset;
              grid-column: 1;
              grid-row: 1;
            }
            .reports-side-column { 
              order: unset;
              grid-column: 2;
              grid-row: 1;
            }
            .bottom-metrics-desktop { 
              display: block;
              height: auto;
              max-height: 15vh;
            }
            .bottom-metrics-mobile { 
              display: none;
            }
            .functional-groups-height { max-height: 22vh; }
            .trips-chart-min-height { min-height: 200px; }
          }
          
          /* =================================================================
             DESKTOP - PEQUEÑO A MEDIANO (1025px - 1440px)
             ================================================================= */
          
          /* Desktop Small: 1025px - 1280px (laptops 13-15") */
          @media (min-width: 1025px) {
            .reports-padding { padding: 1.25rem; }
            .reports-inner-padding { padding: 1.5rem; }
            .reports-header-margin { margin-bottom: 1.25rem; }
            .reports-gap { gap: 1.5rem; }
            .reports-main-layout { 
              grid-template-columns: 1fr 320px;
            }
            .functional-groups-height { max-height: 24vh; }
            .trips-chart-min-height { min-height: 240px; }
            .bottom-metrics-desktop { max-height: 16vh; }
          }
          
          /* Desktop Medium: 1281px - 1440px (laptops 15-17", monitores 24") */
          @media (min-width: 1281px) {
            .reports-padding { padding: 1.5rem; }
            .reports-inner-padding { padding: 1.75rem; }
            .reports-header-margin { margin-bottom: 1.5rem; }
            .reports-gap { gap: 1.75rem; }
            .reports-main-layout { 
              grid-template-columns: 1fr 350px;
            }
            .functional-groups-height { max-height: 26vh; }
            .trips-chart-min-height { min-height: 280px; }
            .bottom-metrics-desktop { max-height: 18vh; }
          }
          
          /* =================================================================
             DESKTOP GRANDE Y ULTRA WIDE (1441px+)
             ================================================================= */
          
          /* Desktop Large: 1441px - 1920px (monitores 27-32") */
          @media (min-width: 1441px) {
            .reports-padding { padding: 1.75rem; }
            .reports-inner-padding { padding: 2rem; }
            .reports-header-margin { margin-bottom: 1.75rem; }
            .reports-gap { gap: 2rem; }
            .reports-main-layout { 
              grid-template-columns: 1fr 380px;
            }
            .functional-groups-height { max-height: 28vh; }
            .trips-chart-min-height { min-height: 320px; }
            .bottom-metrics-desktop { max-height: 20vh; }
          }
          
          /* Ultra Wide: 1921px - 2560px (monitores ultrawide 34-49") */
          @media (min-width: 1921px) {
            .reports-container {
              max-width: 2400px;
              margin: 0 auto;
            }
            .reports-padding { padding: 2rem; }
            .reports-inner-padding { padding: 2.5rem; }
            .reports-header-margin { margin-bottom: 2rem; }
            .reports-gap { gap: 2.5rem; }
            .reports-main-layout { 
              grid-template-columns: 1fr 420px;
            }
            .functional-groups-height { max-height: 30vh; }
            .trips-chart-min-height { min-height: 360px; }
          }
          
          /* Super Ultra Wide: 2561px+ (monitores 49"+ y setups multi-monitor) */
          @media (min-width: 2561px) {
            .reports-container {
              max-width: 3000px;
            }
            .reports-padding { padding: 2.5rem; }
            .reports-inner-padding { padding: 3rem; }
            .reports-gap { gap: 3rem; }
            .reports-main-layout { 
              grid-template-columns: 1fr 480px;
            }
            .functional-groups-height { max-height: 32vh; }
            .trips-chart-min-height { min-height: 400px; }
          }
          
          /* =================================================================
             SCROLL EN ORIENTACIONES Y CASOS ESPECIALES
             ================================================================= */
          
          /* Landscape en móviles - Scroll horizontal habilitado */
          @media (max-height: 500px) and (orientation: landscape) and (max-width: 1024px) {
            .reports-padding { padding: 0.25rem !important; }
            .reports-inner-padding { padding: 0.5rem !important; }
            .reports-header-margin { margin-bottom: 0.25rem !important; }
            .reports-gap { gap: 0.5rem !important; }
            .functional-groups-height { max-height: 25vh !important; }
            .trips-chart-min-height { min-height: 100px !important; }
            
            /* Scroll agresivo en landscape móvil */
            .reports-outer-scroll {
              overflow: auto !important;
              max-height: 100vh;
            }
            
            .reports-content-scroll {
              overflow: auto !important;
              max-height: calc(100vh - 80px);
            }
            
            .reports-main-overflow {
              overflow-y: auto !important;
              overflow-x: hidden !important;
            }
            
            .functional-groups-height {
              overflow-y: auto !important;
              max-height: min(25vh, 120px) !important;
            }
          }
          
          /* Landscape en tablets - Scroll optimizado */
          @media (max-height: 800px) and (orientation: landscape) and (min-width: 769px) and (max-width: 1440px) {
            .functional-groups-height { 
              max-height: 20vh !important; 
              overflow-y: auto !important;
            }
            .trips-chart-min-height { min-height: 150px !important; }
            .bottom-metrics-desktop { 
              max-height: 12vh !important; 
              overflow-y: auto !important;
            }
            
            .reports-content-scroll {
              max-height: calc(100vh - 100px);
              overflow: auto;
            }
          }
          
          /* Portrait en tablets grandes - Más espacio vertical */
          @media (min-height: 1200px) and (orientation: portrait) and (min-width: 768px) {
            .functional-groups-height { 
              max-height: 35vh !important; 
              overflow-y: auto !important;
            }
            .trips-chart-min-height { min-height: 400px !important; }
            .bottom-metrics-desktop { 
              max-height: 25vh !important; 
              overflow-y: auto !important;
            }
            
            .reports-cards-scroll {
              max-height: calc(100vh - 300px);
              overflow-y: auto;
            }
          }
          
          /* =================================================================
             SCROLL EN DISPOSITIVOS ESPECIALES
             ================================================================= */
          
          /* Dispositivos plegables - Scroll adaptativo */
          @media (min-width: 1600px) and (max-width: 1920px) and (min-height: 900px) {
            .reports-main-layout { 
              grid-template-columns: 1.2fr 400px;
            }
            .functional-groups-height { 
              max-height: 25vh; 
              overflow-y: auto;
            }
            .trips-chart-min-height { min-height: 300px; }
            
            .reports-content-scroll {
              overflow: visible;
            }
            
            .reports-cards-scroll {
              max-height: calc(100vh - 350px);
              overflow-y: auto;
            }
          }
          
          /* iPads Pro landscape - Scroll específico */
          @media (min-width: 1024px) and (max-width: 1366px) and (min-height: 768px) and (max-height: 1024px) {
            .reports-main-layout { 
              grid-template-columns: 1fr 280px;
            }
            .functional-groups-height { 
              max-height: 22vh; 
              overflow-y: auto;
            }
            .trips-chart-min-height { min-height: 220px; }
            
            .reports-bottom-scroll {
              max-height: 120px;
              overflow-y: auto;
            }
            
            .reports-cards-scroll {
              max-height: calc(100vh - 300px);
              overflow-y: auto;
            }
          }
          
          /* =================================================================
             SCROLL - OPTIMIZACIONES Y ACCESIBILIDAD
             ================================================================= */
          
          /* Soporte para notch y safe areas con scroll */
          @supports (padding: max(0px)) {
            .reports-container {
              padding-left: max(env(safe-area-inset-left), 0);
              padding-right: max(env(safe-area-inset-right), 0);
              padding-top: max(env(safe-area-inset-top), 0);
              padding-bottom: max(env(safe-area-inset-bottom), 0);
            }
            
            .reports-outer-scroll {
              height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
            }
          }
          
          /* Transiciones suaves con scroll */
          .reports-container * {
            transition: padding 0.3s ease, margin 0.3s ease, gap 0.3s ease, max-height 0.3s ease;
          }
          
          /* Scroll suave global */
          html {
            scroll-behavior: smooth;
          }
          
          /* Reducir movimiento para accesibilidad */
          @media (prefers-reduced-motion: reduce) {
            .reports-container * {
              transition: none !important;
            }
            
            html {
              scroll-behavior: auto !important;
            }
            
            .reports-component-overflow {
              scroll-behavior: auto !important;
            }
          }
          
          /* Alto contraste - scroll visible */
          @media (prefers-contrast: high) {
            .reports-container {
              background-color: #000000;
            }
            
            .reports-outer-scroll::-webkit-scrollbar-thumb {
              background-color: #ffffff;
            }
            
            .reports-component-overflow::-webkit-scrollbar-thumb {
              background-color: #ffffff;
            }
          }
          
          /* Modo oscuro del sistema con scroll */
          @media (prefers-color-scheme: dark) {
            .reports-container {
              background-color: #4a5568;
            }
            
            .reports-outer-scroll::-webkit-scrollbar-thumb {
              background-color: #4a5568;
            }
            
            .reports-component-overflow::-webkit-scrollbar-thumb {
              background-color: #4a5568;
            }
          }
          
          /* Optimización de rendimiento con scroll */
          .reports-container,
          .reports-container * {
            will-change: auto;
            transform: translateZ(0);
          }
          
          /* Scroll momentum en iOS */
          .reports-outer-scroll,
          .reports-content-scroll,
          .reports-component-overflow {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }
          
          /* =================================================================
             SCROLL - FALLBACKS PARA NAVEGADORES ANTIGUOS
             ================================================================= */
          
          /* Fallback para navegadores sin CSS Grid con scroll */
          @supports not (display: grid) {
            .reports-main-layout {
              display: flex !important;
              flex-direction: column !important;
              overflow-y: auto !important;
            }
            
            @media (min-width: 769px) {
              .reports-main-layout {
                flex-direction: row !important;
                overflow: auto !important;
              }
              .reports-main-column {
                flex: 1 !important;
                margin-right: 1rem !important;
                overflow-y: auto !important;
              }
              .reports-side-column {
                width: 300px !important;
                flex-shrink: 0 !important;
                overflow-y: auto !important;
              }
            }
          }
          
          /* Fallback para navegadores sin vh con scroll */
          @supports not (height: 1vh) {
            .functional-groups-height {
              height: 120px !important;
              max-height: none !important;
              overflow-y: auto !important;
            }
            
            .reports-content-scroll {
              max-height: 600px !important;
              overflow-y: auto !important;
            }
          }
          
          /* =================================================================
             SCROLL - OPTIMIZACIONES ESPECÍFICAS POR CONTENIDO
             ================================================================= */
          
          /* Scroll invisible cuando no es necesario */
          .reports-component-overflow:not(:hover) {
            scrollbar-width: none;
          }
          
          .reports-component-overflow:not(:hover)::-webkit-scrollbar {
            display: none;
          }
          
          /* Scroll visible en hover/focus */
          .reports-component-overflow:hover,
          .reports-component-overflow:focus-within {
            scrollbar-width: thin;
          }
          
          .reports-component-overflow:hover::-webkit-scrollbar,
          .reports-component-overflow:focus-within::-webkit-scrollbar {
            display: block;
          }
          
          /* Scroll para touch devices - siempre visible */
          @media (hover: none) and (pointer: coarse) {
            .reports-component-overflow {
              scrollbar-width: thin !important;
            }
            
            .reports-component-overflow::-webkit-scrollbar {
              display: block !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default ReportsPage;