import express from "express";

import clienteCon from "../Controllers/ClienteController.js";

const router=express.Router();

router.route("/").get(clienteCon.get);
// En tu archivo de rutas (routes/clientes.js)
router.get('/usuarios-activos', clienteCon.getUsuariosActivos);
router.get('/resumen-usuarios', clienteCon.getResumenUsuarios);

router.route("/:id").put(clienteCon.PutClientes)
.delete(clienteCon.deleteClientes)
export default router;