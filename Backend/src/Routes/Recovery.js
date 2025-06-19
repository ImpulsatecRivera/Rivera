import express from "express";
import RecoveryPass from "../Controllers/RecoveryController.js";

const router=express.Router();

router.route("/requestCode").post(RecoveryPass.requestCode);



export default router;