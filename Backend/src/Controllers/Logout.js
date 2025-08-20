const LogoutController = {};

const appendDelete = (res, { name, path, isProd, withPartitioned }) => {
  const parts = [
    `${name}=`,
    `Path=${path}`,
    "HttpOnly",
    isProd ? "SameSite=None" : "SameSite=Lax",
    isProd ? "Secure" : "",
    withPartitioned && isProd ? "Partitioned" : "",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "Max-Age=0",
  ].filter(Boolean);
  res.append("Set-Cookie", parts.join("; "));
};

LogoutController.logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";

    // 1) Borrar la cookie con Path=/ (la más común)
    appendDelete(res, { name: "authToken", path: "/", isProd, withPartitioned: true });
    appendDelete(res, { name: "authToken", path: "/", isProd, withPartitioned: false });

    // 2) Por si alguna vez se creó con Path=/api
    appendDelete(res, { name: "authToken", path: "/api", isProd, withPartitioned: true });
    appendDelete(res, { name: "authToken", path: "/api", isProd, withPartitioned: false });


    return res.status(200).json({ Message: "Sesión cerrada" });
  } catch (e) {
    console.error("💥 [logout] Error:", e);
    return res.status(500).json({ Message: "Error al cerrar sesión" });
  }
};

export default LogoutController;
