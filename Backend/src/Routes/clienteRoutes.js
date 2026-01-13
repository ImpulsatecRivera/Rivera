import express from "express";
import clienteCon from "../Controllers/ClienteController.js";

const router = express.Router();

// GET - Todos pueden leer
router.route("/")
  .get(clienteCon.get)
  .post( clienteCon.crearClienteCorporativo);

// Rutas específicas con nombres van ANTES que las rutas con parámetros
router.get('/usuarios-activos',  clienteCon.getUsuariosActivos);
router.get('/resumen-usuarios', clienteCon.getResumenUsuarios);

// Rutas con parámetros van AL FINAL
router.route("/:id")
  .get( clienteCon.getClienteById)    
  .delete(clienteCon.deleteClientes);

// Ruta PUT separada - Admin, Supervisor pueden editar
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