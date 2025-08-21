const LogoutController = {};

LogoutController.logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    
    // Usar EXACTAMENTE los mismos parámetros que en login, pero para eliminar
    const deleteParts = [
      "authToken=", // Valor vacío
      "Path=/",
      "HttpOnly",
      "Expires=Thu, 01 Jan 1970 00:00:00 GMT", // Fecha en el pasado
      "Max-Age=0", // Eliminar inmediatamente
      isProd ? "SameSite=None" : "SameSite=Lax", // MISMO formato que login
      isProd ? "Secure" : "",
      isProd ? "Partitioned" : "", // CHIPS attribute
    ].filter(Boolean);
    
    const deleteCookieStr = deleteParts.join("; ");
    
    console.log("🍪 [LOGOUT] Delete-Cookie:", deleteCookieStr);
    res.setHeader("Set-Cookie", deleteCookieStr);
    
    return res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (e) {
    console.error("💥 [LOGOUT] Error:", e);
    return res.status(500).json({ message: "Error al cerrar sesión" });
  }
};

export default LogoutController;