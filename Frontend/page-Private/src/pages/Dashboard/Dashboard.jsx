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

      <div className="flex-1 p-4 overflow-hidden">
        {/* Agregado overflow-hidden aquí para evitar scroll general */}
        <div className="bg-white rounded-lg p-4 h-full overflow-hidden">
          <Header />

          <div className="grid grid-cols-3 gap-4 mt-4 h-[calc(100%-60px)]">
            {/* Sección izquierda */}
            <div className="col-span-2 flex flex-col gap-4 overflow-hidden">
              <ActivityChart />
              {/* Scroll solo aquí */}
              <div className="flex-1 overflow-auto">
                <CompletedTrips />
              </div>
            </div>

            {/* Sección derecha */}
            <div className="flex flex-col gap-4">
              <LoadMetrics />
              <ReportsCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;