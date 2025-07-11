import React from 'react';
import Header from '../../components/Dashboard/Header';
import ActivityChart from '../../components/Dashboard/ActivityChart';
import CompletedTrips from '../../components/Dashboard/CompletedTrips';
import LoadMetrics from '../../components/Dashboard/LoadMetrics';
import ReportsCard from '../../components/Dashboard/ReportsCard';

const Dashboard = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#34353A] overflow-hidden">
      <div className="flex-1 p-4 sm:p-6 overflow-hidden">
        <div className="bg-white rounded-xl p-4 sm:p-6 h-full overflow-hidden flex flex-col">
          <Header />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 flex-1 overflow-hidden">
            <div className="md:col-span-8 flex flex-col gap-6 overflow-hidden">
              <div className="flex-shrink-0">
                <ActivityChart />
              </div>

              <div className="flex-1 overflow-auto thick-scrollbar-left pr-2" style={{ direction: 'rtl' }}>
                <div className="pr-2" style={{ direction: 'ltr' }}>
                  <CompletedTrips />
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="flex-shrink-0">
                <LoadMetrics />
              </div>

              <div className="flex-1 flex items-end">
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
