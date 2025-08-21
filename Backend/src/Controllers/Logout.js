const LogoutController = {};

LogoutController.logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    
    // Crear múltiples variantes para asegurar eliminación
    const deleteVariants = [
      // Variante 1: Exactamente igual al login pero con fecha pasada
      [
        "authToken=",
        "Path=/",
        "HttpOnly",
        "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        "Max-Age=0",
        isProd ? "SameSite=None" : "SameSite=Lax",
        isProd ? "Secure" : "",
        isProd ? "Partitioned" : "",
      ].filter(Boolean).join("; "),
      
      // Variante 2: Sin Partitioned (por si acaso)
      [
        "authToken=",
        "Path=/",
        "HttpOnly",
        "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        "Max-Age=0",
        isProd ? "SameSite=None" : "SameSite=Lax",
        isProd ? "Secure" : "",
      ].filter(Boolean).join("; "),
      
      // Variante 3: Básica sin SameSite
      "authToken=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0"
    ];
    
    console.log("🍪 [LOGOUT] Enviando múltiples Set-Cookie headers:");
    deleteVariants.forEach((variant, index) => {
      console.log(`   Variante ${index + 1}: ${variant}`);
    });
    
    // Enviar múltiples Set-Cookie headers
    res.setHeader("Set-Cookie", deleteVariants);
    
    return res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (e) {
    console.error("💥 [LOGOUT] Error:", e);
    return res.status(500).json({ message: "Error al cerrar sesión" });
  }
};

export default LogoutController;