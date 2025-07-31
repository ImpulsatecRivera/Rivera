import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
import Maps from "./pages/maps";
import CotizacionesComponent from "./pages/cotizaciones/Cotizaciones";
import CotizacionForm from "./pages/cotizaciones/EditarCotizacion";



import PantallaCarga from "./components/SplashScreen/PantallaCarga";

function App() {
  const location = useLocation();
  
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const splashRoutes = [
    "/empleados/agregarEmployee",
    "/motoristas/agregarMotorista",
    "/Camiones/aggCamion",
    "/proveedores/agregarProveedor",
    "/Camiones/editarCamion/:id",
    "/cotizaciones/CotizacionForm",
    "/viajes/maps"
  ];

  useEffect(() => {
    const shouldShowSplashForRoute = splashRoutes.some(route => {
      if (route.includes(':')) {
        const pattern = route.replace(':id', '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(location.pathname);
      }
      return location.pathname === route;
    });

    if (shouldShowSplashForRoute) {
      setIsRouteLoading(true);
      const timer = setTimeout(() => {
        setIsRouteLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setIsRouteLoading(false);
    }
  }, [location.pathname]);

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
    "/Camiones/editarCamion/:id",
    "/cotizaciones/CotizacionForm",
    "/viajes/maps"
  ];

  const shouldShowMenu = !authRoutes.some(route => {
    if (route.includes(':')) {
      const pattern = route.replace(':id', '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(location.pathname);
    }
    return location.pathname === route || location.pathname.startsWith(route + '/');
  });

  if (isRouteLoading) {
    return <PantallaCarga />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {shouldShowMenu && <SidebarNav />}

      {/* 🆕 Contenido principal responsivo */}
      <div className={`
        flex-1 min-h-screen overflow-y-auto
        ${shouldShowMenu ? 
          // Con sidebar: márgenes responsivos
          'lg:ml-0 md:ml-0 ml-0' : 
          // Sin sidebar: sin márgenes
          'ml-0'
        }
      `}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
          <Route path="/verification-input" element={<VerificationInput />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/informes" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><ClientManagementInterface /></PrivateRoute>} />
          <Route path="/empleados" element={<PrivateRoute><Employee /></PrivateRoute>} />
          <Route path="/empleados/agregarEmployee" element={<PrivateRoute><AddEmployeeForm /></PrivateRoute>} />
          <Route path="/motoristas" element={<PrivateRoute><MotoristaManagementInterface /></PrivateRoute>} />
          <Route path="/motoristas/agregarMotorista" element={<PrivateRoute><AddMotoristaForm /></PrivateRoute>} />
          <Route path="/viajes" element={<PrivateRoute><Travel /></PrivateRoute>} />
          <Route path="/viajes/maps" element={<Maps />} />
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
          <Route path="/cotizaciones" element={<PrivateRoute><CotizacionesComponent /></PrivateRoute>} />
          <Route path="/cotizaciones/CotizacionForm" element={<PrivateRoute><CotizacionForm/></PrivateRoute>} />
          
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
          <Route path="/viajes/maps" element={<Maps />} />
          
          {/* CAMIONES - RUTAS CORREGIDAS */}
          <Route path="/Camiones" element={<Camiones />} />
          <Route path="/camiones" element={<Camiones />} />
          <Route path="/camiones/:id" element={<TruckDetailScreen />} />
          <Route path="/Camiones/:id" element={<TruckDetailScreen />} />
          <Route path="/Camiones/aggCamion" element={<TruckFormScreen />} />
          <Route path="/camiones/aggCamion" element={<TruckFormScreen />} />
          <Route path="/Camiones/editarCamion/:id" element={<TruckManagement />} />
          <Route path="/camiones/editarCamion/:id" element={<TruckManagement />} />
          
          {/* Proveedores */}
          <Route path="/proveedores" element={<ProviderManagementInterface />} />
          <Route path="/proveedores/agregarProveedor" element={<AddProveedorForm />} />
          
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