import proveedorsCon from "../Controllers/ProveedorController.js"
import { validateAuthToken } from "../Middlewares/validateAuthToken.js";
import express from "express";

const router = express.Router();

router.route("/")
    .get(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), proveedorsCon.get)
    .post(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), proveedorsCon.post);

router.route("/:id")
    .put(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), proveedorsCon.put)
    .delete(validateAuthToken(["admin", "Operativo", "Supervisor", "motorista", "auxiliar"]), proveedorsCon.delete);
export default router;
