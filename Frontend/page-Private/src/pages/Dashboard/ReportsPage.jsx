import React from 'react';
import { FiClock, FiTrendingDown } from 'react-icons/fi';

import Sidebar from '../../components/Dashboard/Sidebar';
import ReportsHeader from '../../components/ReportsPage/ReportsHeader';
import MainMetrics from '../../components/ReportsPage/MainMetrics';
import MetricCard from '../../components/ReportsPage/MetricCard';
import FunctionalGroups from '../../components/ReportsPage/FunctionalGroups';
import TripsChartStatic from '../../components/ReportsPage/TripsChart';
import BottomMetrics from '../../components/ReportsPage/BottomMetrics';

const ReportsPage = () => {
  return (
    <div className="flex h-screen bg-[#34353A] overflow-hidden">
      <Sidebar currentPage="informes" />
      
      {/* Contenedor derecho con scroll interno */}
      <div className="flex-1 h-screen overflow-hidden p-4">
        <div className="bg-white rounded-lg h-full p-4 flex flex-col overflow-hidden">
          <ReportsHeader />

          {/* Scroll solo en esta parte */}
          <div className="flex-1 overflow-y-auto mt-4">
            <div className="grid grid-cols-3 gap-6">
              {/* Columna izquierda */}
              <div className="col-span-2 space-y-4">
                <FunctionalGroups />
                <TripsChartStatic />
                <BottomMetrics />
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <MainMetrics />
                <MetricCard icon={FiClock} value="02:36" sublabel="Por viaje" />
                <MetricCard icon={FiTrendingDown} value="-4.5%" sublabel="Comparado con el mes anterior" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
