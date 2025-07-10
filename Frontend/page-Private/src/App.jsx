import { Routes, Route, useLocation } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoutes/PrivateRoute";
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
import ProviderManagementInterface from "./pages/Provedores/Prooveedores";
import AddProveedorForm from "./pages/Provedores/AgregarProovedor";
import TruckManagement from "./pages/Camiones/EditarCamion";

function App() {
  const location = useLocation();

  const authRoutes = ["/", "/recuperar", "/verification-input", "/reset-password"];
  const shouldShowMenu = !authRoutes.includes(location.pathname);

  return (
    <div className="flex">
      {shouldShowMenu && (
        <div className="fixed left-0 top-0 z-40">
          <SidebarNav />
        </div>
      )}

      <div className={`flex-1 min-h-screen ${shouldShowMenu ? "ml-64" : "ml-0"}`}>
        <Routes>
          {/* públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
          <Route path="/verification-input" element={<VerificationInput />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* privadas */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/informes" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><ClientManagementInterface /></PrivateRoute>} />
          <Route path="/empleados" element={<PrivateRoute><Employee /></PrivateRoute>} />
          <Route path="/empleados/agregarEmployee" element={<PrivateRoute><AddEmployeeForm /></PrivateRoute>} />
          <Route path="/motoristas" element={<PrivateRoute><MotoristaManagementInterface /></PrivateRoute>} />
          <Route path="/motoristas/agregarMotorista" element={<PrivateRoute><AddMotoristaForm /></PrivateRoute>} />
          <Route path="/Camiones" element={<PrivateRoute><Camiones /></PrivateRoute>} />
          <Route path="/Camiones/verCamion" element={<PrivateRoute><TruckDetailScreen /></PrivateRoute>} />
          <Route path="/Camiones/aggCamion" element={<PrivateRoute><TruckFormScreen /></PrivateRoute>} />
          <Route path="/Camiones/editarCamion" element={<PrivateRoute><TruckManagement /></PrivateRoute>} />
          <Route path="/proveedores" element={<PrivateRoute><ProviderManagementInterface /></PrivateRoute>} />
          <Route path="/proveedores/agregarProveedor" element={<PrivateRoute><AddProveedorForm /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
