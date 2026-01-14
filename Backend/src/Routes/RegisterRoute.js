import expres from "express";
import Register from "../Controllers/RegisterAdmin.js";

const router = expres.Router()

router.route("/").post(Register.registerAdmin)
//NO SE UTILIZA

export default router;