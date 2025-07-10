import React from 'react';
import Header from '../../components/Dashboard/Header';
import ActivityChart from '../../components/Dashboard/ActivityChart';
import CompletedTrips from '../../components/Dashboard/CompletedTrips';
import LoadMetrics from '../../components/Dashboard/LoadMetrics';
import ReportsCard from '../../components/Dashboard/ReportsCard';

const Dashboard = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#34353A] overflow-hidden">
      <div className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 overflow-hidden">
        <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 h-full overflow-hidden flex flex-col">
          <Header />

          <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 2xl:grid-cols-12 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 mt-4 md:mt-6 lg:mt-8 flex-1 overflow-hidden">
            {/* Sección izquierda - Responsive columns */}
            <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-8 flex flex-col gap-3 sm:gap-4 md:gap-6 lg:gap-8 overflow-hidden">
              <div className="flex-shrink-0 w-full">
                <ActivityChart />
              </div>

              <div className="flex-1 overflow-auto thick-scrollbar-left pr-1 sm:pr-2 md:pr-3 lg:pr-4" style={{ direction: 'rtl' }}>
                <div className="pr-1 sm:pr-2 md:pr-3 lg:pr-4" style={{ direction: 'ltr' }}>
                  <CompletedTrips />
                </div>
              </div>
            </div>

            {/* Sección derecha - Responsive columns */}
            <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-4 flex flex-col gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              <div className="flex-shrink-0 w-full">
                <LoadMetrics />
              </div>

              <div className="flex-1 flex items-end w-full">
                <ReportsCard />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;