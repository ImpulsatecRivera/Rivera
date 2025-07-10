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
      <div className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 overflow-hidden">
        <div className="bg-white rounded-lg h-full p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col">
          <ReportsHeader />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 flex-grow overflow-hidden mt-3 sm:mt-4 md:mt-6 lg:mt-8">
            {/* Columna izquierda - Responsive layout */}
            <div className="md:col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-2 flex flex-col gap-3 sm:gap-4 md:gap-6 lg:gap-8 overflow-hidden">
              <div className="w-full">
                <FunctionalGroups />
              </div>
              <div className="w-full flex-grow">
                <TripsChartStatic />
              </div>
              <div className="w-full">
                <BottomMetrics />
              </div>
            </div>
            
            {/* Columna derecha - Responsive layout */}
            <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1 flex flex-col gap-3 sm:gap-4 md:gap-6 lg:gap-8 overflow-hidden">
              <div className="w-full">
                <MainMetrics />
              </div>
              <div className="w-full">
                <MetricCard icon={FiClock} value="02:36" sublabel="Por viaje" />
              </div>
              <div className="w-full">
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