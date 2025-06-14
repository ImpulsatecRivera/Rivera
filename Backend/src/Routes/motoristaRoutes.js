import express from "express";
import motoristasCon from "../Controllers/MotoristasController.js";


const router = express.Router();

router.route("/")
.get(motoristasCon.get)
.post(motoristasCon.post);

router.route("/:id")
.put(motoristasCon.put)
.delete(motoristasCon.delete);

export default router;