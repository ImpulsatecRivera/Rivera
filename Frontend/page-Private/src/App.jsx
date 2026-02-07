import { Routes, Route, useLocation, Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import animationData from "./assets/lotties/404 not found.json";
import { useAuth } from "./Context/authContext";

// Rutas privadas
import PrivateRoute from "./components/PrivateRoutes/PrivateRoute";

// Públicas
import Login from "./pages/Login";
import RecoverPassword from "./pages/RecoverPassword";
import VerificationInput from "./pages/VerificationInput";
import ResetPassword from "./pages/ResetPassword";

// Privadas
import Dashboard from "./pages/Dashboard/Dashboard";
import ReportsPage from "./pages/Dashboard/ReportsPage";
import ClientManagementInterface from "./pages/Clientes";
import AddClienteForm from "./pages/Clientes/AgregarCliente";
import Employee from "./pages/Employees/Employee";
import AddEmployeeForm from "./pages/Employees/AgregarEmpleados";
import MotoristaManagementInterface from "./pages/Motorista/Motorista";
import AddMotoristaForm from "./pages/Motorista/AgregarMotorista";
import AddAuxiliarForm from "./pages/Motorista/AgregarAuxiliar";
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
import Seleccionar from "./pages/ProcesosElegir/Seleccionar";
import Dashboards from "./pages/Dashbord2/dashbords";
import MantenimientosTable from "./pages/MantenimientosCamiones/PantallaPrincipalMantos";
import CreateMantenimientoPage from "./pages/MantenimientosCamiones/AgregarNuevoManto";
import EditMantenimiento from "./pages/MantenimientosCamiones/EditarMantos";
import CajaChica from "./pages/CajaChica/CajaChica";
import Ventas from "./pages/Ventas/Ventas";
import AgregarVenta from "./pages/Ventas/AgregarVenta";
import Planilla from "./pages/Planilla/Planilla";
import PlanillaQuincenal from "./pages/Planilla/PlanillaQuincenal";
import VerPlanillaQuincenal from "./pages/Planilla/VerPlanillasQuincenales";
import PlanillaSemanal from "./pages/Planilla/Planillasemanal ";
import PlanillaSemanalNueva from "./pages/Planilla/Planillasemanalnueva ";
import NoAccess from "./pages/NoAccess";
import ProgramacionViajesOperativos from "./pages/viajesInternos/ProgramacionViajesOperativos";
import Nav from "./components/Nav/Nav";
import FleetDashboard from './pages/MantenimientosCamiones/FleetDashboard';

// ✅ Diesel
import PantallaPrincipalDiesel from "./pages/Diesel/PantallaPrincipalDiesel";
import AgregarDiesel from "./pages/Diesel/AgregarDiesel";
import EditDiesel from "./pages/Diesel/EditDiesel";

// ✅ Viajes internos
import PantallaPrincipalViajesInternos from "./pages/viajesInternos/PantallaPrincipalViajesInternos";
import AgregarViajeInterno from "./pages/viajesInternos/AgregarViajeInterno";

// UI
import SideNav from "./components/dashbordNav/sideNav";
import PantallaCarga from "./components/SplashScreen/PantallaCarga";
// src/App.jsx (o donde tengas tu componente principal)
import './styles/tutorial-global.css';

// ... resto de tu código

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const isAdmin = user?.userType === "Administrador";

  const PlanillaRoute = ({ children }) => {
    if (isAdmin) return children;
    return <Navigate to="/no-access" replace />;
  };

  const splashRoutes = [
    "/empleados/agregarEmployee",
    "/motoristas/agregarMotorista",
    "/clientes/agregarCliente",
    "/camiones/aggCamion",
    "/proveedores/agregarProveedor",
    "/camiones/editarCamion/:id",
    "/cotizaciones/CotizacionForm",
    "/viajes/maps",
    "/mantenimientos/agregar-mantenimiento",
    "/mantenimientos/editar/:id",
    "/diesel/agregar",
    "/diesel/editar/:id",
    "/viajesInternos/editar/:id",
    "/planilla/quincenal",
    "/planilla/quincenales/:id",
    "/planilla/semanal/nueva",
    "/planilla/semanal/:id",
    "/viajesInternos/agregar",
    "/viajesInternos/programacion",
    "/agregar-venta",
    "/agregar-venta/:id"
  ];

  useEffect(() => {
    const shouldShowSplash = splashRoutes.some((route) => {
      if (route.includes(":")) {
        const regex = new RegExp(`^${route.replace(/:[^/]+/g, "[^/]+")}$`);
        return regex.test(location.pathname);
      }
      return location.pathname === route;
    });

    if (shouldShowSplash) {
      setIsRouteLoading(true);
      const timer = setTimeout(() => setIsRouteLoading(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setIsRouteLoading(false);
    }
  }, [location.pathname]);

  if (isRouteLoading) return <PantallaCarga />;

  return (
    <Routes>
      {/* ===================== PÚBLICAS ===================== */}
      <Route path="/" element={<Login />} />
      <Route path="/recuperar" element={<RecoverPassword />} />
      <Route path="/verification-input" element={<VerificationInput />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ===================== PRIVADA SIN MENÚ ===================== */}
      <Route
        path="/SeleccionarProceso"
        element={
          <PrivateRoute>
            <Seleccionar />
          </PrivateRoute>
        }
      />

      {/* ===================== RUTAS CON SIDENAV (Operaciones) ===================== */}
      <Route
        element={
          <PrivateRoute>
            <div className="flex h-screen overflow-hidden">
              <SideNav />
              <div className="flex-1 min-h-screen overflow-y-auto">
                <Outlet />
              </div>
            </div>
          </PrivateRoute>
        }
      >
        <Route path="/home" element={<Dashboards />} />


        {/* Planillas */}
        <Route path="/planilla" element={<PlanillaRoute><Planilla /></PlanillaRoute>} />
        <Route path="/planilla/quincenal" element={<PlanillaRoute><PlanillaQuincenal /></PlanillaRoute>} />
        <Route path="/planilla/quincenal/:id" element={<PlanillaRoute><PlanillaQuincenal /></PlanillaRoute>} />
        <Route path="/planilla/semanal/nueva" element={<PlanillaRoute><PlanillaSemanalNueva /></PlanillaRoute>} />        
        <Route path="/planilla/semanal/:id" element={<PlanillaRoute><PlanillaSemanal /></PlanillaRoute>} />
        <Route path="/no-access" element={<NoAccess />} />


        {/* Caja Chica */}
        <Route path="/CajaChica" element={<CajaChica />} />

        {/* Ventas */}
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/agregar-venta" element={<AgregarVenta />} />
        <Route path="/agregar-venta/:id" element={<AgregarVenta />} />

        {/* Diesel */}
        <Route path="/diesel" element={<PantallaPrincipalDiesel />} />
        <Route path="/diesel/agregar" element={<AgregarDiesel />} />
        <Route path="/diesel/editar/:id" element={<EditDiesel />} />

        {/* Viajes Internos */}
        <Route path="/viajesInternos" element={<PantallaPrincipalViajesInternos />} />
        <Route path="/viajesInternos/agregar" element={<AgregarViajeInterno />} />
        <Route path="/viajesInternos/programacion" element={<ProgramacionViajesOperativos />} />

        {/* Mantenimientos */}
        <Route path="/mantenimientos" element={<MantenimientosTable />} />
        <Route path="/mantenimientos/agregar-mantenimiento" element={<CreateMantenimientoPage />} />
        <Route path="/mantenimientos/editar/:id" element={<EditMantenimiento />} />
        <Route path="/flota" element={<FleetDashboard />} />
      </Route>

      {/* ===================== RUTAS CON NAV (Administración) ===================== */}
      <Route
        element={
          <PrivateRoute>
            <div className="flex h-screen overflow-hidden">
              <Nav />
              <div className="flex-1 min-h-screen overflow-y-auto">
                <Outlet />
              </div>
            </div>
          </PrivateRoute>
        }
      >
        {/* Dashboards */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/informes" element={<ReportsPage />} />
        <Route path="/no-access" element={<NoAccess />} />

        {/* Clientes */}
        <Route path="/clientes" element={<ClientManagementInterface />} />
        <Route path="/clientes/agregarCliente" element={<AddClienteForm />} />

        {/* Empleados */}
        <Route path="/empleados" element={<Employee />} />
        <Route path="/empleados/agregarEmployee" element={<AddEmployeeForm />} />

        {/* Motoristas */}
        <Route path="/motoristas" element={<MotoristaManagementInterface />} />
        <Route path="/motoristas/agregarMotorista" element={<AddMotoristaForm />} />
        <Route path="/motoristas/agregarAuxiliar" element={<AddAuxiliarForm />} />

        {/* Viajes */}
        <Route path="/viajes" element={<Travel />} />
        <Route path="/viajes/maps" element={<Maps />} />

        {/* Camiones */}
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

      {/* ===================== 404 ===================== */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Lottie animationData={animationData} style={{ maxWidth: 800 }} loop autoplay />
          </div>
        }
      />
    </Routes>
  );
}

export default App;