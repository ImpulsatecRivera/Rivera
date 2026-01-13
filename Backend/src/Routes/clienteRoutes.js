import express from "express";
import clienteCon from "../Controllers/ClienteController.js";
import { authMiddleware } from "../Middleware/auth.js";
import { requireRole, requireAdmin } from "../Middleware/roleMiddleware.js";

const router = express.Router();

// GET - Todos pueden leer
router.route("/")
  .get(authMiddleware, clienteCon.get)
  .post(authMiddleware, requireRole("Operativo", "Supervisor"), clienteCon.crearClienteCorporativo);

// Rutas específicas con nombres van ANTES que las rutas con parámetros
router.get('/usuarios-activos', authMiddleware, clienteCon.getUsuariosActivos);
router.get('/resumen-usuarios', authMiddleware, clienteCon.getResumenUsuarios);

// Rutas con parámetros van AL FINAL
router.route("/:id")
  .get(authMiddleware, clienteCon.getClienteById)    
  .delete(authMiddleware, requireAdmin, clienteCon.deleteClientes);

// Ruta PUT separada - Admin, Supervisor pueden editar
router.put("/:id", 
  authMiddleware,
  requireRole("Supervisor"),
  // Middleware para manejar el upload de imagen
  (req, res, next) => {
    clienteCon.uploadProfileImage(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Error al procesar imagen",
          error: err.message
        });
      }
      next();
    });
  },
  // Controlador principal
  clienteCon.PutClientes
);

export default router;