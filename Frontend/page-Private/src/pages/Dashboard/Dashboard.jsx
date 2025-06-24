import React from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import Header from '../../components/Dashboard/Header';
import ActivityChart from '../../components/Dashboard/ActivityChart';
import CompletedTrips from '../../components/Dashboard/CompletedTrips';
import LoadMetrics from '../../components/Dashboard/LoadMetrics';
import ReportsCard from '../../components/Dashboard/ReportsCard';


const Dashboard = () => {
  return (
    <div className="flex h-screen bg-[#34353A] overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-xl p-6 h-full overflow-hidden">
          <Header />
         
          <div className="grid grid-cols-12 gap-6 mt-6 h-[calc(100%-80px)]">
            {/* Sección izquierda - 8 columnas */}
            <div className="col-span-8 flex flex-col gap-6 overflow-hidden">
              <div className="flex-shrink-0">
                <ActivityChart />
              </div>
             
              <div className="flex-1 overflow-auto thick-scrollbar-left pr-2" style={{ direction: 'rtl' }}>
                <div className="pr-2" style={{ direction: 'ltr' }}>
                  <CompletedTrips />
                </div>
              </div>
            </div>
            {/* Sección derecha - 4 columnas */}
            <div className="col-span-4 flex flex-col gap-6">
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