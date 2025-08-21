import { useAuth } from "../../Context/AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { isLoggedIn, loading, user } = useAuth();

  console.log("🛡️ [PrivateRoute] Estado actual:", {
    isLoggedIn,
    loading,
    user: user ? user.email : "No user"
  });

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    console.log("⏳ [PrivateRoute] Mostrando loading...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está logueado, redirigir a login
  if (!isLoggedIn) {
    console.log("🚫 [PrivateRoute] Usuario no autenticado, redirigiendo a login");
    return <Navigate to="/" replace />;
  }

  console.log("✅ [PrivateRoute] Usuario autenticado, mostrando contenido");
  // Si está logueado, mostrar el contenido
  return children;
};

export default PrivateRoute;