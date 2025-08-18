import express from "express";
import clienteCon from "../Controllers/ClienteController.js";

const router = express.Router();

// ✅ Rutas generales (sin parámetros) van PRIMERO
router.route("/").get(clienteCon.get);

// ✅ Rutas específicas con nombres van ANTES que las rutas con parámetros
router.get('/usuarios-activos', clienteCon.getUsuariosActivos);
router.get('/resumen-usuarios', clienteCon.getResumenUsuarios);

// ✅ CORRECCIÓN: Rutas con parámetros van AL FINAL
router.route("/:id")
  .get(clienteCon.getClienteById)    // 🔥 AGREGADO: GET para obtener cliente por ID
  .put(clienteCon.PutClientes)       // ✅ PUT para actualizar
  .delete(clienteCon.deleteClientes) // ✅ DELETE para eliminar

// ❌ REMOVER ESTA LÍNEA (estaba duplicada y mal ubicada):
// router.get('/clientes/:id', clienteCon.getClienteById);

export default router;