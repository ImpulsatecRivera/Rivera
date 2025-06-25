import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import RecoverPassword from "./pages/RecoverPassword";
import VerificationCode from "./pages/VerificationCode";
import VerificationInput from "./pages/VerificationInput";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import ReportsPage from "./pages/Dashboard/ReportsPage";
import ClientManagementInterface from "./pages/VerClientes";
import SidebarNav from "./components/Nav/Nav";

function App() {
  const location = useLocation();
  
  // Lista de rutas donde NO debe aparecer el menú (solo rutas de autenticación)
  const authRoutes = [
    "/",
    "/recuperar",
    "/verification-code",
    "/verification-input",
    "/reset-password"
  ];
  
  // El menú aparece en todas las rutas EXCEPTO en las de autenticación
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
          <Route path="/verification-code" element={<VerificationCode />} />
          <Route path="/verification-input" element={<VerificationInput />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/informes" element={<ReportsPage />} />
          <Route path="/clientes" element={<ClientManagementInterface />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;