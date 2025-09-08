import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Lottie from 'lottie-react';
import animationData from './assets/lotties/Animation - 1697446322669.json'; // Ajusta la ru

// Rutas privadas
import PrivateRoute from "./components/PrivateRoutes/PrivateRoute";

// Públicas
import Login from "./pages/Login";
import RecoverPassword from "./pages/RecoverPassword";
import VerificationInput from "./pages/VerificationInput";
import ResetPassword from "./pages/ResetPassword";

// Privadas (páginas)
import Dashboard from "./pages/Dashboard/Dashboard";
import ReportsPage from "./pages/Dashboard/ReportsPage";
import ClientManagementInterface from "./pages/Clientes";
import Employee from "./pages/Employees/Employee";
import AddEmployeeForm from "./pages/Employees/AgregarEmpleados";
import MotoristaManagementInterface from "./pages/Motorista/Motorista";
import AddMotoristaForm from "./pages/Motorista/AgregarMotorista";
import Travel from "./pages/Travel";
import Maps from "./pages/maps";
import Camiones from "./pages/Camiones/Camiones";
import TruckDetailScreen from "./pages/Camiones/DetalleCamionenv";
import TruckFormScreen from "./pages/Camiones/FormAggCamion";
import TruckManagement from "./pages/Camiones/EditarCamion";
import ProviderManagementInterface from "./pages/Provedores/Prooveedores";
import AddProveedorForm from "./pages/Provedores/AgregarProovedor";
import CotizacionesComponent from "./pages/cotizaciones/Cotizaciones";
import CotizacionForm from "./pages/cotizaciones/EditarCotizacion";

// UI
import SidebarNav from "./components/Nav/Nav";
import PantallaCarga from "./components/SplashScreen/PantallaCarga";

function App() {
  const location = useLocation();
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  // Rutas que deben mostrar el splash
  const splashRoutes = [
    "/empleados/agregarEmployee",
    "/motoristas/agregarMotorista",
    "/camiones/aggCamion",
    "/proveedores/agregarProveedor",
    "/camiones/editarCamion/:id",
    "/cotizaciones/CotizacionForm",
    "/viajes/maps",
  ];

  useEffect(() => {
    const shouldShowSplashForRoute = splashRoutes.some((route) => {
      if (route.includes(":")) {
        const pattern = route.replace(/:[^/]+/g, "[^/]+");
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

  if (isRouteLoading) {
    return <PantallaCarga />;
  }

  return (
    <Routes>
      {/* ===================== RUTAS PÚBLICAS ===================== */}
      <Route path="/" element={<Login />} />
      <Route path="/recuperar" element={<RecoverPassword />} />
      <Route path="/verification-input" element={<VerificationInput />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ===================== RUTAS PRIVADAS + LAYOUT CON SIDEBAR ===================== */}
      <Route
        element={
          <PrivateRoute>
            {/* Layout protegido (sin archivo extra) */}
            <div className="flex h-screen overflow-hidden">
              <SidebarNav />
              <div className="flex-1 min-h-screen overflow-y-auto">
                <Outlet />
              </div>
            </div>
          </PrivateRoute>
        }
      >
        {/* Dashboard e informes */}
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
        <Route path="/viajes/maps" element={<Maps />} />

        {/* Camiones (normalizado todo en minúsculas) */}
        <Route path="/camiones" element={<Camiones />} />
        <Route path="/camiones/:id" element={<TruckDetailScreen />} />
        <Route path="/camiones/aggCamion" element={<TruckFormScreen />} />
        <Route path="/camiones/editarCamion/:id" element={<TruckManagement />} />

        {/* Proveedores */}
        <Route path="/proveedores" element={<ProviderManagementInterface />} />
        <Route path="/proveedores/agregarProveedor" element={<AddProveedorForm />} />

        {/* Cotizaciones */}
        <Route path="/cotizaciones" element={<CotizacionesComponent />} />
        <Route path="/cotizaciones/CotizacionForm" element={<CotizacionForm />} />
      </Route>

      {/* ===================== 404 FUERA DEL LAYOUT (SIN MENÚ) ===================== */}
      <Route
  path="*"
  element={
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-lg mx-auto px-6">
        
        {/* Animación Lottie */}
        <div className="mb-6">
          {/* Placeholder temporal - reemplaza cuando tengas tu Lottie */}
          
          
          <Lottie
            animationData={animationData}
            style={{ width: 320, height: 320 }}
            loop={true}
            autoplay={true}
          />
        </div>

        {/* Texto del error */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ¡Ups! Ruta perdida
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            La página "{location.pathname}" no fue encontrada
          </p>
          <p className="text-gray-500 mb-6">
            Parece que esta ruta se perdió en el universo digital
          </p>
          
          {/* Botones de navegación */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              ← Volver atrás
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              🏠 Ir al inicio
            </button>
          </div>
        </div>
        
      </div>
    </div>
  }
/>
    </Routes>
  );
}

export default App;
