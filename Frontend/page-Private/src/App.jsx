import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import RecoverPassword from "./pages/RecoverPassword";
import VerificationInput from "./pages/VerificationInput";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import ReportsPage from "./pages/Dashboard/ReportsPage";
import ClientManagementInterface from "./pages/Clientes";
import Employee from "./pages/Employees/Employee";
import MotoristaManagementInterface from "./pages/Motorista/Motorista"; 
import AddMotoristaForm from "./pages/Motorista/AgregarMotorista"; 
import SidebarNav from "./components/Nav/Nav";
import AddEmployeeForm from "./pages/Employees/AgregarEmpleados";
import Camiones from "./pages/Camiones/Camiones";
import TruckDetailScreen from "./pages/Camiones/DetalleCamionenv";
import TruckFormScreen from "./pages/Camiones/FormAggCamion";

function App() {
  const location = useLocation();
  
  // Lista de rutas donde NO debe aparecer el menú
  const authRoutes = [
    "/",
    "/recuperar",
    "/verification-code",
    "/verification-input",
    "/reset-password",
    "/empleados/agregarEmployee",
    "/motoristas/agregarMotorista"
  ];
  
  // El menú aparece en todas las rutas EXCEPTO en las de la lista
  const shouldShowMenu = !authRoutes.includes(location.pathname);

  return (
    <div className="flex">
      {/* Sidebar fijo */}
      {shouldShowMenu && (
        <div className="fixed left-0 top-0 z-40">
          <SidebarNav />
        </div>
      )}
      
      {/* Contenido principal */}
      <div className={`flex-1 min-h-screen ${shouldShowMenu ? 'ml-64' : 'ml-0'}`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
          <Route path="/verification-input" element={<VerificationInput />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/informes" element={<ReportsPage />} />
          <Route path="/clientes" element={<ClientManagementInterface />} />
          <Route path="/empleados" element={<Employee/>} />
          <Route path="/empleados/agregarEmployee" element={<AddEmployeeForm/>} />
          <Route path="/motoristas" element={<MotoristaManagementInterface/>} />
          <Route path="/motoristas/agregarMotorista" element={<AddMotoristaForm/>} />
          <Route path="/Camiones" element={<Camiones/>} />
          <Route path="/Camiones/verCamion" element={<TruckDetailScreen/>} />
          <Route path="/camiones/aggCamion" element={<TruckFormScreen/>} />


        </Routes>
      </div>
    </div>
  );
}



export default App;