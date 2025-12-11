import express from "express"
import ResumenCon from "../Controllers/ResumenDieselController.js"

const router = express.Router()

router.route("/").get(ResumenCon.getResumen)
.post(ResumenCon.AgregarDiesel);

router.route("/:id")
.put(ResumenCon.PutDiesel)
.delete(ResumenCon.DeleteResumen);

export default router;