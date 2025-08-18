/**
 * Controlador para manejar el cierre de sesión de usuarios
 */
const Logout = {};

/**
 * Endpoint para cerrar sesión de usuario
 * POST /auth/logout
 * 
 * Elimina la cookie de autenticación del navegador del usuario
 * para cerrar su sesión activa en la aplicación.
 * 
 * @param {object} req - Objeto request de Express
 * @param {object} res - Objeto response de Express
 * @returns {object} JSON con mensaje de éxito o error
 */
Logout.logout = async (req, res) => {
  try {
    // Eliminar la cookie de autenticación del navegador del cliente
    // httpOnly: true asegura que la cookie no sea accesible desde JavaScript del lado cliente
    // esto ayuda a prevenir ataques XSS (Cross-Site Scripting)
    res.clearCookie("authToken", { httpOnly: true });
    
    // Responder con mensaje de éxito indicando que la sesión se cerró correctamente
    return res.status(200).json({ Message: "Sesión cerrada" });
  } catch (error) {
    // En caso de cualquier error durante el proceso de logout,
    // responder con status 500 (Error interno del servidor)
    return res.status(500).json({ Message: "Error al cerrar sesión" });
  }
};

// Exportar el controlador para poder importarlo en otros archivos
export default Logout;