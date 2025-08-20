// Controlador para manejar el cierre de sesión de usuarios
const LogoutController = {};

// Utilidad para borrar la cookie usando los mismos atributos que al setearla
const clearAuthCookie = (res) => {
  const isProd = process.env.NODE_ENV === "production";
  const attrs = [
    "authToken=",
    "Path=/",
    "HttpOnly",
    "Max-Age=0",
    isProd ? "SameSite=None" : "SameSite=Lax",
    isProd ? "Secure" : "",
    isProd ? "Partitioned" : "",
  ].filter(Boolean);

  const cookieStr = attrs.join("; ");
  console.log("🍪 [LOGOUT] Clear-Cookie:", cookieStr);
  res.append("Set-Cookie", cookieStr);
};

/**
 * POST /auth/logout
 * Elimina la cookie de autenticación del navegador del usuario
 */
LogoutController.logout = async (req, res) => {
  try {
    clearAuthCookie(res);
    return res.status(200).json({ Message: "Sesión cerrada" });
  } catch (error) {
    console.error("💥 [logout] Error:", error);
    return res.status(500).json({ Message: "Error al cerrar sesión" });
  }
};

export default LogoutController;
