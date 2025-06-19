import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RecoverPassword from "./pages/RecoverPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/recuperar" element={<RecoverPassword />} />
    </Routes>
  );
}

export default App;
