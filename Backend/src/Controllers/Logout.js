const LogoutController = {};

// Construye una variante de borrado que calce con la creada en login
const buildDelete = ({ isProd, path, partitioned }) => {
  return [
    "authToken=",
    `Path=${path}`,
    "HttpOnly",
    isProd ? "SameSite=None" : "SameSite=Lax",
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
    const isProd = process.env.NODE_ENV === "production";

    // Enviamos varias variantes para asegurar el borrado
    const headers = [];
    for (const path of ["/", "/api"]) {
      headers.push(buildDelete({ isProd, path, partitioned: true }));  // calza con login en prod
      headers.push(buildDelete({ isProd, path, partitioned: false })); // fallback
    }

    // Enviar múltiples Set-Cookie en un solo response
    res.setHeader("Set-Cookie", headers);
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({ Message: "Sesión cerrada" });
  } catch (e) {
    console.error("💥 [logout] Error:", e);
    return res.status(500).json({ Message: "Error al cerrar sesión" });
  }
};

export default LogoutController;
