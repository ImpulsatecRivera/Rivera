const LogoutController = {};

LogoutController.logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    
    // USAR EXACTAMENTE LA MISMA ESTRUCTURA QUE setAuthCookie
    const parts = [
      "authToken=", // Valor vacío para eliminar
      "Path=/", // IGUAL que login
      "HttpOnly", // IGUAL que login
      "Max-Age=0", // Para eliminar inmediatamente
      "Expires=Thu, 01 Jan 1970 00:00:00 GMT", // Fecha pasada adicional
      isProd ? "SameSite=None" : "SameSite=Lax", // IGUAL que login
      isProd ? "Secure" : "", // IGUAL que login
      isProd ? "Partitioned" : "", // IGUAL que login (CHIPS)
    ].filter(Boolean); // Eliminar strings vacíos
    
    const cookieStr = parts.join("; ");
    
    console.log("🍪 [LOGOUT] Set-Cookie:", cookieStr);
    console.log("🍪 [LOGOUT] Ambiente:", isProd ? "PRODUCCIÓN" : "DESARROLLO");
    
    // Usar setHeader igual que en login
    res.setHeader("Set-Cookie", cookieStr);
    
    return res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (e) {
    console.error("💥 [LOGOUT] Error:", e);
    return res.status(500).json({ message: "Error al cerrar sesión" });
  }
};

export default LogoutController;