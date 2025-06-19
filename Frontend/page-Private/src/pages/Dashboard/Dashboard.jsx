import Sidebar from "../../components/Dashboard/Sidebar";
import Header from "../../components/Dashboard/Header";
import TripList from "../../components/Dashboard/TripList";
import Chart from "../../components/Dashboard/Chart";
import ReportCard from "../../components/Dashboard/ReportCard";
import RightPanel from "../../components/Dashboard/RightPanel";
import avatar from "../../images/avatar.png";

const Dashboard = () => {
  return (
    <div className="flex bg-[#1A1D23] text-white h-screen overflow-hidden">
      {/* Sidebar fijo */}
      <div className="w-64 flex-shrink-0 h-full fixed top-0 left-0 bg-[#1A1D23]">
        <Sidebar />
      </div>

      {/* Contenido principal scrollable */}
      <div className="ml-64 w-full h-full overflow-y-auto bg-[#1A1D23]">
        <div className="max-w-[1400px] mx-auto p-6">
          <div className="bg-white text-black rounded-2xl shadow-md p-6 flex flex-col lg:flex-row gap-6">
            {/* Zona izquierda */}
            <main className="flex-1 space-y-6">
              <Header avatar={avatar} />
              <div>
                <h2 className="text-lg font-semibold mb-4">Actividad de viajes</h2>
                <Chart />
              </div>
              <TripList />
            </main>

            {/* Zona derecha */}
            <aside className="w-full lg:w-[22rem]">
              <RightPanel />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
