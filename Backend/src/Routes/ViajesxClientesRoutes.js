import express from "express"
import ViajesxClienteCon from "../Controllers/ViajesxClienteController.js"


const router = express.Router();

router.route("/")
.get(ViajesxClienteCon.getViajesXCliente)
.post(ViajesxClienteCon.createViajeXCliente);

router.route("/:id")
.get(ViajesxClienteCon.getViajeXClienteById)
.put(ViajesxClienteCon.updateViajeXCliente)
.delete(ViajesxClienteCon.deleteViajeXCliente);

export default router;