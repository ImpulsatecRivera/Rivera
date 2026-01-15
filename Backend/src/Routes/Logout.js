import express from "express";
import LogoutController from "../Controllers/Logout.js";

const router = express.Router();

router.post("/", LogoutController.logout);

export default router;
