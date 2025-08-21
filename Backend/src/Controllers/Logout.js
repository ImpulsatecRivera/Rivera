const LogoutController = {};

LogoutController.logout = async (req, res) => {
  try {
    console.log("🚪 [LOGOUT] Iniciando logout...");
    console.log("🍪 [LOGOUT] Cookies actuales:", req.cookies);
    
    const isProd = process.env.NODE_ENV === "production";

    // ✅ Función corregida para construir cookies de eliminación
    const buildClearCookie = (name) => {
      const parts = [
        `${name}=`, // valor vacío
        "Path=/",
        "HttpOnly", // ✅ Mantener HttpOnly como en login
        "Max-Age=0", // ✅ Eliminar inmediatamente
        "Expires=Thu, 01 Jan 1970 00:00:00 GMT", // ✅ Fecha en el pasado
        isProd ? "SameSite=None" : "SameSite=Lax",
        isProd ? "Secure" : "",
        // ✅ Partitioned solo si está en producción Y la cookie original lo tenía
        ...(isProd ? ["Partitioned"] : []),
      ].filter(Boolean);
      return parts.join("; ");
    };

    // ✅ Lista de cookies a eliminar (sin duplicados)
    const cookiesToClear = [
      buildClearCookie("authToken"),
      buildClearCookie("userType"), // Solo si lo usas
    ];

    console.log("🍪 [LOGOUT] Eliminando cookies:", cookiesToClear);

    // ✅ Método 1: Usar setHeader con múltiples cookies
    res.setHeader("Set-Cookie", cookiesToClear);
    
    // ✅ Método 2: Alternativo con res.clearCookie (más confiable)
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      ...(isProd && { partitioned: true })
    };
    
    // Usar clearCookie como respaldo
    res.clearCookie("authToken", cookieOptions);
    res.clearCookie("userType", cookieOptions);
    
    // ✅ Método 3: Header adicional para limpiar todas las cookies del sitio
    res.setHeader('Clear-Site-Data', '"cookies"');
    
    // ✅ Headers CORS para asegurar que el frontend reciba la respuesta
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    console.log("✅ [LOGOUT] Cookies eliminadas correctamente");
    
    return res.status(200).json({ 
      message: "Sesión cerrada correctamente",
      timestamp: new Date().toISOString()
    });
    
  } catch (e) {
    console.error("💥 [LOGOUT] Error:", e);
    return res.status(500).json({ 
      message: "Error al cerrar sesión",
      error: process.env.NODE_ENV === "development" ? e.message : undefined
    });
  }
};

export default LogoutController;