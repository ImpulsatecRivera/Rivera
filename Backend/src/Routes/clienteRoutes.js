import express from "express";

import clienteCon from "../Controllers/ClienteController.js";

const router=express.Router();

router.route("/").get(clienteCon.get);

export default router;