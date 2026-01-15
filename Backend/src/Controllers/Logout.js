const LogoutController = {};

LogoutController.logout = async (req, res) => {
  try {
    console.log("🚪 [LOGOUT] Iniciando logout...");
    console.log("🍪 [LOGOUT] Cookies actuales:", req.cookies);
    
    const isProd = process.env.NODE_ENV === "production" || process.env.K_SERVICE;

    // ✅ IMPORTANTE: Usar las MISMAS opciones que en Login para consistencia
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      sameSite: "none", // Siempre "none" para Vercel cross-domain
      secure: true,     // Siempre true en Vercel (HTTPS)
    };

    // Para Vercel: agregar partitioned si está en producción
    if (isProd) {
      cookieOptions.partitioned = true;
    }

    console.log("🍪 [LOGOUT] Opciones de cookie:", cookieOptions);

    // ✅ Método 1: Usar clearCookie con las opciones correctas
    res.clearCookie("authToken", cookieOptions);
    res.clearCookie("userType", cookieOptions);
    res.clearCookie("isLoggedIn", cookieOptions);
    
    // ✅ Método 2: Header adicional para Vercel (Clear-Site-Data)
    res.setHeader('Clear-Site-Data', '"cookies"');
    
    // ✅ Headers CORS para asegurar que el frontend reciba la respuesta
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    console.log("✅ [LOGOUT] Cookies eliminadas correctamente");
    console.log("📋 Response headers:", res.getHeaders());
    
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