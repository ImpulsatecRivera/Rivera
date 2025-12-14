/**
 * Rutas para reportes PDF de planillas quincenales
 * 
 * Endpoints disponibles:
 * - GET /quincenal/:id           Generar PDF de planilla quincenal específica
 * - GET /mensual/:mes/:año       Generar reporte mensual consolidado
 */

import express from 'express';
import ReportesPlanillaQuincenalController from '../Controllers/ReportesPlanillaQuincenalController.js';

const router = express.Router();

/**
 * GET /api/reportes/planilla/quincenal/:id
 * Generar y descargar PDF de una planilla quincenal específica
 * 
 * El PDF incluye:
 * - Encabezado con nombre de la empresa
 * - Título y descripción de la quincena
 * - Tabla completa con todos los empleados
 * - Columnas: Nombre, Salario Quincenal, Viáticos, Trabajo Sábado/Domingo,
 *   Total Salario+Viáticos, ISSS 3%, AFP 7.25%, Renta, Anticipos, PTMOS,
 *   Camisas, Otros Descuentos, Total Descuentos, Total a Pagar
 * - Fila de totales al final
 * - Footer con fecha de generación
 * 
 * Params:
 * - id: ObjectId de la planilla quincenal
 * 
 * Ejemplo:
 * GET /api/reportes/planilla/quincenal/674abc123def456
 * 
 * Response:
 * - Content-Type: application/pdf
 * - Content-Disposition: attachment; filename=planilla-quincenal-1-12-2025.pdf
 * 
 * Uso en navegador:
 * http://localhost:4000/api/reportes/planilla/quincenal/674abc123def456
 * 
 * Uso con curl:
 * curl http://localhost:4000/api/reportes/planilla/quincenal/674abc123def456 --output planilla.pdf
 */
router.get('/:id', ReportesPlanillaQuincenalController.generarPDFQuincenal);

/**
 * GET /api/reportes/planilla/mensual/:mes/:año
 * Generar reporte mensual consolidado con todas las quincenas del mes
 * 
 * El PDF incluye:
 * - Resumen de cada quincena del mes (primera y segunda)
 * - Totales por quincena
 * - Total consolidado del mes
 * - Cantidad de empleados por quincena
 * - Estados de las planillas
 * 
 * Params:
 * - mes: Número del mes (1-12)
 * - año: Año (ej: 2025)
 * 
 * Ejemplo:
 * GET /api/reportes/planilla/mensual/12/2025
 * 
 * Response:
 * - Content-Type: application/pdf
 * - Content-Disposition: attachment; filename=reporte-planillas-Diciembre-2025.pdf
 * 
 * Uso en navegador:
 * http://localhost:4000/api/reportes/planilla/mensual/12/2025
 * 
 * Nota: Si no hay planillas para el mes especificado, retorna error 404
 */
router.get('/mensual/:mes/:año', ReportesPlanillaQuincenalController.generarPDFMensual);

export default router;