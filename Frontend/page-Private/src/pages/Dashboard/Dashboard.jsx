import React from 'react';
import Header from '../../components/Dashboard/Header';
import ActivityChart from '../../components/Dashboard/ActivityChart';
import CompletedTrips from '../../components/Dashboard/CompletedTrips';
import LoadMetrics from '../../components/Dashboard/LoadMetrics';
import ReportsCard from '../../components/Dashboard/ReportsCard';

const Dashboard = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#34353A] overflow-hidden">
      <div className="flex-1 p-2 sm:p-3 overflow-hidden">
        <div className="bg-white rounded-xl p-2 sm:p-3 h-full overflow-hidden flex flex-col">
          <Header />

          <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 2xl:grid-cols-12 gap-2 sm:gap-3 mt-2 flex-1 overflow-hidden">
            {/* Sección izquierda - Responsive columns */}
            <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-8 flex flex-col gap-2 sm:gap-3 overflow-hidden">
              <div className="flex-shrink-0 w-full" style={{ height: '45%' }}>
                <ActivityChart />
              </div>

              <div className="flex-1 overflow-auto thick-scrollbar-left pr-1" style={{ direction: 'rtl' }}>
                <div className="pr-1" style={{ direction: 'ltr' }}>
                  <CompletedTrips />
                </div>
              </div>
            </div>

            {/* Sección derecha - Responsive columns */}
            <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-4 flex flex-col gap-1 overflow-hidden">
              <div className="flex-shrink-0 w-full" style={{ height: '45%' }}>
                <LoadMetrics />
              </div>

              <div className="flex-1 w-full overflow-hidden flex flex-col justify-end">
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