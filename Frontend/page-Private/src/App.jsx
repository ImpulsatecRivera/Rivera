import { Routes, Route, useLocation } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoutes/PrivateRoute";
import Login from "./pages/Login";
import RecoverPassword from "./pages/RecoverPassword";
import VerificationInput from "./pages/VerificationInput";
import ResetPassword from "./pages/ResetPassword";
import Travel from "./pages/Travel";
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
import CotizacionesComponent from "./pages/cotizaciones/Cotizaciones";
import CotizacionForm from "./pages/cotizaciones/EditarCotizacion";

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
    "/motoristas/agregarMotorista",
    "/Camiones/aggCamion",
    "/proveedores/agregarProveedor",
    "/Camiones/editarCamion",
    "/cotizaciones/CotizacionForm"
  ];

  // Función para verificar si debe mostrar el menú
  const shouldShowMenu = !authRoutes.some(route => {
    if (route.includes(':')) {
      // Para rutas dinámicas, verificar el patrón
      const pattern = route.replace(':id', '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(location.pathname);
    }
    return location.pathname === route || location.pathname.startsWith(route + '/');
  });

  return (
    <div className="flex">
      {/* Sidebar fijo */}
      {shouldShowMenu && (
        <div className="fixed left-0 top-0 z-40">
          <SidebarNav />
        </div>
      )}

      {/* Contenido principal */}
      <div className={`flex-1 min-h-screen ${shouldShowMenu ? "ml-64" : "ml-0"}`}>
        <Routes>
          {/* Rutas de autenticación */}
          <Route path="/" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
          <Route path="/verification-input" element={<VerificationInput />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Dashboard */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/informes" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><ClientManagementInterface /></PrivateRoute>} />
          <Route path="/empleados" element={<PrivateRoute><Employee /></PrivateRoute>} />
          <Route path="/empleados/agregarEmployee" element={<PrivateRoute><AddEmployeeForm /></PrivateRoute>} />
          <Route path="/motoristas" element={<PrivateRoute><MotoristaManagementInterface /></PrivateRoute>} />
          <Route path="/motoristas/agregarMotorista" element={<PrivateRoute><AddMotoristaForm /></PrivateRoute>} />
          <Route path="/viajes" element={<PrivateRoute><Travel /></PrivateRoute>} />

          <Route path="/Camiones" element={<PrivateRoute><Camiones /></PrivateRoute>} />
          <Route path="/camiones" element={<PrivateRoute><Camiones /></PrivateRoute>} />
          <Route path="/camiones/:id" element={<PrivateRoute><TruckDetailScreen /></PrivateRoute>} />
          <Route path="/Camiones/:id" element={<PrivateRoute><TruckDetailScreen /></PrivateRoute>} />
          <Route path="/Camiones/aggCamion" element={<PrivateRoute><TruckFormScreen /></PrivateRoute>} />
          <Route path="/camiones/aggCamion" element={<PrivateRoute><TruckFormScreen /></PrivateRoute>} />
          <Route path="/Camiones/editarCamion/:id" element={<PrivateRoute><TruckManagement /></PrivateRoute>} />
          <Route path="/camiones/editarCamion/:id" element={<PrivateRoute><TruckManagement /></PrivateRoute>} />

          <Route path="/proveedores" element={<PrivateRoute><ProviderManagementInterface /></PrivateRoute>} />
          <Route path="/proveedores/agregarProveedor" element={<PrivateRoute><AddProveedorForm /></PrivateRoute>} />


          {/* Ruta catch-all para 404 */}


          <Route path="/cotizaciones" element={<PrivateRoute><CotizacionesComponent /></PrivateRoute>} />
          <Route path="/cotizaciones/CotizacionForm" element={<PrivateRoute><CotizacionForm/></PrivateRoute>} />
          
          {/* Ruta catch-all para páginas no encontradas */}

          <Route path="*" element={
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">404 - Página no encontrada</h1>
                <p className="text-gray-600">La ruta "{location.pathname}" no existe.</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;