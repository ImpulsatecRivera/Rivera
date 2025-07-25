import expres from "express";
import Register from "../Controllers/RegisterAdmin.js";

const router = expres.Router()

router.route("/").post(Register.registerAdmin)


export default router;