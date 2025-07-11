import express from "express";
import LoginController from "../Controllers/Login.js"; 

const router = express.Router();

router.post("/", LoginController.Login); 

export default router;
