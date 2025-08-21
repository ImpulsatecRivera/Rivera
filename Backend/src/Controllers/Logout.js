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
    // borramos todas las variantes posibles (por si la cookie fue creada con otros atributos)
    const variants = [
      buildDelete({ name: "authToken", path: "/", sameSite: "SameSite=None", partitioned: true }),
      buildDelete({ name: "authToken", path: "/", sameSite: "SameSite=None", partitioned: false }),
      buildDelete({ name: "authToken", path: "/", sameSite: "SameSite=Lax", partitioned: false }),
      buildDelete({ name: "authToken", path: "/api", sameSite: "SameSite=None", partitioned: true }),
      buildDelete({ name: "authToken", path: "/api", sameSite: "SameSite=None", partitioned: false }),
      buildDelete({ name: "authToken", path: "/api", sameSite: "SameSite=Lax", partitioned: false }),
    ];

    res.setHeader("Set-Cookie", variants);
    return res.status(200).json({ Message: "Sesión cerrada" });
  } catch (e) {
    console.error("💥 [logout] Error:", e);
    return res.status(500).json({ Message: "Error al cerrar sesión" });
  }
};

export default LogoutController;
