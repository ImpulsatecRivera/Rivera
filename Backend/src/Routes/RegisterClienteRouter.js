import expres from "express";
import RegsiterCliente from "../Controllers/RegisterClientes.js";

const router = expres.Router()

router.route("/").post(RegsiterCliente.registrarCliente)

export default router;