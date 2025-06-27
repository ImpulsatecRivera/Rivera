const Logout = {}

Logout.logout = async (req,res) => {
    try {
        res.clearCookie("authToken",{httpOnly: true});

    return res.status(200).json({Message:"Session cerrada"});
    } catch (error) {
        res.status(500).json({Message: "Error al eliminar el token"})
    }
}

export default Logout;