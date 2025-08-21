const LogoutController = {};

const buildDelete = ({ isProd, path, cookieDomain, partitioned }) => {
  return [
    "authToken=",
    `Path=${path}`,
    cookieDomain ? `Domain=${cookieDomain}` : "",
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
    const cookieDomain = process.env.COOKIE_DOMAIN?.trim() || undefined; // DEBE coincidir con el usado en login (o no usar ninguno)

    console.log("🚪 [logout] host:", req.get("host"), "| cookieDomain:", cookieDomain || "(host-only)");

    // Enviamos varias variantes para asegurar el borrado
    const deletes = [];
    for (const path of ["/", "/api"]) {
      deletes.push(buildDelete({ isProd, path, cookieDomain, partitioned: true }));  // calza con login
      deletes.push(buildDelete({ isProd, path, cookieDomain, partitioned: false })); // fallback
    }

    res.setHeader("Set-Cookie", deletes);
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({ Message: "Sesión cerrada" });
  } catch (e) {
    console.error("💥 [logout] Error:", e);
    return res.status(500).json({ Message: "Error al cerrar sesión" });
  }
};

export default LogoutController;
