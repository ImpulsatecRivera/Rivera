import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    res.clearCookie("authToken", { httpOnly: true });
    return res.status(200).json({ Message: "Sesión cerrada" });
  } catch (error) {
    return res.status(500).json({ Message: "Error al eliminar el token" });
  }
});

export default router;
