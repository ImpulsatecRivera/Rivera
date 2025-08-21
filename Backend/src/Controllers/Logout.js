const LogoutController = {};

const isProd = process.env.NODE_ENV === "production";

const buildDelete = ({ name, path = "/", sameSite, partitioned }) => {
  return [
    `${name}=`,
    `Path=${path}`,
    "HttpOnly",
    sameSite,                         // "SameSite=None" o "SameSite=Lax"
    isProd ? "Secure" : "",
    partitioned && isProd ? "Partitioned" : "",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "Max-Age=0",
  ]
    .filter(Boolean)
    .join("; ");
};

LogoutController.logout = async (req, res) => {
  try {
    // Usar exactamente los mismos parámetros que en setAuthCookie del LoginController
    const deleteCookie = buildDelete({ 
      name: "authToken", 
      path: "/", 
      sameSite: isProd ? "SameSite=None" : "SameSite=Lax",
      partitioned: isProd // Solo en producción, igual que el login
    });

    console.log("🍪 [LOGOUT] Delete-Cookie:", deleteCookie);
    res.setHeader("Set-Cookie", deleteCookie);
    return res.status(200).json({ Message: "Sesión cerrada" });
  } catch (e) {
    console.error("💥 [logout] Error:", e);
    return res.status(500).json({ Message: "Error al cerrar sesión" });
  }
};

export default LogoutController;