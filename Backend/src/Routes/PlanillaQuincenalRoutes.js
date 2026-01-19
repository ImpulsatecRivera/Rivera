/**
 * Rutas para el controlador de Planillas Quincenales
 * 
 * Endpoints disponibles:
 * - POST   /                          Crear nueva planilla quincenal
 * - GET    /                          Obtener todas las planillas (con filtros)
 * - GET    /:id                       Obtener planilla por ID
 * - GET    /empleado/:empleadoId      Obtener planillas de un empleado específico
 * - PUT    /:id/empleado/:empleadoId  Actualizar datos de empleado en planilla
 * - POST   /:id/empleado              Agregar empleado a planilla existente
 * - DELETE /:id/empleado/:empleadoId  Eliminar empleado de planilla
 * - PATCH  /:id/estado                Cambiar estado de planilla
 * - DELETE /:id                       Eliminar planilla completa
 */

import express from 'express';
import PlanillaQuincenalController from '../Controllers/PlanillaQuincenalController.js';
import { validateAuthToken } from '../Middlewares/validateAuthToken.js';
const router = express.Router();
router.use(express.Router());

/**
 * POST /api/planillas/quincenal
 * Crear nueva planilla quincenal
 * 
 * Body:
 * {
 *   "año": 2025,
 *   "mes": 12,
 *   "quincena": 1,
 *   "empleados": [
 *     {
 *       "empleadoId": "674abc123...",
 *       "tipoEmpleado": "Empleado",
 *       "viaticos": 65.80,
 *       "trabajoSabadoDomingo": 0,
 *       "otrosDescuentos": {
 *         "anticipos": 50,
 *         "prestamos": 0,
 *         "otros": 0
 *       }
 *     }
 *   ]
 * }
 */
router.post('/',validateAuthToken(["admin"]), PlanillaQuincenalController.crear);

/**
 * GET /api/planillas/quincenal
 * Obtener todas las planillas quincenales con filtros opcionales
 * 
 * Query params:
 * - año: number (ej: 2025)
 * - mes: number (1-12)
 * - quincena: number (1 o 2)
 * - estado: string (pendiente, aprobada, pagada)
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * 
 * Ejemplo:
 * GET /api/planillas/quincenal?año=2025&mes=12&quincena=1&estado=pendiente
 */
router.get('/', validateAuthToken(["admin", "Operativo", "Supervisor"]),PlanillaQuincenalController.obtenerTodas);

/**
 * GET /api/planillas/quincenal/:id
 * Obtener una planilla específica por ID
 * 
 * Params:
 * - id: ObjectId de la planilla
 * 
 * Ejemplo:
 * GET /api/planillas/quincenal/674abc123def456
 */
router.get('/:id',validateAuthToken(["admin", "Operativo", "Supervisor"]), PlanillaQuincenalController.obtenerPorId);

/**
 * GET /api/planillas/quincenal/empleado/:empleadoId
 * Obtener todas las planillas de un empleado específico
 * 
 * Params:
 * - empleadoId: ObjectId del empleado
 * 
 * Query params opcionales:
 * - año: number
 * - mes: number
 * 
 * Ejemplo:
 * GET /api/planillas/quincenal/empleado/674abc123?año=2025&mes=12
 */
router.get('/empleado/:empleadoId',validateAuthToken(["admin", "Operativo", "Supervisor"]), PlanillaQuincenalController.obtenerPorEmpleado);

/**
 * PUT /api/planillas/quincenal/:id/empleado/:empleadoId
 * Actualizar datos de un empleado en la planilla
 * 
 * ⚠️ Solo se puede editar si la planilla no está en estado pagada o pagada (ej. pendiente, aprobada)
 * ❌ NO se puede editar si está: pagada o pagada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * - empleadoId: ObjectId del empleado
 * +
 * 
 * Body:
 * {
 *   "viaticos": 75.00,
 *   "trabajoSabadoDomingo": 0,
 *   "otrosDescuentos": {
 *     "anticipos": 60,
 *     "prestamos": 25,
 *     "otros": 0
 *   }
 * }
 * 
 * Nota: El salario quincenal, ISSS, AFP y Renta se recalculan automáticamente
 */
router.put('/:id/empleado/:empleadoId',validateAuthToken(["admin"]), PlanillaQuincenalController.actualizarEmpleado);

