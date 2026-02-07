import express from "express";
import clienteCon from "../Controllers/ClienteController.js";
import validateAuthToken from "../Middlewares/validateAuthToken.js";

const router = express.Router();

// GET - Requiere sesión (admin, Operativo, Supervisor, cliente, motorista)
router.route("/")
  .get(validateAuthToken(["admin", "Operativo", "Supervisor", "cliente", "motorista", "auxiliar","Coordinador"]), clienteCon.get)
  .post(validateAuthToken(["admin", "Operativo", "Supervisor","Coordinador"]), clienteCon.crearClienteCorporativo);

// PUT corporativo específico
router.put('/corporativo/:id',
  validateAuthToken(["admin","Supervisor"]),
  clienteCon.actualizarClienteCorporativo
);

// Rutas específicas con nombres van ANTES que las rutas con parámetros
router.get('/usuarios-activos', validateAuthToken(["admin", "Operativo", "Supervisor", "cliente", "motorista", "auxiliar","Coordinador"]), clienteCon.getUsuariosActivos);
router.get('/resumen-usuarios', validateAuthToken(["admin", "Operativo", "Supervisor", "cliente", "motorista", "auxiliar","Coordinador"]), clienteCon.getResumenUsuarios);

// Rutas con parámetros van AL FINAL
router.route("/:id")
  .get(validateAuthToken(["admin", "Operativo", "Supervisor", "cliente", "motorista", "auxiliar","Coordinador"]), clienteCon.getClienteById)
  .delete(validateAuthToken(["admin"]), clienteCon.deleteClientes);

// Ruta PUT separada - Admin, Supervisor y el propio cliente puede editar su perfil
router.put("/:id",
  // Validación de sesión/roles (cliente puede editar su propio perfil; controlador debe verificar ownership)
  validateAuthToken(["admin", "Operativo", "Supervisor", "cliente","Coordinador"]),
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