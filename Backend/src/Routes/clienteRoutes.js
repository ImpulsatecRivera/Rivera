import express from "express";

import clienteCon from "../Controllers/ClienteController.js";

const router=express.Router();

router.route("/").get(clienteCon.get);

router.route("/:id").put(clienteCon.PutClientes)
.delete(clienteCon.deleteClientes)
export default router;