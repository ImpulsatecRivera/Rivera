import express from "express";
import RecoveryPass from "../Controllers/RecoveryController.js";

const router=express.Router();

router.route("/requestCode").post(RecoveryPass.requestCode);
router.route("/verifyCode").post(RecoveryPass.verifyCode);
router.route("/newPassword").post(RecoveryPass.newPassword);



export default router;