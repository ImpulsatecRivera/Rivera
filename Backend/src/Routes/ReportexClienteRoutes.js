import express from "express"
import ReportesViajesRoutes from '../Controllers/ReporteViajexCliente.js';
const router = express.Router();

// Quita "/reportes-viajes" de cada ruta
router.get('/pdf-tabla/:mes/:ano', ReportesViajesRoutes.generarPDFEstiloTabla);
router.get('/pdf-individual/:id', ReportesViajesRoutes.generarPDFClienteIndividual);
router.post('/pdf-comparativo', ReportesViajesRoutes.generarPDFComparativoMeses);
router.get('/pdf-consolidado/:ano', ReportesViajesRoutes.generarPDFConsolidadoAnual);

export default router;

