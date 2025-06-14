import express from "express"
import Logout from "../Controllers/Logout.js"

const router = express.Router();

router.route("/")
.post(Logout.logout);

export default router;