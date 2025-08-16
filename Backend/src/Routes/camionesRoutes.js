import express from "express";
import multer from "multer"
import camionesController from "../Controllers/CamionesController.js";


const router = express.Router();

const upload= multer({dest: "public/"})

router
.route("/")
.get(camionesController.get)
.post(upload.single("img"),camionesController.post);

router
.route("/:id")
.put(upload.single("img"),camionesController.put)
.get(camionesController.getById)
.delete(camionesController.delete);

router.get('/:id/stats', camionesController.getByIdWithStats);

export default router;