import proveedorsCon from "../Controllers/ProveedorController.js"
import express from "express";

const router=express.Router();

router.route("/")
.get(proveedorsCon.get)
.post(proveedorsCon.post);


router.route("/:id")
.put(proveedorsCon.put)
.delete(proveedorsCon.delete);


export default router;
