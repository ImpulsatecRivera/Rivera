const Logout = {}

Logout.logout = async (req,res) => {
    res.clearCookie("authToken",{httpOnly: true});

    return res.status(200).json({Message:"Session cerrada"});
}

export default Logout;