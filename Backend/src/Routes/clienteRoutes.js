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
  .delete(clienteCon.deleteClientes);

// Ruta PUT separada para manejar upload de imagen con middleware específico
router.put("/:id", 
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