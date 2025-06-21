import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RecoverPassword from "./pages/RecoverPassword";
import VerificationCode from "./pages/VerificationCode";
import VerificationInput from "./pages/VerificationInput";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import ClientManagementInterface from "./pages/VerClientes";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ClientManagementInterface />} />
      <Route path="/recuperar" element={<RecoverPassword />} />
      <Route path="/verification-code" element={<VerificationCode />} />
      <Route path="/verification-input" element={<VerificationInput />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;