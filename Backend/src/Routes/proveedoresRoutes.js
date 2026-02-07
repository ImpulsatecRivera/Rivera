import proveedorsCon from "../Controllers/ProveedorController.js"
import { validateAuthToken } from "../Middlewares/validateAuthToken.js";
import express from "express";

const router = express.Router();

router.route("/")
    .get(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar","Coordinador"]), proveedorsCon.get)
    .post(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar","Coordinador"]), proveedorsCon.post);

router.route("/:id")
    .put(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar","Coordinador"]), proveedorsCon.put)
    .delete(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar","Coordinador"]), proveedorsCon.delete);
export default router;
