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

function App() {
  const location = useLocation();

  const authRoutes = [
    "/",
    "/recuperar",
    "/verification-code",
    "/verification-input",
    "/reset-password"
  ];

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
          {/* Rutas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
          <Route path="/verification-input" element={<VerificationInput />} />
          <Route path="/reset-password" element={<ResetPassword />} />
<<<<<<< HEAD
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/informes" element={<ReportsPage />} />
          
          {/* Clientes */}
          <Route path="/clientes" element={<ClientManagementInterface />} />
          
          {/* Empleados */}
          <Route path="/empleados" element={<Employee />} />
          <Route path="/empleados/agregarEmployee" element={<AddEmployeeForm />} />
          
          {/* Motoristas */}
          <Route path="/motoristas" element={<MotoristaManagementInterface />} />
          <Route path="/motoristas/agregarMotorista" element={<AddMotoristaForm />} />
          
          {/* Viajes */}
          <Route path="/viajes" element={<Travel />} />
          
          {/* CAMIONES - RUTAS CORREGIDAS */}
          {/* Lista de camiones */}
          <Route path="/Camiones" element={<Camiones />} />
          <Route path="/camiones" element={<Camiones />} /> {/* Alias en minúscula */}
          
          {/* Ver detalle de camión - RUTA DINÁMICA */}
          <Route path="/camiones/:id" element={<TruckDetailScreen />} />
          <Route path="/Camiones/:id" element={<TruckDetailScreen />} /> {/* Alias */}
          
          {/* Agregar camión */}
          <Route path="/Camiones/aggCamion" element={<TruckFormScreen />} />
          <Route path="/camiones/aggCamion" element={<TruckFormScreen />} /> {/* Alias */}
          
          {/* Editar camión - RUTA DINÁMICA */}
          <Route path="/Camiones/editarCamion/:id" element={<TruckManagement />} />
          <Route path="/camiones/editarCamion/:id" element={<TruckManagement />} /> {/* Alias */}
          
          {/* Proveedores */}
          <Route path="/proveedores" element={<ProviderManagementInterface />} />
          <Route path="/proveedores/agregarProveedor" element={<AddProveedorForm />} />
          <Route path="/cotizaciones" element={<CotizacionesComponent/>} />
          
          {/* Ruta catch-all para páginas no encontradas */}
=======

          {/* Rutas privadas */}
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
>>>>>>> d8bbf71261042b151092f53d0fae6aefb3de0ae0
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
