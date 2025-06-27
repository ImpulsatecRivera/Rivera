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
    <div className="w-full h-screen overflow-hidden bg-[#34353A]">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-lg h-full p-4 flex flex-col">
          <ReportsHeader />
          
          <div className="grid grid-cols-3 gap-4 flex-grow overflow-hidden">
            {/* Columna izquierda */}
            <div className="col-span-2 flex flex-col gap-4 overflow-hidden">
              <FunctionalGroups />
              <TripsChartStatic />
              <BottomMetrics />
            </div>
            
            {/* Columna derecha */}
            <div className="flex flex-col gap-4 overflow-hidden">
              <MainMetrics />
              <MetricCard icon={FiClock} value="02:36" sublabel="Por viaje" />
              <MetricCard icon={FiTrendingDown} value="-4.5%" sublabel="Comparado con el mes anterior" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;