/**
 * POST /api/planillas/quincenal/:id/empleado
 * Agregar un nuevo empleado a la planilla
 * 
 * ⚠️ Solo se puede agregar si la planilla no está en estado pagada o pagada (ej. pendiente, aprobada)
 * ❌ NO se puede agregar si está: pagada o pagada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * 
 * Body:
 * {
 *   "empleadoId": "674def456...",
 *   "tipoEmpleado": "Motorista",
 *   "viaticos": 150.00,
 *   "trabajoSabadoDomingo": 0,
 *   "otrosDescuentos": {
 *     "anticipos": 100,
 *     "prestamos": 0,

 *     "otros": 0
 *   }
 * }
 */
router.post('/:id/empleado', validateAuthToken(["admin"]), PlanillaQuincenalController.agregarEmpleado);

/**
 * DELETE /api/planillas/quincenal/:id/empleado/:empleadoId
 * Eliminar un empleado de la planilla
 * 
 * ⚠️ Solo se puede eliminar si la planilla no está en estado pagada o pagada (ej. pendiente, aprobada)
 * ❌ NO se puede eliminar si está: pagada o pagada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * - empleadoId: ObjectId del empleado
 * 
 * Ejemplo:
 * DELETE /api/planillas/quincenal/674abc123/empleado/674def456
 */
router.delete('/:id/empleado/:empleadoId',validateAuthToken(["admin"]), PlanillaQuincenalController.eliminarEmpleado);

/**
 * PATCH /api/planillas/quincenal/:id/estado
 * Cambiar el estado de la planilla
 * 
 * Transiciones válidas:
 * - pendiente   → aprobada, pagada, pagada
 * - aprobada    → pagada, pagada (NO puede regresar a pendiente)
 * - pagada      → pagada (NO puede regresar a pendiente)
 * - pagada     → NO puede cambiar (estado final)
 * 
 * Nota: No existe el estado "borrador" en el modelo actual.
 * 
 * Params:
 * - id: ObjectId de la planilla
 * 
 * Body para cambiar el estado (pendiente, aprobada, pagada):
 * {
 *   "estado": "pendiente"
 * }
 * Body para cambiar a aprobada (fechaAprobacion opcional — si no se envía se asigna la fecha del servidor). No se permiten fechas futuras:
 * {
 *   "estado": "aprobada",
 *   "fechaAprobacion": "2025-12-10T14:00:00"
 * }
 * 
 * Body para cambiar a pagada (REQUIERE fechaPago, en zona 'America/El_Salvador'):
 * {
 *   "estado": "pagada",
 *   "fechaPago": "2025-12-15T10:30:00"
 * }
 * 
 * 
 * Nota: Las fechas se validan en la zona de El Salvador (America/El_Salvador). NO SE ACEPTAN FECHAS FUTURAS.
 */
router.patch('/:id/estado',validateAuthToken(["admin"]), PlanillaQuincenalController.cambiarEstado);

/**
 * DELETE /api/planillas/quincenal/:id
 * Eliminar una planilla completa
 * 
 * ⚠️ Solo se puede eliminar si está en estado: pendiente
 * ❌ NO se puede eliminar si está: pagada o pagada
 * 
 * Params:
 * - id: ObjectId de la planilla
 * 
 * Ejemplo:
 * DELETE /api/planillas/quincenal/674abc123
 */
router.delete('/:id',validateAuthToken(["admin"]), PlanillaQuincenalController.eliminar);

/**
 * GET /api/planillas/quincenal/ultima
 * Obtener la última planilla quincenal creada
 * 
 * Retorna: La planilla quincenal más reciente o información de la primera planilla (2026-01-Q1)
 * si no hay planillas registradas
 */
router.get('/ultima', validateAuthToken(["admin"]), PlanillaQuincenalController.obtenerUltima);

/**
 * POST /api/planillas/quincenal/:id/copiar-datos-anteriores
 * Copiar empleados y estructura de la planilla anterior
 * 
 * Parámetros:
 * - id: ObjectId de la planilla nueva donde copiar los datos
 * 
 * Funcionalidad:
 * - Busca la última planilla anterior a la actual
 * - Copia los empleados manteniendo su salario y estructura
 * - Reinicia viáticos y otros descuentos
 */
router.post('/:id/copiar-datos-anteriores', validateAuthToken(["admin"]), PlanillaQuincenalController.copiarDatosAnteriores);

export default router;