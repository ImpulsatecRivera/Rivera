import { Navigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <p>Cargando...</p>; 

  return isLoggedIn ? children : <Navigate to="/" />;
};

export default PrivateRoute;
