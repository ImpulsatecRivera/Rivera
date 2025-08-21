const LogoutController = {};

LogoutController.logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";

    const buildCookie = (name) => {
      const parts = [
        `${name}=`, // valor vacío
        "Path=/",
        "HttpOnly", // igual que login
        "Max-Age=0",
        "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        isProd ? "SameSite=None" : "SameSite=Lax",
        isProd ? "Secure" : "",
        isProd ? "Partitioned" : "",
      ].filter(Boolean);
      return parts.join("; ");
    };

    const cookiesToClear = [
      buildCookie("authToken"),
      buildCookie("userPreview"),
      buildCookie("userType"),
    ];

    console.log("🍪 [LOGOUT] Clearing cookies:", cookiesToClear);

    // Aquí sí mandamos varias cookies de golpe
    res.setHeader("Set-Cookie", cookiesToClear);

    return res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (e) {
    console.error("💥 [LOGOUT] Error:", e);
    return res.status(500).json({ message: "Error al cerrar sesión" });
  }
};

export default LogoutController;
