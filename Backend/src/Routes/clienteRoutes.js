import express from "express";
import clienteCon from "../Controllers/ClienteController.js";

const router = express.Router();

// Rutas generales (sin parámetros) van PRIMERO
router.route("/").get(clienteCon.get);

// Rutas específicas con nombres van ANTES que las rutas con parámetros
router.get('/usuarios-activos', clienteCon.getUsuariosActivos);
router.get('/resumen-usuarios', clienteCon.getResumenUsuarios);

// Rutas con parámetros van AL FINAL
router.route("/:id")
  .get(clienteCon.getClienteById)    
  .put(clienteCon.PutClientes)       
  .delete(clienteCon.deleteClientes);

export default router;  // ← Removido el "7" extra