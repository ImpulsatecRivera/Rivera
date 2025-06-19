// ✅ App.jsx corregido
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RecoverPassword from "./pages/RecoverPassword";
import VerificationCode from "./pages/VerificationCode";
import VerificationInput from "./pages/VerificationInput"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/recuperar" element={<RecoverPassword />} />
      <Route path="/verification-code" element={<VerificationCode />} />
      <Route path="/verification-input" element={<VerificationInput />} />
    </Routes>
  );
}

export default App;
