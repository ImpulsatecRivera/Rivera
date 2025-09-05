import express from "express";
import motoristasCon from "../Controllers/MotoristasController.js";
import multer from "multer";



const router = express.Router();
const upload= multer({dest: "public/"})


router.route("/")
.get(motoristasCon.get)
.post(upload.single("img"),motoristasCon.post);

router.route("/:id")
.put(upload.single("img"),motoristasCon.put)
.delete(motoristasCon.delete);
router.get('/:id', motoristasCon.getById);


router.get("/viajes-programados/todos", motoristasCon.getAllViajesProgramados);
router.get("/:id/viajes-programados", motoristasCon.getViajesProgramados);
// Agregar esta línea a tus rutas
router.get('/:id/historial-completo', motoristasCon.getHistorialCompleto);
export default router;