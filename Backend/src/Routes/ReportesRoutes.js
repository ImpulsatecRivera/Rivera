import express from 'express';
import ReportesRoutes from "../Controllers/ReportesController.js"

const router = express.Router();


router.get('/individual/:id', ReportesRoutes.generarPDFIndividual);


router.get('/todos', ReportesRoutes.generarPDFTodosMantenimientos);

export default router;